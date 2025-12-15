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
)

func GetPermissionHandler(ctx *web.WebContext, req *webmodel.GetPermissionReq, rsp *webmodel.GetPermissionRsp) error {
	user := dao.GetSession(ctx)
	if user == nil {
		return nil
	}

	if user.Role != define.EnumRole_Administrator {
		// 权限不够
		err := fmt.Errorf("get power but role:%v power is err", user.Role)
		dao.Error(ctx, err.Error())
		return err
	}

	// 所有用户
	allUsers, err := dao.GetAllUserDataByRole(define.EnumRole_Regular)
	if err != nil {
		dao.Error(ctx, "get power is err:%v", err)
		return err
	}

	for _, userData := range allUsers {
		rsp.AllUsers = append(rsp.AllUsers, &webmodel.PermissionGroupUserInfo{
			Id:   userData.Rid,
			Name: userData.Name,
		})
	}

	findUser := func(userId int64) *dbmodel.User {
		for _, userData := range allUsers {
			if userId == userData.Rid {
				return userData
			}
		}
		return nil
	}

	// 所有project
	allProjects, err := dao.GetAllProjectDatas()
	if err != nil {
		dao.Error(ctx, "get power is err:%v", err)
		return err
	}
	for _, projectData := range allProjects {
		rsp.AllProjects = append(rsp.AllProjects, &webmodel.PermissionProject{
			ProjectId: projectData.Id,
			Name:      projectData.Name,
		})
	}

	findProject := func(projectId int64) *dbmodel.Project {
		for _, projectData := range allProjects {
			if projectId == projectData.Id {
				return projectData
			}
		}
		return nil
	}

	// 权限
	allPowers, err := dao.GetAllPowerDatas()
	if err != nil {
		dao.Error(ctx, "get power is err:%v", err)
		return err
	}

	findPower := func(powerId int64) *dbmodel.Power {
		for _, powerData := range allPowers {
			if powerId == powerData.PowerId {
				return powerData
			}
		}
		return nil
	}

	delPowerIds := make([]int64, 0)
	for index := 0; index < len(allPowers); index++ {
		powerData := allPowers[index]
		tmpProjectName := ""
		tmpProject := findProject(powerData.ProjectId)
		if tmpProject != nil {
			tmpProjectName = tmpProject.Name
		}
		if powerData.ProjectId != 0 && tmpProject == nil {
			// 可能出现projectid找不到项目的情况, 这种情况的权限直接删除
			allPowers = append(allPowers[:index], allPowers[index+1:]...)
			delPowerIds = append(delPowerIds, powerData.PowerId)
			index--
			continue
		}
		rsp.PermissionDatas = append(rsp.PermissionDatas, &webmodel.PermissionInfo{
			Id:             powerData.PowerId,
			Name:           powerData.Name,
			Enable:         powerData.Enable,
			ProjectId:      powerData.ProjectId,
			ProjectName:    tmpProjectName,
			Level:          powerData.Data.Level,
			OrderNameMatch: powerData.Data.OrderNameMatch,
		})
	}

	// 删除过期的power
	if len(delPowerIds) > 0 {
		err := dao.DelPowers(delPowerIds)
		if err != nil {
			dao.Error(ctx, "del over power:%v is err:%v", delPowerIds, err)
			return err
		}
	}

	// 权限组
	allPowerGroups, err := dao.GetAllPowerGroupDatas()
	if err != nil {
		dao.Error(ctx, "get all power group is err:%v", err)
		return err
	}
	for _, powerGroup := range allPowerGroups {
		bUpdatePowerGroup := false
		// 检查是否有不正确的poweid
		for indexPowerId := 0; indexPowerId < len(powerGroup.ExtraData.PowerIds); indexPowerId++ {
			if findPower(powerGroup.ExtraData.PowerIds[indexPowerId]) == nil {
				bUpdatePowerGroup = true
				powerGroup.ExtraData.PowerIds = append(powerGroup.ExtraData.PowerIds[:indexPowerId], powerGroup.ExtraData.PowerIds[indexPowerId+1:]...)
				indexPowerId--
			}
		}

		// 检查是否有不正确的用户id
		retGroupUsers := make([]*webmodel.PermissionGroupUserInfo, 0)
		for indexPowerGroupUser := 0; indexPowerGroupUser < len(powerGroup.ExtraData.UserIds); indexPowerGroupUser++ {
			userId := powerGroup.ExtraData.UserIds[indexPowerGroupUser]
			tmpUser := findUser(userId)
			if tmpUser == nil {
				bUpdatePowerGroup = true
				powerGroup.ExtraData.UserIds = append(powerGroup.ExtraData.UserIds[:indexPowerGroupUser], powerGroup.ExtraData.UserIds[indexPowerGroupUser+1:]...)
				indexPowerGroupUser--
			} else {
				retGroupUsers = append(retGroupUsers, &webmodel.PermissionGroupUserInfo{
					Id:   tmpUser.Rid,
					Name: tmpUser.Name,
				})
			}
		}
		rsp.PermissionGroupDatas = append(rsp.PermissionGroupDatas, &webmodel.PermissionGroupInfo{
			Id:       powerGroup.GroupId,
			Name:     powerGroup.Name,
			Enable:   powerGroup.Enable,
			PowerIds: powerGroup.ExtraData.PowerIds,
			Users:    retGroupUsers,
		})

		if bUpdatePowerGroup {
			err := dao.UpdatePowerGroupData(powerGroup.GroupId, powerGroup)
			if err != nil {
				dao.Error(ctx, "get all power group is err:%v", err)
				continue
			}
		}

	}

	// 所有level等级
	rsp.AllLevels = []int{1, 2, 3, 4, 5}

	dao.Info(ctx, "get all power is ok")

	return nil
}

func AddPermissionHandler(ctx *web.WebContext, req *webmodel.AddPermissionReq, rsp *webmodel.AddPermissionRsp) error {
	user := dao.GetSession(ctx)
	if user == nil {
		return nil
	}

	if user.Role != define.EnumRole_Administrator {
		// 权限不够
		err := fmt.Errorf("add power but role:%v power is err", user.Role)
		dao.Error(ctx, err.Error())
		return err
	}

	projectName := ""
	if req.ProjectId != 0 {
		projectData, find, err := dao.GetProjectData(req.ProjectId)
		if err != nil {
			dao.Error(ctx, "add power is err:%v", err)
			return err
		}
		if !find {
			err := fmt.Errorf("add power project:%v is not found", req.ProjectId)
			dao.Error(ctx, err.Error())
			return err
		}
		projectName = projectData.Name
	}

	insertData := &dbmodel.Power{
		Name:      req.Name,
		ProjectId: req.ProjectId,
		Enable:    req.Enable,
		Data: &db_extra.PowerExtra{
			Level:          req.Level,
			OrderNameMatch: req.OrderNameMatch,
		},
	}

	err := dao.InsertPowerData(insertData)
	if err != nil {
		dao.Error(ctx, "add power is err:%v", err)
		return err
	}
	rsp.Data = &webmodel.PermissionInfo{
		Id:             insertData.PowerId,
		Name:           insertData.Name,
		Enable:         insertData.Enable,
		ProjectId:      insertData.ProjectId,
		ProjectName:    projectName,
		Level:          insertData.Data.Level,
		OrderNameMatch: insertData.Data.OrderNameMatch,
	}
	dao.Info(ctx, "add power:%v is ok", rsp.Data)
	return nil
}

func ModifyPermissionHandler(ctx *web.WebContext, req *webmodel.ModifyPermissionReq, rsp *webmodel.ModifyPermissionRsp) error {
	user := dao.GetSession(ctx)
	if user == nil {
		return nil
	}

	if user.Role != define.EnumRole_Administrator {
		// 权限不够
		err := fmt.Errorf("modify power but role:%v power is err", user.Role)
		dao.Error(ctx, err.Error())
		return err
	}

	powerData, find, err := dao.GetPowerData(req.Data.Id)
	if err != nil {
		dao.Error(ctx, "modify power is err:%v", err)
		return err
	}

	if !find {
		dao.Error(ctx, "modify power:%v is not found", req.Data.Id)
		return err
	}

	powerData.Name = req.Data.Name
	powerData.Enable = req.Data.Enable
	powerData.Data.Level = req.Data.Level
	powerData.Data.OrderNameMatch = req.Data.OrderNameMatch
	powerData.ProjectId = req.Data.ProjectId

	err = dao.UpdatePowerData(powerData.PowerId, powerData)
	if err != nil {
		dao.Error(ctx, "modify power is err:%v", err)
		return err
	}

	rsp.Data = req.Data

	dao.Info(ctx, "modify power:%v is ok", rsp.Data)
	return nil
}

func DelPermissionHandler(ctx *web.WebContext, req *webmodel.DelPermissionReq, rsp *webmodel.DelPermissionRsp) error {
	user := dao.GetSession(ctx)
	if user == nil {
		return nil
	}

	if user.Role != define.EnumRole_Administrator {
		// 权限不够
		err := fmt.Errorf("modify power but role:%v power is err", user.Role)
		dao.Error(ctx, err.Error())
		return err
	}

	err := dao.DelPowers([]int64{req.Id})
	if err != nil {
		dao.Error(ctx, "del power:%v is err:%v", req.Id, err)
		return err
	}
	rsp.Id = req.Id
	dao.Info(ctx, "del power:%v is ok", req.Id)
	return nil
}

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
	powerDatas, err := dao.FindPowerDatas(req.PowerIds)
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
		Enable: req.Enable,
		ExtraData: &db_extra.PowerGroupExtra{
			PowerIds: req.PowerIds,
			UserIds:  make([]int64, 0),
		},
	}
	err = dao.InsertPowerGroupData(insertData)
	if err != nil {
		dao.Error(ctx, "add power group is err:%v", err)
		return err
	}
	rsp.Data = &webmodel.PermissionGroupInfo{
		Id:       insertData.GroupId,
		Name:     req.Name,
		Enable:   req.Enable,
		PowerIds: req.PowerIds,
		Users:    make([]*webmodel.PermissionGroupUserInfo, 0),
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

	powerGroupData, find, err := dao.GetPowerGroupData(req.Data.Id)
	if err != nil {
		dao.Error(ctx, "modify power group is err:%v", err)
		return err
	}

	if !find {
		dao.Error(ctx, "modify power group:%v is not found", req.Data.Id)
		return err
	}

	// 查询这些添加的权限是否真实存在
	powerDatas, err := dao.FindPowerDatas(req.Data.PowerIds)
	if err != nil {
		dao.Error(ctx, "modify power group is err:%v", err)
		return err
	}
	if len(powerDatas) != len(req.Data.PowerIds) {
		err := fmt.Errorf("modify power group powers:%v real len:%v is not equal", req.Data.PowerIds, len(powerDatas))
		dao.Error(ctx, err.Error())
		return err
	}

	// 查询这些玩家是否真实存在
	userDatas, err := dao.FindUserDatas(powerGroupData.ExtraData.UserIds)
	if err != nil {
		dao.Error(ctx, "modify power group is err:%v", err)
		return err
	}
	if len(userDatas) != len(powerGroupData.ExtraData.UserIds) {
		err := fmt.Errorf("modify power group users:%v real len:%v is not equal", powerGroupData.ExtraData.UserIds, len(userDatas))
		dao.Error(ctx, err.Error())
		return err
	}

	powerGroupData.Name = req.Data.Name
	powerGroupData.Enable = req.Data.Enable
	powerGroupData.ExtraData.PowerIds = req.Data.PowerIds
	for _, modifyGroupUser := range req.Data.Users {
		bFindUser := false
		for _, id := range powerGroupData.ExtraData.UserIds {
			if id == modifyGroupUser.Id {
				bFindUser = true
				break
			}
		}
		if !bFindUser {
			powerGroupData.ExtraData.UserIds = append(powerGroupData.ExtraData.UserIds, modifyGroupUser.Id)

			// 更新玩家权限数据

		}
	}
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

	powerGroupData, find, err := dao.GetPowerGroupData(req.Id)
	if err != nil {
		dao.Error(ctx, "del power group is err:%v", err)
		return err
	}

	if !find {
		dao.Error(ctx, "del power group:%v is not found", req.Id)
		return err
	}

	// 删除玩家身上的权限组标记
	for _, userId := range powerGroupData.ExtraData.UserIds {
		tmpUpdateUser, find, err := dao.GetUserData(userId)
		if err != nil {
			dao.Error(ctx, "del power group user:%v is err:%v", userId, err)
			continue
		}
		if !find {
			dao.Error(ctx, "del power group user:%v is not found", userId)
			continue
		}
		err = dao.UpdateUserData(tmpUpdateUser.Rid, tmpUpdateUser)
		if err != nil {
			dao.Error(ctx, "del power group user:%v update is err:%v", userId, err)
			continue
		}
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
