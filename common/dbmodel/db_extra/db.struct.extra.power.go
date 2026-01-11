package db_extra

import "github.com/mimis-s/gmweb/common/define"

type PowerGroupExtra struct {
	PowerIds []int64
}

// 玩家的权限仅限gm操作
type PowerExtra struct {
	Level          int                      // 命令的等级(为0匹配所有level)
	OrderNameMatch string                   // 命令字符串匹配(在level下面匹配命令)
	OrderReviews   []define.EnumPowerReview // 对于这些gm命令的权限(1: 运行, 2: 审核)
}
