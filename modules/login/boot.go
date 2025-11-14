package login

import (
	"github.com/mimis-s/gmweb/modules/login/dao"
	"github.com/mimis-s/gmweb/modules/login/service"
)

func Init() (*service.Service, error) {
	d, err := dao.Init()
	if err != nil {
		return nil, err
	}
	return service.Init(d), nil
}
