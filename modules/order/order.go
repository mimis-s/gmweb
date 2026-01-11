package order

import (
	"encoding/json"
	"fmt"
	"regexp"

	"github.com/mimis-s/gmweb/common/dbmodel"
	"github.com/mimis-s/gmweb/common/dbmodel/db_extra"
	"github.com/mimis-s/gmweb/common/define"
	"github.com/mimis-s/gmweb/common/web"
	"github.com/mimis-s/gmweb/common/webmodel"
	"github.com/mimis-s/gmweb/dao"
)

func GetGmOrderBoxReq(ctx *web.WebContext, req *webmodel.GetGmOrderBoxReq, rsp *webmodel.GetGmOrderBoxRsp) error {
	user := dao.GetSession(ctx)
	if user == nil {
		return nil
	}

	rsp.ProjectId = req.ProjectId
	rsp.Datas = make([]*webmodel.RoleGmOrder, 0)

	// 获取玩家数据
	userDBData, find, err := dao.GetUserData(user.Rid)
	if err != nil {
		dao.Error(ctx, err.Error())
		return err
	}
	if !find {
		err := fmt.Errorf("get gm orders but role:%v not found", user.Role)
		dao.Error(ctx, err.Error())
		return err
	}

	orderDatas, _, err := dao.GetUserOrderByReview(ctx, req.ProjectId, user, define.EnumPowerReview_run)
	if err != nil {
		dao.Error(ctx, err.Error())
		return err
	}

	rsp.Datas = make([]*webmodel.RoleGmOrder, 0, len(orderDatas))

	for _, orderData := range orderDatas {
		lastRunArgs := orderData.Data.OrderStruct
		if userDBData.OrderStatus != nil && userDBData.OrderStatus.LastRunArgsMap != nil && userDBData.OrderStatus.LastRunArgsMap[orderData.ProjectId] != nil && userDBData.OrderStatus.LastRunArgsMap[orderData.ProjectId][orderData.Id] != "" {
			lastRunArgs = userDBData.OrderStatus.LastRunArgsMap[orderData.ProjectId][orderData.Id]
		}

		rsp.Datas = append(rsp.Datas, &webmodel.RoleGmOrder{
			GmOrderData: &webmodel.GmOrder{
				OrderId:     orderData.Id,
				OrderName:   orderData.Name,
				Level:       orderData.Level,
				OrderDesc:   orderData.Data.Desc,
				OrderStruct: orderData.Data.OrderStruct,
			},
			LastRunArgs: lastRunArgs,
		})
	}
	dao.Debug(ctx, "get project:%v orders is ok", req.ProjectId)

	return nil
}

func DelGmOrderHandler(ctx *web.WebContext, req *webmodel.DelGmOrderReq, rsp *webmodel.DelGmOrderRsp) error {
	user := dao.GetSession(ctx)
	if user == nil {
		return nil
	}

	if user.Role != define.EnumRole_Administrator {
		// 权限不够
		err := fmt.Errorf("user:%v modify project, but power:%v is err", user.Rid, user.Role)
		dao.Error(ctx, err.Error())
		return err
	}
	err := dao.DelOrderData(req.OrderId)
	if err != nil {
		dao.Error(ctx, "del project:%v order:%v is err:%v", req.ProjectId, req.OrderId, err)
		return err
	}

	dao.Info(ctx, "del project:%v order:%v is ok", req.ProjectId, req.OrderId)
	return nil
}
func AddGmOrderHandler(ctx *web.WebContext, req *webmodel.AddGmOrderReq, rsp *webmodel.AddGmOrderRsp) error {
	user := dao.GetSession(ctx)
	if user == nil {
		return nil
	}

	if user.Role != define.EnumRole_Administrator {
		// 权限不够
		err := fmt.Errorf("user:%v modify project, but power:%v is err", user.Rid, user.Role)
		dao.Error(ctx, err.Error())
		return err
	}
	projectData, find, err := dao.GetProjectData(req.ProjectId)
	if err != nil {
		dao.Error(ctx, "add project:%v order:%v is err:%v", req.ProjectId, req.OrderName, err)
		return err
	}

	if !find {
		err := fmt.Errorf("add project:%v order:%v is not found", req.ProjectId, req.OrderName)
		dao.Error(ctx, err.Error())
		return err
	}

	inserData := &dbmodel.GmOrder{
		ProjectId: req.ProjectId,
		Name:      req.OrderName,
		Level:     req.Level,
		Data: &db_extra.GmOrderExtra{
			Desc:        req.OrderDesc,
			OrderStruct: req.OrderStruct,
			Path:        req.Path,
			Method:      req.Method,
		},
	}

	err = dao.InsertOrderData(inserData)
	if err != nil {
		dao.Error(ctx, "add project:%v order:%v is err:%v", req.ProjectId, req.OrderName, err)
		return err
	}
	rsp.Data = &webmodel.GmOrder{
		OrderId:     inserData.Id,
		OrderName:   inserData.Name,
		Level:       inserData.Level,
		OrderDesc:   inserData.Data.Desc,
		OrderStruct: inserData.Data.OrderStruct,
	}
	rsp.ProjectId = req.ProjectId
	dao.Info(ctx, "add project:%v(%v) order:%v-%v Path:%v Method:%v is ok", req.ProjectId, projectData.Name, inserData.Id, req.OrderName, req.Path, req.Method)
	return nil
}

func ModifyGmOrderHandler(ctx *web.WebContext, req *webmodel.ModifyGmOrderReq, rsp *webmodel.ModifyGmOrderRsp) error {
	user := dao.GetSession(ctx)
	if user == nil {
		return nil
	}

	if user.Role != define.EnumRole_Administrator {
		// 权限不够
		err := fmt.Errorf("user:%v modify project, but power:%v is err", user.Rid, user.Role)
		dao.Error(ctx, err.Error())
		return err
	}
	orderData, find, err := dao.GetOrderData(req.Data.OrderId)
	if err != nil {
		dao.Error(ctx, "modify project:%v order:%v is err:%v", req.ProjectId, req.Data.OrderName, err)
		return err
	}

	if !find {
		err := fmt.Errorf("modify project:%v order:%v is not found", req.ProjectId, req.Data.OrderName)
		dao.Error(ctx, err.Error())
		return err
	}
	orderData.Name = req.Data.OrderName
	orderData.Level = req.Data.Level
	orderData.Data.Desc = req.Data.OrderDesc
	orderData.Data.OrderStruct = req.Data.OrderStruct
	orderData.Data.Path = req.Data.Path
	orderData.Data.Method = req.Data.Method

	err = dao.UpdateOrderData(orderData.Id, orderData)
	if err != nil {
		dao.Error(ctx, "modify project:%v order:%v is err:%v", req.ProjectId, req.Data.OrderName, err)
		return err
	}

	rsp.Data = &webmodel.GmOrder{
		OrderId:     orderData.Id,
		OrderName:   orderData.Name,
		Level:       orderData.Level,
		OrderDesc:   orderData.Data.Desc,
		OrderStruct: orderData.Data.OrderStruct,
		Method:      orderData.Data.Method,
		Path:        orderData.Data.Path,
	}
	dao.Info(ctx, "modify project:%v order:%v-%v Path:%v Method:%v is ok", req.ProjectId, orderData.Id, req.Data.OrderName, req.Data.Path, req.Data.Method)
	return nil
}

func SendGmOrderHandler(ctx *web.WebContext, req *webmodel.SendGmOrderReq, rsp *webmodel.SendGmOrderRsp) error {
	user := dao.GetSession(ctx)
	if user == nil {
		return nil
	}
	userData, find, err := dao.GetUserData(user.Rid)
	if err != nil {
		dao.Error(ctx, "send order:%v get user db is err:%v", req.OrderId, err)
		return err
	}
	if !find {
		// 不存在
		dao.Error(ctx, "send order:%v user db is not found", req.OrderId, err)
		return err
	}

	orderData, find, err := dao.GetOrderData(req.OrderId)
	if err != nil {
		dao.Error(ctx, err.Error())
		return err
	}
	if !find {
		err := fmt.Errorf("send order:%v is not found", req.OrderId)
		dao.Error(ctx, err.Error())
		return err
	}

	projectData, find, err := dao.GetProjectData(orderData.ProjectId)
	if err != nil {
		dao.Error(ctx, err.Error())
		return err
	}
	if !find {
		err := fmt.Errorf("send order:%v project:%v is not found", req.OrderId, orderData.ProjectId)
		dao.Error(ctx, err.Error())
		return err
	}

	_, orderIds, err := dao.GetUserOrderByReview(ctx, orderData.ProjectId, user, define.EnumPowerReview_run)
	if err != nil {
		dao.Error(ctx, err.Error())
		return err
	}
	bSend := false

	for _, orderId := range orderIds {
		if orderId == orderData.Id {
			bSend = true
			break
		}
	}

	if !bSend {
		err := fmt.Errorf("send order:%v name:%v project:%v ip:%v path:%v msg:%v power is not enough", orderData.Id,
			orderData.Name, projectData.Name, projectData.Data.GmAddr, orderData.Data.Path, req.Msg)
		dao.Error(ctx, err.Error())
		// 权限不足
		return fmt.Errorf("send order:%v name:%v project:%v power is not enough", orderData.Id,
			orderData.Name, projectData.Name)
	}

	gmExec := &gmExecReq{
		GMArgs: orderData.Name + " " + req.Msg,
	}
	gmExecJson, _ := json.Marshal(gmExec)

	var gmRsp *ApiResponse
	if orderData.Data.Method == "GET" {
		gmRsp, err = SendGetGmOrder(ctx, projectData.Data.GmAddr, string(gmExecJson))
	} else if orderData.Data.Method == "POST" {
		gmRsp, err = SendPostGmOrder(ctx, projectData.Data.GmAddr+orderData.Data.Path, string(gmExecJson), "")
	}
	if err != nil {
		return err
	}
	if gmRsp != nil {
		rsp.Data = gmRsp.Data
	}

	// 记录用户使用命令情况
	if userData.OrderStatus == nil {
		userData.OrderStatus = &db_extra.RoleGmOrderStatus{
			LastRunArgsMap: make(map[int64]map[int64]string),
		}
	}
	if userData.OrderStatus.LastRunArgsMap[orderData.ProjectId] == nil {
		userData.OrderStatus.LastRunArgsMap[orderData.ProjectId] = make(map[int64]string)
	}
	userData.OrderStatus.LastRunArgsMap[orderData.ProjectId][orderData.Id] = req.Msg
	err = dao.UpdateUserData(userData.Rid, userData)
	if err != nil {
		dao.Error(ctx, err.Error())
	}

	dao.Info(ctx, "send order:%v Method[%v] name:%v project:%v ip:%v path:%v msg:%v", orderData.Data.Method, orderData.Id,
		orderData.Name, projectData.Name, projectData.Data.GmAddr, orderData.Data.Path, string(gmExecJson))
	return nil
}
