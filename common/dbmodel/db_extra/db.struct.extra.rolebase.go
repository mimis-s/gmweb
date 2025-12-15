package db_extra

// 玩家基础信息
type RoleBase struct {
	HeadIcon   string `json:"headicon,omitempty"`
	StatusShow int    `json:"status_show,omitempty"` // 状态展示(加班中, 开心, 悠闲......)
}

// 玩家权限信息
type RolePowerInfo struct {
	PowerGroups []int64 `json:"power_groups,omitempty"` // 玩家拥有的权限组
}

// 玩家的gm命令状态
type RoleGmOrderStatus struct {
	LastRunArgsMap map[int64]map[int64]string `json:"last_run_args_map"` // 玩家上一次执行的参数(大量的数据其实都是重复写入的, 所以这里记录玩家上一次执行命令)
}
