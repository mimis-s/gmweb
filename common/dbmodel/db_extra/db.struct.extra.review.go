package db_extra

type ExtraReviewStep struct {
	ResultData []*ReviewStep // 执行步骤
}

type ReviewStep struct {
	UserId     int64  // 当前步骤的审批人
	Status     int    // 状态(1:成功, 2:等待审批, 3:失败)
	ReviewTime int64  // 审核时间
	Desc       string // 步骤具体信息(可以填当前步骤的gm命令,也可以是执行之后的返回值)
}
