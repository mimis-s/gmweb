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
		engine.Get("/gm_order_table.html", "gm命令管理表", controllerHandler.GmOrderTable)
		engine.Get("/gm_user_mangement.html", "用户管理界面", controllerHandler.GmUserMangement)

		engine.PostWithStructParams("/api/login", "登陆的post", webmodel.GetUserReq{}, controllerHandler.PostApiLogin)
		engine.PostWithStructParams("/api/gm_order_box", "获取gm指令的post", webmodel.GetGmOrderBoxReq{}, controllerHandler.PostApiGmOrderBox)
		engine.PostWithStructParams("/api/gm_order_send", "发送gm命令", webmodel.SendGmOrderReq{}, controllerHandler.PostApiSendGmOrder)
		engine.PostWithStructParams("/api/gm_project_box", "获取项目数据", webmodel.GetGmProjectBoxReq{}, controllerHandler.PostApiGetGmProjectBox)
		engine.PostWithStructParams("/api/gm_order_del", "删除gm命令", webmodel.DelGmOrderReq{}, controllerHandler.PostApiDelGmOrder)
		engine.PostWithStructParams("/api/gm_order_add", "增加gm命令", webmodel.AddGmOrderReq{}, controllerHandler.PostApiAddGmOrder)
		engine.PostWithStructParams("/api/gm_order_modify", "修改gm命令", webmodel.ModifyGmOrderReq{}, controllerHandler.PostApiModifyGmOrder)
		engine.PostWithStructParams("/api/gm_project_add", "新增gm项目", webmodel.AddGmProjectReq{}, controllerHandler.PostApiAddGmProject)
		engine.PostWithStructParams("/api/gm_project_del", "删除gm项目", webmodel.DelGmProjectReq{}, controllerHandler.PostApiDelGmProject)
		engine.PostWithStructParams("/api/gm_project_modify", "修改gm项目", webmodel.ModifyGmProjectReq{}, controllerHandler.PostApiModifyGmProject)

		// 用户
		engine.PostWithStructParams("/api/gm_user_mangement", "修改gm项目", webmodel.GetAllUsersReq{}, controllerHandler.PostApiGetAllUsers)
		engine.PostWithStructParams("/api/gm_user_mangement/add", "增加用户", webmodel.AddUserReq{}, controllerHandler.PostApiAddUser)
		engine.PostWithStructParams("/api/gm_user_mangement/del", "删除用户信息", webmodel.DelUserReq{}, controllerHandler.PostApiDelUser)
		engine.PostWithStructParams("/api/gm_user_mangement/modify", "修改用户信息", webmodel.ModifyUserReq{}, controllerHandler.PostApiModifyUser)

		a.AddServer("gmweb", engine)
		return nil
	}))
}
