package controller

import (
	"fmt"
	"math/rand"

	"github.com/mimis-s/gmweb/common/web"
	"github.com/mimis-s/gmweb/common/webmodel"
	glog "github.com/mimis-s/gmweb/gLog"
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
	ctx.GetGinContext().HTML(200, "gm_tab_home.html", nil)
}

// 登录界面
func (c *ControllerHandler) Login(ctx *web.WebContext) {
	GetSession(ctx)
}

// 登录界面
func (c *ControllerHandler) PostApiLogin(ctx *web.WebContext, req *webmodel.GetUserReq) {
	rsp := &webmodel.GetUserRsp{}
	err := login.LoginHandler(ctx, req, rsp)
	if err != nil {
		glog.Error(0, "", "login is err:%v", err)
		ctx.Err("login is err:%v", err)
		return
	}
	SetSeesion(ctx, req)
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
	rsp := &webmodel.GetPermissionRsp{
		PermissionDatas:      make([]*webmodel.PermissionInfo, 0),
		PermissionGroupDatas: make([]*webmodel.PermissionGroupInfo, 0),
		AllUsers:             make([]*webmodel.PermissionGroupUserInfo, 0),
		AllProjects:          make([]*webmodel.PermissionProject, 0),
		AllLevels:            make([]int, 0),
	}
	// 权限
	rsp.PermissionDatas = append(rsp.PermissionDatas, &webmodel.PermissionInfo{
		Id:             1,
		Name:           "测试服等级为1的所有命令",
		Enable:         true,
		ProjectId:      1,
		ProjectName:    "测试服",
		Level:          2,
		OrderNameMatch: "*",
	})
	rsp.PermissionDatas = append(rsp.PermissionDatas, &webmodel.PermissionInfo{
		Id:             2,
		Name:           "线上服gm发邮件",
		Enable:         false,
		ProjectId:      2,
		ProjectName:    "线上服",
		Level:          2,
		OrderNameMatch: "邮件",
	})

	// 权限组
	rsp.PermissionGroupDatas = append(rsp.PermissionGroupDatas, &webmodel.PermissionGroupInfo{
		Id:       1,
		Name:     "线上线下1,2权限",
		Enable:   true,
		PowerIds: []int64{1, 2},
		Users:    []*webmodel.PermissionGroupUserInfo{},
	})
	rsp.PermissionGroupDatas = append(rsp.PermissionGroupDatas, &webmodel.PermissionGroupInfo{
		Id:       2,
		Name:     "线上权限",
		Enable:   false,
		PowerIds: []int64{2},
		Users: []*webmodel.PermissionGroupUserInfo{
			{
				Id:   1,
				Name: "zhangbin",
			},
		},
	})

	// 所有玩家
	rsp.AllUsers = append(rsp.AllUsers, &webmodel.PermissionGroupUserInfo{
		Id:   1,
		Name: "zhangbin",
	})
	rsp.AllUsers = append(rsp.AllUsers, &webmodel.PermissionGroupUserInfo{
		Id:   2,
		Name: "xiaoming",
	})
	rsp.AllUsers = append(rsp.AllUsers, &webmodel.PermissionGroupUserInfo{
		Id:   3,
		Name: "hongsefengbao",
	})

	// 所有项目
	rsp.AllProjects = append(rsp.AllProjects, &webmodel.PermissionProject{
		ProjectId: 1,
		Name:      "测试服GM命令",
	})
	rsp.AllProjects = append(rsp.AllProjects, &webmodel.PermissionProject{
		ProjectId: 1,
		Name:      "线上服GM命令",
	})

	// 所有等级
	rsp.AllLevels = append(rsp.AllLevels, []int{1, 2, 3, 4, 5}...)

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
