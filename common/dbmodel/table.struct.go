package dbmodel

import (
	"strconv"
)

// 分库使用
func (sg ShardGroup) Tag() string {
	return string(sg)
}

// 分库
type ShardGroup string

const (
	ShardGroupTag_AllInOne ShardGroup = "all_in_one"
)

// 分表
type DbTableInterface interface {
	SubName() string  // 表名
	SubTableNum() int // 分表数量
	BindSubTreasury() ShardGroup
}

func subName(name string, value int64, tableNum int) string {
	temp := value % int64(tableNum)
	// 暂时不分表
	if temp == 0 {
		return name
	}
	return name + "_" + strconv.FormatInt(temp, 10)
}
