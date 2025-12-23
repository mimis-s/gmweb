package gm_log

import (
	"fmt"
	"math"

	"github.com/mimis-s/gmweb/common/define"
	"github.com/mimis-s/gmweb/common/web"
	"github.com/mimis-s/gmweb/common/webmodel"
	"github.com/mimis-s/gmweb/dao"
)

func GetGmLogHandler(ctx *web.WebContext, req *webmodel.GetGmLogReq, rsp *webmodel.GetGmLogRsp) error {
	user := dao.GetSession(ctx)
	if user == nil {
		return nil
	}

	if user.Role != define.EnumRole_Administrator {
		// 权限不够
		err := fmt.Errorf("user:%v modify project, but power:%v is err", user.Rid, user.Role)
		dao.Error(ctx, err.Error())
		return err
	}
	startTime := int64(math.Floor(float64(req.StartTime / 1000)))
	endTime := int64(math.Floor(float64(req.EndTime / 1000)))
	gmLogs, err := dao.FindOperationLogDatas(startTime, endTime, req.Level, req.UserName, req.Ip, req.Msg)
	if err != nil {
		dao.Error(ctx, "find gm log is err:%v", err)
		return err
	}
	for _, gmLog := range gmLogs {
		rsp.Datas = append(rsp.Datas, &webmodel.GmLogInfo{
			Ip:      gmLog.Ip,
			Level:   gmLog.LogLevel,
			LogTime: gmLog.UpdateDate * 1000,
			Msg:     gmLog.LogStr,
			UserId:  gmLog.UserId,
		})
	}
	return nil
}
