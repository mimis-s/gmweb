package controller

import (
	"fmt"
	"math/rand"

	"github.com/mimis-s/gmweb/common/web"
	"github.com/mimis-s/gmweb/common/webmodel"
	"github.com/mimis-s/gmweb/modules/order"
	"github.com/mimis-s/gmweb/modules/power"
	"github.com/mimis-s/gmweb/modules/project"
	"github.com/mimis-s/gmweb/modules/user"
	"github.com/smallnest/rpcx/log"
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

// 管理员主界面
func (c *ControllerHandler) Home(ctx *web.WebContext) {
	ctx.GetGinContext().HTML(200, "gm_tab_home.html", nil)
}

// 普通用户主界面
func (c *ControllerHandler) HomeUser(ctx *web.WebContext) {
	ctx.GetGinContext().HTML(200, "gm_tab_home_user.html", nil)
}

// 登录界面
func (c *ControllerHandler) Login(ctx *web.WebContext) {
	err := user.LoginHandlerHtml(ctx)
	if err != nil {
		log.Errorf("login is err:%v", err)
		return
	}
}

// 登录
func (c *ControllerHandler) PostApiLogin(ctx *web.WebContext, req *webmodel.GetUserReq) {
	rsp := &webmodel.GetUserRsp{}
	err := user.LoginHandler(ctx, req, rsp)
	if err != nil {
		log.Errorf("login is err:%v", err)
		ctx.Err("login is err:%v", err)
		return
	}
	log.Infof("user:%v login is ok", req.Username)
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
	rsp := &webmodel.GetGmOrderBoxRsp{}
	if err := order.GetGmOrderBoxReq(ctx, req, rsp); err != nil {
		log.Errorf("get gm orders is err:%v", err)
		ctx.Err("add gm orders is err:%v", err)
		return
	}
	ctx.SuccessOk(rsp)
}

// 发送gm命令
func (c *ControllerHandler) PostApiSendGmOrder(ctx *web.WebContext, req *webmodel.SendGmOrderReq) {
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
	rsp := &webmodel.AddGmProjectRsp{}
	if err := project.AddGmProjectHandler(ctx, req, rsp); err != nil {
		log.Errorf("add project is err:%v", err)
		ctx.Err("add project is err:%v", err)
		return
	}
	ctx.SuccessOk(rsp)
}

// 删除gm项目
func (c *ControllerHandler) PostApiDelGmProject(ctx *web.WebContext, req *webmodel.DelGmProjectReq) {
	rsp := &webmodel.DelGmProjectRsp{}
	if err := project.DelGmProjectReqHandler(ctx, req, rsp); err != nil {
		log.Errorf("del project is err:%v", err)
		ctx.Err("del project is err:%v", err)
		return
	}
	ctx.SuccessOk(rsp)
}

// 修改gm项目
func (c *ControllerHandler) PostApiModifyGmProject(ctx *web.WebContext, req *webmodel.ModifyGmProjectReq) {
	rsp := &webmodel.ModifyGmProjectRsp{}
	if err := project.ModifyGmProjectHandler(ctx, req, rsp); err != nil {
		log.Errorf("modify project is err:%v", err)
		ctx.Err("modify project is err:%v", err)
		return
	}
	ctx.SuccessOk(rsp)
}

// 获取所有用户
func (c *ControllerHandler) PostApiGetAllUsers(ctx *web.WebContext, req *webmodel.GetAllUsersReq) {
	rsp := &webmodel.GetAllUsersRsp{}
	if err := user.GetAllUsersHandler(ctx, req, rsp); err != nil {
		log.Errorf("get all users is err:%v", err)
		ctx.Err("get all users is err:%v", err)
		return
	}
	ctx.SuccessOk(rsp)
}

// 增加用户
func (c *ControllerHandler) PostApiAddUser(ctx *web.WebContext, req *webmodel.AddUserReq) {
	rsp := &webmodel.AddUserRsp{}
	if err := user.AddUserHandler(ctx, req, rsp); err != nil {
		log.Errorf("add user is err:%v", err)
		ctx.Err("add user is err:%v", err)
		return
	}
	ctx.SuccessOk(rsp)
}

// 删除用户
func (c *ControllerHandler) PostApiDelUser(ctx *web.WebContext, req *webmodel.DelUserReq) {
	rsp := &webmodel.DelUserRsp{}
	if err := user.DelUserHandler(ctx, req, rsp); err != nil {
		log.Errorf("del user is err:%v", err)
		ctx.Err("del user is err:%v", err)
		return
	}
	ctx.SuccessOk(rsp)
}

// 修改用户信息
func (c *ControllerHandler) PostApiModifyUser(ctx *web.WebContext, req *webmodel.ModifyUserReq) {
	rsp := &webmodel.ModifyUserRsp{}
	if err := user.ModifyUserHandler(ctx, req, rsp); err != nil {
		log.Errorf("modify user is err:%v", err)
		ctx.Err("modify user is err:%v", err)
		return
	}
	ctx.SuccessOk(rsp)
}

// 获取权限
func (c *ControllerHandler) PostApiGetPermission(ctx *web.WebContext, req *webmodel.GetPermissionReq) {
	rsp := &webmodel.GetPermissionRsp{
		PermissionDatas:      make([]*webmodel.PermissionInfo, 0),
		PermissionGroupDatas: make([]*webmodel.PermissionGroupInfo, 0),
		AllUsers:             make([]*webmodel.PermissionGroupUserInfo, 0),
		AllProjects:          make([]*webmodel.PermissionProject, 0),
		AllLevels:            make([]int, 0),
	}
	if err := power.GetPermissionHandler(ctx, req, rsp); err != nil {
		log.Errorf("get permission is err:%v", err)
		ctx.Err("get permission is err:%v", err)
		return
	}
	ctx.SuccessOk(rsp)
}

// 增加权限
func (c *ControllerHandler) PostApiAddPermission(ctx *web.WebContext, req *webmodel.AddPermissionReq) {
	id := rand.Intn(100000)
	if req.OrderNameMatch == "" {
		req.OrderNameMatch = "*"
	}
	rsp := &webmodel.AddPermissionRsp{
		Data: &webmodel.PermissionInfo{
			Id:             int64(id),
			Name:           req.Name,
			Enable:         req.Enable,
			ProjectId:      req.ProjectId,
			ProjectName:    req.ProjectName,
			Level:          req.Level,
			OrderNameMatch: req.OrderNameMatch,
		},
	}
	ctx.SuccessOk(rsp)
}

func (c *ControllerHandler) PostApiModifyPermission(ctx *web.WebContext, req *webmodel.ModifyPermissionReq) {
	rsp := &webmodel.ModifyPermissionRsp{
		Data: &webmodel.PermissionInfo{
			Id:             req.Data.Id,
			Name:           req.Data.Name,
			Enable:         req.Data.Enable,
			ProjectId:      req.Data.ProjectId,
			ProjectName:    req.Data.ProjectName,
			Level:          req.Data.Level,
			OrderNameMatch: req.Data.OrderNameMatch,
		},
	}
	ctx.SuccessOk(rsp)
}

// 删除权限
func (c *ControllerHandler) PostApiDelPermission(ctx *web.WebContext, req *webmodel.DelPermissionReq) {
	rsp := &webmodel.DelPermissionRsp{
		Id: req.Id,
	}
	ctx.SuccessOk(rsp)
}

// 增加权限组
func (c *ControllerHandler) PostApiAddPermissionGroup(ctx *web.WebContext, req *webmodel.AddPermissionGroupReq) {
	rsp := &webmodel.AddPermissionGroupRsp{
		Data: &webmodel.PermissionGroupInfo{
			Id:       req.Id,
			Name:     req.Name,
			Enable:   req.Enable,
			PowerIds: req.PowerIds,
			Users:    make([]*webmodel.PermissionGroupUserInfo, 0),
		},
	}
	ctx.SuccessOk(rsp)
}

// 修改权限组
func (c *ControllerHandler) PostApiModifyPermissionGroup(ctx *web.WebContext, req *webmodel.ModifyPermissionGroupReq) {
	rsp := &webmodel.ModifyPermissionGroupRsp{
		Data: &webmodel.PermissionGroupInfo{
			Id:       req.Data.Id,
			Name:     req.Data.Name,
			Enable:   req.Data.Enable,
			PowerIds: req.Data.PowerIds,
			Users:    req.Data.Users,
		},
	}
	ctx.SuccessOk(rsp)
}

// 删除权限组
func (c *ControllerHandler) PostApiDelPermissionGroup(ctx *web.WebContext, req *webmodel.DelPermissionGroupReq) {
	rsp := &webmodel.DelPermissionGroupRsp{
		Id: req.Id,
	}
	ctx.SuccessOk(rsp)
}

// 普通用户获取自己拥有的所有项目信息
func (c *ControllerHandler) PostApiGetGmProjectBriefInfo(ctx *web.WebContext, req *webmodel.GetGmProjectBriefInfoReq) {
	rsp := &webmodel.GetGmProjectBriefInfoRsp{
		Datas: []*webmodel.GmProjectBriefInfo{
			{
				ProjectId: 1,
				Name:      "项目1",
				Desc:      "项目1描述",
			},
			{
				ProjectId: 2,
				Name:      "项目2",
				Desc:      "项目2描述",
			},
			{
				ProjectId: 3,
				Name:      "项目3",
				Desc:      "项目3描述",
			},
		},
	}
	ctx.SuccessOk(rsp)
}
