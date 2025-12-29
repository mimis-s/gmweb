package dbmodel

import (
	"time"

	"github.com/mimis-s/gmweb/common/dbmodel/db_extra"
)

type User struct {
	Rid         int64                       `xorm:"rid not null pk autoincr BIGINT"`
	Name        string                      `xorm:"not null VARCHAR(255)"`
	Password    string                      `xorm:"VARCHAR(255)"`
	Role        int                         `xorm:"INT"` // 用户角色(管理员/普通用户)
	Custom      *db_extra.CustomInfo        `xorm:"comment('#*db_extra.CustomInfo#') JSON" json:"custom,omitempty"`
	BaseData    *db_extra.RoleBase          `xorm:"comment('#*db_extra.RoleBase#') JSON" json:"base_data,omitempty"`
	OrderStatus *db_extra.RoleGmOrderStatus `xorm:"comment('#*db_extra.RoleGmOrderStatus#') JSON" json:"order_status,omitempty"`
	CreatedAt   time.Time                   `xorm:"created"`
	UpdatedAt   time.Time                   `xorm:"updated"`
	DeletedAt   time.Time                   `xorm:"deleted"`
}

// 权限组表
type PowerGroup struct {
	GroupId   int64                     `xorm:"group_id not null pk autoincr comment('主键') BIGINT"`
	Name      string                    `xorm:"not null VARCHAR(255)"`
	Enable    *bool                     `xorm:"BOOL"` // 是否启用
	ExtraData *db_extra.PowerGroupExtra `xorm:"comment('#*db_extra.PowerGroupExtra#') JSON" json:"extra_data,omitempty"`
	CreatedAt time.Time                 `xorm:"created"`
	UpdatedAt time.Time                 `xorm:"updated"`
	DeletedAt time.Time                 `xorm:"deleted"`
}

// 权限分配表
type PowerAssignMent struct {
	Id        int64     `xorm:"not null pk autoincr comment('主键') BIGINT"`
	UserId    int64     `xorm:"user_id not null index(user_group) BIGINT"`
	GroupId   int64     `xorm:"group_id not null index(user_group) BIGINT"`
	CreatedAt time.Time `xorm:"created"`
	UpdatedAt time.Time `xorm:"updated"`
	DeletedAt time.Time `xorm:"deleted"`
}

// 权限表
type Power struct {
	PowerId   int64                `xorm:"power_id not null pk autoincr comment('主键') BIGINT"`
	Name      string               `xorm:"not null VARCHAR(255)"`
	Enable    *bool                `xorm:"BOOL"`   // 是否启用
	ProjectId int64                `xorm:"BIGINT"` // 项目id(为0匹配所有项目)
	Data      *db_extra.PowerExtra `xorm:"comment('#*db_extra.PowerExtra#') JSON" json:"data,omitempty"`
	CreatedAt time.Time            `xorm:"created"`
	UpdatedAt time.Time            `xorm:"updated"`
	DeletedAt time.Time            `xorm:"deleted"`
}

// 项目表
type Project struct {
	Id        int64                  `xorm:"id not null pk autoincr comment('主键') BIGINT"`
	Name      string                 `xorm:"not null VARCHAR(255)"`
	Data      *db_extra.ProjectExtra `xorm:"comment('#*db_extra.ProjectExtra#') JSON" json:"data,omitempty"`
	CreatedAt time.Time              `xorm:"created"`
	UpdatedAt time.Time              `xorm:"updated"`
	DeletedAt time.Time              `xorm:"deleted"`
}

// gm命令表
type GmOrder struct {
	Id        int64                  `xorm:"id not null pk autoincr comment('主键') BIGINT"`
	Level     int                    `xorm:"not null INT"`
	ProjectId int64                  `xorm:"project_id not null BIGINT"`
	Name      string                 `xorm:"not null VARCHAR(255)"`
	Data      *db_extra.GmOrderExtra `xorm:"comment('#*db_extra.GmOrderExtra#') JSON" json:"data,omitempty"`
	CreatedAt time.Time              `xorm:"created"`
	UpdatedAt time.Time              `xorm:"updated"`
	DeletedAt time.Time              `xorm:"deleted"`
}

// 日志表
type OperationLog struct {
	Id         int64     `xorm:"id not null pk autoincr comment('主键') BIGINT"`
	UserId     int64     `xorm:"not null BIGINT"`
	UserName   string    `xorm:"not null VARCHAR(255)"`
	Ip         string    `xorm:"not null VARCHAR(255)"`
	LogLevel   int       `xorm:"not null INT"`
	LogStr     string    `xorm:"not null TEXT"`
	UpdateDate int64     `xorm:"not null BIGINT"`
	CreatedAt  time.Time `xorm:"created"`
	UpdatedAt  time.Time `xorm:"updated"`
	DeletedAt  time.Time `xorm:"deleted"`
}
