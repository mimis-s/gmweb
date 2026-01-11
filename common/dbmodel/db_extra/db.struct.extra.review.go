package db_extra

import "github.com/mimis-s/gmweb/common/define"

type ExtraReviewStep struct {
	NextStepId define.EnumOrderStep // 下一步骤(从0开始)
	ResultData []*ReviewStep        // 执行步骤
}

type ReviewStep struct {
	StepId     define.EnumOrderStep        // 步骤id(从0开始)
	UserId     int64                       // 当前步骤的审批人
	UserName   string                      // 这里记录名字, 如果用户被删除了, 那么审批流程中也应该能显示名字
	Status     define.EnumReviewStepStatus // 状态(1:成功, 2:等待审批, 3:失败)
	ReviewTime int64                       // 审核时间
	Desc       string                      // 步骤具体信息(可以填当前步骤的gm命令,也可以是执行之后的返回值)
}
