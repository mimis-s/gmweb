package power

import (
	"fmt"

	"github.com/mimis-s/gmweb/common/dbmodel"
	"github.com/mimis-s/gmweb/common/define"
	"github.com/mimis-s/gmweb/common/web"
	"github.com/mimis-s/gmweb/common/webmodel"
	"github.com/mimis-s/gmweb/dao"
)

// 授权
func AddPermissionAssignmentHandler(ctx *web.WebContext, req *webmodel.AddPowerAssignmentReq, rsp *webmodel.AddPowerAssignmentRsp) error {
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

	assignmentUser, find, err := dao.GetUserData(int64(req.UserId))
	if err != nil {
		dao.Error(ctx, "add power assignment user:%v is err:%v", req.UserId, err)
		return err
	}
	if !find {
		// 不存在
		err := fmt.Errorf("add power assignment user:%v is not found", req.UserId)
		dao.Error(ctx, err.Error())
		return err
	}
	assignmentGroup, find, err := dao.GetPowerGroupData(int64(req.GroupId))
	if err != nil {
		dao.Error(ctx, "add power assignment user:%v group:%v is err:%v", req.UserId, req.GroupId, err)
		return err
	}
	if !find {
		// 不存在
		err := fmt.Errorf("add power assignment user:%v group:%v is not found", req.UserId, req.GroupId)
		dao.Error(ctx, err.Error())
		return err
	}

	_, find, err = dao.GetPowerAssignmentData(int64(req.UserId), int64(req.GroupId))
	if err != nil {
		dao.Error(ctx, "add power assignment user:%v group:%v is err:%v", req.UserId, req.GroupId, err)
		return err
	}
	if find {
		// 已经存在
		err := fmt.Errorf("add power assignment user:%v group:%v is exist", req.UserId, req.GroupId)
		dao.Error(ctx, err.Error())
		return err
	}

	insertData := &dbmodel.PowerAssignMent{
		UserId:  int64(req.UserId),
		GroupId: int64(req.GroupId),
	}
	err = dao.InsertPowerAssignmentData(insertData)
	if err != nil {
		dao.Error(ctx, "add power group user:%v group:%v is err:%v", req.UserId, req.GroupId, err)
		return err
	}

	rsp.Data = &webmodel.PermissionGroupUserAssignmentInfo{
		UserId:    int(assignmentUser.Rid),
		Name:      assignmentUser.Name,
		GroupId:   int(assignmentGroup.GroupId),
		GroupName: assignmentGroup.Name,
	}
	dao.Info(ctx, "add power assignment:%v name:%v group:%v is ok", insertData.UserId, assignmentUser.Name, assignmentGroup.Name)
	return nil
}

func DelPermissionAssignmentHandler(ctx *web.WebContext, req *webmodel.DelPowerAssignmentReq, rsp *webmodel.DelPowerAssignmentRsp) error {
	user := dao.GetSession(ctx)
	if user == nil {
		return nil
	}

	if user.Role != define.EnumRole_Administrator {
		// 权限不够
		err := fmt.Errorf("del power assignment but role:%v power is err", user.Role)
		dao.Error(ctx, err.Error())
		return err
	}

	err := dao.DelPowerAssignmentDataByIds([]int64{int64(req.Id)})
	if err != nil {
		dao.Error(ctx, "del power assignment:%v is err:%v", req.Id, err)
		return err
	}

	rsp.Id = req.Id

	dao.Info(ctx, "del power assignment:%v is ok", req.Id)
	return nil
}
