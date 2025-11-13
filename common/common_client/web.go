package common_client

import (
	"fmt"
	"reflect"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
)

type Context interface {
	SetGinContext(ctx *gin.Context)
	GetGinContext() *gin.Context
	ResponseParseParamsFieldFail(path string, field string, value string, err error)
}

var structuredUnmarshaler = func(c *gin.Context, structTemplate interface{}) (interface{}, string, string, error) {
	toReq := reflect.TypeOf(structTemplate)
	receiver := reflect.New(toReq).Interface()
	value := reflect.ValueOf(receiver).Elem()
	// 给每个字段赋值
	to := value.Type()
	for i := 0; i < to.NumField(); i++ {
		f := to.Field(i)
		fieldTagName := f.Tag.Get("json")
		if fieldTagName == "" {
			fieldTagName = f.Name
		}

		field := value.Field(i)
		if !field.CanSet() {
			continue
		}

		fieldStr := c.Query(fieldTagName)
		err := setValue(field, fieldStr)
		if err != nil {
			// c.ResponseFailWithDefaultCode(fmt.Sprintf("query param(%v) error:%v", fieldTagName, err))
			return nil, field.String(), fieldStr, fmt.Errorf("query param(%v) error:%v", fieldTagName, err)
		}
	}

	return receiver, "", "", nil
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
	basePath      string
	ginEngine     *gin.Engine
	GroupRoutes   map[string]*RouterGroup // 组路由
	Routes        map[string]*RouteInfo   // 直接路由
	newContextFun func() Context
}

func NewEngine(newContextFun func() Context) *Engine {
	engine := &Engine{
		ginEngine:     gin.Default(),
		newContextFun: newContextFun,
		GroupRoutes:   make(map[string]*RouterGroup),
		Routes:        make(map[string]*RouteInfo),
	}
	return engine
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

func (e *Engine) Run(addr ...string) {
	e.ginEngine.Run(addr...)
}

func getGinHandlerFun(newContextFun func() Context, structTemplate interface{}, handlers ...HandlerFunc) gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx := newContextFun()
		ctx.SetGinContext(c)
		for _, h := range handlers {
			if structTemplate != nil {
				receiver, field, value, err := structuredUnmarshaler(c, structTemplate)
				if err != nil {
					ctx.ResponseParseParamsFieldFail(c.FullPath(), field, value, err)
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
