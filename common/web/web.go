package web

import (
	"fmt"
	"html/template"
	"net/http"
	"reflect"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/mimis-s/zpudding/pkg/net/clientConn"
)

var structuredUnmarshaler = func(c *gin.Context, structTemplate interface{}) (interface{}, error) {
	toReq := reflect.TypeOf(structTemplate)
	receiver := reflect.New(toReq).Interface()
	err := c.ShouldBindJSON(receiver)
	if err != nil {
		return nil, err
	}
	return receiver, nil
}

// setValue 设置结构体一个字段的值
func setValue(field reflect.Value, value string) error {
	if field.Kind() == reflect.Ptr {
		if value == "" {
			return nil
		}

		if field.IsNil() {
			field.Set(reflect.New(field.Type().Elem()))
		}
		field = field.Elem()
	}
	switch field.Kind() {
	case reflect.String:
		field.SetString(value)
	case reflect.Bool:
		if value == "" {
			field.SetBool(false)
		} else {
			b, err := strconv.ParseBool(value)
			if err != nil {
				return err
			}
			field.SetBool(b)
		}
	case reflect.Int, reflect.Int8, reflect.Int16, reflect.Int32, reflect.Int64:
		if value == "" {
			field.SetInt(0)
		} else {
			i, err := strconv.ParseInt(value, 0, field.Type().Bits())
			if err != nil {
				return err
			}
			field.SetInt(i)
		}
	case reflect.Uint, reflect.Uint8, reflect.Uint16, reflect.Uint32, reflect.Uint64:
		if value == "" {
			field.SetUint(0)
		}
		ui, err := strconv.ParseUint(value, 0, field.Type().Bits())
		if err != nil {
			return err
		}
		field.SetUint(ui)
	case reflect.Float32, reflect.Float64:
		if value == "" {
			field.SetFloat(0)
			break
		}
		f, err := strconv.ParseFloat(value, field.Type().Bits())
		if err != nil {
			return err
		}
		field.SetFloat(f)
	case reflect.Struct:
		return fmt.Errorf("unsupport struct field:%v", field.Type())
	case reflect.Slice:
		values := strings.Split(value, ",")
		if len(values) == 1 && values[0] == "" {
			values = []string{}
		}
		field.Set(reflect.MakeSlice(field.Type(), len(values), len(values)))
		for i := 0; i < len(values); i++ {
			err := setValue(field.Index(i), values[i])
			if err != nil {
				return err
			}
		}

	default:
		return fmt.Errorf("no support type %s", field.Type())
	}
	return nil
}

type RouteInfo struct {
	Desc           string
	Method         string
	StructTemplate interface{}
}

type fieldDescInfo struct {
	Name      string
	FieldName string
	Type      string
	Desc      string
}

func (ri *RouteInfo) HasFields() bool {
	return ri.StructTemplate != nil
}

func (ri *RouteInfo) JsonStructDesc() []*fieldDescInfo {
	if ri.StructTemplate == nil {
		return []*fieldDescInfo{}
	}
	list := make([]*fieldDescInfo, 0)
	to := reflect.TypeOf(ri.StructTemplate)
	for i := 0; i < to.NumField(); i++ {
		field := to.Field(i)
		list = append(list, &fieldDescInfo{
			Name:      field.Tag.Get("json"),
			FieldName: field.Name,
			Type:      field.Type.String(),
			Desc:      field.Tag.Get("desc"),
		})
	}
	return list
}

func (ri *RouteInfo) String() string {
	if ri.StructTemplate == nil {
		return "无参数"
	}
	desc := ""
	to := reflect.TypeOf(ri.StructTemplate)
	for i := 0; i < to.NumField(); i++ {
		field := to.Field(i)
		desc += field.Tag.Get("json") + ": " + field.Type.String() + ";"
	}
	return desc
}

// type HandlerFunc func(ctx Context)
type HandlerFunc interface{}

type RouterGroup struct {
	basePath      string
	group         *gin.RouterGroup
	GroupRoutes   map[string]*RouterGroup
	Routes        map[string]*RouteInfo
	newContextFun func() Context
}

func newRouterGroup(group *gin.RouterGroup, newContextFun func() Context) *RouterGroup {
	return &RouterGroup{
		basePath:      group.BasePath(),
		group:         group,
		newContextFun: newContextFun,
		GroupRoutes:   make(map[string]*RouterGroup),
		Routes:        make(map[string]*RouteInfo),
	}
}

func (g *RouterGroup) Use(middleware ...HandlerFunc) {
	g.group.Use(getGinHandlerFun(g.newContextFun, nil, middleware...))
}

func (g *RouterGroup) Group(path string, handlers ...HandlerFunc) *RouterGroup {
	grp := g.group.Group(path, getGinHandlerFun(g.newContextFun, nil, handlers...))
	grp1 := newRouterGroup(grp, g.newContextFun)
	g.GroupRoutes[path] = grp1
	return grp1
}

func (g *RouterGroup) Get(path string, desc string, handlers ...HandlerFunc) gin.IRoutes {
	return g.GetWithStructParams(path, desc, nil, handlers...)
}

func (g *RouterGroup) GetWithStructParams(path string, desc string, structTemplate interface{}, handlers ...HandlerFunc) gin.IRoutes {
	g.Routes[path] = &RouteInfo{Desc: desc, Method: "GET", StructTemplate: structTemplate}
	return g.group.GET(path, getGinHandlerFun(g.newContextFun, structTemplate, handlers...))
}

func (g *RouterGroup) Post(path string, desc string, handlers ...HandlerFunc) gin.IRoutes {
	return g.PostWithStructParams(path, desc, nil, handlers)
}
func (g *RouterGroup) PostWithStructParams(path string, desc string, structTemplate interface{}, handlers ...HandlerFunc) gin.IRoutes {
	g.Routes[path] = &RouteInfo{Desc: desc, Method: "POST", StructTemplate: structTemplate}
	return g.group.POST(path, getGinHandlerFun(g.newContextFun, structTemplate, handlers...))
}

func (g *RouterGroup) TravelGroupTree() map[string]*RouteInfo {
	m := make(map[string]*RouteInfo)
	for k, route := range g.Routes {
		if k[0] != '/' {
			k = "/" + k
		}
		m[k] = route
	}
	for k, subG := range g.GroupRoutes {
		gm := subG.TravelGroupTree()
		for k1, v1 := range gm {
			if k1[0] != '/' {
				k1 = "/" + k1
			}
			m[k+k1] = v1
		}
	}
	return m
}

type Engine struct {
	addr          string
	basePath      string
	ginEngine     *gin.Engine
	GroupRoutes   map[string]*RouterGroup // 组路由
	Routes        map[string]*RouteInfo   // 直接路由
	newContextFun func() Context
}

func NewEngine(addr string, newContextFun func() Context) *Engine {
	engine := &Engine{
		addr:          addr,
		ginEngine:     gin.New(),
		newContextFun: newContextFun,
		GroupRoutes:   make(map[string]*RouterGroup),
		Routes:        make(map[string]*RouteInfo),
	}
	// 添加中间件强制设置静态文件的 MIME 类型
	engine.ginEngine.Use(func(c *gin.Context) {
		path := c.Request.URL.Path
		if strings.HasSuffix(path, ".js") {
			c.Header("Content-Type", "application/javascript; charset=utf-8")
		} else if strings.HasSuffix(path, ".css") {
			c.Header("Content-Type", "text/css; charset=utf-8")
		} else if strings.HasSuffix(path, ".json") {
			c.Header("Content-Type", "application/json; charset=utf-8")
		}
		c.Next()
	})
	engine.ginEngine.Use(gin.Logger())
	engine.ginEngine.Use(gin.Recovery())
	return engine
}
func (e *Engine) SetHTMLTemplate(templ *template.Template) {
	e.ginEngine.SetHTMLTemplate(templ)
}
func (e *Engine) StaticFS(relativePath string, fs http.FileSystem) gin.IRoutes {
	return e.ginEngine.StaticFS(relativePath, fs)
}

func (e *Engine) Use(middleware ...HandlerFunc) {
	e.ginEngine.Use(getGinHandlerFun(e.newContextFun, nil, middleware...))
}

func (e *Engine) Group(path string, handlers ...HandlerFunc) *RouterGroup {
	grp := e.ginEngine.Group(path, getGinHandlerFun(e.newContextFun, nil, handlers...))
	grp1 := newRouterGroup(grp, e.newContextFun)
	e.GroupRoutes[path] = grp1
	return grp1
}

func (e *Engine) Get(path string, desc string, handlers ...HandlerFunc) gin.IRoutes {
	return e.GetWithStructParams(path, desc, nil, handlers...)
}

func (e *Engine) GetWithStructParams(path string, desc string, structTemplate interface{}, handlers ...HandlerFunc) gin.IRoutes {
	e.Routes[path] = &RouteInfo{Desc: desc, Method: "GET", StructTemplate: structTemplate}
	return e.ginEngine.GET(path, getGinHandlerFun(e.newContextFun, structTemplate, handlers...))
}

func (e *Engine) Post(path string, desc string, handlers ...HandlerFunc) gin.IRoutes {
	return e.PostWithStructParams(path, desc, nil, handlers...)
}

func (e *Engine) PostWithStructParams(path string, desc string, structTemplate interface{}, handlers ...HandlerFunc) gin.IRoutes {
	e.Routes[path] = &RouteInfo{Desc: desc, Method: "POST", StructTemplate: structTemplate}
	return e.ginEngine.POST(path, getGinHandlerFun(e.newContextFun, structTemplate, handlers...))
}

func (e *Engine) TravelGroupTree() map[string]*RouteInfo {
	m := make(map[string]*RouteInfo)
	for k, route := range e.Routes {
		if k[0] != '/' {
			k = "/" + k
		}
		m[k] = route
	}
	for k, subG := range e.GroupRoutes {
		gm := subG.TravelGroupTree()
		for k1, v1 := range gm {
			if k1[0] != '/' {
				k1 = "/" + k1
			}
			m[k+k1] = v1
		}
	}
	return m
}

func (e *Engine) SetAddr(addr, protocol string, newSessionFunc func(clientConn.ClientConn) clientConn.ClientSession) {
	return
}

func (e *Engine) Run() error {
	return e.ginEngine.Run(e.addr)
}

func (e *Engine) Stop() {
}

func getGinHandlerFun(newContextFun func() Context, structTemplate interface{}, handlers ...HandlerFunc) gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx := newContextFun()
		ctx.SetGinContext(c)
		for _, h := range handlers {
			if structTemplate != nil {
				receiver, err := structuredUnmarshaler(c, structTemplate)
				if err != nil {
					ctx.GetGinContext().JSON(http.StatusInternalServerError, gin.H{
						"success": false,
						"message": fmt.Sprintf("操作失败:%v", err),
					})
					c.Abort()
					return
				} else {
					reflect.ValueOf(h).Call([]reflect.Value{reflect.ValueOf(ctx), reflect.ValueOf(receiver)})
				}
			} else {
				reflect.ValueOf(h).Call([]reflect.Value{reflect.ValueOf(ctx)})
			}

			if c.IsAborted() {
				return
			}
		}
	}
}
