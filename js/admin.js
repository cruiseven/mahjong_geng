// 管理员面板 - JavaScript 逻辑

// 导入数据库模块
import { DB } from './db.js';

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', async function() {
    // 加载并显示输赢记录
    await loadAndDisplayRounds();
    
    // 加载并显示消费记录
    await loadAndDisplayExpenses();
    
    // 绑定表单事件
    bindFormEvents();
});

// 加载并显示输赢记录
async function loadAndDisplayRounds() {
    try {
        // 从数据库获取所有记录
        const allRounds = await DB.rounds.getAll();
        
        // 按局数倒序排列
        const sortedRounds = allRounds.sort((a, b) => b.roundNum - a.roundNum);
        
        const roundsManagement = document.getElementById('rounds-management');
        roundsManagement.innerHTML = '';
        
        if (sortedRounds.length === 0) {
            roundsManagement.innerHTML = '<p class="no-records">暂无输赢记录</p>';
            return;
        }
        
        // 显示记录列表
        sortedRounds.forEach(round => {
            const roundItem = document.createElement('div');
            roundItem.className = 'round-item';
            roundItem.dataset.roundNum = round.roundNum;

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
        
        // 设置记录内容
        const commission = round.commission || 0;
        const rate = round.rate || 0;
        const threshold = round.threshold || 500;
        // 去掉公共账户和门槛的小数点
        const commissionDisplay = Math.round(commission);
        const thresholdDisplay = Math.round(threshold);

            roundItem.innerHTML = `
                <div class="round-header">
                    <h4>第 ${round.roundNum} 局</h4>
                    <button class="delete-round-btn" data-round-num="${round.roundNum}">删除</button>
                </div>
                <div class="round-time">记录时间: ${round.time || '未知'}</div>
                ${playersDetails}
                <div class="round-commission">公共账户: ${commissionDisplay} 元 (抽取比例: ${rate.toFixed(1)}%，抽公共账户门槛: ${thresholdDisplay} 元)</div>
            `;

            roundsManagement.appendChild(roundItem);
        });
        
        // 绑定删除按钮事件
        bindDeleteRoundEvents();
    } catch (error) {
        console.error('加载输赢记录失败:', error);
    }
}

// 加载并显示消费记录
async function loadAndDisplayExpenses() {
    try {
        // 从数据库获取所有金额明细
        const details = await DB.details.getAll();
        
        // 过滤出消费记录，并按时间倒序排列
        const sortedExpenses = details
            .filter(detail => detail.type === 'expense')
            .sort((a, b) => b.timestamp - a.timestamp);
        
        const expensesManagement = document.getElementById('expenses-management');
        expensesManagement.innerHTML = '';
        
        if (sortedExpenses.length === 0) {
            expensesManagement.innerHTML = '<p class="no-records">暂无消费记录</p>';
            return;
        }
        
        // 显示消费记录列表
        sortedExpenses.forEach(expense => {
            const expenseItem = document.createElement('div');
            expenseItem.className = 'expense-item';
            expenseItem.dataset.expenseId = expense.id;
            
            expenseItem.innerHTML = `
                <div class="expense-header">
                    <div class="expense-detail">${expense.detail}</div>
                    <button class="delete-expense-btn" data-expense-id="${expense.id}">删除</button>
                </div>
                <div class="expense-time">消费时间: ${expense.time}</div>
                <div class="expense-amount">金额: ${Math.round(expense.amount)}元</div>
            `;
            
            expensesManagement.appendChild(expenseItem);
        });
        
        // 绑定删除按钮事件
        bindDeleteExpenseEvents();
    } catch (error) {
        console.error('加载消费记录失败:', error);
    }
}

// 绑定删除输赢记录事件
function bindDeleteRoundEvents() {
    const deleteButtons = document.querySelectorAll('.delete-round-btn');
    deleteButtons.forEach(button => {
        button.addEventListener('click', async function() {
            const roundNum = parseInt(this.dataset.roundNum);
            if (confirm(`确定要删除第 ${roundNum} 局记录吗？`)) {
                await deleteRound(roundNum);
            }
        });
    });
}

// 删除特定输赢记录
async function deleteRound(roundNum) {
    try {
        // 从数据库获取所有记录
        const allRounds = await DB.rounds.getAll();
        
        // 过滤掉要删除的记录
        const updatedRounds = allRounds.filter(round => round.roundNum !== roundNum);
        
        // 保存更新后的记录
        await DB.rounds.saveAll(updatedRounds);
        
        // 重新加载并显示记录
        await loadAndDisplayRounds();
        
        // 更新统计数据
        updateStats();
    } catch (error) {
        console.error('删除输赢记录失败:', error);
    }
}

// 绑定删除消费记录事件
function bindDeleteExpenseEvents() {
    const deleteButtons = document.querySelectorAll('.delete-expense-btn');
    deleteButtons.forEach(button => {
        button.addEventListener('click', async function() {
            const expenseId = parseInt(this.dataset.expenseId);
            if (confirm('确定要删除这条消费记录吗？')) {
                await deleteExpense(expenseId);
            }
        });
    });
}

// 删除特定消费记录
async function deleteExpense(expenseId) {
    try {
        // 从数据库获取所有金额明细
        const allDetails = await DB.details.getAll();
        
        // 过滤掉要删除的记录
        const updatedDetails = allDetails.filter(detail => detail.id !== expenseId);
        
        // 保存更新后的记录
        await DB.details.saveAll(updatedDetails);
        
        // 重新加载并显示记录
        await loadAndDisplayExpenses();
        
        // 更新统计数据
        updateStats();
    } catch (error) {
        console.error('删除消费记录失败:', error);
    }
}

// 绑定表单事件
function bindFormEvents() {
    // 初始公共资金表单
    const initialFundForm = document.getElementById('initial-fund-form');
    if (initialFundForm) {
        initialFundForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            await saveInitialFund();
        });
    }
    
    // 绑定删除初始资金按钮事件
    const deleteInitialFundBtn = document.getElementById('delete-initial-fund');
    if (deleteInitialFundBtn) {
        deleteInitialFundBtn.addEventListener('click', async function() {
            if (confirm('确定要删除所有初始公共资金记录吗？这将影响所有相关统计数据。')) {
                await deleteInitialFund();
            }
        });
    }
}

// 删除初始公共资金
async function deleteInitialFund() {
    try {
        // 1. 从数据库获取所有金额明细
        const allDetails = await DB.details.getAll();
        
        // 2. 过滤掉初始公共资金记录
        const updatedDetails = allDetails.filter(detail => detail.detail !== '初始公共资金');
        
        // 3. 保存更新后的明细
        await DB.details.saveAll(updatedDetails);
        
        // 4. 重新计算公共账户余额（只保留佣金收入）
        const allRounds = await DB.rounds.getAll();
        const totalCommission = allRounds.reduce((sum, round) => sum + round.commission, 0);
        
        // 5. 更新统计数据
        await DB.stats.updateTotalCommission(totalCommission);
        
        // 6. 重新加载并显示记录
        await loadAndDisplayRounds();
        await loadAndDisplayExpenses();
        
        alert('初始公共资金记录已删除！');
    } catch (error) {
        console.error('删除初始公共资金失败:', error);
        alert('删除失败，请重试！');
    }
}

// 保存初始公共资金
async function saveInitialFund() {
    try {
        const initialFundAmount = parseInt(document.getElementById('initial-fund-amount').value);
        
        if (isNaN(initialFundAmount) || initialFundAmount < 0) {
            alert('请输入有效的初始公共资金');
            return;
        }
        
        // 更新统计数据中的累计佣金
        await DB.stats.updateTotalCommission(initialFundAmount);
        
        // 添加初始公共资金作为一笔收入记录
        const initialFundRecord = {
            id: Date.now(),
            type: 'income',
            detail: '初始公共资金',
            amount: initialFundAmount,
            time: new Date().toLocaleString('zh-CN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            }),
            timestamp: Date.now(),
            balance: initialFundAmount
        };
        
        // 加载所有金额明细
        const allDetails = await DB.details.getAll();
        
        // 添加初始资金记录
        allDetails.push(initialFundRecord);
        
        // 保存更新后的明细
        await DB.details.saveAll(allDetails);
        
        alert('初始公共资金设置成功！');
        
        // 重新加载并显示消费记录
        await loadAndDisplayExpenses();
    } catch (error) {
        console.error('保存初始公共资金失败:', error);
        alert('保存失败，请重试！');
    }
}

// 更新统计数据
async function updateStats() {
    try {
        // 重新计算累计佣金
        const allRounds = await DB.rounds.getAll();
        const totalCommission = allRounds.reduce((sum, round) => sum + round.commission, 0);
        
        // 更新统计数据
        await DB.stats.updateTotalCommission(totalCommission);
    } catch (error) {
        console.error('更新统计数据失败:', error);
    }
}

// 添加CSS样式
const style = document.createElement('style');
style.textContent = `
    .admin-section {
        background-color: #ecf0f1;
        padding: 20px;
        border-radius: 8px;
        margin-bottom: 20px;
    }
    
    .round-header,
    .expense-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 10px;
    }
    
    .delete-round-btn,
    .delete-expense-btn {
        padding: 5px 10px;
        background-color: #e74c3c;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
    }
    
    .delete-round-btn:hover,
    .delete-expense-btn:hover {
        background-color: #c0392b;
    }
`;
document.head.appendChild(style);