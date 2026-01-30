// 数据同步模块
// 用于在GitHub上存储数据，实现多设备同步

import { DB } from './db_local.js';

// GitHub API 配置
const GITHUB_USERNAME = 'cruiseven'; // GitHub 用户名
const REPO_NAME = 'mahjong_geng'; // 仓库名
const DATA_FILE_PATH = 'data.json'; // 数据文件路径
const BRANCH = 'master'; // 分支名

// 同步状态
let syncStatus = {
    lastSync: null,
    isSyncing: false,
    error: null
};

// 获取GitHub API令牌（从localStorage中获取，用户需要手动设置）
function getGithubToken() {
    return localStorage.getItem('github_token');
}

// 设置GitHub API令牌
function setGithubToken(token) {
    localStorage.setItem('github_token', token);
}

// 从GitHub获取数据
async function fetchDataFromGithub() {
    const token = getGithubToken();
    if (!token) {
        throw new Error('请先设置GitHub API令牌');
    }

    try {
        const response = await fetch(
            `https://api.github.com/repos/${GITHUB_USERNAME}/${REPO_NAME}/contents/${DATA_FILE_PATH}?ref=${BRANCH}`,
            {
                headers: {
                    'Authorization': `token ${token}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            }
        );

        if (!response.ok) {
            if (response.status === 404) {
                // 数据文件不存在，返回空数据
                return null;
            }
            throw new Error(`从GitHub获取数据失败: ${response.status}`);
        }

        const data = await response.json();
        const content = atob(data.content.replace(/\s/g, ''));
        return JSON.parse(content);
    } catch (error) {
        console.error('从GitHub获取数据失败:', error);
        throw error;
    }
}

// 上传数据到GitHub
async function uploadDataToGithub(data) {
    const token = getGithubToken();
    if (!token) {
        throw new Error('请先设置GitHub API令牌');
    }

    try {
        // 首先检查文件是否存在
        let sha = null;
        try {
            const response = await fetch(
                `https://api.github.com/repos/${GITHUB_USERNAME}/${REPO_NAME}/contents/${DATA_FILE_PATH}?ref=${BRANCH}`,
                {
                    headers: {
                        'Authorization': `token ${token}`,
                        'Accept': 'application/vnd.github.v3+json'
                    }
                }
            );

            if (response.ok) {
                const existingData = await response.json();
                sha = existingData.sha;
            }
        } catch (error) {
            // 文件不存在，继续执行
        }

        // 准备上传数据
        const content = btoa(JSON.stringify(data, null, 2));
        const commitMessage = `同步数据: ${new Date().toISOString()}`;

        const uploadResponse = await fetch(
            `https://api.github.com/repos/${GITHUB_USERNAME}/${REPO_NAME}/contents/${DATA_FILE_PATH}`,
            {
                method: 'PUT',
                headers: {
                    'Authorization': `token ${token}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: commitMessage,
                    content: content,
                    branch: BRANCH,
                    sha: sha
                })
            }
        );

        if (!uploadResponse.ok) {
            throw new Error(`上传数据到GitHub失败: ${uploadResponse.status}`);
        }

        return true;
    } catch (error) {
        console.error('上传数据到GitHub失败:', error);
        throw error;
    }
}

// 导出所有数据为JSON对象
async function exportAllData() {
    const rounds = await DB.rounds.getAll();
    const details = await DB.details.getAll();
    const settings = await DB.settings.get();
    const stats = await DB.stats.get();

    return {
        rounds: rounds,
        details: details,
        settings: settings,
        stats: stats,
        exportTime: new Date().toISOString()
    };
}

// 导入数据到本地存储
async function importDataToLocal(data) {
    if (!data) return;

    try {
        // 导入游戏记录
        if (data.rounds && Array.isArray(data.rounds)) {
            await DB.rounds.saveAll(data.rounds);
        }

        // 导入金额明细
        if (data.details && Array.isArray(data.details)) {
            for (const detail of data.details) {
                await DB.details.save(detail);
            }
        }

        // 导入设置
        if (data.settings) {
            await DB.settings.save(data.settings);
        }

        // 导入统计数据
        if (data.stats) {
            await DB.stats.save(data.stats);
        }

        return true;
    } catch (error) {
        console.error('导入数据到本地失败:', error);
        throw error;
    }
}

// 同步数据到GitHub
async function syncToGithub() {
    if (syncStatus.isSyncing) {
        throw new Error('正在同步中，请稍后再试');
    }

    syncStatus.isSyncing = true;
    syncStatus.error = null;

    try {
        const data = await exportAllData();
        await uploadDataToGithub(data);
        syncStatus.lastSync = new Date().toISOString();
        syncStatus.isSyncing = false;
        return true;
    } catch (error) {
        syncStatus.error = error.message;
        syncStatus.isSyncing = false;
        throw error;
    }
}

// 从GitHub同步数据
async function syncFromGithub() {
    if (syncStatus.isSyncing) {
        throw new Error('正在同步中，请稍后再试');
    }

    syncStatus.isSyncing = true;
    syncStatus.error = null;

    try {
        const data = await fetchDataFromGithub();
        if (data) {
            await importDataToLocal(data);
        }
        syncStatus.lastSync = new Date().toISOString();
        syncStatus.isSyncing = false;
        return true;
    } catch (error) {
        syncStatus.error = error.message;
        syncStatus.isSyncing = false;
        throw error;
    }
}

// 双向同步
async function sync() {
    try {
        // 先从GitHub获取最新数据
        await syncFromGithub();
        // 然后将本地数据上传到GitHub
        await syncToGithub();
        return true;
    } catch (error) {
        throw error;
    }
}

// 获取同步状态
function getSyncStatus() {
    return { ...syncStatus };
}

// 初始化同步模块
function initSync() {
    // 检查是否已设置GitHub令牌
    const token = getGithubToken();
    if (!token) {
        console.log('未设置GitHub API令牌，请在设置页面中配置');
    }
}

// 导出同步模块
const Sync = {
    init: initSync,
    syncToGithub: syncToGithub,
    syncFromGithub: syncFromGithub,
    sync: sync,
    getStatus: getSyncStatus,
    getGithubToken: getGithubToken,
    setGithubToken: setGithubToken
};

export default Sync;