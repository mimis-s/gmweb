package controller

import (
	"fmt"
	"math/rand"

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
	// ctx.GetGinContext().HTML(200, "index.html", nil)
	c.Home(ctx)
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

// 项目卡片
func (c *ControllerHandler) GmProjectCard(ctx *web.WebContext) {
	ctx.GetGinContext().HTML(200, "gm_project_card.html", nil)
}

// 项目界面布局
func (c *ControllerHandler) GmProjectBox(ctx *web.WebContext) {
	ctx.GetGinContext().HTML(200, "gm_project_box.html", nil)
}

// gm命令管理表
func (c *ControllerHandler) GmOrderTable(ctx *web.WebContext) {
	ctx.GetGinContext().HTML(200, "gm_order_table.html", nil)
}

// 用户管理界面
func (c *ControllerHandler) GmUserMangement(ctx *web.WebContext) {
	ctx.GetGinContext().HTML(200, "gm_user_mangement.html", nil)
}

// 权限管理界面
func (c *ControllerHandler) GmPermission(ctx *web.WebContext) {
	ctx.GetGinContext().HTML(200, "gm_permission.html", nil)
}

// 获取当前的gm命令
func (c *ControllerHandler) PostApiGmOrderBox(ctx *web.WebContext, req *webmodel.GetGmOrderBoxReq) {
	// session := GetSession(ctx)
	// if session == nil {
	// 	return
	// }
	// roleId := session.Values["user_id"].(int64)

	// 现在暂时不接入mysql, 先造一个假数据把界面展示做了
	rsp := &webmodel.GetGmOrderBoxRsp{}
	rsp.ProjectId = 1
	rsp.Datas = make([]*webmodel.RoleGmOrder, 0)
	for i := 0; i < 10; i++ {
		orderId := int64(i)
		orderName := fmt.Sprintf("名字:%v", i)
		orderDesc := fmt.Sprintf("GM发邮件:%v", i)

		rsp.Datas = append(rsp.Datas, &webmodel.RoleGmOrder{
			GmOrderData: &webmodel.GmOrder{
				OrderId:   orderId,
				OrderName: orderName,
				OrderDesc: orderDesc,
				Level:     1,
				OrderStruct: ` {
                            "id": 101,
                            "title": "JavaScript高级程序设计",
                            "author": "Nicholas C. Zakas",
                            "price": 89.50,
                            "inStock": true,
                            "tags": ["编程", "前端", "JavaScript"]
							}`,
				Path:   "/api/test",
				Method: "POST",
			},
			LastRunArgs: "",
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

// 发送gm命令
func (c *ControllerHandler) PostApiSendGmOrder(ctx *web.WebContext, req *webmodel.SendGmOrderReq) {
	session := GetSession(ctx)
	if session == nil {
		return
	}
	ctx.SuccessOk("成功")
}

func (c *ControllerHandler) PostApiGetGmProjectBox(ctx *web.WebContext, req *webmodel.GetGmProjectBoxReq) {
	// session := GetSession(ctx)
	// if session == nil {
	// 	return
	// }
	rsp := &webmodel.GetGmProjectBoxRsp{
		Datas: make([]*webmodel.GmProject, 0),
	}
	retData := &webmodel.GmProject{}
	retData.ProjectId = 1
	retData.GmAddr = "127.0.0.1:2001"
	retData.Name = "C3内网压测"
	retData.Desc = "描述"
	retData.Datas = make([]*webmodel.GmOrder, 0)
	for i := 0; i < 10; i++ {
		orderId := int64(i)
		orderName := fmt.Sprintf("名字:%v", i)
		orderDesc := fmt.Sprintf("GM发邮件:%v", i)

		retData.Datas = append(retData.Datas, &webmodel.GmOrder{
			OrderId:   orderId,
			OrderName: orderName,
			OrderDesc: orderDesc,
			Level:     1,
			OrderStruct: ` {
                            "id": 101,
                            "title": "JavaScript高级程序设计",
                            "author": "Nicholas C. Zakas",
                            "price": 89.50,
                            "inStock": true,
                            "tags": ["编程", "前端", "JavaScript"]
							}`,
			Path:   "/api/test",
			Method: "POST",
		})
	}
	rsp.Datas = append(rsp.Datas, retData)
	rsp.Datas = append(rsp.Datas, retData)

	ctx.SuccessOk(rsp)
}

// 删除gm命令
func (c *ControllerHandler) PostApiDelGmOrder(ctx *web.WebContext, req *webmodel.DelGmOrderReq) {
	fmt.Printf("删除gm命令成功%v\n", req)
	ctx.SuccessOk("成功")
}

// 新增gm命令
func (c *ControllerHandler) PostApiAddGmOrder(ctx *web.WebContext, req *webmodel.AddGmOrderReq) {
	rsp := &webmodel.AddGmOrderRsp{
		Data: &webmodel.GmOrder{
			Level:       req.Level,
			OrderDesc:   req.OrderDesc,
			OrderId:     1,
			OrderStruct: req.OrderStruct,
			OrderName:   req.OrderName,
		},
	}
	rsp.ProjectId = req.ProjectId
	ctx.SuccessOk(rsp)
}

// 修改gm命令
func (c *ControllerHandler) PostApiModifyGmOrder(ctx *web.WebContext, req *webmodel.ModifyGmOrderReq) {
	rsp := &webmodel.ModifyGmOrderRsp{
		Data: req.Data,
	}
	rsp.ProjectId = req.ProjectId
	ctx.SuccessOk(rsp)
}

// 新增gm项目
func (c *ControllerHandler) PostApiAddGmProject(ctx *web.WebContext, req *webmodel.AddGmProjectReq) {
	rsp := &webmodel.AddGmProjectRsp{
		Data: &webmodel.GmProject{
			ProjectId: 1,
			Name:      req.Name,
			Desc:      req.Desc,
			GmAddr:    req.GmAddr,
		},
	}
	ctx.SuccessOk(rsp)
}

// 删除gm项目
func (c *ControllerHandler) PostApiDelGmProject(ctx *web.WebContext, req *webmodel.DelGmProjectReq) {
	rsp := &webmodel.DelGmProjectRsp{
		ProjectId: req.ProjectId,
	}
	ctx.SuccessOk(rsp)
}

// 删除gm项目
func (c *ControllerHandler) PostApiModifyGmProject(ctx *web.WebContext, req *webmodel.ModifyGmProjectReq) {
	rsp := &webmodel.ModifyGmProjectRsp{
		ProjectId: req.ProjectId,
		Name:      req.Name,
		Desc:      req.Desc,
		GmAddr:    req.GmAddr,
	}
	ctx.SuccessOk(rsp)
}

// 获取所有用户
func (c *ControllerHandler) PostApiGetAllUsers(ctx *web.WebContext, req *webmodel.GetAllUsersReq) {
	rsp := &webmodel.GetAllUsersRsp{
		Datas: []*webmodel.User{
			{
				UserId:   1,
				Name:     "小一",
				Password: "342",
			},
			{
				UserId:   2,
				Name:     "寒风",
				Password: "5678",
			},
			{
				UserId:   3,
				Name:     "小毛毛",
				Password: "23",
			},
		},
	}
	ctx.SuccessOk(rsp)
}

// 增加用户
func (c *ControllerHandler) PostApiAddUser(ctx *web.WebContext, req *webmodel.AddUserReq) {
	userId := rand.Intn(100000)
	rsp := &webmodel.AddUserRsp{
		Data: &webmodel.User{
			UserId:   int64(userId),
			Name:     req.Name,
			Password: req.Password,
		},
	}
	ctx.SuccessOk(rsp)
}

// 删除用户
func (c *ControllerHandler) PostApiDelUser(ctx *web.WebContext, req *webmodel.DelUserReq) {
	rsp := &webmodel.DelUserRsp{
		UserId: req.UserId,
	}
	ctx.SuccessOk(rsp)
}

// 修改用户信息
func (c *ControllerHandler) PostApiModifyUser(ctx *web.WebContext, req *webmodel.ModifyUserReq) {
	rsp := &webmodel.ModifyUserRsp{
		Data: &webmodel.User{
			UserId:   req.UserId,
			Name:     req.Name,
			Password: req.Password,
		},
	}
	ctx.SuccessOk(rsp)
}

// 获取权限
func (c *ControllerHandler) PostApiGetPermission(ctx *web.WebContext, req *webmodel.GetPermissionReq) {
	rsp := &webmodel.GetPermissionRsp{}
	ctx.SuccessOk(rsp)
}

// 增加权限
func (c *ControllerHandler) PostApiAddPermission(ctx *web.WebContext, req *webmodel.AddPermissionReq) {
	rsp := &webmodel.AddPermissionRsp{}
	ctx.SuccessOk(rsp)
}

// 修改权限
func (c *ControllerHandler) PostApiModifyPermission(ctx *web.WebContext, req *webmodel.ModifyPermissionReq) {
	rsp := &webmodel.ModifyPermissionRsp{}
	ctx.SuccessOk(rsp)
}

// 删除权限
func (c *ControllerHandler) PostApiDelPermission(ctx *web.WebContext, req *webmodel.DelPermissionReq) {
	rsp := &webmodel.DelPermissionRsp{}
	ctx.SuccessOk(rsp)
}

// 获取权限组
func (c *ControllerHandler) PostApiGetPermissionGroup(ctx *web.WebContext, req *webmodel.GetPermissionGroupReq) {
	rsp := &webmodel.GetPermissionGroupRsp{}
	ctx.SuccessOk(rsp)
}

// 增加权限组
func (c *ControllerHandler) PostApiAddPermissionGroup(ctx *web.WebContext, req *webmodel.AddPermissionGroupReq) {
	rsp := &webmodel.AddPermissionGroupRsp{}
	ctx.SuccessOk(rsp)
}

// 修改权限组
func (c *ControllerHandler) PostApiModifyPermissionGroup(ctx *web.WebContext, req *webmodel.ModifyPermissionGroupReq) {
	rsp := &webmodel.ModifyPermissionGroupRsp{}
	ctx.SuccessOk(rsp)
}

// 删除权限组
func (c *ControllerHandler) PostApiDelPermissionGroup(ctx *web.WebContext, req *webmodel.DelPermissionGroupReq) {
	rsp := &webmodel.DelPermissionGroupRsp{}
	ctx.SuccessOk(rsp)
}
