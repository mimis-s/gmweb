package power

import (
	"encoding/json"
	"fmt"

	"github.com/mimis-s/gmweb/common/dbmodel"
	"github.com/mimis-s/gmweb/common/dbmodel/db_extra"
	"github.com/mimis-s/gmweb/common/define"
	"github.com/mimis-s/gmweb/common/web"
	"github.com/mimis-s/gmweb/common/webmodel"
	"github.com/mimis-s/gmweb/dao"
	"github.com/mimis-s/gmweb/lib/parse"
)

// 权限组
func AddPermissionGroupHandler(ctx *web.WebContext, req *webmodel.AddPermissionGroupReq, rsp *webmodel.AddPermissionGroupRsp) error {
	user := dao.GetSession(ctx)
	if user == nil {
		return nil
	}

	if user.Role != define.EnumRole_Administrator {
		// 权限不够
		err := fmt.Errorf("add power group but role:%v power is err", user.Role)
		dao.Error(ctx, err.Error())
		return err
	}

	// 查询这些添加的权限是否真实存在
	powerDatas, err := dao.FindPowerDatas(parse.SliceIntToInt64(req.PowerIds))
	if err != nil {
		dao.Error(ctx, "add power group is err:%v", err)
		return err
	}
	if len(powerDatas) != len(req.PowerIds) {
		err := fmt.Errorf("add power group powers:%v real len:%v is not equal", req.PowerIds, len(powerDatas))
		dao.Error(ctx, err.Error())
		return err
	}
	insertData := &dbmodel.PowerGroup{
		Name:   req.Name,
		Enable: &req.Enable,
		ExtraData: &db_extra.PowerGroupExtra{
			PowerIds: parse.SliceIntToInt64(req.PowerIds),
		},
	}
	err = dao.InsertPowerGroupData(insertData)
	if err != nil {
		dao.Error(ctx, "add power group is err:%v", err)
		return err
	}
	rsp.Data = &webmodel.PermissionGroupInfo{
		Id:       int(insertData.GroupId),
		Name:     req.Name,
		Enable:   req.Enable,
		PowerIds: req.PowerIds,
	}
	dao.Info(ctx, "add power group:%v name:%v powerids:%v is ok", insertData.GroupId, req.Name, req.PowerIds)
	return nil
}

func ModifyPermissionGroupHandler(ctx *web.WebContext, req *webmodel.ModifyPermissionGroupReq, rsp *webmodel.ModifyPermissionGroupRsp) error {
	user := dao.GetSession(ctx)
	if user == nil {
		return nil
	}

	if user.Role != define.EnumRole_Administrator {
		// 权限不够
		err := fmt.Errorf("modify power group but role:%v power is err", user.Role)
		dao.Error(ctx, err.Error())
		return err
	}

	powerGroupData, find, err := dao.GetPowerGroupData(int64(req.Data.Id))
	if err != nil {
		dao.Error(ctx, "modify power group is err:%v", err)
		return err
	}

	if !find {
		dao.Error(ctx, "modify power group:%v is not found", req.Data.Id)
		return err
	}

	// 查询这些添加的权限是否真实存在
	powerDatas, err := dao.FindPowerDatas(parse.SliceIntToInt64(req.Data.PowerIds))
	if err != nil {
		dao.Error(ctx, "modify power group is err:%v", err)
		return err
	}
	if len(powerDatas) != len(req.Data.PowerIds) {
		err := fmt.Errorf("modify power group powers:%v real len:%v is not equal", req.Data.PowerIds, len(powerDatas))
		dao.Error(ctx, err.Error())
		return err
	}

	powerGroupData.Name = req.Data.Name
	powerGroupData.Enable = &req.Data.Enable
	powerGroupData.ExtraData.PowerIds = parse.SliceIntToInt64(req.Data.PowerIds)
	err = dao.UpdatePowerGroupData(powerGroupData.GroupId, powerGroupData)
	if err != nil {
		dao.Error(ctx, "modify power group is err:%v", err)
		return err
	}
	rsp.Data = req.Data
	strGroup, _ := json.Marshal(rsp.Data)
	dao.Info(ctx, "modify power group:%v is ok", string(strGroup))
	return nil
}

func DelPermissionGroupHandler(ctx *web.WebContext, req *webmodel.DelPermissionGroupReq, rsp *webmodel.DelPermissionGroupRsp) error {
	user := dao.GetSession(ctx)
	if user == nil {
		return nil
	}

	if user.Role != define.EnumRole_Administrator {
		// 权限不够
		err := fmt.Errorf("del power group but role:%v power is err", user.Role)
		dao.Error(ctx, err.Error())
		return err
	}

	powerGroupData, find, err := dao.GetPowerGroupData(int64(req.Id))
	if err != nil {
		dao.Error(ctx, "del power group is err:%v", err)
		return err
	}

	if !find {
		dao.Error(ctx, "del power group:%v is not found", req.Id)
		return err
	}

	err = dao.DelPowerGroupData(powerGroupData.GroupId)
	if err != nil {
		dao.Error(ctx, "del power group:%v is err:%v", powerGroupData.GroupId, err)
		return err
	}
	rsp.Id = req.Id

	dao.Info(ctx, "del power group:%v is ok", req.Id)
	return nil
}
