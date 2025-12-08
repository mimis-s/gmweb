package dao

import "github.com/mimis-s/gmweb/common/dbmodel"

func FindOperationLogDatas(startTime int64, endTime int64) ([]*dbmodel.OperationLog, error) {
	rets := make([]*dbmodel.OperationLog, 0)
	err := daoHandler.db.ReadEngine().Table((&dbmodel.OperationLog{}).SubTable(0)).
		Where("update_date >= ? and update_date <= ?", startTime, endTime).Find(&rets)
	if err != nil {
		return nil, err
	}
	return rets, nil
}

func InsertOperationLogData(data *dbmodel.OperationLog) error {
	_, err := daoHandler.db.Table((&dbmodel.OperationLog{}).SubName()).Insert(data)
	if err != nil {
		return err
	}
	return nil
}
