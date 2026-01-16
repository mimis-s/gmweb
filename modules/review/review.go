package review

import (
	"fmt"
	"time"

	"github.com/mimis-s/gmweb/common/dbmodel/db_extra"
	"github.com/mimis-s/gmweb/common/define"
	"github.com/mimis-s/gmweb/common/web"
	"github.com/mimis-s/gmweb/common/webmodel"
	"github.com/mimis-s/gmweb/dao"
	"github.com/mimis-s/gmweb/lib/parse"
	"github.com/mimis-s/gmweb/modules/gm_common"
)

// 按照时间查询审核数据
func GetReviewHandler(ctx *web.WebContext, req *webmodel.GetReviewReq, rsp *webmodel.GetReviewRsp) error {
	user := dao.GetSession(ctx)
	if user == nil {
		return nil
	}

	_, orderIds, err := dao.GetUserOrderByReview(ctx, int64(req.ProjectId), user, define.EnumPowerReview_review)
	if err != nil {
		dao.Error(ctx, err.Error())
		return err
	}

	datas, err := dao.FindReviewDatas(int64(req.ProjectId), orderIds, parse.StringToInt64(req.StartTime), parse.StringToInt64(req.EndTime))
	if err != nil {
		dao.Error(ctx, err.Error())
		return err
	}

	rsp.Datas = make([]*webmodel.ReviewInfo, 0)
	for _, data := range datas {
		reviewModelData := &webmodel.ReviewInfo{
			Id:          int(data.ReviewDB.Id),
			ProjectId:   int(data.ReviewDB.ProjectId),
			ProjectName: data.ProjectDB.Name,
			OrderId:     int(data.ReviewDB.OrderId),
			OrderName:   data.OrderDB.Name,
			OrderDesc:   data.OrderDB.Desc,
			UserId:      int(data.ReviewDB.UserId),
			UserName:    data.UserDB.Name,
			NextStep:    data.ReviewDB.ExtraData.NextStepId,
			ResultData:  make([]*webmodel.ReviewStep, 0),
			StartDate:   parse.Int64ToString(data.ReviewDB.StartDate),
		}
		for _, stepData := range data.ReviewDB.ExtraData.ResultData {
			reviewModelData.ResultData = append(reviewModelData.ResultData, &webmodel.ReviewStep{
				StepId:     int(stepData.StepId),
				UserId:     int(stepData.UserId),
				UserName:   stepData.UserName,
				Status:     stepData.Status,
				ReviewTime: parse.Int64ToString(stepData.ReviewTime),
				Desc:       stepData.Desc,
			})
		}
		rsp.Datas = append(rsp.Datas, reviewModelData)
	}
	return nil
}

// 查询单个人某一条gm命令执行的审核数据
func GetUserOrderReviewHandler(ctx *web.WebContext, req *webmodel.GetUserOrderReviewReq, rsp *webmodel.GetUserOrderReviewRsp) error {
	user := dao.GetSession(ctx)
	if user == nil {
		return nil
	}
	datas, err := dao.FindReviewByUserDatas(user.Rid, int64(req.OrderId))
	if err != nil {
		dao.Error(ctx, err.Error())
		return err
	}
	rsp.Datas = make([]*webmodel.ReviewInfo, 0)
	for _, data := range datas {
		reviewModelData := &webmodel.ReviewInfo{
			Id:          int(data.ReviewDB.Id),
			ProjectId:   int(data.ReviewDB.ProjectId),
			ProjectName: data.ProjectDB.Name,
			OrderId:     int(data.ReviewDB.OrderId),
			OrderName:   data.OrderDB.Name,
			OrderDesc:   data.OrderDB.Desc,
			UserId:      int(data.ReviewDB.UserId),
			UserName:    data.UserDB.Name,
			ResultData:  make([]*webmodel.ReviewStep, 0),
			NextStep:    data.ReviewDB.ExtraData.NextStepId,
			StartDate:   parse.Int64ToString(data.ReviewDB.StartDate),
		}
		for _, stepData := range data.ReviewDB.ExtraData.ResultData {
			reviewModelData.ResultData = append(reviewModelData.ResultData, &webmodel.ReviewStep{
				StepId:     int(stepData.StepId),
				UserId:     int(stepData.UserId),
				UserName:   stepData.UserName,
				Status:     stepData.Status,
				ReviewTime: parse.Int64ToString(stepData.ReviewTime),
				Desc:       stepData.Desc,
			})
		}
		rsp.Datas = append(rsp.Datas, reviewModelData)
	}
	return nil
}

// 审核命令
func OrderReviewStepHandler(ctx *web.WebContext, req *webmodel.OrderReviewStepReq, rsp *webmodel.OrderReviewStepRsp) error {
	user := dao.GetSession(ctx)
	if user == nil {
		return nil
	}

	reviewData, find, err := dao.GetReviewData(int64(req.ReviewId))
	if err != nil {
		dao.Error(ctx, "order review step：%v %v is err:%v", req.ReviewId, req.IsAgree, err)
		return err
	}
	if !find {
		err = fmt.Errorf("order review step：%v %v is not found", req.ReviewId, req.IsAgree)
		dao.Error(ctx, "order review step：%v %v is not found", req.ReviewId, req.IsAgree)
		return err
	}
	if reviewData.ReviewDB.ExtraData.NextStepId != define.EnumOrderStep_review {
		err = fmt.Errorf("order review step：%v %v, next step:%v is err",
			req.ReviewId, req.IsAgree, reviewData.ReviewDB.ExtraData.NextStepId)
		dao.Error(ctx, "order review step：%v %v, next step:%v is err",
			req.ReviewId, req.IsAgree, reviewData.ReviewDB.ExtraData.NextStepId)
		return err
	}

	stepData, err := gm_common.StepGmOrderReview(ctx, user, reviewData.ReviewDB.ProjectId, reviewData.ReviewDB.OrderId, int64(req.ReviewId), req.IsAgree, false)
	if err != nil {
		return err
	}
	if stepData == nil {
		return nil
	}
	reviewData.ReviewDB.ExtraData.NextStepId++
	reviewData.ReviewDB.ExtraData.ResultData = append(reviewData.ReviewDB.ExtraData.ResultData, stepData)

	firstStep := reviewData.ReviewDB.ExtraData.ResultData[0]

	lastStep := &db_extra.ReviewStep{
		StepId:     define.EnumOrderStep_Push,
		UserId:     user.Rid,
		UserName:   user.Name,
		Status:     define.EnumReviewStepStatus_refuse,
		ReviewTime: time.Now().Unix(),
		Desc:       "审批已拒绝",
	}

	if req.IsAgree {
		lastStep, err = gm_common.StepGmOrderPush(ctx, user, firstStep.UserId, firstStep.UserName, reviewData.OrderDB, reviewData.ProjectDB, firstStep.Desc)
		if err != nil {
			dao.Error(ctx, "order review step：%v %v is err:%v", req.ReviewId, req.IsAgree, err)
			return err
		}
	}
	reviewData.ReviewDB.ExtraData.NextStepId++
	reviewData.ReviewDB.ExtraData.ResultData = append(reviewData.ReviewDB.ExtraData.ResultData, lastStep)
	err = dao.UpdateReviewData(reviewData.ReviewDB.Id, reviewData.ReviewDB)
	if err != nil {
		dao.Error(ctx, "order review step：%v %v is err:%v", req.ReviewId, req.IsAgree, err)
		return err
	}
	rsp.Data = &webmodel.ReviewInfo{
		Id:          int(reviewData.ReviewDB.Id),
		ProjectId:   int(reviewData.ReviewDB.ProjectId),
		ProjectName: reviewData.ProjectDB.Name,
		OrderId:     int(reviewData.ReviewDB.OrderId),
		OrderName:   reviewData.OrderDB.Name,
		OrderDesc:   reviewData.OrderDB.Desc,
		UserId:      int(reviewData.ReviewDB.UserId),
		UserName:    reviewData.UserDB.Name,
		NextStep:    reviewData.ReviewDB.ExtraData.NextStepId,
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

	dao.Info(ctx, "order review step：%v %v, next step:%v is ok", req.ReviewId, req.IsAgree, reviewData.ReviewDB.ExtraData.NextStepId)
	return nil
}
