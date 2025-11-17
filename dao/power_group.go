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
	err := daoHandler.db.ReadEngine().Table((&dbmodel.PowerGroup{}).SubName()).In("group_id", groupIds).Find(&rets)
	if err != nil {
		return nil, err
	}
	return rets, nil
}

func UpdatePowerGroupData(groupId int64, data *dbmodel.PowerGroup) error {
	_, err := daoHandler.db.Table((&dbmodel.PowerGroup{}).SubName()).Where("group_id=?", groupId).Update(data)
	if err != nil {
		return err
	}
	return nil
}

func InsertPowerGroupData(data *dbmodel.PowerGroup) error {
	_, err := daoHandler.db.Table((&dbmodel.PowerGroup{}).SubName()).Insert(data)
	if err != nil {
		return err
	}
	return nil
}
