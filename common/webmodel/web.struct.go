package webmodel

import "github.com/mimis-s/gmweb/common/define"

type GetUserReq struct {
	Username string `json:"username"`
	Password string `json:"password"`
	Remember string `json:"remember"`
}

type GetUserRsp struct {
}

type GetGmOrderBoxReq struct {
	ProjectId int64 `json:"projectid"` // 项目id
}

type GetGmOrderBoxRsp struct {
	ProjectId int64          `json:"projectid"` // 项目id
	Datas     []*RoleGmOrder `json:"datas"`     // 项目id对应的所有命令数据
}

type RoleGmOrder struct {
	GmOrderData *GmOrder `json:"gmorderdata"`
	LastRunArgs string   `json:"lastrunargs"` // 玩家上一次执行的参数(大量的数据其实都是重复写入的, 所以这里记录玩家上一次执行命令)
}

type GmOrder struct {
	OrderId     int64  `json:"orderid"` // 命令id
	OrderName   string `json:"ordername"`
	Path        string `json:"path"`   // 路径(普通用户获取值为空)
	Method      string `json:"method"` // POST / GET(普通用户获取值为空)
	OrderDesc   string `json:"orderdesc"`
	Level       int    `json:"level"`
	OrderStruct string `json:"orderstruct"` // 命令结构(普通用户获取值为空)
}

type SendGmOrderReq struct {
	OrderId int64  `json:"orderid"` // 命令id
	Msg     string `json:"msg"`     // gm命令数据
}

type SendGmOrderRsp struct {
	Data interface{} `json:"data"`
}

type GetGmProjectBoxReq struct {
}

type GetGmProjectBoxRsp struct {
	Datas []*GmProject `json:"datas"`
}

type GmProject struct {
	ProjectId int64      `json:"projectid"` // 项目id
	Name      string     `json:"name"`      // 项目名(不可重复)
	Desc      string     `json:"desc"`      // 项目描述
	GmAddr    string     `json:"gmaddr"`    // 项目Gm地址(普通用户没有权限查看修改地址)
	Datas     []*GmOrder `json:"datas"`     // 项目id对应的所有命令数据
}

type GmProjectBriefInfo struct {
	ProjectId int64  `json:"projectid"` // 项目id
	Name      string `json:"name"`      // 项目名(不可重复)
	Desc      string `json:"desc"`      // 项目描述
}

type DelGmOrderReq struct {
	ProjectId int64 `json:"projectid"` // 项目id
	OrderId   int64 `json:"orderid"`   // 命令id
}

type DelGmOrderRsp struct {
}

type AddGmOrderReq struct {
	ProjectId   int64  `json:"projectid"` // 项目id
	OrderName   string `json:"ordername"` // 命令名字(不允许重名)
	Level       int    `json:"level"`
	Path        string `json:"path"`
	Method      string `json:"method"`
	OrderDesc   string `json:"orderdesc"`
	OrderStruct string `json:"orderstruct"` // 命令结构
}

type AddGmOrderRsp struct {
	ProjectId int64    `json:"projectid"` // 项目id
	Data      *GmOrder `json:"data"`
}

type ModifyGmOrderReq struct {
	ProjectId int64    `json:"projectid"` // 项目id
	Data      *GmOrder `json:"data"`
}

type ModifyGmOrderRsp struct {
	ProjectId int64    `json:"projectid"` // 项目id
	Data      *GmOrder `json:"data"`
}

type AddGmProjectReq struct {
	Name   string `json:"name"`   // 项目名(不可重复)
	Desc   string `json:"desc"`   // 项目描述
	GmAddr string `json:"gmaddr"` // 项目Gm地址
}

type AddGmProjectRsp struct {
	Data *GmProject `json:"data"`
}

type DelGmProjectReq struct {
	ProjectId int64 `json:"projectid"` // 项目id
}

type DelGmProjectRsp struct {
	ProjectId int64 `json:"projectid"` // 项目id
}

type ModifyGmProjectReq struct {
	ProjectId int64  `json:"projectid"` // 项目id
	Name      string `json:"name"`      // 项目名(不可重复)
	Desc      string `json:"desc"`      // 项目描述
	GmAddr    string `json:"gmaddr"`    // 项目Gm地址
}

type ModifyGmProjectRsp struct {
	ProjectId int64  `json:"projectid"` // 项目id
	Name      string `json:"name"`      // 项目名(不可重复)
	Desc      string `json:"desc"`      // 项目描述
	GmAddr    string `json:"gmaddr"`    // 项目Gm地址
}

type User struct {
	UserId   int64  `json:"userid"`
	Name     string `json:"name"`
	Password string `json:"password"`
}

type GetAllUsersReq struct {
}

type GetAllUsersRsp struct {
	Datas []*User `json:"datas"`
}

type ModifyUserReq struct {
	UserId   int64  `json:"userid"`
	Name     string `json:"name"`
	Password string `json:"password"`
}

type ModifyUserRsp struct {
	Data *User `json:"data"`
}

type AddUserReq struct {
	Name     string `json:"name"`
	Password string `json:"password"`
}

type AddUserRsp struct {
	Data *User `json:"data"`
}

type DelUserReq struct {
	UserId int64 `json:"userid"`
}

type DelUserRsp struct {
	UserId int64 `json:"userid"`
}

type PermissionInfo struct {
	Id             int64  `json:"id"`
	Name           string `json:"name"`
	Enable         bool   `json:"enable"`         // 是否启用
	ProjectId      int64  `json:"projectid"`      // 项目id(为0匹配所有项目)
	ProjectName    string `json:"projectname"`    // 项目名字
	Level          int    `json:"level"`          // 命令的等级(为0匹配所有level)
	OrderNameMatch string `json:"ordernamematch"` // 命令字符串匹配(在level下面匹配命令)
}

type PermissionGroupUserInfo struct {
	UserId int64  `json:"userid"`
	Name   string `json:"username"`
}

type PermissionGroupUserAssignmentInfo struct {
	Id        int64  `json:"id"`
	UserId    int64  `json:"userid"`
	Name      string `json:"username"`
	GroupId   int64  `json:"groupid"`
	GroupName string `json:"groupname"`
}

type PermissionGroupInfo struct {
	Id       int64   `json:"id"`
	Name     string  `json:"name"`
	Enable   bool    `json:"enable"` // 是否启用
	PowerIds []int64 `json:"powerids"`
}

type PermissionProject struct {
	ProjectId int64  `json:"projectid"` // 项目id
	Name      string `json:"name"`      // 项目名(不可重复)
}

type GetPermissionReq struct {
}

type GetPermissionRsp struct {
	PermissionDatas      []*PermissionInfo                    `json:"permissiondatas"`      // 权限列表
	PermissionGroupDatas []*PermissionGroupInfo               `json:"permissiongroupdatas"` // 权限组列表
	AllUsers             []*PermissionGroupUserInfo           `json:"allusers"`             // 所有玩家(做权限筛选)
	AllProjects          []*PermissionProject                 `json:"allprojects"`          // 所有项目(做权限筛选)
	AllLevels            []int                                `json:"allLevels"`            // 所有可选命令等级(做权限筛选)
	Assignment           []*PermissionGroupUserAssignmentInfo `json:"assignment"`           // 拥有权限组的用户
}

type AddPermissionReq struct {
	Name           string `json:"name"`
	Enable         bool   `json:"enable"`         // 是否启用
	ProjectId      int64  `json:"projectid"`      // 项目id(为0匹配所有项目)
	ProjectName    string `json:"projectname"`    // 项目名称
	Level          int    `json:"level"`          // 命令的等级(为0匹配所有level)
	OrderNameMatch string `json:"ordernamematch"` // 命令字符串匹配(在level下面匹配命令)
}

type AddPermissionRsp struct {
	Data *PermissionInfo `json:"data"`
}

type DelPermissionReq struct {
	Id int64 `json:"id"`
}

type DelPermissionRsp struct {
	Id int64 `json:"id"`
}

type ModifyPermissionReq struct {
	Data *PermissionInfo `json:"data"`
}

type ModifyPermissionRsp struct {
	Data *PermissionInfo `json:"data"`
}

type AddPermissionGroupReq struct {
	Id       int64   `json:"id"`
	Name     string  `json:"name"`
	Enable   bool    `json:"enable"` // 是否启用
	PowerIds []int64 `json:"powerids"`
}

type AddPermissionGroupRsp struct {
	Data *PermissionGroupInfo `json:"data"`
}

type DelPermissionGroupReq struct {
	Id int64 `json:"id"`
}

type DelPermissionGroupRsp struct {
	Id int64 `json:"id"`
}

type ModifyPermissionGroupReq struct {
	Data *PermissionGroupInfo `json:"data"`
}

type ModifyPermissionGroupRsp struct {
	Data *PermissionGroupInfo `json:"data"`
}

// 获取项目简略信息(普通用户使用, 按照用户权限返回项目信息)
type GetGmProjectBriefInfoReq struct {
}

type GetGmProjectBriefInfoRsp struct {
	Datas []*GmProjectBriefInfo `json:"datas"`
}

// 删除权限分配数据
type DelPowerAssignmentReq struct {
	Id int64 `json:"id"`
}

type DelPowerAssignmentRsp struct {
	Id int64 `json:"id"`
}

// 添加权限分配数据
type AddPowerAssignmentReq struct {
	UserId  int64 `json:"userid"`
	GroupId int64 `json:"groupid"`
}

type AddPowerAssignmentRsp struct {
	Data *PermissionGroupUserAssignmentInfo `json:"data"`
}

// 获取日志
type GetGmLogReq struct {
	UserName  string `json:"username"`  // 用户名过滤(为空就是所有用户)
	Ip        string `json:"ip"`        // IP地址过滤(模糊匹配)
	Level     int    `json:"level"`     // 日志等级过滤(为0是所有等级)
	StartTime int64  `json:"starttime"` // 日期范围过滤
	EndTime   int64  `json:"endtime"`   // 日期范围过滤
	Msg       string `json:"msg"`       // 消息内容过滤(模糊匹配)
}

type GmLogInfo struct {
	UserId   int64  `json:"userid"`
	UserName string `json:"username"`
	Ip       string `json:"ip"`
	Level    int    `json:"level"`
	LogTime  int64  `json:"logtime"`
	Msg      string `json:"msg"`
}

type GetGmLogRsp struct {
	Datas []*GmLogInfo `json:"datas"`
}

type ReviewStep struct {
	UserId     int64                       `json:"user_id"` // 当前步骤的审批人
	UserName   string                      `json:"user_name"`
	Status     define.EnumReviewStepStatus `json:"status"`      // 状态(1:成功, 2:等待审批, 3:失败)
	ReviewTime int64                       `json:"review_time"` // 审核时间
	Desc       string                      `json:"desc"`        // 步骤具体信息(可以填当前步骤的gm命令,也可以是执行之后的返回值)
}

type ReviewInfo struct {
	ProjectId   int64         `json:"project_id"`
	ProjectName string        `json:"project_name"`
	OrderId     int64         `json:"order_id"`
	OrderName   string        `json:"order_name"`
	OrderDesc   string        `json:"order_desc"`
	UserId      int64         `json:"user_id"`
	UserName    string        `json:"user_name"`
	ResultData  []*ReviewStep `json:"result_data"` // 执行步骤
	StartDate   int64         `json:"start_date"`  // 申请审核的时间(作为查询条件)
}

// 获取审核信息
type GetReviewReq struct {
	ProjectId int64 `json:"projectid"` // 按照项目来划分
	StartTime int64 `json:"starttime"` // 日期范围过滤(申请时间为标准)
	EndTime   int64 `json:"endtime"`   // 日期范围过滤(申请时间为标准)
}
type GetReviewRsp struct {
	Datas []*ReviewInfo `json:"datas"`
}

// 获取某个人的一条gm命令的审核信息
type GetUserOrderReviewReq struct {
	OrderId int64 `json:"orderid"`
}
type GetUserOrderReviewRsp struct {
	Datas []*ReviewInfo `json:"datas"`
}

// 审核命令
type OrderReviewStepReq struct {
	ReviewId int64 `json:"reviewid"` // 审核id
	IsAgree  bool  `json:"is_agree"` // 是否同意(true:同意, false:拒绝)
}

type OrderReviewStepRsp struct {
	Data *ReviewInfo `json:"data"`
}
