package service

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/mimis-s/gmweb/common/web"
	"github.com/mimis-s/gmweb/common/webmodel"
	"github.com/mimis-s/gmweb/modules/login/dao"
)

type Service struct {
	dao *dao.Dao
}

func (s *Service) LoginPageHandler(ctx *web.WebContext) {
	ctx.GetGinContext().HTML(http.StatusOK, "login.html", gin.H{
		"title": "用户登录",
	})
}

func (s *Service) LoginHandler(ctx *web.WebContext, req *webmodel.User) {
	// 在Header中返回下一个页面路径
	ctx.GetGinContext().Header("next-page", "/tab_home")
	ctx.GetGinContext().JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "成功",
	})
}
