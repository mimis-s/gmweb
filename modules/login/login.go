package login

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/sessions"
)

type User struct {
	Username string `json:"username"`
	Password string `json:"password"`
	Remember string `json:"remember"`
}

var users = []User{}
var sessionStore = sessions.NewCookieStore([]byte("your-secret-key"))

func LoginPageHandler(c *gin.Context) {
	session, _ := sessionStore.Get(c.Request, "session1")
	if auth, ok := session.Values["authenticated"].(bool); ok && auth {
		c.Redirect(http.StatusFound, "/tab_home")
		return
	}

	c.HTML(http.StatusOK, "login.html", gin.H{
		"title": "用户登录",
	})
}

func LoginHandler(c *gin.Context) {
	loginReq := &User{}
	err := c.ShouldBindJSON(loginReq)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "失败",
		})
		return
	}

	// 创建会话
	session, _ := sessionStore.Get(c.Request, "session1")
	session.Values["authenticated"] = true
	session.Values["user_id"] = 1
	session.Values["username"] = loginReq.Username

	if loginReq.Remember == "on" {
		// 记住我 - 设置30天过期
		session.Options = &sessions.Options{
			Path:   "/",
			MaxAge: 30, // 10s
		}
	}

	session.Save(c.Request, c.Writer)

	// 在Header中返回下一个页面路径
	c.Header("next-page", "/tab_home")
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "成功",
	})
}
