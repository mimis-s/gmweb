package router

import (
	"embed"
	"html/template"
	"net/http"

	"github.com/mimis-s/gmweb/common/boot_config"
	"github.com/mimis-s/gmweb/controller"
	"github.com/mimis-s/zpudding/pkg/app"
	"github.com/mimis-s/zpudding/pkg/net"
	"github.com/mimis-s/zpudding/pkg/net/clientConn"
	"github.com/mimis-s/zpudding/pkg/net/service"

	"github.com/gin-gonic/gin"
)

type Service struct {
	service.Service
}

func Init(s *app.Registry, port string, htmlEmbed embed.FS, assetsEmbed embed.FS) {
	addr := boot_config.CustomBootFlagsData.IP + ":" + boot_config.CustomBootFlagsData.Port
	net.InitServer(addr, "http", func(cc clientConn.ClientConn) clientConn.ClientSession {

	})
	clientConn.NewClientConn_http()
	s.AddAppOutSide(app.NewAppOutSide("all_in_one", func(a *app.App) error {
		a.AddServer("gmweb")
	}))
	engine := gin.Default()
	templ := template.Must(template.New("").ParseFS(htmlEmbed, "templates/*.html"))
	engine.SetHTMLTemplate(templ)
	// 加载静态资源(比如图片,文件等)
	engine.StaticFS("/assets", http.FS(assetsEmbed))

	engine.GET("/", controller.Index)
	engine.GET("/login", controller.Login)
	engine.GET("/register", controller.Register)
	engine.GET("/tab_home", controller.Home)
	engine.POST("/api/login", controller.PostApiLogin)

	engine.Run(port)
}
