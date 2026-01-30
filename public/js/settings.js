// 佣金设置页面 - JavaScript 逻辑

// 导入数据库模块
import { DB } from './db_local.js';
// 导入同步模块
import Sync from './sync.js';

// 默认设置
const DEFAULT_SETTINGS = {
    commissionRate: 20,      // 默认公共账户比例20%
    commissionThreshold: 500  // 默认抽公共账户门槛500元
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', async function() {
    // 初始化同步模块
    Sync.init();
    
    // 加载当前设置
    await loadSettings();
    
    // 加载保存的GitHub令牌
    loadGithubToken();
    
    // 绑定按钮事件
    bindEvents();
    
    // 绑定同步事件
    bindSyncEvents();
    
    // 更新同步状态显示
    updateSyncStatus();
});

// 加载当前设置
async function loadSettings() {
    try {
        // 从数据库获取设置，如果没有则使用默认设置
        const savedSettings = await DB.settings.get();
        const settings = savedSettings ? savedSettings : DEFAULT_SETTINGS;
        
        // 移除id字段（如果存在）
        delete settings.id;
        
        // 设置输入框的值
        document.getElementById('commission-rate-setting').value = settings.commissionRate;
        document.getElementById('commission-threshold-setting').value = settings.commissionThreshold;
    } catch (error) {
        console.error('加载设置失败:', error);
        // 加载失败时使用默认设置
        document.getElementById('commission-rate-setting').value = DEFAULT_SETTINGS.commissionRate;
        document.getElementById('commission-threshold-setting').value = DEFAULT_SETTINGS.commissionThreshold;
    }
}

// 保存设置
async function saveSettings() {
    // 获取输入的值
    const commissionRate = parseFloat(document.getElementById('commission-rate-setting').value);
    const commissionThreshold = parseFloat(document.getElementById('commission-threshold-setting').value);
    
    // 验证输入
    if (isNaN(commissionRate) || commissionRate < 0 || commissionRate > 100) {
        alert('请输入有效的佣金比例（0-100%）');
        return;
    }
    
    if (isNaN(commissionThreshold) || commissionThreshold < 0) {
        alert('请输入有效的抽佣门槛（大于等于0）');
        return;
    }
    
    // 创建设置对象
    const settings = {
        commissionRate: commissionRate,
        commissionThreshold: commissionThreshold
    };
    
    // 保存到数据库
    try {
        await DB.settings.save(settings);
        // 提示保存成功
        alert('设置保存成功！');
    } catch (error) {
        console.error('保存设置失败:', error);
        alert('保存设置失败，请重试！');
    }
}

// 绑定事件处理函数
function bindEvents() {
    // 保存设置按钮
    document.getElementById('save-settings').addEventListener('click', saveSettings);
    
    // 返回首页按钮
    document.getElementById('back-to-main').addEventListener('click', function() {
        window.location.href = '../index.html';
    });
    
    // 返回管理员面板按钮
    document.getElementById('back-to-admin').addEventListener('click', function() {
        window.location.href = 'admin.html';
    });
}

// 加载保存的GitHub令牌
function loadGithubToken() {
    const token = Sync.getGithubToken();
    if (token) {
        document.getElementById('github-token').value = token;
    }
}

// 保存GitHub令牌
function saveGithubToken() {
    const token = document.getElementById('github-token').value;
    if (!token) {
        alert('请输入GitHub API令牌');
        return;
    }
    
    Sync.setGithubToken(token);
    alert('GitHub API令牌保存成功！');
}

// 绑定同步事件
function bindSyncEvents() {
    // 保存GitHub令牌按钮
    document.getElementById('save-github-token').addEventListener('click', saveGithubToken);
    
    // 同步到GitHub按钮
    document.getElementById('sync-to-github').addEventListener('click', async function() {
        try {
            showSyncStatus('正在同步到GitHub...');
            await Sync.syncToGithub();
            showSyncStatus('同步到GitHub成功！');
            updateSyncStatus();
        } catch (error) {
            showSyncStatus(`同步失败: ${error.message}`);
        }
    });
    
    // 从GitHub同步按钮
    document.getElementById('sync-from-github').addEventListener('click', async function() {
        try {
            showSyncStatus('正在从GitHub同步...');
            await Sync.syncFromGithub();
            showSyncStatus('从GitHub同步成功！');
            updateSyncStatus();
            // 重新加载设置
            await loadSettings();
        } catch (error) {
            showSyncStatus(`同步失败: ${error.message}`);
        }
    });
    
    // 双向同步按钮
    document.getElementById('sync-both').addEventListener('click', async function() {
        try {
            showSyncStatus('正在双向同步...');
            await Sync.sync();
            showSyncStatus('双向同步成功！');
            updateSyncStatus();
            // 重新加载设置
            await loadSettings();
        } catch (error) {
            showSyncStatus(`同步失败: ${error.message}`);
        }
    });
}

// 显示同步状态
function showSyncStatus(message) {
    const statusDiv = document.getElementById('sync-status');
    const messageP = document.getElementById('sync-message');
    
    statusDiv.style.display = 'block';
    messageP.textContent = `同步状态：${message}`;
}

// 更新同步状态显示
function updateSyncStatus() {
    const status = Sync.getStatus();
    const statusDiv = document.getElementById('sync-status');
    const messageP = document.getElementById('sync-message');
    const timeP = document.getElementById('last-sync-time');
    
    statusDiv.style.display = 'block';
    
    if (status.error) {
        messageP.textContent = `同步状态：错误 - ${status.error}`;
    } else if (status.isSyncing) {
        messageP.textContent = '同步状态：同步中...';
    } else {
        messageP.textContent = '同步状态：正常';
    }
    
    if (status.lastSync) {
        timeP.textContent = `上次同步：${new Date(status.lastSync).toLocaleString('zh-CN')}`;
    } else {
        timeP.textContent = '上次同步：从未';
    }
}