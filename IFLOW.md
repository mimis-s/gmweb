# IFLOW.md - gmweb 项目上下文

## 项目概述

gmweb 是一个基于 Web 的 GM (Game Master) 管理控制界面，用于管理游戏服务器的各种操作命令和用户权限。该项目采用 Go 语言开发，使用 Gin 框架提供 Web 服务，MySQL 数据库存储数据，XORM 作为 ORM 框架，并基于 zpudding 应用框架构建。

### 核心功能

- **用户认证**: 用户注册、登录、会话管理
- **GM 命令管理**: GM 指令的增删改查、发送功能
- **项目管理**: 游戏项目的添加、修改、删除
- **用户管理**: 用户账号的增删改查、角色分配
- **权限管理**: 权限、权限组、权限分配的三层管理架构
- **日志查看**: 操作日志记录和查询

### 技术栈

- **语言**: Go 1.23.4
- **Web 框架**: Gin v1.11.0
- **ORM**: XORM v1.3.11
- **数据库**: MySQL
- **应用框架**: zpudding (内部应用框架)
- **会话管理**: Gorilla Sessions
- **RPC**: rpcx v1.8.32 (用于 GM 命令发送)
- **配置**: YAML 格式

---

## 项目结构

```
gmweb/
├── main.go                    # 程序入口
├── go.mod / go.sum           # Go 依赖管理
├── AGENTS.md                  # 开发规范文档
├── README.md                  # 项目说明
├── Dockerfile                 # Docker 构建文件
├── config/
│   └── boot_config.yaml       # 配置文件 (数据库连接等)
├── common/                    # 公共模块
│   ├── boot_config/          # 启动配置
│   ├── common_client/        # 数据库/Redis 客户端
│   ├── dbmodel/              # 数据库模型定义
│   ├── web/                  # Web 上下文封装
│   └── webmodel/             # Web 请求/响应结构体
├── controller/               # HTTP 处理器
├── dao/                      # 数据库访问层
├── modules/                  # 业务逻辑模块
│   ├── user/                # 用户相关逻辑
│   ├── order/               # GM 命令相关逻辑
│   ├── project/             # 项目相关逻辑
│   ├── power/               # 权限相关逻辑
│   └── gm_log/              # 日志相关逻辑
├── router/                   # 路由配置
├── templates/                # HTML 模板
├── assets/                   # 静态资源 (CSS, JS, 图片等)
└── lib/                      # 工具库
    └── encrypt/              # 加密工具
```

### 目录职责

| 目录 | 职责 |
|------|------|
| `controller` | 处理 HTTP 请求，调用业务模块，返回响应 |
| `dao` | 数据库操作，封装所有 SQL 查询 |
| `modules` | 核心业务逻辑，实现具体功能 |
| `common` | 公共代码，包括配置、数据库模型、Web 工具 |
| `router` | 定义所有 API 路由和页面路由 |
| `templates` | HTML 模板文件 |
| `assets` | 静态资源文件 (CSS, JS, 图片) |
| `lib` | 通用工具库 |

---

## 构建与运行

### 基本命令

```bash
# 构建项目
go build -o gmweb

# 直接运行
go run main.go

# 运行所有测试
go test ./... -v

# 运行单个测试
go test -run TestName -v

# 整理依赖
go mod tidy
```

### 配置文件

项目使用 `config/boot_config.yaml` 进行配置，主要配置项包括：

```yaml
db:
- tag: "all_in_one"           # 数据库标识
  master:
    addr: "127.0.0.1:3306"    # 主库地址
    db: "zhangbin_gmweb"      # 数据库名
    user: "root"              # 用户名
    passwd: "dev123"          # 密码
  slaves:
  - addr: "127.0.0.1:3306"    # 从库配置
    db: "zhangbin_gmweb"
    user: "root"
    passwd: "dev123"

log:
  path: ""                    # 日志文件路径
```

### 启动参数

可通过命令行参数覆盖配置文件中的设置：

| 参数 | 默认值 | 说明 |
|------|--------|------|
| `--ip` | 192.168.1.1 | 服务器地址 |
| `--web_port` | 8888 | HTTP 服务端口 |
| `--user` | admin | 管理员用户名 |
| `--password` | admin123 | 管理员密码 |

---

## 代码规范

### 导入规范

使用 `go fmt` 进行格式化，导入分组顺序：
1. 标准库
2. 第三方库
3. 本地包

### 命名规范

- **函数/变量**: camelCase (小驼峰)
- **类型**: PascalCase (大驼峰)
- **数据库字段**: snake_case (下划线)
- **错误处理**: 使用 `if err != nil { return err }` 模式

### 代码结构

- **函数长度**: 保持函数简洁，建议 < 50 行
- **类型定义**: 优先使用 struct，接口仅在必要时使用
- **指针接收者**: 仅在需要修改结构体或避免大对象拷贝时使用

### Web 开发规范

- **模板**: 使用模板继承，表单中包含 CSRF token
- **API 路由**: 统一使用 `/api/` 前缀，遵循 REST 风格
- **数据库操作**: 多操作查询使用事务，实现合理的索引
- **资源嵌入**: 使用 `embed.FS` 嵌入模板和静态资源

### HTML/前端规范

- 模板文件位于 `templates/` 目录
- 静态资源位于 `assets/` 目录
- 前端使用 jQuery 和自定义 JS 模块
- 样式使用 CSS 文件，遵循项目现有风格

---

## 数据库模型

### 核心表结构

| 表名 | 说明 |
|------|------|
| `user` | 用户表，包含账号、密码、角色、自定义数据 |
| `power_group` | 权限组表，管理权限分组 |
| `power_assignment` | 权限分配表，关联用户和权限组 |
| `power` | 权限表，定义具体权限 |
| `project` | 项目表，管理游戏项目 |
| `gm_order` | GM 命令表，存储 GM 指令 |
| `operation_log` | 操作日志表，记录所有操作 |

### 模型定义位置

所有数据库模型定义在 `common/dbmodel/db.struct.go` 文件中，使用 XORM 标签映射数据库字段。

---

## API 路由

### 页面路由

| 路由 | 页面 | 说明 |
|------|------|------|
| `/` | index.html | 首页 |
| `/login` | login.html | 登录页面 |
| `/register` | register.html | 注册页面 |
| `/gm_tab_home` | gm_tab_home.html | 管理员主页 |
| `/gm_tab_home_user` | gm_tab_home_user.html | 普通用户主页 |
| `/gm_order_box.html` | gm_order_box.html | GM 命令管理界面布局 |
| `/gm_order_card.html` | gm_order_card.html | GM 命令卡片界面 |
| `/gm_order_table.html` | gm_order_table.html | GM 命令表格界面 |
| `/gm_project_box.html` | gm_project_box.html | 项目管理界面布局 |
| `/gm_project_card.html` | gm_project_card.html | 项目卡片界面 |
| `/gm_user_mangement.html` | gm_user_mangement.html | 用户管理界面 |
| `/gm_permission.html` | gm_permission.html | 权限管理界面 |
| `/gm_log.html` | gm_log.html | 日志查看界面 |

### API 接口

#### 认证相关
- `POST /api/login` - 用户登录

#### GM 命令管理
- `POST /api/gm_order_box` - 获取 GM 命令列表
- `POST /api/gm_order_add` - 新增 GM 命令
- `POST /api/gm_order_del` - 删除 GM 命令
- `POST /api/gm_order_modify` - 修改 GM 命令
- `POST /api/gm_order_send` - 发送 GM 命令

#### 项目管理
- `POST /api/gm_project_box` - 获取项目列表
- `POST /api/gm_project_add` - 新增项目
- `POST /api/gm_project_del` - 删除项目
- `POST /api/gm_project_modify` - 修改项目
- `POST /api/gm_projects` - 普通用户获取可用项目

#### 用户管理
- `POST /api/gm_user_mangement` - 获取所有用户
- `POST /api/gm_user_mangement/add` - 新增用户
- `POST /api/gm_user_mangement/del` - 删除用户
- `POST /api/gm_user_mangement/modify` - 修改用户

#### 权限管理
- `POST /api/gm_permission` - 获取权限信息
- `POST /api/gm_permission/add` - 新增权限
- `POST /api/gm_permission/modify` - 修改权限
- `POST /api/gm_permission/del` - 删除权限
- `POST /api/gm_permission/group/add` - 新增权限组
- `POST /api/gm_permission/group/modify` - 修改权限组
- `POST /api/gm_permission/group/del` - 删除权限组
- `POST /api/gm_permission/assign/add` - 分配权限
- `POST /api/gm_permission/assign/del` - 取消权限分配

#### 日志管理
- `POST /api/gm_log` - 查询操作日志

---

## 关键文件说明

| 文件 | 用途 |
|------|------|
| `main.go` | 程序入口，初始化配置、数据库、路由 |
| `router/router.go` | 定义所有 HTTP 路由 |
| `controller/controller.go` | HTTP 请求处理器 |
| `common/web/context.go` | Web 上下文封装 |
| `common/webmodel/web.struct.go` | 请求/响应结构体 |
| `common/dbmodel/db.struct.go` | 数据库模型定义 |
| `modules/order/order.go` | GM 命令业务逻辑 |
| `modules/order/send.go` | GM 命令发送逻辑 |
| `modules/user/user.go` | 用户业务逻辑 |
| `modules/user/login.go` | 登录处理逻辑 |
| `modules/project/project.go` | 项目业务逻辑 |
| `modules/power/power.go` | 权限业务逻辑 |
| `modules/power/power_group.go` | 权限组业务逻辑 |
| `modules/power/assignment.go` | 权限分配业务逻辑 |
| `modules/gm_log/go_log.go` | 日志业务逻辑 |
| `common/boot_config/boot_config.go` | 配置定义 |

---

## 架构特点

### 应用启动流程

1. 创建应用注册表 (`app.Registry`)
2. 添加配置初始化任务
3. 初始化数据库连接
4. 注册 HTTP 路由
5. 启动 Web 服务

### 资源嵌入

项目使用 Go 的 `embed` 包将模板和静态资源编译进二进制文件：

```go
//go:embed templates
var htmlEmbed embed.FS

//go:embed assets
var assetsEmbed embed.FS
```

### 优雅关闭

项目支持通过信号处理实现优雅关闭：

```go
func GracefulStop(cancel context.CancelFunc) {
    c := make(chan os.Signal, 1)
    signal.Notify(c, syscall.SIGHUP, syscall.SIGQUIT, syscall.SIGTERM, syscall.SIGINT)
    // ...
}
```

### 响应格式

所有 API 接口使用统一的响应格式：

```go
// 成功响应
ctx.SuccessOk(rsp)

// 错误响应
ctx.Err("错误信息", err)
```

---

## 开发注意事项

1. **错误处理**: 所有可能出错的地方都需要检查错误并返回
2. **数据库操作**: 使用事务确保数据一致性，合理创建索引
3. **静态资源**: 静态文件通过 `http.FS` 嵌入打包
4. **模板渲染**: 使用 `template.ParseFS` 加载嵌入的模板文件
5. **API 响应**: 使用 `ctx.SuccessOk()` 和 `ctx.Err()` 返回统一格式响应
6. **日志记录**: 使用 `log.Infof`, `log.Errorf` 记录关键操作
7. **应用框架**: 使用 zpudding 框架的 `app.Registry` 和 `app.App` 进行应用生命周期管理

---

## 常见任务

### 添加新功能

1. 在 `modules/` 目录添加业务逻辑模块
2. 在 `dao/` 目录添加数据访问方法
3. 在 `controller/controller.go` 添加处理函数
4. 在 `router/router.go` 注册路由
5. 在 `common/webmodel/web.struct.go` 定义请求/响应结构

### 数据库变更

1. 修改 `common/dbmodel/` 下的模型定义
2. 使用 XORM 的同步功能更新数据库结构
3. 必要时在 `common/dbmodel/db.sync.go` 添加自定义同步逻辑

### 新增页面

1. 在 `templates/` 添加 HTML 模板
2. 在 `assets/` 添加对应的 CSS/JS 文件
3. 在 `router/router.go` 注册页面路由
4. 在 `controller/controller.go` 添加渲染处理函数

### 新增 API 接口

1. 在 `common/webmodel/web.struct.go` 定义请求和响应结构体
2. 在 `modules/` 目录实现业务逻辑
3. 在 `controller/controller.go` 添加处理函数
4. 在 `router/router.go` 使用 `engine.PostWithStructParams()` 注册路由