package db_extra

type PowerGroupExtra struct {
	Desc     string // 权限组描述
	PowerIds []int64
}

// 玩家的权限仅限gm操作
type PowerExtra struct {
	Desc      string // 权限描述
	ProjectId int64  // 项目id
	Level     int    // 命令的等级
}
