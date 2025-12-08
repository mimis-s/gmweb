package dao

import "github.com/mimis-s/gmweb/common/dbmodel"

func GetUserData(userId int64) (*dbmodel.User, bool, error) {
	ret := &dbmodel.User{}
	find, err := daoHandler.db.ReadEngine().Table(ret.SubName()).Where("rid=?", userId).Get(ret)
	if err != nil {
		return nil, false, err
	}
	return ret, find, nil
}

func UpdateUserData(userId int64, data *dbmodel.User) error {
	_, err := daoHandler.db.Table((&dbmodel.User{}).SubName()).Where("rid=?", userId).Update(data)
	if err != nil {
		return err
	}
	return nil
}

func InsertUserData(userId int64, data *dbmodel.User) error {
	_, err := daoHandler.db.Table((&dbmodel.User{}).SubName()).Insert(data)
	if err != nil {
		return err
	}
	return nil
}
