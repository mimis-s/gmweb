package order

import (
	"fmt"

	"github.com/mimis-s/gmweb/common/web"
	"github.com/mimis-s/gmweb/common/webmodel"
	"github.com/mimis-s/gmweb/dao"
)

func GetGmOrderReq(ctx *web.WebContext, roleId int64, req *webmodel.GetGmOrderReq, rsp *webmodel.GetGmOrderRsp) error {
	rsp.ProjectId = req.ProjectId
	rsp.Datas = make([]*webmodel.GmOrder, 0)

	// 获取玩家数据, 里面有玩家拥有的权限组, 玩家使用命令的记录(点赞等)
	roleDBData, find, err := dao.GetRoleData(roleId)
	if err != nil {
		return err
	}
	if !find {
		return fmt.Errorf("role:%v get gm order but not found db", roleId)
	}

	// 权限组, 权限组里面有大量实际的权限
	if roleDBData.RolePowerData == nil || len(roleDBData.RolePowerData.PowerGroups) == 0 {
		// 没有任何权限
		return nil
	}
	powerGroupDBDatas, err := dao.FindPowerGroupDatas(roleDBData.RolePowerData.PowerGroups)
	if err != nil {
		return err
	}

	allPowerIds := make([]int64, 0)
	for _, data := range powerGroupDBDatas {
		if data.ExtraData == nil {
			continue
		}
		for _, powerId := range data.ExtraData.PowerIds {
			allPowerIds = append(allPowerIds, powerId)
		}
	}

	powerDBDatas, err := dao.FindPowerDatas(allPowerIds)
	if err != nil {
		return err
	}

	levels := make([]int, 0)
	for _, data := range powerDBDatas {
		if data.Data != nil && data.Data.ProjectId == req.ProjectId {
			levels = append(levels, data.Data.Level)
		}
	}
	gmOrderDBDatas, err := dao.FindOrderDatas(req.ProjectId, levels)
	if err != nil {
		return err
	}

	for _, data := range gmOrderDBDatas {
		if data.Data == nil {
			continue
		}
		isLike := false     // 当前玩家是否点赞
		isBelittle := false // 当前玩家是否倒赞
		iscollect := false  // 当前玩家是否收藏
		lastRunArgs := ""
		if roleDBData.OrderStatus != nil {
			if len(roleDBData.OrderStatus.LastRunArgsMap) != 0 {
				lastRunArgs = roleDBData.OrderStatus.LastRunArgsMap[data.Id]
			}
			if roleDBData.OrderStatus.OrderStatusMap != nil && roleDBData.OrderStatus.OrderStatusMap[data.Id] != nil {
				isLike = roleDBData.OrderStatus.OrderStatusMap[data.Id][1]
				isBelittle = roleDBData.OrderStatus.OrderStatusMap[data.Id][2]
				iscollect = roleDBData.OrderStatus.OrderStatusMap[data.Id][3]
			}
		}
		rsp.Datas = append(rsp.Datas, &webmodel.GmOrder{
			OrderId:     data.Id,
			OrderName:   data.Name,
			OrderDesc:   data.Data.Desc,
			Level:       data.Level,
			OrderStruct: data.Data.OrderStruct,
			LastRunArgs: lastRunArgs,
			OrderStatus: data.Data.OrderStatusNum,
			IsLike:      isLike,
			IsBelittle:  isBelittle,
			Iscollect:   iscollect,
		})
	}
	return nil
}
