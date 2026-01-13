package review

import (
	"fmt"

	"github.com/mimis-s/gmweb/common/define"
	"github.com/mimis-s/gmweb/common/web"
	"github.com/mimis-s/gmweb/common/webmodel"
	"github.com/mimis-s/gmweb/dao"
	"github.com/mimis-s/gmweb/modules/gm_common"
)

// 按照时间查询审核数据
func GetReviewHandler(ctx *web.WebContext, req *webmodel.GetReviewReq, rsp *webmodel.GetReviewRsp) error {
	user := dao.GetSession(ctx)
	if user == nil {
		return nil
	}

	_, orderIds, err := dao.GetUserOrderByReview(ctx, req.ProjectId, user, define.EnumPowerReview_review)
	if err != nil {
		dao.Error(ctx, err.Error())
		return err
	}

	datas, err := dao.FindReviewDatas(req.ProjectId, orderIds, req.StartTime, req.EndTime)
	if err != nil {
		dao.Error(ctx, err.Error())
		return err
	}

	rsp.Datas = make([]*webmodel.ReviewInfo, 0)
	for _, data := range datas {
		reviewModelData := &webmodel.ReviewInfo{
			ProjectId:   data.ReviewDB.ProjectId,
			ProjectName: data.ProjectDB.Name,
			OrderId:     data.ReviewDB.OrderId,
			OrderName:   data.OrderDB.Name,
			OrderDesc:   data.OrderDB.Desc,
			UserId:      data.ReviewDB.UserId,
			UserName:    data.UserDB.Name,
			ResultData:  make([]*webmodel.ReviewStep, 0),
			StartDate:   data.ReviewDB.StartDate,
		}
		for _, stepData := range data.ReviewDB.ExtraData.ResultData {
			reviewModelData.ResultData = append(reviewModelData.ResultData, &webmodel.ReviewStep{
				UserId:     stepData.UserId,
				UserName:   stepData.UserName,
				Status:     stepData.Status,
				ReviewTime: stepData.ReviewTime,
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
	datas, err := dao.FindReviewByUserDatas(user.Rid, req.OrderId)
	if err != nil {
		dao.Error(ctx, err.Error())
		return err
	}
	rsp.Datas = make([]*webmodel.ReviewInfo, 0)
	for _, data := range datas {
		reviewModelData := &webmodel.ReviewInfo{
			ProjectId:   data.ReviewDB.ProjectId,
			ProjectName: data.ProjectDB.Name,
			OrderId:     data.ReviewDB.OrderId,
			OrderName:   data.OrderDB.Name,
			OrderDesc:   data.OrderDB.Desc,
			UserId:      data.ReviewDB.UserId,
			UserName:    data.UserDB.Name,
			ResultData:  make([]*webmodel.ReviewStep, 0),
			StartDate:   data.ReviewDB.StartDate,
		}
		for _, stepData := range data.ReviewDB.ExtraData.ResultData {
			reviewModelData.ResultData = append(reviewModelData.ResultData, &webmodel.ReviewStep{
				UserId:     stepData.UserId,
				UserName:   stepData.UserName,
				Status:     stepData.Status,
				ReviewTime: stepData.ReviewTime,
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

	reviewData, find, err := dao.GetReviewData(req.ReviewId)
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

	stepData, err := gm_common.StepGmOrderReview(ctx, user, reviewData.ReviewDB.ProjectId, reviewData.ReviewDB.OrderId, req.ReviewId, req.IsAgree, false)
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
		dao.Error(ctx, "order review step：%v %v is err:%v", req.ReviewId, req.IsAgree, err)
		return err
	}
	reviewData.ReviewDB.ExtraData.NextStepId++
	reviewData.ReviewDB.ExtraData.ResultData = append(reviewData.ReviewDB.ExtraData.ResultData, stepData)
	err = dao.UpdateReviewData(reviewData.ReviewDB.Id, reviewData.ReviewDB)
	if err != nil {
		dao.Error(ctx, "order review step：%v %v is err:%v", req.ReviewId, req.IsAgree, err)
		return err
	}
	rsp.Data = &webmodel.ReviewInfo{
		ProjectId:   reviewData.ReviewDB.ProjectId,
		ProjectName: reviewData.ProjectDB.Name,
		OrderId:     reviewData.ReviewDB.OrderId,
		OrderName:   reviewData.OrderDB.Name,
		OrderDesc:   reviewData.OrderDB.Desc,
		UserId:      reviewData.ReviewDB.UserId,
		UserName:    reviewData.UserDB.Name,
		ResultData:  make([]*webmodel.ReviewStep, 0),
	}
	for _, stepData := range reviewData.ReviewDB.ExtraData.ResultData {
		rsp.Data.ResultData = append(rsp.Data.ResultData, &webmodel.ReviewStep{
			UserId:     stepData.UserId,
			UserName:   stepData.UserName,
			Status:     stepData.Status,
			ReviewTime: stepData.ReviewTime,
			Desc:       stepData.Desc,
		})
	}

	dao.Info(ctx, "order review step：%v %v, next step:%v is ok", req.ReviewId, req.IsAgree, reviewData.ReviewDB.ExtraData.NextStepId)
	return nil
}
