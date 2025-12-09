package dao

import "github.com/mimis-s/gmweb/common/dbmodel"

func GetUserData(userId int64) (*dbmodel.User, bool, error) {
	ret := &dbmodel.User{}
	find, err := daoHandler.db.ReadEngine().Table(ret.SubTable(0)).Where("rid=?", userId).Get(ret)
	if err != nil {
		return nil, false, err
	}
	return ret, find, nil
}

func GetUserDataByName(userName string) (*dbmodel.User, bool, error) {
	ret := &dbmodel.User{}
	find, err := daoHandler.db.ReadEngine().Table(ret.SubTable(0)).Where("name=?", userName).Get(ret)
	if err != nil {
		return nil, false, err
	}
	return ret, find, nil
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
