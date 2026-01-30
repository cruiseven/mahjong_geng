// 管理员面板 - JavaScript 逻辑

// 导入数据库模块
import { DB } from './db_local.js';

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', async function() {
    // 加载并显示局数记录
    await loadAndDisplayRoundsDetail();
    
    // 加载并显示消费记录
    await loadAndDisplayExpenses();
    
    // 计算并显示历史输赢统计
    await calculateHistoricalStats();
    
    // 计算并显示公共资金支持度
    await calculateSupportStats();
    
    // 绑定表单事件
    bindFormEvents();
});



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
        
        // 只显示近期3条数据
        const recentExpenses = sortedExpenses.slice(0, 3);
        
        // 显示消费记录列表
        recentExpenses.forEach(expense => {
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
        
        // 添加查看更多按钮（如果有更多记录）
        if (sortedExpenses.length > 3) {
            const viewMoreBtn = document.createElement('button');
            viewMoreBtn.className = 'view-more-btn';
            viewMoreBtn.textContent = '查看更多';
            viewMoreBtn.addEventListener('click', () => {
                // 跳转到查看更多页面
                window.location.href = 'expenses.html';
            });
            expensesManagement.appendChild(viewMoreBtn);
        }
        
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
        // 先移除旧的事件监听器，避免重复绑定
        button.replaceWith(button.cloneNode(true));
    });
    
    // 重新绑定事件监听器
    const newDeleteButtons = document.querySelectorAll('.delete-round-btn');
    newDeleteButtons.forEach(button => {
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
        
        // 重新加载并显示局数记录详情
        await loadAndDisplayRoundsDetail();
        
        // 更新统计数据
        updateStats();
        
        // 重新计算并显示历史输赢统计
        await calculateHistoricalStats();
        
        // 重新计算并显示公共资金支持度
        await calculateSupportStats();
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
        
        // 重新加载并显示消费记录
        await loadAndDisplayExpenses();
        
        // 更新统计数据
        updateStats();
        
        // 重新计算并显示历史输赢统计
        await calculateHistoricalStats();
        
        // 重新计算并显示公共资金支持度
        await calculateSupportStats();
    } catch (error) {
        console.error('删除消费记录失败:', error);
    }
}

// 加载并显示局数记录详情
async function loadAndDisplayRoundsDetail() {
    try {
        // 从数据库获取所有记录
        const allRounds = await DB.rounds.getAll();
        
        // 按时间倒序排列（最近的先显示）
        const sortedRounds = allRounds.sort((a, b) => {
            // 尝试将时间转换为时间戳进行比较
            const timeA = a.time ? new Date(a.time).getTime() : 0;
            const timeB = b.time ? new Date(b.time).getTime() : 0;
            return timeB - timeA;
        });
        
        const roundsManagementDetail = document.getElementById('rounds-management-detail');
        roundsManagementDetail.innerHTML = '';
        
        if (sortedRounds.length === 0) {
            roundsManagementDetail.innerHTML = '<p class="no-records">暂无局数记录</p>';
            return;
        }
        
        // 只显示最近3个记录
        const recentRounds = sortedRounds.slice(0, 3);
        
        // 显示局数记录，按时间倒序排列
        recentRounds.forEach(round => {
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

            roundsManagementDetail.appendChild(roundItem);
        });
        
        // 添加查看更多按钮（如果有更多记录）
        if (sortedRounds.length > 3) {
            const viewMoreBtn = document.createElement('button');
            viewMoreBtn.className = 'view-more-btn';
            viewMoreBtn.textContent = '查看更多';
            viewMoreBtn.addEventListener('click', () => {
                // 跳转到查看更多页面
                window.location.href = 'rounds.html';
            });
            roundsManagementDetail.appendChild(viewMoreBtn);
        }
        
        // 绑定删除按钮事件
        bindDeleteRoundEvents();
    } catch (error) {
        console.error('加载局数记录详情失败:', error);
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
    
    // 绑定数据库操作按钮事件
    bindDBOperationEvents();
}

// 绑定数据库操作事件
function bindDBOperationEvents() {
    // 保存数据库按钮事件
    const saveDatabaseBtn = document.getElementById('save-database');
    if (saveDatabaseBtn) {
        saveDatabaseBtn.addEventListener('click', async function() {
            await saveDatabase();
        });
    }
    
    // 导入数据库按钮事件
    const importDatabaseBtn = document.getElementById('import-database');
    if (importDatabaseBtn) {
        importDatabaseBtn.addEventListener('click', function() {
            // 先显示确认对话框
            if (confirm('确定要导入数据库吗？这将覆盖现有数据。')) {
                // 每次点击时创建新的文件输入框，避免浏览器保留状态
                const input = document.getElementById('import-database-input');
                const newInput = input.cloneNode(true);
                input.replaceWith(newInput);
                newInput.click();
                
                // 绑定新的change事件
                newInput.addEventListener('change', async function(e) {
                    const file = e.target.files[0];
                    if (file) {
                        await importDatabase(file);
                        // 导入完成后清空文件输入框
                        newInput.value = '';
                    }
                });
            }
        });
    }
}

// 保存数据库
async function saveDatabase() {
    try {
        // 调用API导出数据库数据
        const dbData = await DB.export();
        
        // 创建JSON字符串
        const jsonStr = JSON.stringify(dbData, null, 2);
        
        // 创建Blob对象
        const blob = new Blob([jsonStr], { type: 'application/json' });
        
        // 创建下载链接
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `mahjong-db-${new Date().toISOString().slice(0, 10)}.json`;
        
        // 触发下载
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        // 释放URL对象
        URL.revokeObjectURL(url);
        
        alert('数据库保存成功！');
    } catch (error) {
        console.error('保存数据库失败:', error);
        alert('保存数据库失败，请重试！');
    }
}

// 导入数据库
async function importDatabase(file) {
    try {
        // 读取文件内容
        const reader = new FileReader();
        reader.onload = async function(e) {
            try {
                const dbData = JSON.parse(e.target.result);
                
                // 检查数据格式
                if (!dbData) {
                    throw new Error('无效的数据库文件格式');
                }
                
                // 文件读取完成后再次确认，确保用户真的想要覆盖现有数据
                if (!confirm('确定要导入此数据库文件吗？这将覆盖现有数据，且操作不可撤销！')) {
                    return;
                }
                
                // 清空现有数据
                await DB.clear();
                
                let importedCount = 0;
                
                // 保存导入的数据 - 使用循环调用save方法，确保兼容性
                // 处理不同的数据格式：allRounds（导出格式）和rounds（预期格式）
                const roundsData = dbData.rounds || dbData.allRounds || [];
                if (Array.isArray(roundsData) && roundsData.length > 0) {
                    console.log(`开始导入游戏记录，共${roundsData.length}条`);
                    for (const round of roundsData) {
                        await DB.rounds.save(round);
                        importedCount++;
                    }
                }
                
                // 处理不同的数据格式：details（预期格式）、allDetails（可能的导出格式）和goldDetails（导出格式）
                const detailsData = dbData.details || dbData.allDetails || dbData.goldDetails || [];
                if (Array.isArray(detailsData) && detailsData.length > 0) {
                    console.log(`开始导入金额明细，共${detailsData.length}条`);
                    for (const detail of detailsData) {
                        await DB.details.save(detail);
                        importedCount++;
                    }
                }
                
                // 处理不同的数据格式：settings（预期格式）和commissionSettings（导出格式）
                if (dbData.settings || dbData.commissionSettings) {
                    console.log('开始导入设置信息');
                    const settingsData = dbData.settings || dbData.commissionSettings;
                    await DB.settings.save(settingsData);
                    importedCount++;
                }
                
                // 处理不同的数据格式：stats（预期格式）和totalCommission（导出格式）
                if (dbData.stats || dbData.totalCommission !== undefined) {
                    console.log('开始导入统计数据');
                    if (dbData.stats) {
                        await DB.stats.save(dbData.stats);
                    } else {
                        // 如果只有totalCommission，创建stats对象
                        await DB.stats.save({ totalCommission: dbData.totalCommission });
                    }
                    importedCount++;
                }
                
                console.log(`数据库导入完成，共导入${importedCount}条数据`);
                
                // 重新加载页面数据
                location.reload();
                
                alert(`数据库导入成功！共导入${importedCount}条数据`);
            } catch (error) {
                console.error('导入数据库失败:', error);
                console.error('错误位置:', error.stack);
                console.error('导入的数据:', JSON.stringify(dbData, null, 2));
                alert('导入数据库失败，请检查文件格式！\n' + error.message);
            }
        };
        
        reader.readAsText(file);
    } catch (error) {
        console.error('导入数据库失败:', error);
        console.error('错误位置:', error.stack);
        alert('导入数据库失败，请重试！\n' + error.message);
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
        
        // 重新加载并显示记录
        await loadAndDisplayRoundsDetail();
        await loadAndDisplayExpenses();
        
        // 重新计算并显示历史输赢统计
        await calculateHistoricalStats();
        
        // 重新计算并显示公共资金支持度
        await calculateSupportStats();
        
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
        
        // 重新计算并显示历史输赢统计
        await calculateHistoricalStats();
        
        // 重新计算并显示公共资金支持度
        await calculateSupportStats();
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

// 计算并显示历史输赢统计
async function calculateHistoricalStats() {
    try {
        // 获取所有游戏记录
        const allRounds = await DB.rounds.getAll();
        
        // 固定玩家姓名列表
        const playerNames = ['刘', '蔡', '范', '耿', '陈', '陆'];
        
        // 初始化玩家统计对象
        const playerStats = {};
        playerNames.forEach(name => {
            playerStats[name] = 0;
        });
        
        // 遍历所有记录，统计每个玩家的累计输赢
        allRounds.forEach(round => {
            if (round.playersData && Array.isArray(round.playersData)) {
                round.playersData.forEach(player => {
                    if (player.name && playerStats.hasOwnProperty(player.name)) {
                        playerStats[player.name] += player.score;
                    }
                });
            }
        });
        
        // 获取显示容器
        const historicalStatsContainer = document.getElementById('historical-stats');
        
        // 构建HTML内容 - 参考公共资金支持度样式
        let html = '<div class="support-stats-grid">';
        playerNames.forEach(name => {
            const totalScore = playerStats[name];
            const displayScore = Math.round(Math.abs(totalScore));
            const status = totalScore > 0 ? '赢' : totalScore < 0 ? '输' : '平';
            const amountClass = totalScore > 0 ? 'win-amount' : totalScore < 0 ? 'lose-amount' : '';
            
            html += `
                <div class="support-stat-item">
                    <div class="player-name">${name}:</div>
                    <div class="player-status">${status}</div>
                    <div class="player-score ${amountClass}">${displayScore}元</div>
                </div>
            `;
        });
        html += '</div>';
        
        historicalStatsContainer.innerHTML = html;
    } catch (error) {
        console.error('计算历史输赢统计失败:', error);
    }
}

// 计算并显示公共资金支持度
async function calculateSupportStats() {
    try {
        // 获取所有游戏记录
        const allRounds = await DB.rounds.getAll();
        
        // 固定玩家姓名列表
        const playerNames = ['刘', '蔡', '范', '耿', '陈', '陆'];
        
        // 初始化玩家支持度对象
        const supportStats = {};
        playerNames.forEach(name => {
            supportStats[name] = 0;
        });
        
        // 遍历所有记录，计算每个玩家对公共资金的贡献
        allRounds.forEach(round => {
            if (round.playersData && Array.isArray(round.playersData)) {
                round.playersData.forEach(player => {
                    if (player.name && supportStats.hasOwnProperty(player.name) && player.score > 0) {
                        // 只有当玩家赢钱且超过当时的抽佣门槛时，才计算贡献
                        const threshold = round.threshold || 500;
                        const rate = round.rate || 20;
                        if (player.score > threshold) {
                            const contribution = player.score * (rate / 100);
                            supportStats[player.name] += contribution;
                        }
                    }
                });
            }
        });
        
        // 计算总贡献
        const totalSupport = Object.values(supportStats).reduce((sum, value) => sum + value, 0);
        
        // 获取显示容器
        const supportStatsContainer = document.getElementById('support-stats');
        
        // 构建HTML内容
        let html = '<div class="support-stats-grid">';
        playerNames.forEach(name => {
            const contribution = supportStats[name];
            const displayContribution = Math.round(contribution);
            const percentage = totalSupport > 0 ? ((contribution / totalSupport) * 100).toFixed(1) : '0.0';
            
            html += `
                <div class="support-stat-item">
                    <div class="player-name">${name}:</div>
                    <div class="player-contribution">贡献 ${displayContribution}元</div>
                    <div class="player-percentage">占比 ${percentage}%</div>
                </div>
            `;
        });
        html += '</div>';
        
        // 添加总贡献显示
        html += `<div class="total-support">
                    <strong>总贡献：${Math.round(totalSupport)}元</strong>
                </div>`;
        
        supportStatsContainer.innerHTML = html;
    } catch (error) {
        console.error('计算公共资金支持度失败:', error);
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
    
    .stats-section {
        background-color: #ffffff;
        padding: 15px;
        border-radius: 8px;
        margin-bottom: 20px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        overflow: hidden;
    }
    
    /* 历史输赢统计容器和公共资金支持度容器 - 管理员页面专用 */
    #historical-stats, #support-stats {
        width: 100% !important;
        overflow: hidden !important;
        display: block !important;
        grid-template-columns: none !important;
        gap: 0 !important;
        padding: 0 !important;
        margin: 0 !important;
        box-sizing: border-box !important;
    }
    
    /* 确保统计区域充分利用空间 */
    #historical-stats > *, #support-stats > * {
        width: 100% !important;
    }
    
    /* 管理员页面专用支持度网格样式 - 强制覆盖所有其他样式 */
    #historical-stats .support-stats-grid, #support-stats .support-stats-grid {
        width: calc(100% - 20px) !important;
        display: grid !important;
        grid-template-columns: repeat(3, 1fr) !important;
        grid-template-rows: repeat(2, 1fr) !important;
        gap: 15px !important;
        margin: 15px auto 0 auto !important;
        padding: 0 !important;
        box-sizing: border-box !important;
    }
    
    /* 管理员页面总贡献显示样式 */
    #support-stats .total-support {
        width: calc(100% - 20px) !important;
        margin: 20px auto 0 auto !important;
        padding: 15px !important;
        background-color: #d4edda !important;
        border-radius: 6px !important;
        text-align: center !important;
        font-size: 1.2em !important;
        box-sizing: border-box !important;
    }
    
    /* 管理员页面专用响应式设计 - 覆盖style.css中的媒体查询 */
    @media (max-width: 768px) {
        /* 确保容器有足够的内边距 */
        .container {
            padding: 15px !important;
        }
        
        /* 管理员页面专用支持度网格响应式 */
        #historical-stats .support-stats-grid, #support-stats .support-stats-grid {
            width: calc(100% - 30px) !important;
            grid-template-columns: repeat(2, 1fr) !important;
            grid-template-rows: repeat(3, 1fr) !important;
            gap: 10px !important;
            margin: 15px auto 0 auto !important;
        }
        
        /* 管理员页面总贡献显示响应式 */
        #support-stats .total-support {
            width: calc(100% - 30px) !important;
        }
    }
    
    /* 公共资金支持度项样式 */
    .support-stat-item {
        padding: 20px;
        border-radius: 8px;
        border: 2px solid transparent;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        text-align: center;
        transition: all 0.3s ease;
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
    
    /* 简化版历史输赢统计样式 - 无留白设计 */
    .historical-stats-simple {
        margin-top: 15px;
        width: 100%;
    }
    
    /* 统计摘要样式 */
    .simple-summary {
        background-color: #f8f9fa;
        padding: 15px;
        border-radius: 8px;
        margin-bottom: 15px;
        width: 100%;
        display: flex;
        justify-content: space-around;
        flex-wrap: wrap;
        gap: 20px;
    }
    
    .summary-row {
        display: flex;
        flex-direction: column;
        align-items: center;
        margin-bottom: 0;
        font-size: 1.1em;
    }
    
    .summary-label {
        font-weight: bold;
        color: #333;
        margin-bottom: 5px;
    }
    
    /* 玩家列表样式 - 简化版 */
    .simple-player-list {
        display: flex;
        flex-direction: column;
        gap: 5px;
        width: 100%;
    }
    
    /* 每个玩家一行 - 无留白设计 */
    .simple-player-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 15px;
        font-size: 1.3em; /* 字体稍微大一点 */
        background-color: #f8f9fa;
        border-radius: 6px;
        width: 100%;
    }
    
    /* 玩家姓名样式 */
    .player-name-simple {
        font-weight: bold;
        color: #333;
        min-width: 60px;
    }
    
    /* 玩家金额样式 - 简化版 */
    .player-amount-simple {
        font-weight: bold;
    }
    
    /* 赢输颜色样式 */
    .win-amount {
        color: #e74c3c; /* 赢 - 红色 */
        font-weight: bold;
    }
    
    .lose-amount {
        color: #27ae60; /* 输 - 绿色 */
        font-weight: bold;
    }
    
    /* 为每个玩家设置不同颜色，与首页保持一致 */
    .historical-stat-item:nth-child(1),
    .support-stat-item:nth-child(1) {
        background-color: #ffebee;
        border-color: #ef5350;
    }
    
    .historical-stat-item:nth-child(2),
    .support-stat-item:nth-child(2) {
        background-color: #e8f5e8;
        border-color: #4caf50;
    }
    
    .historical-stat-item:nth-child(3),
    .support-stat-item:nth-child(3) {
        background-color: #e3f2fd;
        border-color: #2196f3;
    }
    
    .historical-stat-item:nth-child(4),
    .support-stat-item:nth-child(4) {
        background-color: #fff3e0;
        border-color: #ff9800;
    }
    
    .historical-stat-item:nth-child(5),
    .support-stat-item:nth-child(5) {
        background-color: #f3e5f5;
        border-color: #9c27b0;
    }
    
    .historical-stat-item:nth-child(6),
    .support-stat-item:nth-child(6) {
        background-color: #e0f7fa;
        border-color: #00bcd4;
    }
    
    /* 玩家标题颜色 */
    .historical-stat-item:nth-child(1) .player-name,
    .support-stat-item:nth-child(1) .player-name {
        color: #c62828;
    }
    
    .historical-stat-item:nth-child(2) .player-name,
    .support-stat-item:nth-child(2) .player-name {
        color: #2e7d32;
    }
    
    .historical-stat-item:nth-child(3) .player-name,
    .support-stat-item:nth-child(3) .player-name {
        color: #1565c0;
    }
    
    .historical-stat-item:nth-child(4) .player-name,
    .support-stat-item:nth-child(4) .player-name {
        color: #ef6c00;
    }
    
    .historical-stat-item:nth-child(5) .player-name,
    .support-stat-item:nth-child(5) .player-name {
        color: #7b1fa2;
    }
    
    .historical-stat-item:nth-child(6) .player-name,
    .support-stat-item:nth-child(6) .player-name {
        color: #00838f;
    }
    
    /* 统一玩家标题样式 */
    .player-name {
        font-weight: bold;
        font-size: 1.2em;
        margin-bottom: 10px;
        display: block;
    }
    
    /* 历史输赢统计特有样式 */
    .historical-stat-item .player-status {
        font-size: 1em;
        margin: 8px 0;
    }
    
    .historical-stat-item .player-score {
        font-size: 1.8em;
        font-weight: bold;
        margin: 5px 0;
    }
    
    /* 公共资金支持度特有样式 */
    .player-contribution {
        margin: 10px 0;
        font-size: 1em;
    }
    
    .player-percentage {
        font-size: 1.2em;
        color: #666;
        margin-top: 10px;
    }
    
    .total-support {
        margin-top: 20px;
        padding: 15px;
        background-color: #d4edda;
        border-radius: 6px;
        text-align: center;
        font-size: 1.2em;
    }
    
    /* 赢输颜色样式 */
    .win-amount {
        color: #e74c3c;
        font-weight: bold;
    }
    
    .lose-amount {
        color: #27ae60;
        font-weight: bold;
    }
    
    /* 初始公共资金设置样式 */
    #initial-fund-form {
        display: flex;
        flex-direction: column;
        gap: 15px;
    }
    
    /* 使用.form-row类的样式，确保布局一致 */
    #initial-fund-form .form-row {
        margin-bottom: 10px;
    }
    
    /* 调整按钮区域的位置，使其与输入框左边缘对齐 */
    #initial-fund-form .buttons-section {
        margin-left: 222px; /* 210px (label width) + 12px (gap) */
    }
    
    /* 响应式调整 */
    @media (max-width: 768px) {
        /* 初始公共资金设置响应式 */
        #initial-fund-form .form-row {
            flex-direction: column;
            align-items: flex-start;
        }
        
        #initial-fund-form .form-row label {
            text-align: left;
            margin-bottom: 5px;
            width: 100%;
        }
        
        #initial-fund-form .buttons-section {
            margin-left: 0 !important;
            width: 100%;
        }
    }
    
    /* 初始公共资金设置按钮样式 */
    #save-initial-fund, #delete-initial-fund {
        padding: 12px 20px;
        border: none;
        border-radius: 4px;
        font-size: 16px;
        font-weight: bold;
        cursor: pointer;
        transition: all 0.3s ease;
        min-width: 120px;
        white-space: nowrap;
    }
    
    #save-initial-fund {
        background-color: #27ae60;
        color: white;
    }
    
    #save-initial-fund:hover {
        background-color: #229954;
    }
    
    #delete-initial-fund {
        background-color: #e74c3c;
        color: white;
    }
    
    #delete-initial-fund:hover {
        background-color: #c0392b;
    }
    
    /* 查看更多按钮样式 */
    .view-more-btn {
        display: block;
        margin: 20px auto;
        padding: 10px 20px;
        background-color: #3498db;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 16px;
        font-weight: bold;
        transition: background-color 0.3s ease;
    }
    
    .view-more-btn:hover {
        background-color: #2980b9;
    }
`;
document.head.appendChild(style);