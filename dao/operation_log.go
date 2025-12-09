package dao

import (
	"time"

	"github.com/mimis-s/gmweb/common/dbmodel"
)

func FindOperationLogDatas(startTime int64, endTime int64) ([]*dbmodel.OperationLog, error) {
	rets := make([]*dbmodel.OperationLog, 0)
	err := daoHandler.db.ReadEngine().Table((&dbmodel.OperationLog{}).SubTable(0)).
		Where("update_date >= ? and update_date <= ?", startTime, endTime).Find(&rets)
	if err != nil {
		return nil, err
	}
	return rets, nil
}

func insertOperationLogData(data *dbmodel.OperationLog) error {
	_, err := daoHandler.db.Table((&dbmodel.OperationLog{}).SubName()).Insert(data)
	if err != nil {
		return err
	}
	return nil
}

type LogLevel int

var (
	LogLevel_Debug LogLevel = 1
	LogLevel_Err   LogLevel = 2
	LogLevel_Info  LogLevel = 3
)

func log(userId int64, userName string, ip string, logLevel LogLevel, logStr string) {
	data := &dbmodel.OperationLog{
		UserId:     userId,
		UserName:   userName,
		Ip:         ip,
		LogLevel:   int(logLevel),
		LogStr:     logStr,
		UpdateDate: time.Now().Unix(),
	}
	insertOperationLogData(data)
}
