-- Cloudflare D1 数据库初始化脚本
-- 用于创建麻将记账应用所需的所有表和默认数据

-- 游戏记录表
CREATE TABLE IF NOT EXISTS rounds (
    roundNum INTEGER PRIMARY KEY,
    playersData TEXT NOT NULL,
    commission REAL NOT NULL,
    rate REAL NOT NULL,
    threshold REAL NOT NULL DEFAULT 500,
    time TEXT NOT NULL,
    timestamp INTEGER NOT NULL
);

-- 金额明细表
CREATE TABLE IF NOT EXISTS details (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL,
    detail TEXT NOT NULL,
    amount REAL NOT NULL,
    time TEXT NOT NULL,
    timestamp INTEGER NOT NULL,
    balance REAL NOT NULL
);

-- 设置表
CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY DEFAULT 1,
    commissionRate REAL NOT NULL,
    commissionThreshold REAL NOT NULL
);

-- 统计表
CREATE TABLE IF NOT EXISTS stats (
    id INTEGER PRIMARY KEY DEFAULT 1,
    totalCommission REAL NOT NULL,
    roundCount INTEGER NOT NULL
);

-- 插入默认设置
INSERT OR IGNORE INTO settings (id, commissionRate, commissionThreshold)
VALUES (1, 20, 500);

-- 插入默认统计数据
INSERT OR IGNORE INTO stats (id, totalCommission, roundCount)
VALUES (1, 0, 0);
