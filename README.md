# 麻将记账应用

## 项目简介

这是一个基于Web的麻将记账应用，用于记录麻将游戏的收支情况、佣金计算和统计分析。

## 功能特点

### 核心功能

- 🎮 游戏记录管理：记录每局游戏的玩家数据、佣金等信息
- 💰 收支明细管理：记录所有收入和支出明细
- 📊 统计分析：显示累计佣金和游戏局数
- ⚙️ 设置管理：可调整佣金比例和抽佣门槛
- 📤 数据导出：支持导出所有数据

### 技术特点

- 前后端分离架构
- 本地SQLite数据库存储
- 响应式设计，支持多种设备
- 直观易用的用户界面

## 技术栈

### 后端

- Python 3.10+
- Flask 3.0.0：Web框架
- Flask-SQLAlchemy 3.1.1：ORM数据库工具
- SQLite：轻量级关系型数据库

### 前端

- HTML5
- CSS3
- JavaScript (ES6+)

## 项目结构

```
Mahjong/
├── css/              # 样式文件
│   └── style.css
├── html/             # HTML页面
│   ├── admin.html    # 管理员页面
│   ├── details.html  # 收支明细页面
│   ├── expense.html  # 支出记录页面
│   ├── history.html  # 历史记录页面
│   └── settings.html # 设置页面
├── js/               # JavaScript文件
│   ├── admin.js
│   ├── db.js
│   ├── details.js
│   ├── expense.js
│   ├── history.js
│   ├── script.js
│   └── settings.js
├── instance/         # 数据库文件目录
│   └── mahjong.db    # SQLite数据库文件
├── __pycache__/      # Python编译缓存
├── app.py            # Flask应用主文件
├── index.html        # 应用首页
├── requirements.txt  # 项目依赖
├── start_server.py   # 服务器启动脚本
└── README.md         # 项目说明文档
```

## 安装和运行

### 环境要求

- Python 3.10 或更高版本
- 现代Web浏览器（Chrome、Firefox、Safari、Edge等）

### 本地运行步骤

#### 方法一：使用启动脚本（推荐）

1. 确保您的计算机已安装Python 3.10+
2. 下载或克隆项目到本地
3. 打开命令行工具，进入项目目录
4. 运行启动脚本：
   ```bash
   python start_server.py
   ```
5. 启动脚本会自动检查并安装依赖，然后启动服务器
6. 打开浏览器，访问 `http://localhost:5050` 开始使用应用

#### 方法二：手动安装和运行

1. 确保您的计算机已安装Python 3.10+
2. 下载或克隆项目到本地
3. 打开命令行工具，进入项目目录
4. 安装依赖：
   ```bash
   pip install -r requirements.txt
   ```
5. 启动Flask服务器：
   ```bash
   python app.py
   ```
6. 打开浏览器，访问 `http://localhost:5000` 开始使用应用

## GitHub托管步骤

### 1. 创建GitHub仓库

1. 登录GitHub账号
2. 点击右上角的「+」号，选择「New repository」
3. 填写仓库信息：
   - Repository name: 输入仓库名称，如 `mahjong-accounting`
   - Description: 可选，输入仓库描述
   - Public: 选择公开或私有仓库
   - Initialize this repository with: 可以选择不勾选任何选项
4. 点击「Create repository」创建仓库

### 2. 将本地项目推送到GitHub

#### 步骤1：初始化本地Git仓库

在项目根目录下打开命令行工具，执行以下命令：

```bash
git init
```

#### 步骤2：添加项目文件

```bash
git add .
```

#### 步骤3：提交初始版本

```bash
git commit -m "Initial commit"
```

#### 步骤4：关联GitHub仓库

```bash
git remote add origin https://github.com/您的用户名/仓库名称.git
```

#### 步骤5：推送代码到GitHub

```bash
git push -u origin master
```

如果您使用的是GitHub新的默认分支名称 `main`，请使用：

```bash
git push -u origin main
```

### 3. 在GitHub上管理项目

推送成功后，您可以在GitHub仓库页面看到完整的项目代码。

## 在GitHub上运行服务

由于这是一个需要后端运行的Web应用，直接在GitHub上无法运行完整的服务。您可以使用以下方式在GitHub或其他平台上部署运行：

### 选项1：使用GitHub Codespaces

1. 进入GitHub仓库页面
2. 点击绿色的「Code」按钮
3. 选择「Codespaces」选项卡
4. 点击「Create codespace on master」（或main分支）
5. 等待Codespaces环境创建完成
6. 在Codespaces终端中运行：
   ```bash
   python start_server.py
   ```
7. 点击终端中的链接或在浏览器中访问 `http://localhost:5050`

### 选项2：使用Vercel等云平台部署

1. 注册Vercel、Render或Heroku等云平台账号
2. 按照平台的部署指南，将GitHub仓库连接到平台
3. 配置构建命令和启动命令
4. 部署完成后，使用平台提供的URL访问应用

### 选项3：使用Docker部署

1. 安装Docker
2. 在项目根目录创建 `Dockerfile` 和 `docker-compose.yml` 文件
3. 构建Docker镜像并运行容器
4. 在浏览器中访问容器映射的端口

## 使用说明

1. **首页**：显示基本统计信息和快捷入口
2. **历史记录**：查看所有游戏记录，可进行编辑和删除
3. **收支明细**：查看所有收入和支出记录
4. **支出记录**：添加新的支出记录
5. **设置**：调整佣金比例和抽佣门槛
6. **管理员**：管理所有数据，包括导出和清空数据

## 注意事项

1. 首次运行时，系统会自动创建数据库文件 `instance/mahjong.db`
2. 数据库文件存储在本地，建议定期备份
3. 开发环境下，Flask会自动重载代码修改
4. 生产环境部署时，请配置适当的安全设置

## 开发说明

### 数据库模型

#### Round（游戏记录）

- roundNum: 游戏局数
- playersData: 玩家数据（JSON格式）
- commission: 佣金金额
- rate: 佣金比例
- threshold: 抽佣门槛
- time: 时间字符串
- timestamp: 时间戳

#### Detail（收支明细）

- id: 自增ID
- type: 类型（income/expense）
- detail: 详细描述
- amount: 金额
- time: 时间字符串
- timestamp: 时间戳
- balance: 余额

#### Setting（设置）

- id: 固定为1
- commissionRate: 佣金比例
- commissionThreshold: 抽佣门槛

#### Stat（统计）

- id: 固定为1
- totalCommission: 累计佣金
- roundCount: 游戏局数

### API端点

#### 游戏记录

- GET `/api/rounds`: 获取所有游戏记录
- POST `/api/rounds`: 添加游戏记录
- POST `/api/rounds/all`: 保存所有游戏记录

#### 收支明细

- GET `/api/details`: 获取所有收支明细
- POST `/api/details`: 添加收支明细
- POST `/api/details/all`: 保存所有收支明细

#### 设置

- GET `/api/settings`: 获取设置
- POST `/api/settings`: 保存设置

#### 统计

- GET `/api/stats`: 获取统计数据
- PUT `/api/stats/total`: 更新累计佣金

#### 数据管理

- GET `/api/export`: 导出所有数据
- DELETE `/api/clear`: 清空数据库

## 许可证

本项目采用 MIT 许可证，详情请查看 LICENSE 文件。

## 更新日志

### 版本 1.0.0

- 初始发布
- 实现核心功能：游戏记录、收支明细、统计分析
- 支持设置管理和数据导出

## 贡献

欢迎提交Issue和Pull Request来改进这个项目！

## 联系方式

如有问题或建议，请通过GitHub Issues联系我们。

---

**祝您使用愉快！** 🎉
