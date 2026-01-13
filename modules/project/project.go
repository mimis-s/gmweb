package project

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

// 获取普通用户权限的project
func getRegularUserPermissionProjects(ctx *web.WebContext, user *dao.CacheUser) ([]*dbmodel.Project, error) {
	// 获取玩家数据
	powerAssignmentDatas, err := dao.GetPowerAssignmentDataByUserId(user.Rid)
	if err != nil {
		dao.Error(ctx, err.Error())
		return nil, err
	}

	powerGroups := make([]int64, 0)
	for _, powerAssignmentData := range powerAssignmentDatas {
		powerGroups = append(powerGroups, powerAssignmentData.GroupId)
	}

	// 检查玩家是否有权限组
	if len(powerGroups) == 0 {
		dao.Info(ctx, "get project brief info is ok")
		return []*dbmodel.Project{}, nil
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
		dao.Info(ctx, "get project brief info is ok")
		return []*dbmodel.Project{}, nil
	}

	// 查询权限数据
	powerDBDatas, err := dao.FindEnablePowerDatas(allPowerIds)
	if err != nil {
		dao.Error(ctx, err.Error())
		return nil, err
	}
	bAll := false
	projectIDs := make([]int64, 0, len(powerDBDatas))
	for _, powerDBData := range powerDBDatas {
		if powerDBData.ProjectId == 0 {
			bAll = true
			break
		}
		projectIDs = append(projectIDs, powerDBData.ProjectId)
	}
	projectDatas := make([]*dbmodel.Project, 0)
	if bAll {
		projectDatas, err = dao.GetAllProjectDatas()
	} else {
		projectDatas, err = dao.GetProjectDataByIds(projectIDs)
	}
	if err != nil {
		dao.Error(ctx, err.Error())
		return nil, err
	}
	return projectDatas, nil
}

func getAdminUserPermissionProjects(ctx *web.WebContext, user *dao.CacheUser) ([]*dbmodel.Project, error) {
	projectDatas, err := dao.GetAllProjectDatas()
	if err != nil {
		dao.Error(ctx, err.Error())
		return nil, err
	}
	return projectDatas, nil
}

// 普通用户获取自己拥有的所有项目信息
func GetGmProjectBriefInfoHandler(ctx *web.WebContext, req *webmodel.GetGmProjectBriefInfoReq, rsp *webmodel.GetGmProjectBriefInfoRsp) error {
	user := dao.GetSession(ctx)
	if user == nil {
		return nil
	}
	var err error
	var projectDatas []*dbmodel.Project
	switch user.Role {
	case define.EnumRole_Administrator:
		projectDatas, err = getAdminUserPermissionProjects(ctx, user)
		if err != nil {
			dao.Error(ctx, err.Error())
			return err
		}
	default:
		projectDatas, err = getRegularUserPermissionProjects(ctx, user)
		if err != nil {
			dao.Error(ctx, err.Error())
			return err
		}
	}

	rsp.Datas = make([]*webmodel.GmProjectBriefInfo, 0)
	for _, projectData := range projectDatas {
		rsp.Datas = append(rsp.Datas, &webmodel.GmProjectBriefInfo{
			ProjectId: int(projectData.Id),
			Name:      projectData.Name,
			Desc:      projectData.Data.Desc,
		})
	}
	dao.Debug(ctx, "get project brief info is ok")

	return nil
}

func AddGmProjectHandler(ctx *web.WebContext, req *webmodel.AddGmProjectReq, rsp *webmodel.AddGmProjectRsp) error {
	user := dao.GetSession(ctx)
	if user == nil {
		return nil
	}

	if user.Role != define.EnumRole_Administrator {
		// 权限不够
		err := fmt.Errorf("user:%v add project, but power:%v is err", user.Rid, user.Role)
		dao.Error(ctx, err.Error())
		return err
	}

	if req.Name == "" {
		err := fmt.Errorf("add project name:%v is null", req.Name)
		dao.Error(ctx, err.Error())
		return err
	}

	// 项目名不能重复
	_, find, err := dao.GetProjectDataByName(req.Name)
	if err != nil {
		dao.Error(ctx, "add project:%v is err:%v", req.Name, err)
		return err
	}

	if find {
		err := fmt.Errorf("add project:%v is already exist", req.Name)
		dao.Error(ctx, err.Error())
		return err
	}
	insertData := &dbmodel.Project{
		Name: req.Name,
		Data: &db_extra.ProjectExtra{
			Desc:   req.Desc,
			GmAddr: req.GmAddr,
		},
	}
	err = dao.InsertProjectData(insertData)
	if err != nil {
		dao.Error(ctx, "add project:%v is err:%v", req.Name, err)
		return err
	}
	rsp.Data = &webmodel.GmProject{
		ProjectId: int(insertData.Id),
		Name:      insertData.Name,
		Desc:      insertData.Data.Desc,
		GmAddr:    insertData.Data.GmAddr,
		Datas:     make([]*webmodel.GmOrder, 0),
	}
	dao.Info(ctx, "add project:%v name:%v gmaddr:%v desc:%v is ok", insertData.Id, insertData.Name, insertData.Data.GmAddr, insertData.Data.Desc)

	return nil
}

func DelGmProjectReqHandler(ctx *web.WebContext, req *webmodel.DelGmProjectReq, rsp *webmodel.DelGmProjectRsp) error {
	user := dao.GetSession(ctx)
	if user == nil {
		return nil
	}

	if user.Role != define.EnumRole_Administrator {
		// 权限不够
		err := fmt.Errorf("user:%v del project, but power:%v is err", user.Rid, user.Role)
		dao.Error(ctx, err.Error())
		return err
	}

	// 项目对应权限也需要删除
	projectData, find, err := dao.GetProjectData(int64(req.ProjectId))
	if err != nil {
		dao.Error(ctx, "del project:%v is err:%v", req.ProjectId, err)
		return err
	}

	if !find {
		err := fmt.Errorf("del project:%v is not found", req.ProjectId)
		dao.Error(ctx, err.Error())
		return err
	}

	err = dao.DelPowersByProjectId([]int64{int64(req.ProjectId)})
	if err != nil {
		dao.Error(ctx, "del project:%v powers is err:%v", req.ProjectId, err)
		return err
	}

	// 对应的gm命令也要删除
	err = dao.DelOrderDataByProjectId(int64(req.ProjectId))
	if err != nil {
		dao.Error(ctx, "del project:%v order is err:%v", req.ProjectId, err)
		return err
	}

	err = dao.DelProjectData(int64(req.ProjectId))
	if err != nil {
		dao.Error(ctx, "del project:%v is err:%v", req.ProjectId, err)
		return err
	}
	rsp.ProjectId = req.ProjectId

	dao.Info(ctx, "del project:%v name:%v is ok", projectData.Id, projectData.Name)

	return nil
}

func ModifyGmProjectHandler(ctx *web.WebContext, req *webmodel.ModifyGmProjectReq, rsp *webmodel.ModifyGmProjectRsp) error {
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

	if req.Name == "" {
		err := fmt.Errorf("modify project name:%v is null", req.Name)
		dao.Error(ctx, err.Error())
		return err
	}

	// 项目名不能重复
	project, find, err := dao.GetProjectDataByName(req.Name)
	if err != nil {
		dao.Error(ctx, "modify project:%v is err:%v", req.Name, err)
		return err
	}

	if find && project.Id != int64(req.ProjectId) {
		err := fmt.Errorf("modify project:%v is already exist", req.Name)
		dao.Error(ctx, err.Error())
		return err
	}

	projectData, find, err := dao.GetProjectData(int64(req.ProjectId))
	if err != nil {
		dao.Error(ctx, "modify project:%v is err:%v", req.ProjectId, err)
		return err
	}

	if !find {
		err := fmt.Errorf("modify project:%v is not found", req.ProjectId)
		dao.Error(ctx, err.Error())
		return err
	}
	projectData.Name = req.Name
	projectData.Data.Desc = req.Desc
	projectData.Data.GmAddr = req.GmAddr
	err = dao.UpdateProjectData(projectData.Id, projectData)
	if err != nil {
		dao.Error(ctx, "modify project:%v is err:%v", req.ProjectId, err)
		return err
	}
	rsp.Desc = req.Desc
	rsp.GmAddr = req.GmAddr
	rsp.Name = req.Name
	rsp.ProjectId = req.ProjectId

	strProject, _ := json.Marshal(rsp)
	dao.Info(ctx, "modify project:%v is ok", string(strProject))

	return nil
}

func GetGmProjectBoxHandler(ctx *web.WebContext, req *webmodel.GetGmProjectBoxReq, rsp *webmodel.GetGmProjectBoxRsp) error {
	user := dao.GetSession(ctx)
	if user == nil {
		return nil
	}

	if user.Role != define.EnumRole_Administrator {
		// 权限不够
		err := fmt.Errorf("user:%v get project box, but power:%v is err", user.Rid, user.Role)
		dao.Error(ctx, err.Error())
		return err
	}

	projectDatas, err := dao.GetAllProjectDatas()
	if err != nil {
		dao.Error(ctx, "get project box is err:%v", err)
		return err
	}

	allOrderDatas, err := dao.GetAllOrderDatas()
	if err != nil {
		dao.Error(ctx, "get project box is err:%v", err)
		return err
	}

	orderMap := make(map[int64][]*dbmodel.GmOrder)
	for _, orderData := range allOrderDatas {
		orderMap[orderData.ProjectId] = append(orderMap[orderData.ProjectId], orderData)
	}

	rsp.Datas = make([]*webmodel.GmProject, 0)
	for _, projectData := range projectDatas {
		retProjectData := &webmodel.GmProject{
			ProjectId: int(projectData.Id),
			Name:      projectData.Name,
			Desc:      projectData.Data.Desc,
			GmAddr:    projectData.Data.GmAddr,
			Datas:     make([]*webmodel.GmOrder, 0),
		}

		for _, orderData := range orderMap[projectData.Id] {
			retOrderData := &webmodel.GmOrder{
				OrderId:     int(orderData.Id),
				OrderName:   orderData.Name,
				Path:        orderData.Data.Path,
				Method:      orderData.Data.Method,
				OrderDesc:   orderData.Desc,
				Level:       orderData.Level,
				OrderStruct: orderData.Data.OrderStruct,
			}
			retProjectData.Datas = append(retProjectData.Datas, retOrderData)
		}
		rsp.Datas = append(rsp.Datas, retProjectData)
	}
	dao.Debug(ctx, "get all project box is ok")
	return nil
}
