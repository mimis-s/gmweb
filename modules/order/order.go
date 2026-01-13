package order

import (
	"fmt"

	"github.com/mimis-s/gmweb/common/dbmodel"
	"github.com/mimis-s/gmweb/common/dbmodel/db_extra"
	"github.com/mimis-s/gmweb/common/define"
	"github.com/mimis-s/gmweb/common/web"
	"github.com/mimis-s/gmweb/common/webmodel"
	"github.com/mimis-s/gmweb/dao"
	"github.com/mimis-s/gmweb/lib/parse"
	"github.com/mimis-s/gmweb/modules/gm_common"
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

	orderDatas, _, err := dao.GetUserOrderByReview(ctx, int64(req.ProjectId), user, define.EnumPowerReview_run)
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
				OrderId:     int(orderData.Id),
				OrderName:   orderData.Name,
				Level:       orderData.Level,
				OrderDesc:   orderData.Desc,
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
	err := dao.DelOrderData(int64(req.OrderId))
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
	projectData, find, err := dao.GetProjectData(int64(req.ProjectId))
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
		Name:  req.OrderName,
		Level: req.Level,
		Desc:  req.OrderDesc,
		Data: &db_extra.GmOrderExtra{
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
		OrderId:     int(inserData.Id),
		OrderName:   inserData.Name,
		Level:       inserData.Level,
		OrderDesc:   inserData.Desc,
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
	orderData, find, err := dao.GetOrderData(int64(req.Data.OrderId))
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
	orderData.Desc = req.Data.OrderDesc
	orderData.Data.OrderStruct = req.Data.OrderStruct
	orderData.Data.Path = req.Data.Path
	orderData.Data.Method = req.Data.Method

	err = dao.UpdateOrderData(orderData.Id, orderData)
	if err != nil {
		dao.Error(ctx, "modify project:%v order:%v is err:%v", req.ProjectId, req.Data.OrderName, err)
		return err
	}

	rsp.Data = &webmodel.GmOrder{
		OrderId:     int(orderData.Id),
		OrderName:   orderData.Name,
		Level:       orderData.Level,
		OrderDesc:   orderData.Desc,
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
	reviewData, err := gm_common.StepGmOrderRun(ctx, user, int64(req.OrderId), req.Msg)
	if err != nil {
		return err
	}
	if reviewData == nil {
		return nil
	}

	// 记录用户使用命令情况
	if reviewData.UserDB.OrderStatus == nil {
		reviewData.UserDB.OrderStatus = &db_extra.RoleGmOrderStatus{
			LastRunArgsMap: make(map[int64]map[int64]string),
		}
	}
	if reviewData.UserDB.OrderStatus.LastRunArgsMap[reviewData.OrderDB.ProjectId] == nil {
		reviewData.UserDB.OrderStatus.LastRunArgsMap[reviewData.OrderDB.ProjectId] = make(map[int64]string)
	}
	reviewData.UserDB.OrderStatus.LastRunArgsMap[reviewData.OrderDB.ProjectId][reviewData.OrderDB.Id] = req.Msg
	err = dao.UpdateUserData(reviewData.UserDB.Rid, reviewData.UserDB)
	if err != nil {
		dao.Error(ctx, err.Error())
	}

	err = afterAutoReview(ctx, user, reviewData)
	rsp.Data = &webmodel.ReviewInfo{
		ProjectId:   int(reviewData.ReviewDB.ProjectId),
		ProjectName: reviewData.ProjectDB.Name,
		OrderId:     int(reviewData.ReviewDB.OrderId),
		OrderName:   reviewData.OrderDB.Name,
		OrderDesc:   reviewData.OrderDB.Desc,
		UserId:      int(reviewData.ReviewDB.UserId),
		UserName:    reviewData.UserDB.Name,
		ResultData:  make([]*webmodel.ReviewStep, 0),
	}
	for _, stepData := range reviewData.ReviewDB.ExtraData.ResultData {
		rsp.Data.ResultData = append(rsp.Data.ResultData, &webmodel.ReviewStep{
			StepId:     int(stepData.StepId),
			UserId:     int(stepData.UserId),
			UserName:   stepData.UserName,
			Status:     stepData.Status,
			ReviewTime: parse.Int64ToString(stepData.ReviewTime),
			Desc:       stepData.Desc,
		})
	}
	if err != nil {
		dao.Error(ctx, "auto review send order:%v Method[%v] name:%v project:%v ip:%v path:%v msg:%v is err:%v", reviewData.OrderDB.Data.Method, reviewData.OrderDB.Id,
			reviewData.OrderDB.Name, reviewData.ProjectDB.Name, reviewData.ProjectDB.Data.GmAddr, reviewData.OrderDB.Data.Path, req.Msg, err)
	} else {
		dao.Info(ctx, "send order:%v Method[%v] name:%v project:%v ip:%v path:%v msg:%v", reviewData.OrderDB.Data.Method, reviewData.OrderDB.Id,
			reviewData.OrderDB.Name, reviewData.ProjectDB.Name, reviewData.ProjectDB.Data.GmAddr, reviewData.OrderDB.Data.Path, req.Msg)
	}

	return nil
}

func afterAutoReview(ctx *web.WebContext, user *dao.CacheUser, reviewData *dao.ReviewDBInfo) error {
	stepData, err := gm_common.StepGmOrderReview(ctx, user, reviewData.ReviewDB.ProjectId, reviewData.ReviewDB.OrderId, reviewData.ReviewDB.Id, true, true)
	if err != nil {
		return err
	}
	if stepData == nil {
		return nil
	}
	reviewData.ReviewDB.ExtraData.NextStepId++
	reviewData.ReviewDB.ExtraData.ResultData = append(reviewData.ReviewDB.ExtraData.ResultData, stepData)

	firstStep := reviewData.ReviewDB.ExtraData.ResultData[0]

	stepData, err = gm_common.StepGmOrderPush(ctx, user, firstStep.UserId, firstStep.UserName, reviewData.OrderDB, reviewData.ProjectDB, firstStep.Desc)
	if err != nil {
		dao.Error(ctx, "auto order review step：%v %v is err:%v", reviewData.ReviewDB.Id, true, err)
		return err
	}
	reviewData.ReviewDB.ExtraData.NextStepId++
	reviewData.ReviewDB.ExtraData.ResultData = append(reviewData.ReviewDB.ExtraData.ResultData, stepData)
	err = dao.UpdateReviewData(reviewData.ReviewDB.Id, reviewData.ReviewDB)
	if err != nil {
		dao.Error(ctx, "auto order review step：%v %v is err:%v", reviewData.ReviewDB.Id, true, err)
		return err
	}
	return nil
}
