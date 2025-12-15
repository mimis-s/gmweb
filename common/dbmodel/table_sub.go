package dbmodel

/*
	分表, 绑定分库
*/

// 用户表
func (tb *User) SubTableNum() int {
	return 1
}

func (tb *User) SubTable(baseValue int64) string {
	return subName(tb.SubName(), baseValue, tb.SubTableNum())
}

func (tb *User) BindSubTreasury() ShardGroup {
	return ShardGroupTag_AllInOne
}

// 权限组表
func (tb *PowerGroup) SubTableNum() int {
	return 1
}

func (tb *PowerGroup) SubTable(baseValue int64) string {
	return subName(tb.SubName(), baseValue, tb.SubTableNum())
}

func (tb *PowerGroup) BindSubTreasury() ShardGroup {
	return ShardGroupTag_AllInOne
}

// 权限表
func (tb *Power) SubTableNum() int {
	return 1
}

func (tb *Power) SubTable(baseValue int64) string {
	return subName(tb.SubName(), baseValue, tb.SubTableNum())
}

func (tb *Power) BindSubTreasury() ShardGroup {
	return ShardGroupTag_AllInOne
}

// 项目表
func (tb *Project) SubTableNum() int {
	return 1
}

func (tb *Project) SubTable(baseValue int64) string {
	return subName(tb.SubName(), baseValue, tb.SubTableNum())
}

func (tb *Project) BindSubTreasury() ShardGroup {
	return ShardGroupTag_AllInOne
}

// 命令表
func (tb *GmOrder) SubTableNum() int {
	return 1
}

func (tb *GmOrder) SubTable(baseValue int64) string {
	return subName(tb.SubName(), baseValue, tb.SubTableNum())
}

func (tb *GmOrder) BindSubTreasury() ShardGroup {
	return ShardGroupTag_AllInOne
}

// 日志表
func (tb *OperationLog) SubTableNum() int {
	return 1
}

func (tb *OperationLog) SubTable(baseValue int64) string {
	return subName(tb.SubName(), baseValue, tb.SubTableNum())
}

func (tb *OperationLog) BindSubTreasury() ShardGroup {
	return ShardGroupTag_AllInOne
}

// 权限分配表
func (tb *PowerAssignMent) SubTableNum() int {
	return 1
}

func (tb *PowerAssignMent) SubTable(baseValue int64) string {
	return subName(tb.SubName(), baseValue, tb.SubTableNum())
}

func (tb *PowerAssignMent) BindSubTreasury() ShardGroup {
	return ShardGroupTag_AllInOne
}
