package router

import (
	"embed"
	"html/template"
	"net/http"

	"github.com/mimis-s/gmweb/common/web"

	"github.com/mimis-s/gmweb/common/boot_config"
	"github.com/mimis-s/gmweb/common/webmodel"
	"github.com/mimis-s/gmweb/controller"
	"github.com/mimis-s/zpudding/pkg/app"
)

func Init(s *app.Registry, htmlEmbed embed.FS, assetsEmbed embed.FS) {
	s.AddAppOutSide(app.NewAppOutSide("all_in_one", func(a *app.App) error {
		addr := boot_config.CustomBootFlagsData.IP + ":" + boot_config.CustomBootFlagsData.Port
		engine := web.NewEngine(addr, func() web.Context { return &web.WebContext{} })
		templ := template.Must(template.New("").ParseFS(htmlEmbed, "templates/*.html"))
		engine.SetHTMLTemplate(templ)
		// 加载静态资源(比如图片,文件等)
		engine.StaticFS("/assets", http.FS(assetsEmbed))
		controllerHandler, err := controller.Init()
		if err != nil {
			return err
		}

		engine.Get("/", "index", controllerHandler.Index)
		engine.Get("/login", "登陆", controllerHandler.Login)
		engine.Get("/register", "注册", controllerHandler.Register)
		engine.Get("/tab_home", "主页", controllerHandler.Home)
		engine.Get("/gm_order_card.html", "gm命令卡片", controllerHandler.GmOrderCard)
		engine.Get("/gm_order_box.html", "gm命令界面布局", controllerHandler.GmOrderBox)
		engine.Get("/gm_project_card.html", "项目卡片", controllerHandler.GmProjectCard)
		engine.Get("/gm_project_box.html", "项目界面布局", controllerHandler.GmProjectBox)

		engine.PostWithStructParams("/api/login", "登陆的post", webmodel.GetUserReq{}, controllerHandler.PostApiLogin)
		engine.PostWithStructParams("/api/gm_order_box", "获取gm指令的post", webmodel.GetGmOrderBoxReq{}, controllerHandler.PostApiGmOrderBox)
		engine.PostWithStructParams("/api/gm_order_send", "发送gm命令", webmodel.SendGmOrderReq{}, controllerHandler.PostApiSendGmOrder)
		engine.PostWithStructParams("/api/gm_project_box", "获取项目数据", webmodel.GetGmProjectBoxReq{}, controllerHandler.PostApiGetGmProjectBox)

		a.AddServer("gmweb", engine)
		return nil
	}))
}
