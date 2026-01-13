package gm_common

import (
	"encoding/json"
	"fmt"
	"time"

	"github.com/mimis-s/gmweb/common/dbmodel"
	"github.com/mimis-s/gmweb/common/dbmodel/db_extra"
	"github.com/mimis-s/gmweb/common/define"
	"github.com/mimis-s/gmweb/common/web"
	"github.com/mimis-s/gmweb/dao"
)

// 初始化执行命令
func StepGmOrderRun(ctx *web.WebContext, user *dao.CacheUser, orderId int64, msg string) (*dao.ReviewDBInfo, error) {
	userData, find, err := dao.GetUserData(user.Rid)
	if err != nil {
		dao.Error(ctx, "send order:%v get user db is err:%v", orderId, err)
		return nil, err
	}
	if !find {
		// 不存在
		dao.Error(ctx, "send order:%v user db is not found", orderId, err)
		return nil, err
	}
	orderData, find, err := dao.GetOrderData(orderId)
	if err != nil {
		dao.Error(ctx, err.Error())
		return nil, err
	}
	if !find {
		err := fmt.Errorf("send order:%v is not found", orderId)
		dao.Error(ctx, err.Error())
		return nil, err
	}

	projectData, find, err := dao.GetProjectData(orderData.ProjectId)
	if err != nil {
		dao.Error(ctx, err.Error())
		return nil, err
	}
	if !find {
		err := fmt.Errorf("send order:%v project:%v is not found", orderId, orderData.ProjectId)
		dao.Error(ctx, err.Error())
		return nil, err
	}

	_, orderIds, err := dao.GetUserOrderByReview(ctx, orderData.ProjectId, user, define.EnumPowerReview_run)
	if err != nil {
		dao.Error(ctx, err.Error())
		return nil, err
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
			orderData.Name, projectData.Name, projectData.Data.GmAddr, orderData.Data.Path, msg)
		dao.Error(ctx, err.Error())
		// 权限不足
		return nil, fmt.Errorf("send order:%v name:%v project:%v power is not enough", orderData.Id,
			orderData.Name, projectData.Name)
	}

	newReviewData := &dbmodel.Review{
		ProjectId: orderData.ProjectId,
		OrderId:   orderData.Id,
		UserId:    user.Rid,
		ExtraData: &db_extra.ExtraReviewStep{
			ResultData: []*db_extra.ReviewStep{
				&db_extra.ReviewStep{
					StepId:     define.EnumOrderStep_start,
					UserId:     user.Rid,
					UserName:   user.Name,
					Status:     define.EnumReviewStepStatus_success,
					ReviewTime: time.Now().Unix(),
					Desc:       msg,
				}},
			NextStepId: define.EnumOrderStep_review,
		},
		StartDate: time.Now().Unix(),
	}

	err = dao.InsertReviewData(newReviewData)
	if err != nil {
		dao.Error(ctx, err.Error())
		return nil, err
	}

	return &dao.ReviewDBInfo{
		OrderDB:   orderData,
		ProjectDB: projectData,
		ReviewDB:  newReviewData,
		UserDB:    userData,
	}, nil
}

// 推送gm命令
func StepGmOrderPush(ctx *web.WebContext, reviewUser *dao.CacheUser, sendUserId int64, sendUserName string, orderData *dbmodel.GmOrder, projectData *dbmodel.Project, msg string) (*db_extra.ReviewStep, error) {
	retStep := &db_extra.ReviewStep{
		StepId:   define.EnumOrderStep_Push,
		UserId:   reviewUser.Rid,
		UserName: reviewUser.Name,
		Status:   define.EnumReviewStepStatus_success,
	}

	gmExec := &gmExecReq{
		GMArgs: orderData.Name + " " + msg,
	}
	gmExecJson, _ := json.Marshal(gmExec)

	var gmRsp *ApiResponse
	var err error
	if orderData.Data.Method == "GET" {
		gmRsp, err = SendGetGmOrder(ctx, projectData.Data.GmAddr, string(gmExecJson))
	} else if orderData.Data.Method == "POST" {
		gmRsp, err = SendPostGmOrder(ctx, projectData.Data.GmAddr+orderData.Data.Path, string(gmExecJson), "")
	}
	retStep.ReviewTime = time.Now().Unix()
	if err != nil {
		retStep.Status = define.EnumReviewStepStatus_fail
		retStep.Desc = err.Error()
		dao.Error(ctx, err.Error())
		return retStep, nil
	}
	resultStr := ""
	if gmRsp != nil {
		tmpResultStr, err := json.Marshal(gmRsp.Data)
		if err != nil {
			retStep.Status = define.EnumReviewStepStatus_fail
			retStep.Desc = err.Error()
			dao.Error(ctx, err.Error())
			return retStep, nil
		}
		resultStr = string(tmpResultStr)
	}
	retStep.Status = define.EnumReviewStepStatus_success
	retStep.Desc = resultStr

	dao.Info(ctx, "review send user:%v:%v order:%v Method[%v] name:%v project:%v ip:%v path:%v msg:%v", sendUserId, sendUserName,
		orderData.Data.Method, orderData.Id, orderData.Name, projectData.Name, projectData.Data.GmAddr, orderData.Data.Path, string(gmExecJson))
	return retStep, nil
}

// 审核命令
func StepGmOrderReview(ctx *web.WebContext, user *dao.CacheUser, reviewProjectId int64, reviewOrderId int64, reviewId int64, isAgree bool, bAuto bool) (*db_extra.ReviewStep, error) {
	// 判断用户是否有审核命令的权限
	_, orderIds, err := dao.GetUserOrderByReview(ctx, reviewProjectId, user, define.EnumPowerReview_review)
	if err != nil {
		dao.Error(ctx, "order review step：%v %v is err:%v", reviewId, isAgree, err)
		return nil, err
	}
	bReview := false

	for _, orderId := range orderIds {
		if orderId == reviewOrderId {
			bReview = true
			break
		}
	}

	if !bReview {
		if bAuto { // 权限不支持自动审核
			return nil, nil
		}
		err := fmt.Errorf("order review step：%v %v power is not enough", reviewId, isAgree)
		dao.Error(ctx, err.Error())
		// 权限不足
		return nil, err
	}

	desc := "拒绝"
	if isAgree {
		desc = "同意"
	}

	stepData := &db_extra.ReviewStep{
		StepId:     define.EnumOrderStep_review,
		UserId:     user.Rid,
		UserName:   user.Name,
		Status:     define.EnumReviewStepStatus_success,
		ReviewTime: time.Now().Unix(),
		Desc:       desc,
	}

	return stepData, nil
}
