package webmodel

type GetUserReq struct {
	Username string `json:"username"`
	Password string `json:"password"`
	Remember string `json:"remember"`
}

type GetUserRsp struct {
}

type GetGmOrderReq struct {
	ProjectId int64 `json:"project_id"` // 项目id
}

type GetGmOrderRsp struct {
	ProjectId int64      `json:"project_id"` // 项目id
	Datas     []*GmOrder `json:"datas"`      // 项目id对应的所有命令数据
}

type GmOrder struct {
	OrderId     int64         `json:"order_id"` // 命令id
	OrderName   string        `json:"order_name"`
	OrderDesc   string        `json:"order_desc"`
	Level       int           `json:"level"`
	OrderStruct string        `json:"order_struct"`  // 命令结构
	LastRunArgs string        `json:"last_run_args"` // 玩家上一次执行的参数(大量的数据其实都是重复写入的, 所以这里记录玩家上一次执行命令)
	OrderStatus map[int]int64 `json:"order_status"`  // 点赞/倒赞/收藏对应的数量
	IsLike      bool          // 当前玩家是否点赞
	IsBelittle  bool          // 当前玩家是否倒赞
	Iscollect   bool          // 当前玩家是否收藏
}
