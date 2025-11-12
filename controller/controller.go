package controller

import (
	"github.com/gin-gonic/gin"
	"github.com/mimis-s/gmweb/modules/login"
)

// 模拟用户数据
var users = map[string]string{
	"admin": "123456",
	"user":  "password",
}

func Index(c *gin.Context) {
	c.HTML(200, "index.html", nil)
}

// 注册界面
func Register(c *gin.Context) {
	c.HTML(200, "register.html", nil)
}

// 主界面
func Home(c *gin.Context) {
	c.HTML(200, "tab_home.html", nil)
}

// 登录界面
func Login(c *gin.Context) {
	// c.HTML(200, "login.html", nil)
	login.LoginPageHandler(c)
}

// 登录界面
func PostApiLogin(c *gin.Context) {
	// c.HTML(200, "tab_home.html", nil)
	// c.Header("next-page", "/tab_home")
	// c.JSON(http.StatusOK, gin.H{
	// 	"success": true,
	// 	"message": "成功",
	// })
	login.LoginHandler(c)
}
