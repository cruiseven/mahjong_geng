/**
 * 本地存储数据库管理模块
 * 
 * 这个模块使用浏览器的localStorage API实现本地数据存储，
 * 用于在GitHub Pages等静态网站环境中替代服务器端数据库。
 * 
 * 主要功能：
 * - 使用localStorage存储游戏记录、金额明细、设置和统计数据
 * - 提供与db.js相同的API接口，便于切换
 * - 支持数据的增删查改操作
 * - 支持数据导出和清空
 * 
 * 存储机制：
 * - 所有数据以JSON格式存储在localStorage中
 * - 使用统一的键名前缀'mahjong_'避免冲突
 * - 自动生成唯一ID确保数据完整性
 * 
 * @module db_local
 * @author TANG
 * @version 1.0
 */

// 本地存储键名前缀
const STORAGE_PREFIX = 'mahjong_';

// 初始化数据库
async function initDB() {
    // 检查是否已有数据
    if (!localStorage.getItem(`${STORAGE_PREFIX}initialized`)) {
        // 初始化默认数据
        const defaultSettings = {
            commissionRate: 20,
            commissionThreshold: 500
        };

        const defaultStats = {
            totalCommission: 0,
            roundCount: 0
        };

        // 保存默认数据
        localStorage.setItem(`${STORAGE_PREFIX}settings`, JSON.stringify(defaultSettings));
        localStorage.setItem(`${STORAGE_PREFIX}stats`, JSON.stringify(defaultStats));
        localStorage.setItem(`${STORAGE_PREFIX}rounds`, JSON.stringify([]));
        localStorage.setItem(`${STORAGE_PREFIX}details`, JSON.stringify([]));
        localStorage.setItem(`${STORAGE_PREFIX}initialized`, 'true');

        console.log('本地数据库初始化完成');
    }
    console.log('数据库初始化完成');
}

// 获取所有游戏记录
async function getAllRounds() {
    const rounds = localStorage.getItem(`${STORAGE_PREFIX}rounds`);
    return rounds ? JSON.parse(rounds) : [];
}

// 保存游戏记录
async function saveRound(round) {
    const rounds = await getAllRounds();

    // 检查是否已存在相同roundNum的记录
    const existingIndex = rounds.findIndex(r => r.roundNum === round.roundNum);

    if (existingIndex !== -1) {
        // 更新现有记录
        rounds[existingIndex] = round;
    } else {
        // 添加新记录
        rounds.push(round);

        // 更新回合数统计
        const stats = await getStats();
        stats.roundCount = rounds.length;
        await saveStats(stats);
    }

    localStorage.setItem(`${STORAGE_PREFIX}rounds`, JSON.stringify(rounds));
    return round;
}

// 保存所有游戏记录
async function saveAllRounds(rounds) {
    localStorage.setItem(`${STORAGE_PREFIX}rounds`, JSON.stringify(rounds));

    // 更新回合数统计
    const stats = await getStats();
    stats.roundCount = rounds.length;
    await saveStats(stats);

    return rounds;
}

// 获取所有金额明细
async function getAllDetails() {
    const details = localStorage.getItem(`${STORAGE_PREFIX}details`);
    return details ? JSON.parse(details) : [];
}

// 保存金额明细
async function saveDetail(detail) {
    const details = await getAllDetails();

    // 生成唯一ID
    if (!detail.id) {
        detail.id = Date.now() + Math.floor(Math.random() * 1000);
    }

    // 检查是否已存在相同ID的记录
    const existingIndex = details.findIndex(d => d.id === detail.id);

    if (existingIndex !== -1) {
        // 更新现有记录
        details[existingIndex] = detail;
    } else {
        // 添加新记录
        details.push(detail);
    }

    localStorage.setItem(`${STORAGE_PREFIX}details`, JSON.stringify(details));
    return detail;
}

// 保存所有金额明细
async function saveAllDetails(details) {
    localStorage.setItem(`${STORAGE_PREFIX}details`, JSON.stringify(details));
    return details;
}

// 获取设置信息
async function getSettings() {
    const settings = localStorage.getItem(`${STORAGE_PREFIX}settings`);
    return settings ? JSON.parse(settings) : {
        commissionRate: 20,
        commissionThreshold: 500
    };
}

// 保存设置信息
async function saveSettings(settings) {
    localStorage.setItem(`${STORAGE_PREFIX}settings`, JSON.stringify(settings));
    return settings;
}

// 获取统计数据
async function getStats() {
    const stats = localStorage.getItem(`${STORAGE_PREFIX}stats`);
    return stats ? JSON.parse(stats) : {
        totalCommission: 0,
        roundCount: 0
    };
}

// 保存统计数据
async function saveStats(stats) {
    localStorage.setItem(`${STORAGE_PREFIX}stats`, JSON.stringify(stats));
    return stats;
}

// 更新累计佣金
async function updateTotalCommission(amount) {
    const stats = await getStats();
    stats.totalCommission = amount;
    return await saveStats(stats);
}

// 导出数据库数据为JSON
async function exportDB() {
    const rounds = await getAllRounds();
    const details = await getAllDetails();
    const settings = await getSettings();
    const stats = await getStats();

    return {
        allRounds: rounds,
        totalCommission: stats.totalCommission,
        goldDetails: details,
        commissionSettings: settings,
        exportTime: new Date().toISOString()
    };
}

// 清空数据库
async function clearDB() {
    localStorage.removeItem(`${STORAGE_PREFIX}rounds`);
    localStorage.removeItem(`${STORAGE_PREFIX}details`);

    // 重置设置和统计数据
    const defaultSettings = {
        commissionRate: 20,
        commissionThreshold: 500
    };

    const defaultStats = {
        totalCommission: 0,
        roundCount: 0
    };

    localStorage.setItem(`${STORAGE_PREFIX}settings`, JSON.stringify(defaultSettings));
    localStorage.setItem(`${STORAGE_PREFIX}stats`, JSON.stringify(defaultStats));

    return { message: 'Database cleared successfully' };
}

// 数据库管理对象
export const DB = {
    init: initDB,
    rounds: {
        getAll: getAllRounds,
        save: saveRound,
        saveAll: saveAllRounds
    },
    details: {
        getAll: getAllDetails,
        save: saveDetail,
        saveAll: saveAllDetails
    },
    settings: {
        get: getSettings,
        save: saveSettings
    },
    stats: {
        get: getStats,
        save: saveStats,
        updateTotalCommission: updateTotalCommission
    },
    export: exportDB,
    clear: clearDB
};