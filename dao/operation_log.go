package dao

import (
	"fmt"
	"time"

	"github.com/mimis-s/gmweb/common/dbmodel"
	"github.com/mimis-s/gmweb/common/web"
)

func FindOperationLogDatas(startTime int64, endTime int64, level int, userName string, ipAddr string, msg string) ([]*dbmodel.OperationLog, error) {
	rets := make([]*dbmodel.OperationLog, 0)
	session := daoHandler.db.ReadEngine().Table((&dbmodel.OperationLog{}).SubTable(0)).
		Where("update_date >= ? and update_date <= ?", startTime, endTime)
	if level != 0 {
		session = session.Where("log_level=?", level)
	}
	if userName != "" {
		session = session.Where("user_name=?", "userName")
	}
	if ipAddr != "" {
		session = session.Where("ip like ?", "%"+ipAddr+"%")
	}
	if msg != "" {
		session = session.Where("log_str like ?", "%"+msg+"%")
	}
	err := session.Find(&rets)
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
	LogLevel_Debug    LogLevel = 1
	LogLevel_Err      LogLevel = 2
	LogLevel_Info     LogLevel = 3
	LogLevel_Warnning LogLevel = 4
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

func Warning(ctx *web.WebContext, format string, args ...interface{}) {
	user := GetSession(ctx)
	if user != nil {
		log(user.Rid, user.Name, user.Ip, LogLevel_Warnning, fmt.Sprintf(format, args...))
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
