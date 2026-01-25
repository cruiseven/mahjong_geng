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

### 本地运行步骤

如果您想在本地运行该应用，可以按照以下步骤操作：

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
6. 打开浏览器，访问 `http://localhost:5050` 开始使用应用

## 在线访问

该应用已经部署到Render平台，您可以直接通过以下链接访问：

```
https://mahjong-geng.onrender.com
```

## 使用说明

1. **首页**：显示基本统计信息和快捷入口
2. **历史记录**：查看所有游戏记录，可进行编辑和删除
3. **收支明细**：查看所有收入和支出记录
4. **支出记录**：添加新的支出记录
5. **设置**：调整佣金比例和抽佣门槛
6. **管理员**：管理所有数据，包括导出和清空数据

## 许可证

本项目采用 MIT 许可证，详情请查看 LICENSE 文件。

## 更新日志

### 版本 1.0.0

- 初始发布
- 实现核心功能：游戏记录、收支明细、统计分析
- 支持设置管理和数据导出

---

**祝您使用愉快！** 🎉
