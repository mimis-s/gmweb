package order

import (
	"fmt"
	"regexp"

	"github.com/mimis-s/gmweb/common/dbmodel"
	"github.com/mimis-s/gmweb/common/dbmodel/db_extra"
	"github.com/mimis-s/gmweb/common/define"
	"github.com/mimis-s/gmweb/common/web"
	"github.com/mimis-s/gmweb/common/webmodel"
	"github.com/mimis-s/gmweb/dao"
)

// 获取普通用户权限内的命令
func getRegularUserOrder(ctx *web.WebContext, projectId int64, user *dao.CacheUser) ([]*dbmodel.GmOrder, error) {
	powerAssignmentDatas, err := dao.GetPowerAssignmentDataByUserId(user.Rid)
	if err != nil {
		dao.Error(ctx, err.Error())
		return nil, err
	}

	powerGroups := make([]int64, 0)
	for _, powerAssignmentData := range powerAssignmentDatas {
		powerGroups = append(powerGroups, powerAssignmentData.GroupId)
	}

	// 查询权限组数据
	powerGroupDBDatas, err := dao.FindEnabelPowerGroupDatas(powerGroups)
	if err != nil {
		dao.Error(ctx, err.Error())
		return nil, err
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
		dao.Error(ctx, "get project:%v orders powers:%v is ok", projectId, allPowerIds)
		return make([]*dbmodel.GmOrder, 0), nil
	}

	// 查询权限数据
	powerDBDatas, err := dao.FindEnablePowerDatas(allPowerIds)
	if err != nil {
		dao.Error(ctx, err.Error())
		return nil, err
	}

	// 提取符合条件的命令
	orderDatas, err := dao.GetOrderDatasByProjectId(projectId)
	if err != nil {
		dao.Error(ctx, err.Error())
		return nil, err
	}

	judgePower := func(orderData *dbmodel.GmOrder) bool {
		if user.Role == define.EnumRole_Administrator {
			return true
		}
		for _, powerData := range powerDBDatas {
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

	retOrderDatas := make([]*dbmodel.GmOrder, 0)

	for _, orderData := range orderDatas {
		if judgePower(orderData) {
			retOrderDatas = append(retOrderDatas, orderData)
		}
	}
	return retOrderDatas, nil
}

func getAdminUserOrder(ctx *web.WebContext, projectId int64, user *dao.CacheUser) ([]*dbmodel.GmOrder, error) {
	return dao.GetOrderDatasByProjectId(projectId)
}

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

	orderDatas := make([]*dbmodel.GmOrder, 0)
	switch user.Role {
	case define.EnumRole_Regular:
		orderDatas, err = getRegularUserOrder(ctx, req.ProjectId, user)
	case define.EnumRole_Administrator:
		orderDatas, err = getAdminUserOrder(ctx, req.ProjectId, user)
	}
	if err != nil {
		return err
	}

	rsp.Datas = make([]*webmodel.RoleGmOrder, 0, len(orderDatas))

	for _, orderData := range orderDatas {
		lastRunArgs := orderData.Data.OrderStruct
		if userDBData.OrderStatus != nil && userDBData.OrderStatus.LastRunArgsMap != nil && userDBData.OrderStatus.LastRunArgsMap[orderData.ProjectId] != nil {
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
	dao.Error(ctx, "get project:%v orders is ok", req.ProjectId)

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

	// 检查命令是否重名
	_, find, err = dao.GetOrderDataByName(req.OrderName)
	if err != nil {
		dao.Error(ctx, "add project:%v order:%v is err:%v", req.ProjectId, req.OrderName, err)
		return err
	}

	if find {
		err := fmt.Errorf("add project:%v order:%v is exist", req.ProjectId, req.OrderName)
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
	}
	dao.Info(ctx, "modify project:%v order:%v-%v Path:%v Method:%v is ok", req.ProjectId, orderData.Id, req.Data.OrderName, req.Data.Path, req.Data.Method)
	return nil
}
