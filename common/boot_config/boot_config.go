package boot_config

import "github.com/mimis-s/zpudding/pkg/app"

/*
	解析boot_config.yaml文件
*/

type BootFlags struct {
	IP     string `flag:"ip" default:"192.168.1.1" desc:"服务器地址"`
	Port   string `flag:"port" default:"8888" desc:"服务器http端口"`
	User   string `flag:"user" default:"admin" desc:"管理员用户名"`
	Passwd string `flag:"passwd" default:"admin123" desc:"管理员密码"`
}

type DBConfig struct {
	Addr   string `yaml:"addr"`
	DB     string `yaml:"db"` // 数据库名字
	User   string `yaml:"user"`
	Passwd string `yaml:"passwd"`
}

type DBManageConfig struct {
	Tag         string      `yaml:"tag"`
	Master      DBConfig    `yaml:"master"` // 主数据库
	Slaves      []*DBConfig `yaml:"slaves"` // 从数据库
	MaxOpenConn int         `yaml:"max_open_conn"`
	MaxIdleConn int         `yaml:"max_idle_conn"`
}

type BootConfig struct {
	DB []DBManageConfig `yaml:"db"`

	Log struct {
		Path string `yaml:"path"`
	} `yaml:"log"`
}

var BootConfigData = new(BootConfig)
var CustomBootFlagsData = new(BootFlags)
var GlobalCmdFlagData = new(app.GlobalCmdFlag)
