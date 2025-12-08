package glog

import (
	"fmt"
	"time"

	"github.com/mimis-s/gmweb/common/dbmodel"
	"github.com/mimis-s/gmweb/dao"
)

type LogLevel int

var (
	LogLevel_Debug LogLevel = 1
	LogLevel_Err   LogLevel = 2
	LogLevel_Info  LogLevel = 3
)

func log(userId int64, userName string, logLevel LogLevel, logStr string) {
	data := &dbmodel.OperationLog{
		UserId:     userId,
		UserName:   userName,
		LogLevel:   int(logLevel),
		LogStr:     logStr,
		UpdateDate: time.Now().Unix(),
	}
	dao.InsertOperationLogData(data)
}

func Debug(userId int64, userName string, format string, args ...interface{}) {
	log(userId, userName, LogLevel_Debug, fmt.Sprintf(format, args...))
}

func Info(userId int64, userName string, format string, args ...interface{}) {
	log(userId, userName, LogLevel_Info, fmt.Sprintf(format, args...))
}
func Error(userId int64, userName string, format string, args ...interface{}) {
	log(userId, userName, LogLevel_Err, fmt.Sprintf(format, args...))
}
