package controller

import (
	"fmt"

	"github.com/mimis-s/gmweb/common/web"
	"github.com/mimis-s/gmweb/common/webmodel"
	"github.com/mimis-s/gmweb/modules/login"
)

type ControllerHandler struct {
}

func Init() (*ControllerHandler, error) {
	return &ControllerHandler{}, nil
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
	GetSession(ctx)
}

// 登录界面
func (c *ControllerHandler) PostApiLogin(ctx *web.WebContext, req *webmodel.GetUserReq) {
	SetSeesion(ctx, req)
	rsp := &webmodel.GetUserRsp{}
	login.LoginHandler(ctx, req, rsp)
	ctx.SuccessOk(rsp)

}

// gm命令卡片界面
func (c *ControllerHandler) GmOrderCard(ctx *web.WebContext) {
	ctx.GetGinContext().HTML(200, "gm_order_card.html", nil)
}

// 基础布局
func (c *ControllerHandler) GmOrderBox(ctx *web.WebContext) {
	ctx.GetGinContext().HTML(200, "gm_order_box.html", nil)
}

// 获取当前的gm命令
func (c *ControllerHandler) PostApiGmOrderBox(ctx *web.WebContext, req *webmodel.GetGmOrderBoxReq) {
	session := GetSession(ctx)
	if session == nil {
		return
	}
	// roleId := session.Values["user_id"].(int64)

	// 现在暂时不接入mysql, 先造一个假数据把界面展示做了
	rsp := &webmodel.GetGmOrderBoxRsp{}
	rsp.ProjectId = 1
	rsp.Datas = make([]*webmodel.GmOrder, 0)
	for i := 0; i < 10; i++ {
		orderId := int64(i)
		orderName := fmt.Sprintf("名字:%v", i)
		orderDesc := fmt.Sprintf("GM发邮件:%v", i)

		rsp.Datas = append(rsp.Datas, &webmodel.GmOrder{
			OrderId:     orderId,
			OrderName:   orderName,
			OrderDesc:   orderDesc,
			Level:       1,
			OrderStruct: "",
			LastRunArgs: "",
			OrderStatus: map[int]int64{1: 10, 2: 20, 3: 5},
			IsLike:      true,
			IsBelittle:  false,
			Iscollect:   true,
		})
	}
	ctx.SuccessOk(rsp)
	return

	// err := order.GetGmOrderReq(ctx, roleId, req, rsp)
	// if err != nil {
	// 	ctx.Err("roleId:%v post gm order is err:%v", roleId, err)
	// 	return
	// }
	// ctx.SuccessOk(rsp)
}
