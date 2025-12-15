package dao

import "github.com/mimis-s/gmweb/common/dbmodel"

func GetOrderData(oriderId int64) (*dbmodel.GmOrder, bool, error) {
	ret := &dbmodel.GmOrder{}
	find, err := daoHandler.db.ReadEngine().Table(ret.SubName()).Where("id=?", oriderId).Get(ret)
	if err != nil {
		return nil, false, err
	}
	return ret, find, nil
}

func GetOrderDataByName(name string) (*dbmodel.GmOrder, bool, error) {
	ret := &dbmodel.GmOrder{}
	find, err := daoHandler.db.ReadEngine().Table(ret.SubName()).Where("name=?", name).Get(ret)
	if err != nil {
		return nil, false, err
	}
	return ret, find, nil
}

func GetOrderDatasByProjectId(projectId int64) ([]*dbmodel.GmOrder, error) {
	rets := make([]*dbmodel.GmOrder, 0)
	err := daoHandler.db.ReadEngine().Table((&dbmodel.GmOrder{}).SubName()).Where("project_id=?", projectId).Find(&rets)
	if err != nil {
		return nil, err
	}
	return rets, nil
}

func GetAllOrderDatas() ([]*dbmodel.GmOrder, error) {
	rets := make([]*dbmodel.GmOrder, 0)
	err := daoHandler.db.ReadEngine().Table((&dbmodel.GmOrder{}).SubName()).Find(&rets)
	if err != nil {
		return nil, err
	}
	return rets, nil
}

func UpdateOrderData(oriderId int64, data *dbmodel.GmOrder) error {
	_, err := daoHandler.db.Table((&dbmodel.GmOrder{}).SubName()).Where("id=?", oriderId).Update(data)
	if err != nil {
		return err
	}
	return nil
}

func InsertOrderData(data *dbmodel.GmOrder) error {
	_, err := daoHandler.db.Table((&dbmodel.GmOrder{}).SubName()).Insert(data)
	if err != nil {
		return err
	}
	return nil
}

func DelOrderDataByProjectId(projectId int64) error {
	_, err := daoHandler.db.Table((&dbmodel.GmOrder{}).SubName()).Where("project_id=?", projectId).Unscoped().Delete(&dbmodel.GmOrder{})
	if err != nil {
		return err
	}
	return nil
}

func DelOrderData(id int64) error {
	_, err := daoHandler.db.Table((&dbmodel.GmOrder{}).SubName()).Where("id=?", id).Unscoped().Delete(&dbmodel.GmOrder{})
	if err != nil {
		return err
	}
	return nil
}
