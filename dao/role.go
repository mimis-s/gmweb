package dao

import "github.com/mimis-s/gmweb/common/dbmodel"

func GetRoleData(roleId int64) (*dbmodel.Role, bool, error) {
	ret := &dbmodel.Role{}
	find, err := daoHandler.db.ReadEngine().Table(ret.SubName()).Where("rid=?", roleId).Get(ret)
	if err != nil {
		return nil, false, err
	}
	return ret, find, nil
}

func UpdateRoleData(roleId int64, data *dbmodel.Role) error {
	_, err := daoHandler.db.Table((&dbmodel.Role{}).SubName()).Where("rid=?", roleId).Update(data)
	if err != nil {
		return err
	}
	return nil
}

func InsertRoleData(roleId int64, data *dbmodel.Role) error {
	_, err := daoHandler.db.Table((&dbmodel.Role{}).SubName()).Insert(data)
	if err != nil {
		return err
	}
	return nil
}
