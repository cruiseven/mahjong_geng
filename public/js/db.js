/**
 * 数据库管理模块 - 服务器API通信
 * 
 * 这个模块负责与Flask后端API进行通信，处理所有数据库相关的操作。
 * 使用fetch API发送HTTP请求，支持游戏记录、金额明细、设置和统计数据的CRUD操作。
 * 
 * 主要功能：
 * - 游戏记录的增删查改
 * - 金额明细的增删查改
 * - 设置信息的读取和保存
 * - 统计数据的读取和更新
 * - 数据导出和数据库清空
 * 
 * API基础路径：/api
 * 
 * @module db
 * @author TANG
 * @version 1.0
 */

// API基础URL
const API_BASE_URL = '/api';

// 辅助函数：发送HTTP请求
async function fetchAPI(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;

    // 默认请求头
    const defaultHeaders = {
        'Content-Type': 'application/json'
    };

    // 合并请求选项
    const fetchOptions = {
        ...options,
        headers: {
            ...defaultHeaders,
            ...options.headers
        }
    };

    try {
        // 发送请求
        const response = await fetch(url, fetchOptions);

        // 检查响应状态
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`API请求失败: ${response.status} ${response.statusText}`);
        }

        // 解析JSON响应
        return await response.json();
    } catch (error) {
        console.error('API请求错误:', error);
        throw error;
    }
}

// 初始化数据库
async function initDB() {
    // 简化初始化，去掉从localStorage迁移数据的功能
    console.log('数据库初始化完成');
}

// 获取所有游戏记录
async function getAllRounds() {
    return await fetchAPI('/rounds');
}

// 保存游戏记录
async function saveRound(round) {
    return await fetchAPI('/rounds', {
        method: 'POST',
        body: JSON.stringify(round)
    });
}

// 保存所有游戏记录
async function saveAllRounds(rounds) {
    return await fetchAPI('/rounds/all', {
        method: 'POST',
        body: JSON.stringify(rounds)
    });
}

// 获取所有金额明细
async function getAllDetails() {
    return await fetchAPI('/details');
}

// 保存金额明细
async function saveDetail(detail) {
    return await fetchAPI('/details', {
        method: 'POST',
        body: JSON.stringify(detail)
    });
}

// 保存所有金额明细
async function saveAllDetails(details) {
    return await fetchAPI('/details/all', {
        method: 'POST',
        body: JSON.stringify(details)
    });
}

// 获取设置信息
async function getSettings() {
    return await fetchAPI('/settings');
}

// 保存设置信息
async function saveSettings(settings) {
    return await fetchAPI('/settings', {
        method: 'POST',
        body: JSON.stringify(settings)
    });
}

// 获取统计数据
async function getStats() {
    return await fetchAPI('/stats');
}

// 保存统计数据
async function saveStats(stats) {
    // 由于服务器端统计数据是自动计算的，这里只更新累计佣金
    return await fetchAPI('/stats/total', {
        method: 'PUT',
        body: JSON.stringify({ totalCommission: stats.totalCommission })
    });
}

// 更新累计佣金
async function updateTotalCommission(amount) {
    return await fetchAPI('/stats/total', {
        method: 'PUT',
        body: JSON.stringify({ totalCommission: amount })
    });
}

// 导出数据库数据为JSON
async function exportDB() {
    return await fetchAPI('/export');
}

// 清空数据库
async function clearDB() {
    return await fetchAPI('/clear', {
        method: 'DELETE'
    });
}

/**
 * 数据库管理对象
 * 
 * 提供统一的数据库操作接口，封装所有与后端API的通信。
 * 
 * @namespace DB
 * @property {Function} init - 初始化数据库
 * @property {Object} rounds - 游戏记录相关操作
 * @property {Function} rounds.getAll - 获取所有游戏记录
 * @property {Function} rounds.save - 保存单条游戏记录
 * @property {Function} rounds.saveAll - 批量保存游戏记录
 * @property {Object} details - 金额明细相关操作
 * @property {Function} details.getAll - 获取所有金额明细
 * @property {Function} details.save - 保存单条明细
 * @property {Function} details.saveAll - 批量保存明细
 * @property {Object} settings - 设置相关操作
 * @property {Function} settings.get - 获取设置
 * @property {Function} settings.save - 保存设置
 * @property {Object} stats - 统计数据相关操作
 * @property {Function} stats.get - 获取统计数据
 * @property {Function} stats.save - 保存统计数据
 * @property {Function} stats.updateTotalCommission - 更新累计佣金
 * @property {Function} export - 导出所有数据
 * @property {Function} clear - 清空数据库
 */
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
