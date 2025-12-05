package db_extra

type PowerGroupExtra struct {
	Enable   bool // 是否启用
	PowerIds []int64
	UserIds  []int64 // 拥有权限组的用户
}

// 玩家的权限仅限gm操作
type PowerExtra struct {
	Enable         bool   // 是否启用
	ProjectId      int64  // 项目id(为0匹配所有项目)
	Level          int    // 命令的等级(为0匹配所有level)
	OrderNameMatch string // 命令字符串匹配(在level下面匹配命令)
}
