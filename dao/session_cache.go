package dao

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/mimis-s/gmweb/common/dbmodel"
	"github.com/mimis-s/gmweb/common/define"
	"github.com/mimis-s/gmweb/common/web"

	"github.com/gorilla/sessions"
)

type CacheUser struct {
	Rid      int64
	Name     string
	Password string
	Role     define.EnumRole // 用户角色(管理员/普通用户)
	Ip       string
}

var sessionStore = sessions.NewCookieStore([]byte("your-secret-key"))

func GetSession(ctx *web.WebContext) *CacheUser {
	session, _ := sessionStore.Get(ctx.GetGinContext().Request, "session1")
	if auth, ok := session.Values["authenticated"].(bool); ok && auth {
		user := &CacheUser{
			Rid:      session.Values["user_id"].(int64),
			Name:     session.Values["user_name"].(string),
			Password: session.Values["user_passwd"].(string),
			Role:     define.EnumRole(session.Values["user_role"].(int)),
			Ip:       session.Values["user_ip"].(string),
		}
		return user
	}
	ctx.NextPage("/login")

	return nil
}

// // 如果用户缓存已经过期, 则强行改变用户界面到登陆界面
// func GetSessionAndRedirectInit(ctx *web.WebContext) *sessions.Session {
// 	session, _ := sessionStore.Get(ctx.GetGinContext().Request, "session1")
// 	if auth, ok := session.Values["authenticated"].(bool); !ok || !auth {
// 		ctx.GetGinContext().Redirect(http.StatusFound, "/login")
// 		return nil
// 	}

// 	return session
// }

func RedirectSession(ctx *web.WebContext) error {
	session, _ := sessionStore.Get(ctx.GetGinContext().Request, "session1")
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
	session, _ := sessionStore.Get(ctx.GetGinContext().Request, "session1")
	session.Values["authenticated"] = true
	session.Values["user_id"] = userData.Rid
	session.Values["user_name"] = userData.Name
	session.Values["user_passwd"] = userData.Password
	session.Values["user_role"] = userData.Role
	session.Values["user_ip"] = userData.Custom.Ip

	if userData.Role == int(define.EnumRole_Administrator) {
		session.Values["tab_home"] = "/gm_tab_home"
	} else {
		session.Values["tab_home"] = "/gm_tab_home_user"
	}

	maxAge := 24 * 7 * 60 * 60 // 7天

	// 记住我 - 设置30天过期
	session.Options = &sessions.Options{
		Path:   "/",
		MaxAge: maxAge, // 10s
	}

	session.Save(ctx.GetGinContext().Request, ctx.GetGinContext().Writer)
	ctx.NextPage(session.Values["tab_home"].(string))
	return session
}
