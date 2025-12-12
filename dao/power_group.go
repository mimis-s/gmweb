package dao

import "github.com/mimis-s/gmweb/common/dbmodel"

func GetPowerGroupData(groupId int64) (*dbmodel.PowerGroup, bool, error) {
	ret := &dbmodel.PowerGroup{}
	find, err := daoHandler.db.ReadEngine().Table(ret.SubName()).Where("group_id=?", groupId).Get(ret)
	if err != nil {
		return nil, false, err
	}
	return ret, find, nil
}

func FindPowerGroupDatas(groupIds []int64) ([]*dbmodel.PowerGroup, error) {
	rets := make([]*dbmodel.PowerGroup, 0)
	err := daoHandler.db.ReadEngine().Table((&dbmodel.PowerGroup{}).SubTable(0)).In("group_id", groupIds).Find(&rets)
	if err != nil {
		return nil, err
	}
	return rets, nil
}

func GetAllPowerGroupDatas() ([]*dbmodel.PowerGroup, error) {
	rets := make([]*dbmodel.PowerGroup, 0)
	err := daoHandler.db.ReadEngine().Table((&dbmodel.PowerGroup{}).SubTable(0)).Find(&rets)
	if err != nil {
		return nil, err
	}
	return rets, nil
}

func UpdatePowerGroupData(groupId int64, data *dbmodel.PowerGroup) error {
	_, err := daoHandler.db.Table((&dbmodel.PowerGroup{}).SubTable(0)).Where("group_id=?", groupId).Update(data)
	if err != nil {
		return err
	}
	return nil
}

func InsertPowerGroupData(data *dbmodel.PowerGroup) error {
	_, err := daoHandler.db.Table((&dbmodel.PowerGroup{}).SubTable(0)).Insert(data)
	if err != nil {
		return err
	}
	return nil
}

func DelPowerGroupData(groupId int64) error {
	_, err := daoHandler.db.Table((&dbmodel.PowerGroup{}).SubTable(0)).Where("group_id=?", groupId).Unscoped().Delete(&dbmodel.PowerGroup{})
	if err != nil {
		return err
	}
	return nil
}
