# 麻将记账应用 - GitHub Pages 部署指南

本指南将帮助您将麻将记账应用部署到 GitHub Pages，使用浏览器本地存储替代后端数据库。

## 项目结构

```
Mahjong/
├── css/
│   └── style.css          # 样式文件
├── html/
│   ├── admin.html         # 管理员页面
│   ├── details.html       # 金额明细页面
│   ├── expense.html       # 添加消费记录页面
│   ├── expenses.html      # 所有消费记录页面
│   ├── history.html       # 历史记录页面
│   ├── rounds.html        # 所有输赢记录页面
│   └── settings.html      # 公共账户设置页面
├── js/
│   ├── admin.js           # 管理员页面逻辑
│   ├── db.js              # 原始数据库模块（API调用）
│   ├── db_local.js        # 本地存储数据库模块（GitHub Pages用）
│   ├── details.js         # 金额明细页面逻辑
│   ├── expense.js         # 添加消费记录页面逻辑
│   ├── history.js         # 历史记录页面逻辑
│   ├── script.js          # 核心逻辑
│   └── settings.js        # 公共账户设置页面逻辑
├── index.html             # 首页
├── README.md              # 原始 README
└── README_GITHUB.md       # GitHub Pages 部署指南
```

## 修改步骤

为了在 GitHub Pages 上运行，我们已经将项目修改为使用浏览器本地存储替代后端数据库：

1. **创建了本地存储数据库模块**：
   - `js/db_local.js` - 使用 `localStorage` 存储数据
   - 保持与原始 `db.js` 相同的接口，确保其他代码不需要修改

2. **修改了所有导入语句**：
   - 将所有 `import { DB } from './db.js';` 改为 `import { DB } from './db_local.js';`
   - 涉及文件：
     - `js/script.js`
     - `js/admin.js`
     - `js/expense.js`
     - `js/details.js`
     - `js/settings.js`
     - `js/history.js`
     - `html/expenses.html`
     - `html/rounds.html`

## 部署到 GitHub Pages

### 步骤 1：创建 GitHub 仓库

1. 在 GitHub 上创建一个新的仓库
2. 将本地项目推送到 GitHub 仓库

### 步骤 2：启用 GitHub Pages

1. 进入仓库设置
2. 找到 "Pages" 部分
3. 在 "Source" 下拉菜单中选择 "main" 分支
4. 点击 "Save" 按钮
5. 等待几分钟，GitHub Pages 会生成并部署您的站点

### 步骤 3：访问部署的站点

部署完成后，您可以通过以下 URL 访问您的应用：
```
https://<your-username>.github.io/<your-repository-name>/
```

## 功能说明

### 本地存储实现

应用使用浏览器的 `localStorage` API 存储数据，主要存储以下内容：

- **游戏记录** (`mahjong_rounds`) - 存储所有游戏回合记录
- **金额明细** (`mahjong_details`) - 存储所有金额变动记录（包括初始资金和消费记录）
- **设置信息** (`mahjong_settings`) - 存储公共账户抽取比例和门槛设置
- **统计数据** (`mahjong_stats`) - 存储累计佣金和回合数统计

### 数据导出/导入

应用保留了数据导出/导入功能：

1. **导出数据** - 将当前所有数据导出为 JSON 文件
2. **导入数据** - 从 JSON 文件导入数据到本地存储

### 注意事项

1. **数据存储限制**：
   - localStorage 通常有 5MB 左右的存储空间限制
   - 对于一般的麻将记账使用是足够的

2. **数据安全性**：
   - 数据存储在用户浏览器本地，不会上传到服务器
   - 清除浏览器缓存可能会导致数据丢失
   - 建议定期导出数据备份

3. **多设备同步**：
   - 由于数据存储在本地，不同设备间数据不会自动同步
   - 可以通过导出/导入功能在设备间迁移数据

4. **功能限制**：
   - 所有功能与原始应用相同
   - 数据仅存储在当前浏览器中

## 本地开发测试

在部署到 GitHub Pages 之前，您可以在本地测试应用：

1. 直接在浏览器中打开 `index.html` 文件
2. 或者使用本地服务器（如 VS Code 的 Live Server 扩展）

## 故障排除

### 问题：页面加载后无数据

- **原因**：本地存储尚未初始化
- **解决方法**：刷新页面，应用会自动初始化默认数据

### 问题：数据导入失败

- **原因**：导入的 JSON 文件格式不正确
- **解决方法**：确保使用应用导出的 JSON 文件，或检查文件格式是否符合要求

### 问题：存储空间不足

- **原因**：localStorage 存储空间达到限制
- **解决方法**：删除旧的游戏记录，或导出数据后清空并重新导入必要的数据

## 总结

通过使用浏览器本地存储替代后端数据库，我们成功将麻将记账应用适配为可以部署在 GitHub Pages 上的静态网站。虽然有一些存储和同步的限制，但对于个人或小团体使用已经足够满足需求。

希望本指南对您有所帮助！如有任何问题，请随时联系。