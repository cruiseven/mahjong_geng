// 佣金设置页面 - JavaScript 逻辑

// 导入数据库模块
import { DB } from './db.js';

// 默认设置
const DEFAULT_SETTINGS = {
    commissionRate: 20,      // 默认公共账户比例20%
    commissionThreshold: 500  // 默认抽公共账户门槛500元
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', async function() {
    // 加载当前设置
    await loadSettings();
    
    // 绑定按钮事件
    bindEvents();
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