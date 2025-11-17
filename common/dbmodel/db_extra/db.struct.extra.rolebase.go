package db_extra

// 玩家基础信息
type RoleBase struct {
	AccountId  string `json:"account_id,omitempty"`
	Name       string `json:"name,omitempty"`
	HeadIcon   string `json:"headicon,omitempty"`
	StatusShow int    `json:"status_show,omitempty"` // 状态展示(加班中, 开心, 悠闲......)
}

// 玩家权限信息
type RolePowerInfo struct {
	PowerGroups []int64 `json:"power_groups,omitempty"` // 玩家拥有的权限组
}

// 玩家的gm命令状态
type RoleGmOrderStatus struct {
	OrderStatusMap map[int64]map[int]bool `json:"order_status_map,omitempty"` // gm命令 -> 点赞/倒赞/收藏(1/2/3) -> 是否对这个命令进行了操作
	LastRunArgsMap map[int64]string       `json:"last_run_args_map"`          // 玩家上一次执行的参数(大量的数据其实都是重复写入的, 所以这里记录玩家上一次执行命令)
}
