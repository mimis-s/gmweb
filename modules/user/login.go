package user

import (
	"fmt"

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
	userDBData := dao.GetSession(ctx)
	if userDBData == nil {
		userDBData, find, err = dao.GetUserDataByName(req.Username)
		if err != nil {
			return err
		}
		if !find {
			return fmt.Errorf("user:%v login, but is not found", req.Username)
		}
	}
	passwd, err := encrypt.Decrypt(userDBData.Password)
	if err != nil {
		return fmt.Errorf("user:%v login is err:%v", req.Username, err)
	}
	if passwd != req.Password {
		return fmt.Errorf("user:%v login, but passwd is err", req.Username)
	}
	session := dao.SetSeesion(ctx, userDBData)

	ctx.NextPage(session.Values["tab_home"].(string))

	dao.Info(ctx, "login is success")
	return nil
}
