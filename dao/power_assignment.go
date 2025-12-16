package dao

import "github.com/mimis-s/gmweb/common/dbmodel"

func GetPowerAssignmentDataByUserId(userId int64) ([]*dbmodel.PowerAssignMent, error) {
	rets := make([]*dbmodel.PowerAssignMent, 0)
	err := daoHandler.db.ReadEngine().Table((&dbmodel.PowerAssignMent{}).SubName()).Where("user_id=?", userId).Find(&rets)
	if err != nil {
		return nil, err
	}
	return rets, nil
}

func GetPowerAssignmentData(userId int64, groupId int64) (*dbmodel.PowerAssignMent, bool, error) {
	ret := &dbmodel.PowerAssignMent{}
	find, err := daoHandler.db.ReadEngine().Table((&dbmodel.PowerAssignMent{}).SubName()).Where("user_id=? and group_id=?", userId, groupId).Get(ret)
	if err != nil {
		return nil, false, err
	}
	return ret, find, nil
}

func GetAllPowerAssignmentDatas() ([]*dbmodel.PowerAssignMent, error) {
	rets := make([]*dbmodel.PowerAssignMent, 0)
	err := daoHandler.db.ReadEngine().Table((&dbmodel.PowerAssignMent{}).SubName()).Find(&rets)
	if err != nil {
		return nil, err
	}
	return rets, nil
}

func UpdatePowerAssignmentData(data *dbmodel.PowerAssignMent) error {
	_, err := daoHandler.db.Table((&dbmodel.PowerAssignMent{}).SubName()).Where("user_id=? and group_id=?", data.UserId, data.GroupId).Update(data)
	if err != nil {
		return err
	}
	return nil
}

func InsertPowerAssignmentData(data *dbmodel.PowerAssignMent) error {
	_, err := daoHandler.db.Table((&dbmodel.PowerAssignMent{}).SubName()).Insert(data)
	if err != nil {
		return err
	}
	return nil
}

func DelPowerAssignmentDataByIds(ids []int64) error {
	_, err := daoHandler.db.Table((&dbmodel.PowerAssignMent{}).SubName()).In("id", ids).Unscoped().Delete(&dbmodel.PowerAssignMent{})
	if err != nil {
		return err
	}
	return nil
}
