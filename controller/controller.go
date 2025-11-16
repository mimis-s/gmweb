package controller

import (
	"github.com/mimis-s/gmweb/common/web"

	"github.com/mimis-s/gmweb/common/webmodel"
	"github.com/mimis-s/gmweb/modules/login"
	"github.com/mimis-s/gmweb/modules/login/service"
)

type ControllerHandler struct {
	loginSvc *service.Service
}

func Init() (*ControllerHandler, error) {
	loginSvc, err := login.Init()
	if err != nil {
		return nil, err
	}
	return &ControllerHandler{
		loginSvc: loginSvc,
	}, nil
}

func (c *ControllerHandler) Index(ctx *web.WebContext) {
	ctx.GetGinContext().HTML(200, "index.html", nil)
}

// 注册界面
func (c *ControllerHandler) Register(ctx *web.WebContext) {
	ctx.GetGinContext().HTML(200, "register.html", nil)
}

// 主界面
func (c *ControllerHandler) Home(ctx *web.WebContext) {
	ctx.GetGinContext().HTML(200, "tab_home.html", nil)
}

// 登录界面
func (c *ControllerHandler) Login(ctx *web.WebContext) {
	if GetSession(ctx) == nil {
		c.loginSvc.LoginPageHandler(ctx)
	}
}

// 登录界面
func (c *ControllerHandler) PostApiLogin(ctx *web.WebContext, req *webmodel.User) {
	SetSeesion(ctx, req)
	c.loginSvc.LoginHandler(ctx, req)
}

// gm命令卡片界面
func (c *ControllerHandler) GmOrderCard(ctx *web.WebContext) {
	ctx.GetGinContext().HTML(200, "gm_order_card.html", nil)
}
