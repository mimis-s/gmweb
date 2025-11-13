package common_client

import (
	"context"
	"encoding/json"
	"fmt"
	"math/rand"
	"strings"
	"sync"

	"github.com/mimis-s/gmweb/common/boot_config"
	"xorm.io/xorm"
	"xorm.io/xorm/contexts"
)

func getOperationType(sql string) string {
	if len(sql) < 6 {
		return "OTHER"
	}
	return strings.ToUpper(sql[:6])
}

type SqlClient struct {
	*xorm.EngineGroup
}

func (s *SqlClient) ReadEngine() *xorm.Engine {
	// 随机选一个读库
	slaves := s.Slaves()
	if len(slaves) > 0 {
		return slaves[rand.Intn(len(slaves))]
	}
	// 用主库保底
	return s.Master()
}

var dbMutex sync.Mutex
var dbClientMap = make(map[string]*SqlClient)

func parseParams2Dsn(user, passwd, addr, db string) string {
	return fmt.Sprintf("%s:%s@tcp(%s)/%s?parseTime=True&loc=Local", user, passwd, addr, db)
}

func newMysqlClent(mysqlConfig boot_config.DBManageConfig) (*SqlClient, error) {
	databaseDsns := make([]string, 0, len(mysqlConfig.Slaves)+1)
	masterDsn := parseParams2Dsn(mysqlConfig.Master.User, mysqlConfig.Master.Passwd, mysqlConfig.Master.Addr, mysqlConfig.Master.DB)
	databaseDsns = append(databaseDsns, masterDsn)
	for _, slave := range mysqlConfig.Slaves {
		slavesDsn := parseParams2Dsn(slave.User, slave.Passwd, slave.Addr, slave.DB)
		databaseDsns = append(databaseDsns, slavesDsn)
	}
	engineGroup, err := xorm.NewEngineGroup("mysql", databaseDsns)
	if err != nil {
		return nil, err
	}
	engineGroup.SetMaxIdleConns(int(mysqlConfig.MaxIdleConn))
	engineGroup.SetMaxOpenConns(int(mysqlConfig.MaxOpenConn))
	engineGroup.AddHook(&MysqlHook{})
	return &SqlClient{engineGroup}, nil
}

// mysql的读写钩子
type MysqlHook struct {
}

func (h *MysqlHook) BeforeProcess(c *contexts.ContextHook) (context.Context, error) {
	return c.Ctx, nil
}

func (h *MysqlHook) AfterProcess(c *contexts.ContextHook) error {
	// 获取操作类型 (SELECT, INSERT, UPDATE, DELETE)
	opType := getOperationType(c.SQL)
	fmt.Printf("[xorm]:%v use time:%vms - sql: %v args[%v]\n", opType, c.ExecuteTime.Milliseconds(), c.SQL, c.Args)
	return nil
}

func NewSqlClent(dbConfigs []boot_config.DBManageConfig, tag string) (*SqlClient, error) {
	// 初始化数据库xorm
	dbMutex.Lock()
	defer dbMutex.Unlock()

	if dbClientMap[tag] != nil {
		return dbClientMap[tag], nil
	}

	for _, mysqlConfig := range dbConfigs {
		if mysqlConfig.Tag == tag {
			client, err := newMysqlClent(mysqlConfig)
			if err != nil {
				return nil, err
			}
			dbClientMap[tag] = client
			return client, nil
		}
	}
	strJson, _ := json.Marshal(dbConfigs)
	errStr := fmt.Sprintf("mysql tag:%v url[%v] db New Engine is not found", tag, string(strJson))
	return nil, fmt.Errorf(errStr)
}
