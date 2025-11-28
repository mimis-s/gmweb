package webmodel

type GetUserReq struct {
	Username string `json:"username"`
	Password string `json:"password"`
	Remember string `json:"remember"`
}

type GetUserRsp struct {
}

type GetGmOrderBoxReq struct {
	ProjectId int64 `json:"projectid"` // 项目id
}

type GetGmOrderBoxRsp struct {
	ProjectId int64          `json:"projectid"` // 项目id
	Datas     []*RoleGmOrder `json:"datas"`     // 项目id对应的所有命令数据
}

type RoleGmOrder struct {
	GmOrderData *GmOrder `json:"gmorderdata"`
	LastRunArgs string   `json:"lastrunargs"` // 玩家上一次执行的参数(大量的数据其实都是重复写入的, 所以这里记录玩家上一次执行命令)
}

type GmOrder struct {
	OrderId     int64  `json:"orderid"` // 命令id
	OrderName   string `json:"ordername"`
	Path        string `json:"path"`   // 路径
	Method      string `json:"method"` // POST / GET
	OrderDesc   string `json:"orderdesc"`
	Level       int    `json:"level"`
	OrderStruct string `json:"orderstruct"` // 命令结构
}

type SendGmOrderReq struct {
	OrderId int64  `json:"orderid"` // 命令id
	Msg     string `json:"msg"`     // gm命令数据
}

type SendGmOrderRsp struct {
}

type GetGmProjectBoxReq struct {
}

type GetGmProjectBoxRsp struct {
	ProjectId   int64      `json:"projectid"` // 项目id
	ProjectName string     `json:"projectname"`
	Datas       []*GmOrder `json:"datas"` // 项目id对应的所有命令数据
}

type DelGmOrderReq struct {
	ProjectId int64 `json:"projectid"` // 项目id
	OrderId   int64 `json:"orderid"`   // 命令id
}

type DelGmOrderRsp struct {
}

type AddGmOrderReq struct {
	ProjectId   int64  `json:"projectid"` // 项目id
	OrderName   string `json:"ordername"` // 命令名字(不允许重名)
	Level       int    `json:"level"`
	OrderDesc   string `json:"orderdesc"`
	OrderStruct string `json:"orderstruct"` // 命令结构
}

type AddGmOrderRsp struct {
	ProjectId int64    `json:"projectid"` // 项目id
	Data      *GmOrder `json:"data"`
}

type ModifyGmOrderReq struct {
	ProjectId int64    `json:"projectid"` // 项目id
	Data      *GmOrder `json:"data"`
}

type ModifyGmOrderRsp struct {
	ProjectId int64    `json:"projectid"` // 项目id
	Data      *GmOrder `json:"data"`
}

type AddGmProjectReq struct {
	Name   string // 项目名(不可重复)
	Desc   string // 项目描述
	GmAddr string // 项目Gm地址
}

type GmProject struct {
}

type AddGmProjectRsp struct {
	ProjectId   int64  `json:"projectid"` // 项目id
	Name        string // 项目名(不可重复)
	Desc        string // 项目描述
	GmAddr      string // 项目Gm地址
	ProjectId   int64  `json:"projectid"` // 项目id
	ProjectName string `json:"projectname"`
}

type DelGmProjectReq struct {
	ProjectId int64 `json:"projectid"` // 项目id
}

type DelGmProjectRsp struct {
	ProjectId int64 `json:"projectid"` // 项目id
}

type ModifyGmProjectReq struct {
	ProjectId int64  `json:"projectid"` // 项目id
	Name      string // 项目名(不可重复)
	Desc      string // 项目描述
	GmAddr    string // 项目Gm地址
}

type ModifyGmProjectRsp struct {
	ProjectId int64  `json:"projectid"` // 项目id
	Name      string // 项目名(不可重复)
	Desc      string // 项目描述
	GmAddr    string // 项目Gm地址
}
