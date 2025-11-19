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
	ProjectId int64      `json:"projectid"` // 项目id
	Datas     []*GmOrder `json:"datas"`     // 项目id对应的所有命令数据
}

type GmOrder struct {
	OrderId     int64         `json:"orderid"` // 命令id
	OrderName   string        `json:"ordername"`
	OrderDesc   string        `json:"orderdesc"`
	Level       int           `json:"level"`
	OrderStruct string        `json:"orderstruct"` // 命令结构
	LastRunArgs string        `json:"lastrunargs"` // 玩家上一次执行的参数(大量的数据其实都是重复写入的, 所以这里记录玩家上一次执行命令)
	OrderStatus map[int]int64 `json:"orderstatus"` // 点赞/倒赞/收藏对应的数量
	IsLike      bool          // 当前玩家是否点赞
	IsBelittle  bool          // 当前玩家是否倒赞
	Iscollect   bool          // 当前玩家是否收藏
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
}
