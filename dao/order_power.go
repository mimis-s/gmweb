package dao

import (
	"regexp"

	"github.com/mimis-s/gmweb/common/dbmodel"
	"github.com/mimis-s/gmweb/common/define"
	"github.com/mimis-s/gmweb/common/web"
)

// 获取用户权限内的命令(review类型 -> 1: 执行权限 2: 审核权限)
func GetUserOrderByReview(ctx *web.WebContext, projectId int64, user *CacheUser, reviewStatus ...define.EnumPowerReview) (
	[]*dbmodel.GmOrder, []int64, error) {
	var orderDatas []*dbmodel.GmOrder
	var err error
	if projectId == 0 {
		orderDatas, err = GetAllOrderDatas()
	} else {
		orderDatas, err = GetOrderDatasByProjectId(projectId)
	}
	if user.Role == define.EnumRole_Administrator {
		if err != nil {
			return nil, nil, err
		}
		rets := make([]*dbmodel.GmOrder, 0)
		retIds := make([]int64, 0)
		for _, data := range orderDatas {
			retIds = append(retIds, data.Id)
			rets = append(rets, data)
		}
		return rets, retIds, nil
	}

	powerAssignmentDatas, err := GetPowerAssignmentDataByUserId(user.Rid)
	if err != nil {
		return nil, nil, err
	}

	powerGroups := make([]int64, 0)
	for _, powerAssignmentData := range powerAssignmentDatas {
		powerGroups = append(powerGroups, powerAssignmentData.GroupId)
	}

	// 查询权限组数据
	powerGroupDBDatas, err := FindEnabelPowerGroupDatas(powerGroups)
	if err != nil {
		return nil, nil, err
	}

	// 收集所有权限ID
	allPowerIds := make([]int64, 0, len(powerGroupDBDatas))
	for _, data := range powerGroupDBDatas {
		if data.ExtraData == nil {
			continue
		}
		allPowerIds = append(allPowerIds, data.ExtraData.PowerIds...)
	}

	// 如果没有权限ID，则直接返回
	if len(allPowerIds) == 0 {
		Error(ctx, "get project:%v orders powers:%v is ok", projectId, allPowerIds)
		return make([]*dbmodel.GmOrder, 0), make([]int64, 0), err
	}

	// 查询权限数据
	powerDBDatas, err := FindEnablePowerDatas(allPowerIds)
	if err != nil {
		return nil, nil, err
	}

	// 提取符合条件的命令
	if err != nil {
		return nil, nil, err
	}

	judgePower := func(orderData *dbmodel.GmOrder) bool {
		for _, powerData := range powerDBDatas {
			bReview := false
			for _, review := range powerData.Data.OrderReviews {
				for _, reviewStatusData := range reviewStatus {
					if review == reviewStatusData {
						bReview = true
						break
					}
				}
				if bReview {
					break
				}
			}
			if !bReview {
				continue
			}
			if powerData.ProjectId == 0 || powerData.ProjectId == projectId {
				if powerData.Data.Level == 0 || powerData.Data.Level == orderData.Level {
					re := regexp.MustCompile(powerData.Data.OrderNameMatch)
					if re.MatchString(orderData.Name) {
						return true
					}
				}
			}
		}
		return false
	}
	retOrders := make([]*dbmodel.GmOrder, 0)
	retOrderIds := make([]int64, 0)
	for _, orderData := range orderDatas {
		if judgePower(orderData) {
			retOrderIds = append(retOrderIds, orderData.Id)
			retOrders = append(retOrders, orderData)
		}
	}
	return retOrders, retOrderIds, nil
}
