package dao

import (
	"github.com/mimis-s/gmweb/common/boot_config"
	"github.com/mimis-s/gmweb/common/common_client"
	"github.com/mimis-s/gmweb/common/dbmodel"
	"github.com/mimis-s/gmweb/common/dbmodel/db_extra"
	"github.com/mimis-s/gmweb/common/define"
	"github.com/mimis-s/gmweb/lib/encrypt"
)

type dao struct {
	db *common_client.SqlClient
}

var daoHandler *dao

func Init(db *common_client.SqlClient) error {
	daoHandler = &dao{db: db}

	// 创建一个root账号/修改账号密码
	if boot_config.CustomBootFlagsData.User != "" {
		passwd, err := encrypt.Encrypt(boot_config.CustomBootFlagsData.Passwd)
		if err != nil {
			return err
		}

		userDBData, find, err := GetUserDataByName(boot_config.CustomBootFlagsData.User)
		if err != nil {
			return err
		}
		if !find {
			err := InsertUserData(&dbmodel.User{
				Name:     boot_config.CustomBootFlagsData.User,
				Password: passwd,
				BaseData: &db_extra.RoleBase{
					StatusShow: int(define.EnumUserStatus_Work),
				},
				Role:   int(define.EnumRole_Administrator),
				Custom: &db_extra.CustomInfo{},
				RolePowerData: &db_extra.RolePowerInfo{
					PowerGroups: make([]int64, 0),
				},
			})
			if err != nil {
				return err
			}
		} else {
			if userDBData.Password != passwd {
				userDBData.Password = passwd
				err = UpdateUserData(userDBData.Rid, userDBData)
				if err != nil {
					return err
				}
			}
		}
	}

	return nil
}
