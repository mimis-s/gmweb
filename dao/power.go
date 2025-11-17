package dao

import "github.com/mimis-s/gmweb/common/dbmodel"

func GetPowerData(Id int64) (*dbmodel.Power, bool, error) {
	ret := &dbmodel.Power{}
	find, err := daoHandler.db.ReadEngine().Table(ret.SubName()).Where("power_id=?", Id).Get(ret)
	if err != nil {
		return nil, false, err
	}
	return ret, find, nil
}

func FindPowerDatas(powerIds []int64) ([]*dbmodel.Power, error) {
	rets := make([]*dbmodel.Power, 0)
	err := daoHandler.db.ReadEngine().Table((&dbmodel.Power{}).SubName()).In("power_id", powerIds).Find(&rets)
	if err != nil {
		return nil, err
	}
	return rets, nil
}

func UpdatePowerData(Id int64, data *dbmodel.Power) error {
	_, err := daoHandler.db.Table((&dbmodel.Power{}).SubName()).Where("power_id=?", Id).Update(data)
	if err != nil {
		return err
	}
	return nil
}

func InsertPowerData(data *dbmodel.Power) error {
	_, err := daoHandler.db.Table((&dbmodel.Power{}).SubName()).Insert(data)
	if err != nil {
		return err
	}
	return nil
}
