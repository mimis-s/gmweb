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
		engine.PostWithStructParams("/api/login", "登陆的post", webmodel.User{}, controllerHandler.PostApiLogin)

		a.AddServer("gmweb", engine)
		return nil
	}))
}
