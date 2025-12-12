package dao

import (
	"fmt"
	"time"

	"github.com/mimis-s/gmweb/common/dbmodel"
	"github.com/mimis-s/gmweb/common/web"
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

func Debug(ctx *web.WebContext, format string, args ...interface{}) {
	user := GetSession(ctx)
	if user != nil {
		log(user.Rid, user.Name, user.Ip, LogLevel_Debug, fmt.Sprintf(format, args...))
	}
}

func Error(ctx *web.WebContext, format string, args ...interface{}) {
	user := GetSession(ctx)
	if user != nil {
		log(user.Rid, user.Name, user.Ip, LogLevel_Err, fmt.Sprintf(format, args...))
	}
}

func Info(ctx *web.WebContext, format string, args ...interface{}) {
	user := GetSession(ctx)
	if user != nil {
		log(user.Rid, user.Name, user.Ip, LogLevel_Info, fmt.Sprintf(format, args...))
	}
}
