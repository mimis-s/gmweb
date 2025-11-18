package web

import (
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
)

type Context interface {
	SetGinContext(ctx *gin.Context)
	GetGinContext() *gin.Context
}

type WebContext struct {
	ctx *gin.Context
}

func (w *WebContext) SetGinContext(ctx *gin.Context) {
	w.ctx = ctx

}
func (w *WebContext) GetGinContext() *gin.Context {
	return w.ctx
}

func (w *WebContext) NextPage(pagePath string) {
	w.ctx.Header("next-page", pagePath)
}

func (w *WebContext) Err(formatStr string, args ...any) {
	w.ctx.JSON(http.StatusFound, gin.H{
		"success": false,
		"message": fmt.Sprintf(formatStr, args...),
	})
}

func (w *WebContext) SuccessOk(rsp interface{}) {

	w.ctx.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": rsp,
	})
}
