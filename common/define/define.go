package define

type EnumRole int

var (
	EnumRole_Regular       EnumRole = 1 // 普通用户
	EnumRole_Administrator EnumRole = 2 // 管理员
)

// 玩家状态展示
type EnumUserStatus int

var (
	EnumUserStatus_Relax        EnumUserStatus = 1 // 放松
	EnumUserStatus_Happy        EnumUserStatus = 2 // 开心
	EnumUserStatus_Work         EnumUserStatus = 3 // 工作
	EnumUserStatus_WorkOvertime EnumUserStatus = 4 // 加班
)
