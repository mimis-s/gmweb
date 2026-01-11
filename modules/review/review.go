package review

import (
	"fmt"
	"time"

	"github.com/mimis-s/gmweb/common/dbmodel/db_extra"
	"github.com/mimis-s/gmweb/common/define"
	"github.com/mimis-s/gmweb/common/web"
	"github.com/mimis-s/gmweb/common/webmodel"
	"github.com/mimis-s/gmweb/dao"
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
			ProjectName: data.ProjectName,
			OrderId:     data.ReviewDB.OrderId,
			OrderName:   data.OrderName,
			OrderDesc:   data.OrderDesc,
			UserId:      data.ReviewDB.UserId,
			UserName:    data.UserName,
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
			ProjectName: data.ProjectName,
			OrderId:     data.ReviewDB.OrderId,
			OrderName:   data.OrderName,
			OrderDesc:   data.OrderDesc,
			UserId:      data.ReviewDB.UserId,
			UserName:    data.UserName,
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
	if reviewData.ExtraData.NextStepId != define.EnumOrderStep_review {
		err = fmt.Errorf("order review step：%v %v, next step:%v is err",
			req.ReviewId, req.IsAgree, reviewData.ExtraData.NextStepId)
		dao.Error(ctx, "order review step：%v %v, next step:%v is err",
			req.ReviewId, req.IsAgree, reviewData.ExtraData.NextStepId)
		return err
	}

	// 判断用户是否有审核命令的权限
	_, orderIds, err := dao.GetUserOrderByReview(ctx, reviewData.ProjectId, user, define.EnumPowerReview_review)
	if err != nil {
		dao.Error(ctx, "order review step：%v %v is err:%v", req.ReviewId, req.IsAgree, err)
		return err
	}
	bReview := false

	for _, orderId := range orderIds {
		if orderId == reviewData.OrderId {
			bReview = true
			break
		}
	}

	if !bReview {
		err := fmt.Errorf("order review step：%v %v power is not enough", req.ReviewId, req.IsAgree)
		dao.Error(ctx, err.Error())
		// 权限不足
		return err
	}

	desc := "拒绝"
	if req.IsAgree {
		desc = "同意"
	}

	reviewData.ExtraData.ResultData = append(reviewData.ExtraData.ResultData, &db_extra.ReviewStep{
		StepId:     define.EnumOrderStep_review,
		UserId:     reviewData.UserId,
		UserName:   user.Name,
		Status:     define.EnumReviewStepStatus_success,
		ReviewTime: time.Now().Unix(),
		Desc:       desc,
	})

	reviewData.ExtraData.NextStepId++

	dao.Info(ctx, "order review step：%v %v, next step:%v is ok", req.ReviewId, req.IsAgree, reviewData.ExtraData.NextStepId)
	return nil
}
