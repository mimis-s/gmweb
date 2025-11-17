package db_extra

type GmOrderExtra struct {
	Desc           string
	OrderStatusNum map[int]int64 // 点赞, 倒赞, 收藏次数
	OrderStruct    string        // 命令结构
}
