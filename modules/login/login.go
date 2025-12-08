package login

import (
	"github.com/mimis-s/gmweb/common/web"
	"github.com/mimis-s/gmweb/common/webmodel"
)

func LoginHandler(ctx *web.WebContext, req *webmodel.GetUserReq, rsp *webmodel.GetUserRsp) error {
	// 在Header中返回下一个页面路径
	ctx.NextPage("/gm_tab_home_user")
	return nil
}
