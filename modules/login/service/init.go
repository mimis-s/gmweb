package service

import "github.com/mimis-s/gmweb/modules/login/dao"

func Init(d *dao.Dao) *Service {
	return &Service{
		dao: d,
	}
}
