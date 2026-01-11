package dao

import (
	"github.com/mimis-s/gmweb/common/dbmodel"
	"github.com/mimis-s/gmweb/common/define"
)

func GetUserData(userId int64) (*dbmodel.User, bool, error) {
	ret := &dbmodel.User{}
	find, err := daoHandler.db.ReadEngine().Table(ret.SubTable(0)).Where("rid=?", userId).Get(ret)
	if err != nil {
		return nil, false, err
	}
	return ret, find, nil
}

func FindUserDatas(userIds []int64) ([]*dbmodel.User, error) {
	rets := make([]*dbmodel.User, 0)
	err := daoHandler.db.ReadEngine().Table((&dbmodel.User{}).SubTable(0)).In("rid", userIds).Find(&rets)
	if err != nil {
		return nil, err
	}
	return rets, nil
}

func FindUserDatasToMap(userIds []int64) (map[int64]*dbmodel.User, error) {
	rets := make([]*dbmodel.User, 0)
	err := daoHandler.db.ReadEngine().Table((&dbmodel.User{}).SubTable(0)).In("rid", userIds).Find(&rets)
	if err != nil {
		return nil, err
	}
	retMap := make(map[int64]*dbmodel.User)
	for _, ret := range rets {
		retMap[ret.Rid] = ret
	}
	return retMap, nil
}

func GetUserDataByName(userName string) (*dbmodel.User, bool, error) {
	ret := &dbmodel.User{}
	find, err := daoHandler.db.ReadEngine().Table(ret.SubTable(0)).Where("name=?", userName).Get(ret)
	if err != nil {
		return nil, false, err
	}
	return ret, find, nil
}

func GetAllUserDataByRole(role define.EnumRole) ([]*dbmodel.User, error) {
	rets := make([]*dbmodel.User, 0)
	err := daoHandler.db.ReadEngine().Table((&dbmodel.User{}).SubTable(0)).Where("role=?", int(role)).Find(&rets)
	if err != nil {
		return nil, err
	}
	return rets, nil
}

func UpdateUserData(userId int64, data *dbmodel.User) error {
	_, err := daoHandler.db.Table((&dbmodel.User{}).SubTable(0)).Where("rid=?", userId).Update(data)
	if err != nil {
		return err
	}
	return nil
}

func InsertUserData(data *dbmodel.User) error {
	_, err := daoHandler.db.Table((&dbmodel.User{}).SubTable(0)).Insert(data)
	if err != nil {
		return err
	}
	return nil
}

func DelUserData(userId int64) error {
	_, err := daoHandler.db.Table((&dbmodel.User{}).SubTable(0)).Where("rid = ?", userId).Unscoped().Delete(&dbmodel.User{})
	if err != nil {
		return err
	}
	return nil
}
