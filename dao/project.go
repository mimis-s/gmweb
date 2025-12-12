package dao

import "github.com/mimis-s/gmweb/common/dbmodel"

func GetProjectData(id int64) (*dbmodel.Project, bool, error) {
	ret := &dbmodel.Project{}
	find, err := daoHandler.db.ReadEngine().Table(ret.SubName()).Where("id=?", id).Get(ret)
	if err != nil {
		return nil, false, err
	}
	return ret, find, nil
}

func GetProjectDataByName(name string) (*dbmodel.Project, bool, error) {
	ret := &dbmodel.Project{}
	find, err := daoHandler.db.ReadEngine().Table(ret.SubName()).Where("name=?", name).Get(ret)
	if err != nil {
		return nil, false, err
	}
	return ret, find, nil
}

func GetAllProjectDatas() ([]*dbmodel.Project, error) {
	rets := make([]*dbmodel.Project, 0)
	err := daoHandler.db.ReadEngine().Table((&dbmodel.Project{}).SubName()).Find(&rets)
	if err != nil {
		return nil, err
	}
	return rets, nil
}

func UpdateProjectData(id int64, data *dbmodel.Project) error {
	_, err := daoHandler.db.Table((&dbmodel.Project{}).SubName()).Where("id=?", id).Update(data)
	if err != nil {
		return err
	}
	return nil
}

func InsertProjectData(data *dbmodel.Project) error {
	_, err := daoHandler.db.Table((&dbmodel.Project{}).SubName()).Insert(data)
	if err != nil {
		return err
	}
	return nil
}

func DelProjectData(projectId int64) error {
	_, err := daoHandler.db.Table((&dbmodel.Project{}).SubName()).Where("id=?", projectId).Unscoped().Delete(&dbmodel.Project{})
	if err != nil {
		return err
	}
	return nil
}
