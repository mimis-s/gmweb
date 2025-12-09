package order

import (
	"fmt"

	"github.com/mimis-s/gmweb/common/web"
	"github.com/mimis-s/gmweb/common/webmodel"
	"github.com/mimis-s/gmweb/dao"
)

func GetGmOrderBoxReq(ctx *web.WebContext, roleId int64, req *webmodel.GetGmOrderBoxReq, rsp *webmodel.GetGmOrderBoxRsp) error {
	rsp.ProjectId = req.ProjectId
	rsp.Datas = make([]*webmodel.RoleGmOrder, 0)

	// 获取玩家数据, 里面有玩家拥有的权限组, 玩家使用命令的记录(点赞等)
	roleDBData, find, err := dao.GetUserData(roleId)
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
	// gmOrderDBDatas, err := dao.FindOrderDatas(req.ProjectId, levels)
	// if err != nil {
	// 	return err
	// }

	// for _, data := range gmOrderDBDatas {
	// 	if data.Data == nil {
	// 		continue
	// 	}
	// 	lastRunArgs := ""
	// 	if roleDBData.OrderStatus != nil {
	// 		if len(roleDBData.OrderStatus.LastRunArgsMap) != 0 {
	// 			lastRunArgs = roleDBData.OrderStatus.LastRunArgsMap[data.Id]
	// 		}
	// 	}
	// 	rsp.Datas = append(rsp.Datas, &webmodel.RoleGmOrder{
	// 		GmOrderData: &webmodel.GmOrder{
	// 			OrderId:     data.Id,
	// 			OrderName:   data.Name,
	// 			OrderDesc:   data.Data.Desc,
	// 			Level:       data.Level,
	// 			OrderStruct: data.Data.OrderStruct,
	// 		},
	// 		LastRunArgs: lastRunArgs,
	// 	})
	// }
	return nil
}
