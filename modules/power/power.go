package power

import (
	"fmt"

	"github.com/mimis-s/gmweb/common/dbmodel"
	"github.com/mimis-s/gmweb/common/dbmodel/db_extra"
	"github.com/mimis-s/gmweb/common/define"
	"github.com/mimis-s/gmweb/common/web"
	"github.com/mimis-s/gmweb/common/webmodel"
	"github.com/mimis-s/gmweb/dao"
	"github.com/mimis-s/gmweb/lib/parse"
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
			UserId: int(userData.Rid),
			Name:   userData.Name,
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
			ProjectId: int(projectData.Id),
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
		orderReviews := make([]int, 0)
		for _, orderReview := range powerData.Data.OrderReviews {
			orderReviews = append(orderReviews, int(orderReview))
		}
		rsp.PermissionDatas = append(rsp.PermissionDatas, &webmodel.PermissionInfo{
			Id:             int(powerData.PowerId),
			Name:           powerData.Name,
			Enable:         *powerData.Enable,
			ProjectId:      int(powerData.ProjectId),
			ProjectName:    tmpProjectName,
			Level:          powerData.Data.Level,
			OrderNameMatch: powerData.Data.OrderNameMatch,
			OrderReviews:   orderReviews,
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
	findPowerGroup := func(powerGroupId int64) *dbmodel.PowerGroup {
		for _, powerGroupData := range allPowerGroups {
			if powerGroupId == powerGroupData.GroupId {
				return powerGroupData
			}
		}
		return nil
	}
	// 获取所有的权限分配情况
	allPowerAssignmentDatas, err := dao.GetAllPowerAssignmentDatas()
	if err != nil {
		dao.Error(ctx, "del over power:%v is err:%v", delPowerIds, err)
		return err
	}
	// 权限分配
	delPowerAssignmentIds := make([]int64, 0)
	for _, powerAssignment := range allPowerAssignmentDatas {
		userData := findUser(powerAssignment.UserId)
		powerGroupData := findPowerGroup(powerAssignment.GroupId)
		if userData == nil || powerGroupData == nil {
			delPowerAssignmentIds = append(delPowerAssignmentIds, powerAssignment.Id)
			continue
		}

		rsp.Assignment = append(rsp.Assignment, &webmodel.PermissionGroupUserAssignmentInfo{
			Id:        int(powerAssignment.Id),
			UserId:    int(powerAssignment.UserId),
			Name:      userData.Name,
			GroupId:   int(powerGroupData.GroupId),
			GroupName: powerGroupData.Name,
		})
	}
	if len(delPowerAssignmentIds) > 0 {
		err := dao.DelPowerAssignmentDataByIds(delPowerAssignmentIds)
		if err != nil {
			dao.Error(ctx, "del power assignment:%v is err:%v", delPowerIds, err)
			return err
		}
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
		rsp.PermissionGroupDatas = append(rsp.PermissionGroupDatas, &webmodel.PermissionGroupInfo{
			Id:       int(powerGroup.GroupId),
			Name:     powerGroup.Name,
			Enable:   *powerGroup.Enable,
			PowerIds: parse.SliceInt64ToInt(powerGroup.ExtraData.PowerIds),
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

	dao.Debug(ctx, "get all power is ok")

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
		projectData, find, err := dao.GetProjectData(int64(req.ProjectId))
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
		ProjectId: int64(req.ProjectId),
		Enable:    &req.Enable,
		Data: &db_extra.PowerExtra{
			Level:          req.Level,
			OrderNameMatch: req.OrderNameMatch,
			OrderReviews:   []define.EnumPowerReview{define.EnumPowerReview_run}, // 默认赋予执行权限
		},
	}

	err := dao.InsertPowerData(insertData)
	if err != nil {
		dao.Error(ctx, "add power is err:%v", err)
		return err
	}
	orderReviews := make([]int, 0)
	for _, orderReview := range insertData.Data.OrderReviews {
		orderReviews = append(orderReviews, int(orderReview))
	}
	rsp.Data = &webmodel.PermissionInfo{
		Id:             int(insertData.PowerId),
		Name:           insertData.Name,
		Enable:         *insertData.Enable,
		ProjectId:      int(insertData.ProjectId),
		ProjectName:    projectName,
		Level:          insertData.Data.Level,
		OrderNameMatch: insertData.Data.OrderNameMatch,
		OrderReviews:   orderReviews,
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

	powerData, find, err := dao.GetPowerData(int64(req.Data.Id))
	if err != nil {
		dao.Error(ctx, "modify power is err:%v", err)
		return err
	}

	if !find {
		dao.Error(ctx, "modify power:%v is not found", req.Data.Id)
		return err
	}

	orderReviews := make([]define.EnumPowerReview, 0)
	for _, orderReview := range req.Data.OrderReviews {
		orderReviews = append(orderReviews, define.EnumPowerReview(orderReview))
	}

	powerData.Name = req.Data.Name
	powerData.Enable = &req.Data.Enable
	powerData.Data.Level = req.Data.Level
	powerData.Data.OrderNameMatch = req.Data.OrderNameMatch
	powerData.Data.OrderReviews = orderReviews
	powerData.ProjectId = int64(req.Data.ProjectId)

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

	err := dao.DelPowers([]int64{int64(req.Id)})
	if err != nil {
		dao.Error(ctx, "del power:%v is err:%v", req.Id, err)
		return err
	}
	rsp.Id = req.Id
	dao.Info(ctx, "del power:%v is ok", req.Id)
	return nil
}
