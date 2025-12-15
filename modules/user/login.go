package user

import (
	"fmt"

	"github.com/mimis-s/gmweb/common/dbmodel/db_extra"
	"github.com/mimis-s/gmweb/common/web"
	"github.com/mimis-s/gmweb/common/webmodel"
	"github.com/mimis-s/gmweb/dao"
	"github.com/mimis-s/gmweb/lib/encrypt"
)

func LoginHandlerHtml(ctx *web.WebContext) error {
	dao.RedirectSession(ctx)
	return nil
}

func LoginHandler(ctx *web.WebContext, req *webmodel.GetUserReq, rsp *webmodel.GetUserRsp) error {
	// 在Header中返回下一个页面路径
	var err error
	var find bool
	user := dao.GetSession(ctx)
	if user != nil {
		return nil
	}
	userDBData, find, err := dao.GetUserDataByName(req.Username)
	if err != nil {
		return err
	}
	if !find {
		return fmt.Errorf("user:%v login, but is not found", req.Username)
	}

	passwd, err := encrypt.Decrypt(userDBData.Password)
	if err != nil {
		return fmt.Errorf("user:%v login is err:%v", req.Username, err)
	}
	if passwd != req.Password {
		return fmt.Errorf("user:%v login, but passwd is err", req.Username)
	}

	if userDBData.Custom == nil {
		userDBData.Custom = &db_extra.CustomInfo{}
	}

	userDBData.Custom.Ip = ctx.GetGinContext().ClientIP()
	dao.UpdateUserData(userDBData.Rid, userDBData)
	dao.SetSeesion(ctx, userDBData)

	dao.Info(ctx, "login is success")
	return nil
}
