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
		ProjectId: insertData.Id,
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
	projectData, find, err := dao.GetProjectData(req.ProjectId)
	if err != nil {
		dao.Error(ctx, "del project:%v is err:%v", req.ProjectId, err)
		return err
	}

	if !find {
		err := fmt.Errorf("del project:%v is not found", req.ProjectId)
		dao.Error(ctx, err.Error())
		return err
	}

	err = dao.DelPowersByProjectId([]int64{req.ProjectId})
	if err != nil {
		dao.Error(ctx, "del project:%v powers is err:%v", req.ProjectId, err)
		return err
	}

	// 对应的gm命令也要删除
	err = dao.DelOrderDataByProjectId(req.ProjectId)
	if err != nil {
		dao.Error(ctx, "del project:%v order is err:%v", req.ProjectId, err)
		return err
	}

	err = dao.DelProjectData(req.ProjectId)
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

	if find && project.Id != req.ProjectId {
		err := fmt.Errorf("modify project:%v is already exist", req.Name)
		dao.Error(ctx, err.Error())
		return err
	}

	projectData, find, err := dao.GetProjectData(req.ProjectId)
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
	projectData.Data.GmAddr = req.Desc
	err = dao.UpdateProjectData(projectData.Id, projectData)
	if err != nil {
		dao.Error(ctx, "modify project:%v is err:%v", req.ProjectId, err)
		return err
	}
	rsp.Desc = req.Desc
	rsp.GmAddr = req.GmAddr
	rsp.Name = req.GmAddr
	rsp.ProjectId = req.ProjectId

	strProject, _ := json.Marshal(rsp)
	dao.Info(ctx, "modify project:%v is ok", string(strProject))

	return nil
}
