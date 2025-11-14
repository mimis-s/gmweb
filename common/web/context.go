package web

import "github.com/gin-gonic/gin"

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
