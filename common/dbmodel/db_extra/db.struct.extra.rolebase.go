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
