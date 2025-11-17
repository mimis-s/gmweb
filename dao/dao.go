package dao

import "github.com/mimis-s/gmweb/common/common_client"

type dao struct {
	db *common_client.SqlClient
}

var daoHandler *dao

func Init(db *common_client.SqlClient) error {
	daoHandler = &dao{db: db}
	return nil
}
