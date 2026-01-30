# Cloudflare Pages + D1 部署指南

## 📋 前置要求

- Node.js 16+ 已安装
- 拥有 Cloudflare 账号（免费）
- Git 已安装并配置

---

## 🚀 部署步骤

### 第 1 步: 安装 Wrangler CLI

```bash
npm install -g wrangler
```

验证安装:
```bash
wrangler --version
```

---

### 第 2 步: 登录 Cloudflare

```bash
wrangler login
```

这会打开浏览器，要求你授权 Wrangler 访问你的 Cloudflare 账号。

---

### 第 3 步: 创建 D1 数据库

```bash
wrangler d1 create mahjong-db
```

**重要**: 复制输出中的 `database_id`，例如:
```
✅ Successfully created DB 'mahjong-db'
database_id = "abc123def456ghi789"
```

---

### 第 4 步: 更新 wrangler.toml 配置

打开 `wrangler.toml` 文件，将 `database_id` 替换为上一步获取的 ID:

```toml
[[d1_databases]]
binding = "DB"
database_name = "mahjong-db"
database_id = "abc123def456ghi789"  # 替换为你的 database_id
```

---

### 第 5 步: 初始化数据库

```bash
wrangler d1 execute mahjong-db --file=schema.sql
```

验证数据库:
```bash
wrangler d1 execute mahjong-db --command="SELECT * FROM settings"
```

应该看到默认设置数据。

---

### 第 6 步: 本地测试（可选但推荐）

```bash
wrangler pages dev public --d1 DB=mahjong-db
```

访问 `http://localhost:8788` 测试应用功能:
- ✅ 添加游戏记录
- ✅ 查看历史记录
- ✅ 金额明细
- ✅ 设置保存

按 `Ctrl+C` 停止本地服务器。

---

### 第 7 步: 部署到 Cloudflare Pages

#### 方式 1: 使用 Wrangler CLI（推荐）

```bash
wrangler pages deploy public --project-name=mahjong
```

首次部署会提示创建项目，输入 `y` 确认。

#### 方式 2: 通过 GitHub 自动部署

1. 将代码推送到 GitHub:
   ```bash
   git add .
   git commit -m "feat: 迁移到 Cloudflare Pages"
   git push
   ```

2. 访问 [Cloudflare Dashboard](https://dash.cloudflare.com/)
3. 进入 **Pages** → **Create a project**
4. 连接你的 GitHub 仓库
5. 配置构建设置:
   - **Build command**: 留空
   - **Build output directory**: `public`
6. 在 **Environment variables** 中添加 D1 绑定（通过 Dashboard 设置）

---

### 第 8 步: 绑定 D1 数据库到 Pages 项目

如果使用方式 2 部署，需要手动绑定数据库:

1. 在 Cloudflare Dashboard 中，进入你的 Pages 项目
2. 点击 **Settings** → **Functions**
3. 在 **D1 database bindings** 中添加:
   - **Variable name**: `DB`
   - **D1 database**: 选择 `mahjong-db`
4. 保存并重新部署

---

### 第 9 步: 访问你的应用

部署成功后，你会获得一个 URL，例如:
```
https://mahjong.pages.dev
```

访问这个 URL，你的麻将记账应用就上线了！🎉

---

## 🔄 后续更新流程

### 更新代码

1. 修改代码
2. 重新部署:
   ```bash
   wrangler pages deploy public --project-name=mahjong
   ```

**数据不会丢失**，因为数据库和应用是分离的。

---

### 更新数据库结构

如果需要修改数据库表结构:

1. 修改 `schema.sql`
2. 执行更新:
   ```bash
   wrangler d1 execute mahjong-db --file=schema.sql
   ```

**注意**: 如果表已存在，`CREATE TABLE IF NOT EXISTS` 不会覆盖现有数据。

---

## 📊 数据迁移（从现有 SQLite 数据库）

如果你有现有的 SQLite 数据库数据需要迁移:

### 方法 1: 使用导出功能

1. 在旧应用中访问 `/api/export` 导出所有数据
2. 保存 JSON 文件
3. 在新应用中使用管理页面导入数据

### 方法 2: 使用 SQL 脚本

1. 从旧数据库导出数据:
   ```bash
   sqlite3 instance/mahjong.db .dump > data.sql
   ```

2. 导入到 D1:
   ```bash
   wrangler d1 execute mahjong-db --file=data.sql
   ```

---

## 🛠️ 故障排查

### 问题 1: 部署后 API 返回 500 错误

**解决方案**: 检查 D1 数据库是否正确绑定
```bash
wrangler pages deployment list --project-name=mahjong
```

### 问题 2: 数据库查询失败

**解决方案**: 确认数据库已初始化
```bash
wrangler d1 execute mahjong-db --command="SELECT name FROM sqlite_master WHERE type='table'"
```

应该看到 `rounds`, `details`, `settings`, `stats` 四个表。

### 问题 3: 本地测试无法连接数据库

**解决方案**: 确保使用 `--d1` 参数:
```bash
wrangler pages dev public --d1 DB=mahjong-db
```

---

## 📈 性能优化建议

1. **启用缓存**: Cloudflare 自动缓存静态资源
2. **使用自定义域名**: 在 Pages 设置中添加自定义域名
3. **监控使用情况**: 在 Cloudflare Dashboard 查看请求统计

---

## 🔒 安全建议

1. **添加访问控制**: 使用 Cloudflare Access 保护应用
2. **定期备份数据**: 使用 `/api/export` 定期导出数据
3. **限制 API 访问**: 在 Functions 中添加身份验证

---

## 📞 获取帮助

- [Cloudflare Pages 文档](https://developers.cloudflare.com/pages/)
- [D1 数据库文档](https://developers.cloudflare.com/d1/)
- [Wrangler CLI 文档](https://developers.cloudflare.com/workers/wrangler/)

---

## ✅ 部署检查清单

- [ ] 安装 Wrangler CLI
- [ ] 创建 D1 数据库
- [ ] 更新 `wrangler.toml` 中的 `database_id`
- [ ] 初始化数据库（运行 `schema.sql`）
- [ ] 本地测试所有功能
- [ ] 部署到 Cloudflare Pages
- [ ] 绑定 D1 数据库
- [ ] 访问生产环境 URL 验证
- [ ] 测试数据持久化
- [ ] 备份现有数据（如果有）

---

**恭喜！你的麻将记账应用现在运行在 Cloudflare 全球边缘网络上！** 🎉
