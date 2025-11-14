package controller

import (
	"net/http"

	"github.com/mimis-s/gmweb/common/web"

	"github.com/gorilla/sessions"
	"github.com/mimis-s/gmweb/common/webmodel"
)

var users = []*webmodel.User{}
var sessionStore = sessions.NewCookieStore([]byte("your-secret-key"))

func GetSession(ctx *web.WebContext) *sessions.Session {
	session, _ := sessionStore.Get(ctx.GetGinContext().Request, "session1")
	if auth, ok := session.Values["authenticated"].(bool); ok && auth {
		ctx.GetGinContext().Redirect(http.StatusFound, "/tab_home")
		return session
	}

	return nil
}

func SetSeesion(ctx *web.WebContext, req *webmodel.User) *sessions.Session {
	// 创建会话
	session, _ := sessionStore.Get(ctx.GetGinContext().Request, "session1")
	session.Values["authenticated"] = true
	session.Values["user_id"] = 1
	session.Values["username"] = req.Username

	if req.Remember == "on" {
		// 记住我 - 设置30天过期
		session.Options = &sessions.Options{
			Path:   "/",
			MaxAge: 30, // 10s
		}
	}

	session.Save(ctx.GetGinContext().Request, ctx.GetGinContext().Writer)
	return session
}
