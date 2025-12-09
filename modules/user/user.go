package user

import (
	"github.com/mimis-s/gmweb/common/web"
	"github.com/mimis-s/gmweb/common/webmodel"
	"github.com/mimis-s/gmweb/dao"
)

func GetAllUsersHandler(ctx *web.WebContext, req *webmodel.GetAllUsersReq, rsp *webmodel.GetAllUsersRsp) error {
	if dao.GetSessionAndRedirectInit(ctx) {
		return nil
	}
	return nil
}

func AddUserHandler(ctx *web.WebContext, req *webmodel.AddUserReq, rsp *webmodel.AddUserRsp) error {
	if dao.GetSessionAndRedirectInit(ctx) {
		return nil
	}
	return nil
}

func DelUserHandler(ctx *web.WebContext, req *webmodel.DelUserReq, rsp *webmodel.DelUserRsp) error {
	if dao.GetSessionAndRedirectInit(ctx) {
		return nil
	}
	return nil
}

func ModifyUserHandler(ctx *web.WebContext, req *webmodel.ModifyUserReq, rsp *webmodel.ModifyUserRsp) error {
	if dao.GetSessionAndRedirectInit(ctx) {
		return nil
	}
	return nil
}
