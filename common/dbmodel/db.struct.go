package dbmodel

import (
	"time"

	"github.com/mimis-s/gmweb/common/dbmodel/db_extra"
)

type Account struct {
	AccountId        string               `xorm:"account_id not null pk VARCHAR(255)"`
	Password         string               `xorm:"not null VARCHAR(255)"`
	RoleId           int64                `xorm:"role_id index(index_role_id) BIGINT" json:"role_id,omitempty"`
	Custom           *db_extra.CustomInfo `xorm:"custom JSON" json:"custom,omitempty"`
	LatestLoginTime  int64                `xorm:"comment('最近登录时间戳') BIGINT"`
	LatestLogoutTime int64                `xorm:"comment('最近登出时间戳') BIGINT"`
	CreatedAt        time.Time            `xorm:"created"`
	UpdatedAt        time.Time            `xorm:"updated"`
	DeletedAt        time.Time            `xorm:"deleted"`
}

type Role struct {
	Rid           int64                   `xorm:"rid not null pk comment('主键') BIGINT"`
	BaseData      *db_extra.RoleBase      `xorm:"base_data JSON" json:"base_data,omitempty"`
	RolePowerData *db_extra.RolePowerInfo `xorm:"role_power_data JSON" json:"role_power_data,omitempty"`
	CreatedAt     time.Time               `xorm:"created"`
	UpdatedAt     time.Time               `xorm:"updated"`
	DeletedAt     time.Time               `xorm:"deleted"`
}

// 权限组表
type PowerGroup struct {
	GroupId   int64                     `xorm:"group_id not null pk autoincr comment('主键') BIGINT"`
	ExtraData *db_extra.PowerGroupExtra `xorm:"extra_data JSON" json:"extra_data,omitempty"`
	CreatedAt time.Time                 `xorm:"created"`
	UpdatedAt time.Time                 `xorm:"updated"`
	DeletedAt time.Time                 `xorm:"deleted"`
}

// 权限表
type Power struct {
	PowerId   int64                `xorm:"power_id not null pk autoincr comment('主键') BIGINT"`
	Data      *db_extra.PowerExtra `xorm:"data JSON" json:"data,omitempty"`
	CreatedAt time.Time            `xorm:"created"`
	UpdatedAt time.Time            `xorm:"updated"`
	DeletedAt time.Time            `xorm:"deleted"`
}

// 项目表
type Project struct {
	Id   int64                  `xorm:"id not null pk autoincr comment('主键') BIGINT"`
	Name string                 `xorm:"not null VARCHAR(255)"`
	Data *db_extra.ProjectExtra `xorm:"data JSON" json:"data,omitempty"`
}

// gm命令表
type GmOrder struct {
	Id        int64                  `xorm:"id not null pk autoincr comment('主键') BIGINT"`
	Level     int                    `xorm:"not null INT"`
	ProjectId int64                  `xorm:"project_id not null BIGINT"`
	Name      string                 `xorm:"not null VARCHAR(255)"`
	Data      *db_extra.GmOrderExtra `xorm:"data JSON" json:"data,omitempty"`
}
