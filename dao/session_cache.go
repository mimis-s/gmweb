package dao

import (
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/mimis-s/gmweb/common/dbmodel"
	"github.com/mimis-s/gmweb/common/define"
	"github.com/mimis-s/gmweb/common/web"

	"github.com/gorilla/sessions"
	"github.com/mimis-s/gmweb/common/webmodel"
)

var users = []*webmodel.GetUserReq{}
var sessionStore = sessions.NewCookieStore([]byte("gmweb_session_key"))

func GetSession(ctx *web.WebContext) *dbmodel.User {
	session, _ := sessionStore.Get(ctx.GetGinContext().Request, "user-session")
	if auth, ok := session.Values["authenticated"].(bool); ok && auth {
		user := session.Values["user"].(*dbmodel.User)
		return user
	}

	return nil
}

// 如果用户缓存已经过期, 则强行改变用户界面到登陆界面
func GetSessionAndRedirectInit(ctx *web.WebContext) bool {
	session, _ := sessionStore.Get(ctx.GetGinContext().Request, "user-session")
	if auth, ok := session.Values["authenticated"].(bool); !ok || !auth {
		ctx.GetGinContext().Redirect(http.StatusFound, "/login")
		return true
	}

	return false
}

func RedirectSession(ctx *web.WebContext) error {
	session, _ := sessionStore.Get(ctx.GetGinContext().Request, "user-session")
	if auth, ok := session.Values["authenticated"].(bool); ok && auth {
		ctx.GetGinContext().Redirect(http.StatusFound, session.Values["tab_home"].(string))
		return nil
	}

	ctx.GetGinContext().HTML(http.StatusOK, "login.html", gin.H{
		"title": "用户登录",
	})

	return nil
}

func SetSeesion(ctx *web.WebContext, userData *dbmodel.User) *sessions.Session {
	// 创建会话
	session, _ := sessionStore.Get(ctx.GetGinContext().Request, "user-session")
	session.Values["authenticated"] = true
	session.Values["user"] = userData

	if userData.Role == int(define.EnumRole_Administrator) {
		session.Values["tab_home"] = "/gm_tab_home"
	} else {
		session.Values["tab_home"] = "/gm_tab_home_user"
	}

	// 记住我 - 设置30天过期
	session.Options = &sessions.Options{
		Path:   "/",
		MaxAge: 10, // 10s
	}

	session.Save(ctx.GetGinContext().Request, ctx.GetGinContext().Writer)
	return session
}

func Debug(ctx *web.WebContext, format string, args ...interface{}) {
	user := GetSession(ctx)
	if user != nil {
		log(user.Rid, user.Name, user.Custom.Ip, LogLevel_Debug, fmt.Sprintf(format, args...))
	}
}

func Error(ctx *web.WebContext, format string, args ...interface{}) {
	user := GetSession(ctx)
	if user != nil {
		log(user.Rid, user.Name, user.Custom.Ip, LogLevel_Err, fmt.Sprintf(format, args...))
	}
}

func Info(ctx *web.WebContext, format string, args ...interface{}) {
	user := GetSession(ctx)
	if user != nil {
		log(user.Rid, user.Name, user.Custom.Ip, LogLevel_Info, fmt.Sprintf(format, args...))
	}
}
