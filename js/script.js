// Mahjong Game - Core JavaScript Logic

// 导入数据库模块
import { DB } from './db.js';

// 全局变量
let totalCommission = 0; // 累计佣金总额
let roundCount = 0; // 局数计数器
let allRounds = []; // 所有局记录
let currentSettings = {
    commissionRate: 20,      // 默认佣金比例20%
    commissionThreshold: 500  // 默认抽佣门槛500元
};

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', async function() {
    // 初始化数据库（从localStorage迁移数据）
    try {
        await DB.init();
        console.log('数据库初始化成功');
    } catch (error) {
        console.error('数据库初始化失败:', error);
    }
    
    // 加载保存的设置
    await loadSettings();
    
    // 加载所有记录
    await loadAllRounds();
    
    // 初始化6个玩家输入框
    initializePlayers();
    
    // 绑定按钮事件
    bindEvents();
    
    // 初始化并启动时间显示
    updateCurrentTime();
    setInterval(updateCurrentTime, 1000); // 每秒更新一次时间
    
    // 显示最近3局记录
    displayRecentRounds();
    
    // 显示最近3条消费记录
    await displayRecentExpenses();
    
    // 绑定管理员登录事件
    bindAdminLoginEvents();
});

// 显示最近3条消费记录
async function displayRecentExpenses() {
    try {
        // 从数据库获取所有金额明细
        const details = await DB.details.getAll();
        
        // 过滤出消费记录，并按时间倒序排列，取最近3条
        const recentExpenses = details
            .filter(detail => detail.type === 'expense')
            .sort((a, b) => b.timestamp - a.timestamp)
            .slice(0, 3);
        
        const expensesList = document.getElementById('expenses-list');
        // 防御性：如果目标容器不存在，就跳过渲染，避免页面崩溃
        if (!expensesList) {
            return;
        }
        expensesList.innerHTML = '';
        
        if (recentExpenses.length === 0) {
            expensesList.innerHTML = '<p class="no-records">暂无消费记录</p>';
            return;
        }
        
        // 显示消费记录
        recentExpenses.forEach(expense => {
            const expenseItem = document.createElement('div');
            expenseItem.className = 'expense-item';
            
            expenseItem.innerHTML = `
                <div class="expense-detail">${expense.detail}</div>
                <div class="expense-time">消费时间: ${expense.time}</div>
                <div class="expense-amount">金额: ${Math.round(expense.amount)}元</div>
            `;
            
            expensesList.appendChild(expenseItem);
        });
    } catch (error) {
        console.error('加载最近消费记录失败:', error);
    }
}

// 绑定管理员登录事件
function bindAdminLoginEvents() {
    const loginForm = document.getElementById('admin-login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const username = document.getElementById('admin-username').value;
            const password = document.getElementById('admin-password').value;
            
            // 验证管理员用户名和密码
    if (username === 'admin' && password === 'admin123') {
        alert('管理员登录成功！');
        // 登录成功后，跳转到管理员面板
        window.location.href = '/html/admin.html';
    } else {
        alert('用户名或密码错误！');
    }
        });
    }
}

// 加载所有记录
async function loadAllRounds() {
    try {
        console.log('开始加载所有记录');
        
        // 从数据库获取所有记录
        console.log('调用DB.rounds.getAll()获取记录...');
        try {
            const fetchedRounds = await DB.rounds.getAll();
            console.log('从数据库获取到的记录:', fetchedRounds);
            console.log('从数据库获取到的记录数量:', fetchedRounds.length);
            
            // 确保fetchedRounds是数组
            if (Array.isArray(fetchedRounds)) {
                allRounds = fetchedRounds;
            } else {
                console.error('从数据库获取到的记录不是数组:', fetchedRounds);
                allRounds = [];
            }
        } catch (error) {
            console.error('调用DB.rounds.getAll()失败:', error);
            allRounds = [];
        }
        
        // 设置roundCount为最大的roundNum，而不是记录数量
        if (allRounds.length > 0) {
            roundCount = Math.max(...allRounds.map(round => round.roundNum));
        } else {
            roundCount = 0;
        }
        console.log('roundCount设置为:', roundCount);
        
        // 从数据库获取统计数据，包括初始公共资金
        const stats = await DB.stats.get();
        totalCommission = stats.totalCommission;
        console.log('从数据库获取的totalCommission:', totalCommission);
        
        // 更新金币池显示（包含消费支出）
        await updateTotalCommission();
        console.log('金币池显示已更新');
        console.log('loadAllRounds函数执行完成');
    } catch (error) {
        console.error('加载游戏记录失败:', error);
        console.error('错误详情:', error.stack);
    }
}

// 加载保存的设置
async function loadSettings() {
    try {
        // 从数据库获取设置
        const savedSettings = await DB.settings.get();
        if (savedSettings) {
            // 移除id字段（如果存在）
            delete savedSettings.id;
            currentSettings = savedSettings;
        }
        
        // 更新页面上的设置显示
        updateSettingsDisplay();
    } catch (error) {
        console.error('加载设置失败:', error);
    }
}

// 更新当前时间显示
function updateCurrentTime() {
    const now = new Date();
    const timeString = now.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
    const timeEl = document.getElementById('time-display');
    if (timeEl) {
        timeEl.textContent = timeString;
    }
}

// 更新设置显示
function updateSettingsDisplay() {
    // 只在找到元素时更新，避免在index.html中报错
    const settingsElement = document.getElementById('current-settings');
    const rateInput = document.getElementById('commission-rate');
    
    if (settingsElement && rateInput) {
        // 更新显示文本
        settingsElement.innerHTML = `佣金比例: <strong>${currentSettings.commissionRate}%</strong> (低于${currentSettings.commissionThreshold}元不抽佣)`;
        
        // 更新隐藏输入框的值
        rateInput.value = currentSettings.commissionRate;
    }
}

// 初始化6个玩家输入框
function initializePlayers() {
    const playersContainer = document.querySelector('.players-container');
    if (!playersContainer) {
        // 页面上可能没有玩家输入区域，忽略
        return;
    }
    // 固定玩家姓名列表
    const playerNames = ['刘', '蔡', '范', '耿', '陈', '陆'];
    
    // 生成6个玩家输入框，只保留输赢输入
    for (let i = 0; i < 6; i++) {
        const playerDiv = document.createElement('div');
        playerDiv.className = 'player-input';
        playerDiv.innerHTML = `
            <h4>${playerNames[i]}</h4>
            <div>
                <label for="player-${i+1}-score">输赢:</label>
                <input type="number" id="player-${i+1}-score" placeholder="0" step="0.01" value="0">
            </div>
        `;
        playersContainer.appendChild(playerDiv);
    }
}

// 绑定事件处理函数
function bindEvents() {
    // 添加本局记录按钮
    const addRoundBtn = document.getElementById('add-round');
    if (addRoundBtn) {
        addRoundBtn.addEventListener('click', addRound);
    }
    
    // 添加消费记录按钮
    const addExpenseBtn = document.getElementById('add-expense');
    if (addExpenseBtn) {
        addExpenseBtn.addEventListener('click', function() {
            window.location.href = '/html/expense.html';
        });
    }
    
    // 金额明细按钮
    const viewDetailsBtn = document.getElementById('view-details');
    if (viewDetailsBtn) {
        viewDetailsBtn.addEventListener('click', function() {
            window.location.href = '/html/details.html';
        });
    }
}

// 添加本局记录
async function addRound() {
    // 使用currentSettings中的佣金比例，而不是从DOM中获取
    const commissionRate = currentSettings.commissionRate / 100;
    
    // 获取所有玩家的输赢数据
    const playersData = [];
    let totalWin = 0;
    let totalLose = 0;
    // 固定玩家姓名列表
    const playerNames = ['刘', '蔡', '范', '耿', '陈', '陆'];
    
    for (let i = 0; i < 6; i++) {
        const el = document.getElementById(`player-${i+1}-score`);
        if (!el) {
            console.warn(`缺少玩家输入框: player-${i+1}-score`);
            return;
        }
        const score = parseFloat(el.value) || 0;

        playersData.push({ name: playerNames[i], score });

        // 统计总赢和总输
        if (score > 0) {
            totalWin += score;
        } else if (score < 0) {
            totalLose += Math.abs(score);
        }
    }
    
    // 验证数据完整性：总赢和总输应该相等（游戏平衡）
    if (Math.abs(totalWin - totalLose) > 0.01) {
        alert('数据不平衡！总赢金额与总输金额不一致，请检查输入。');
        return;
    }
    
    // 计算本局佣金（佣金从赢家那里抽取）
    // 规则：只有单个玩家赢钱超过门槛时，才从该玩家那里抽取佣金
    let roundCommission = 0;
    for (const player of playersData) {
        if (player.score > currentSettings.commissionThreshold) {
            roundCommission += player.score * commissionRate;
        }
    }
    
    // 增加局数
    roundCount++;
    
    // 获取当前时间
    const now = new Date();
    const timeString = now.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
    
    // 创建本局记录对象
    const roundRecord = {
        roundNum: roundCount,
        playersData: playersData,
        commission: roundCommission,
        rate: commissionRate * 100,
        threshold: currentSettings.commissionThreshold, // 添加抽佣门槛信息
        time: timeString,
        timestamp: now.getTime() // 用于排序
    };
    
    // 添加到所有记录数组
    allRounds.push(roundRecord);
    
    // 保存到数据库
    try {
        await DB.rounds.save(roundRecord);
    } catch (error) {
        console.error('保存游戏记录失败:', error);
    }
    
    // 更新累计佣金
    totalCommission += roundCommission;
    
    try {
        await DB.stats.updateTotalCommission(totalCommission);
    } catch (error) {
        console.error('更新统计数据失败:', error);
    }
    
    await updateTotalCommission();
    
    // 显示最近5局记录
    displayRecentRounds();
    
    // 清空当前玩家的输赢输入
    clearPlayerScores();
}

// 更新累计佣金显示
async function updateTotalCommission() {
    // 计算正确的金币池余额
    const totalGold = await calculateCurrentGold();
    
    // 去掉小数点，只显示整数
    const totalGoldInteger = Math.round(totalGold);
    
    // 更新页面显示
    const el = document.getElementById('total-commission-amount');
    if (el) {
        el.textContent = totalGoldInteger;
    }
}

// 计算当前金币池余额
async function calculateCurrentGold() {
    // 获取所有明细记录，计算正确的余额
    const allDetails = [];
    
    try {
        // 1. 加载所有金额明细（包括初始公共资金和消费支出）
        const dbDetails = await DB.details.getAll();
        
        // 2. 加载佣金收入记录
        const rounds = await DB.rounds.getAll();
        
        // 先添加所有金额明细
        allDetails.push(...dbDetails);
        
        // 再添加佣金收入记录
        rounds.forEach(round => {
            // 只处理有佣金收入的记录
            if (round.commission > 0) {
                const incomeRecord = {
                    type: 'income',
                    amount: round.commission
                };
                
                allDetails.push(incomeRecord);
            }
        });
        
        // 计算总收入和总支出
        let totalIncome = 0;
        let totalExpense = 0;
        
        allDetails.forEach(detail => {
            if (detail.type === 'income') {
                totalIncome += detail.amount;
            } else if (detail.type === 'expense') {
                totalExpense += detail.amount;
            }
        });
        
        // 当前余额 = 总收入 - 总支出
        return totalIncome - totalExpense;
    } catch (error) {
        console.error('计算当前金币池余额失败:', error);
        return 0;
    }
}

// 保存所有记录到数据库
async function saveAllRounds() {
    console.log('saveAllRounds函数被调用，当前allRounds长度:', allRounds.length);
    console.log('allRounds内容:', allRounds);
    try {
        const result = await DB.rounds.saveAll(allRounds);
        console.log('DB.rounds.saveAll调用成功，结果:', result);
        return result;
    } catch (error) {
        console.error('保存游戏记录失败:', error);
        throw error;
    }
}

// 显示最近5局记录
function displayRecentRounds() {
    const roundsList = document.getElementById('rounds-list');
    if (!roundsList) return;
    roundsList.innerHTML = '';
    
    // 获取最近3局记录，按时间倒序排列
    const recentRounds = [...allRounds].sort((a, b) => b.timestamp - a.timestamp).slice(0, 3);
    
    // 显示记录
    recentRounds.forEach((round, index) => {
        try {
            const roundItem = document.createElement('div');
            roundItem.className = 'round-item';
            
            // 构建玩家详情HTML
            let playersDetails = '<div class="player-details-grid">';
            if (round.playersData && Array.isArray(round.playersData)) {
                // 每个玩家单独一行，垂直排列
                playersDetails += '<div class="player-details-row">';
                round.playersData.forEach(player => {
                    const status = player.score > 0 ? '赢' : player.score < 0 ? '输' : '平';
                    const displayScore = Math.round(Math.abs(player.score)); // 去掉小数点
                    const amountClass = player.score > 0 ? 'win-amount' : player.score < 0 ? 'lose-amount' : '';
                    
                    playersDetails += `
                        <div class="player-detail">
                            <span style="text-align: left;">${player.name}: ${status}</span> 
                            <span class="${amountClass}">${displayScore}元</span>
                        </div>
                    `;
                });
                playersDetails += '</div>';
            }
            playersDetails += '</div>';
        
        // 设置记录内容，添加错误处理
        const commission = round.commission || 0;
        const rate = round.rate || 0;
        const threshold = round.threshold || 500;
        // 去掉公共账户和门槛的小数点
        const commissionDisplay = Math.round(commission);
        const thresholdDisplay = Math.round(threshold);
        
        roundItem.innerHTML = `
            <h4>第 ${round.roundNum} 局</h4>
            <div class="round-time">记录时间: ${round.time || '未知'}</div>
            ${playersDetails}
            <div class="round-commission">公共账户: ${commissionDisplay}元 (抽取比例: ${rate.toFixed(1)}%，抽公共账户门槛: ${thresholdDisplay}元)</div>
        `;
            
            roundsList.appendChild(roundItem);
        } catch (error) {
            console.error(`显示第 ${index + 1} 条记录失败:`, error);
        }
    });
    
    if (recentRounds.length === 0) {
        roundsList.innerHTML = '<p class="no-records">暂无记录</p>';
    }
}

// 清空玩家的输赢分数（保留姓名）
function clearPlayerScores() {
    for (let i = 1; i <= 6; i++) {
        const el = document.getElementById(`player-${i}-score`);
        if (el) {
            el.value = '0';
        }
    }
}

// 辅助函数：格式化金额显示
function formatMoney(amount) {
    return parseFloat(amount).toFixed(2);
}
