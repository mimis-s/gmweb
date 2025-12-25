package main

import (
	"context"
	"embed"
	"os"
	"os/signal"
	"syscall"

	"github.com/mimis-s/gmweb/common/boot_config"
	"github.com/mimis-s/gmweb/common/common_client"
	"github.com/mimis-s/gmweb/dao"
	"github.com/mimis-s/gmweb/router"

	"github.com/mimis-s/zpudding/pkg/app"
)

//go:embed templates
var htmlEmbed embed.FS

//go:embed newassets
var assetsEmbed embed.FS

func newDefRegistry() *app.Registry {
	s := app.NewRegistry(
		app.AddRegistryBootConfigFile(boot_config.BootConfigData),
		app.AddRegistryExBootFlags(boot_config.CustomBootFlagsData),
		app.AddRegistryGlobalCmdFlag(boot_config.GlobalCmdFlagData),
	)

	s.AddInitTask("初始化数据库", func() error {
		dbClient, err := common_client.NewSqlClent(boot_config.BootConfigData.DB, "all_in_one")
		if err != nil {
			return err
		}
		dao.Init(dbClient)
		_, cancel := context.WithCancel(context.Background())
		go GracefulStop(cancel)
		return nil
	})

	return s
}

func main() {
	s := newDefRegistry()
	router.Init(s, htmlEmbed, assetsEmbed)
	s.Run()
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
