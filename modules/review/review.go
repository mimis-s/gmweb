package review

import (
	"github.com/mimis-s/gmweb/common/web"
	"github.com/mimis-s/gmweb/common/webmodel"
	"github.com/mimis-s/gmweb/dao"
)

func GetReviewDataHandler(ctx *web.WebContext, req *webmodel.GetGmProjectBriefInfoReq, rsp *webmodel.GetGmProjectBriefInfoRsp) error {
	user := dao.GetSession(ctx)
	if user == nil {
		return nil
	}

	return nil
}
