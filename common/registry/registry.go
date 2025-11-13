package registry

import (
	"context"
	"os"
	"os/signal"
	"syscall"

	"github.com/mimis-s/gmweb/common/boot_config"

	"github.com/mimis-s/zpudding/pkg/app"
	"github.com/mimis-s/zpudding/pkg/zlog"
)

func NewDefRegistry() *app.Registry {
	s := app.NewRegistry(
		app.AddRegistryBootConfigFile(boot_config.BootConfigData),
		app.AddRegistryExBootFlags(boot_config.CustomBootFlagsData),
	)

	s.AddInitTask("初始化rpc调用客户端", func() error {
		// 日志
		zlog.NewLogger(boot_config.BootConfigData.Log.Path + "/" + "log.log")
		_, cancel := context.WithCancel(context.Background())
		go GracefulStop(cancel)
		return nil
	})

	return s
}

func GracefulStop(cancel context.CancelFunc) {
	c := make(chan os.Signal, 1)
	signal.Notify(c, syscall.SIGHUP, syscall.SIGQUIT, syscall.SIGTERM, syscall.SIGINT)
	for {
		s := <-c
		switch s {
		case syscall.SIGQUIT, syscall.SIGTERM, syscall.SIGINT:
			cancel()
			return
		case syscall.SIGHUP:
		// TODO reload
		default:
			return
		}
	}
}
