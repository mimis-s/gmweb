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

// gm命令权限(执行, 审核)
type EnumPowerReview int

var (
	EnumPowerReview_run    EnumPowerReview = 1 // 执行
	EnumPowerReview_review EnumPowerReview = 2 // 审核
)

// gm操作步骤
type EnumOrderStep int

var (
	EnumOrderStep_start  EnumOrderStep = 0 // 发起gm请求
	EnumOrderStep_review EnumOrderStep = 1 // 审核
	EnumOrderStep_end    EnumOrderStep = 2 // 完成
)

// 审批状态
type EnumReviewStepStatus int

var (
	EnumReviewStepStatus_success EnumReviewStepStatus = 0 // 发起gm请求
	EnumReviewStepStatus_pending EnumReviewStepStatus = 1 // 审核
	EnumReviewStepStatus_fail    EnumReviewStepStatus = 2 // 完成
)
