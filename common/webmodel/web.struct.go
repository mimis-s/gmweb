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
	Datas []*GmProject `json:"datas"`
}

type GmProject struct {
	ProjectId int64      `json:"projectid"` // 项目id
	Name      string     `json:"name"`      // 项目名(不可重复)
	Desc      string     `json:"desc"`      // 项目描述
	GmAddr    string     `json:"gmaddr"`    // 项目Gm地址(普通用户没有权限查看修改地址)
	Datas     []*GmOrder `json:"datas"`     // 项目id对应的所有命令数据
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
	Name   string `json:"name"`   // 项目名(不可重复)
	Desc   string `json:"desc"`   // 项目描述
	GmAddr string `json:"gmaddr"` // 项目Gm地址
}

type AddGmProjectRsp struct {
	Data *GmProject `json:"data"`
}

type DelGmProjectReq struct {
	ProjectId int64 `json:"projectid"` // 项目id
}

type DelGmProjectRsp struct {
	ProjectId int64 `json:"projectid"` // 项目id
}

type ModifyGmProjectReq struct {
	ProjectId int64  `json:"projectid"` // 项目id
	Name      string `json:"name"`      // 项目名(不可重复)
	Desc      string `json:"desc"`      // 项目描述
	GmAddr    string `json:"gmaddr"`    // 项目Gm地址
}

type ModifyGmProjectRsp struct {
	ProjectId int64  `json:"projectid"` // 项目id
	Name      string `json:"name"`      // 项目名(不可重复)
	Desc      string `json:"desc"`      // 项目描述
	GmAddr    string `json:"gmaddr"`    // 项目Gm地址
}

type User struct {
	UserId   int64  `json:"userid"`
	Name     string `json:"name"`
	Password string `json:"password"`
}

type GetAllUsersReq struct {
}

type GetAllUsersRsp struct {
	Datas []*User `json:"datas"`
}

type ModifyUserReq struct {
	UserId   int64  `json:"userid"`
	Name     string `json:"name"`
	Password string `json:"password"`
}

type ModifyUserRsp struct {
	Data *User `json:"data"`
}

type AddUserReq struct {
	Name     string `json:"name"`
	Password string `json:"password"`
}

type AddUserRsp struct {
	Data *User `json:"data"`
}

type DelUserReq struct {
	UserId int64 `json:"userid"`
}

type DelUserRsp struct {
	UserId int64 `json:"userid"`
}
