package dao

// func GetOrderData(roleId int64) (*dbmodel.GmOrder, bool, error) {
// 	ret := &dbmodel.GmOrder{}
// 	find, err := daoHandler.db.ReadEngine().Table(ret.SubName()).Where("id=?", roleId).Get(ret)
// 	if err != nil {
// 		return nil, false, err
// 	}
// 	return ret, find, nil
// }

// func FindOrderDatas(projectId int64, levels []int) ([]*dbmodel.GmOrder, error) {
// 	rets := make([]*dbmodel.GmOrder, 0)
// 	err := daoHandler.db.ReadEngine().Table((&dbmodel.GmOrder{}).SubName()).Where("project_id", projectId).In("level", levels).Find(&rets)
// 	if err != nil {
// 		return nil, err
// 	}
// 	return rets, nil
// }

// func UpdateOrderData(roleId int64, data *dbmodel.Role) error {
// 	_, err := daoHandler.db.Table((&dbmodel.Role{}).SubName()).Where("rid=?", roleId).Update(data)
// 	if err != nil {
// 		return err
// 	}
// 	return nil
// }

// func InsertOrderData(roleId int64, data *dbmodel.Role) error {
// 	_, err := daoHandler.db.Table((&dbmodel.Role{}).SubName()).Insert(data)
// 	if err != nil {
// 		return err
// 	}
// 	return nil
// }
