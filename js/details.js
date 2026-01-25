// 金额明细页面 - JavaScript 逻辑

// 导入数据库模块
import { DB } from './db.js';

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', async function() {
    // 加载并显示所有明细记录
    await loadAndDisplayDetails();
});

// 加载并显示所有明细记录
async function loadAndDisplayDetails() {
    // 加载所有记录
    const allDetails = await getAllDetails();
    
    // 按时间倒序排列（最新的在前面）
    allDetails.sort((a, b) => b.timestamp - a.timestamp);
    
    // 计算统计信息
    const stats = calculateStats(allDetails);
    
    // 更新统计信息显示
    updateStatsDisplay(stats);
    
    // 显示明细记录
    displayDetails(allDetails);
}

// 获取所有明细记录（包括初始公共资金、佣金收入和消费支出）
async function getAllDetails() {
    const allDetails = [];
    
    try {
        // 1. 加载统计数据，获取当前余额作为初始值
        const stats = await DB.stats.get();
        let currentBalance = stats.totalCommission;
        
        // 2. 加载所有金额明细（包括初始公共资金和消费支出）
        const dbDetails = await DB.details.getAll();
        
        // 3. 加载佣金收入记录
        const rounds = await DB.rounds.getAll();
        
        // 先添加所有金额明细
        allDetails.push(...dbDetails);
        
        // 再添加佣金收入记录
        rounds.forEach(round => {
            // 只处理有佣金收入的记录
            if (round.commission > 0) {
                const incomeRecord = {
                    id: 'round-' + round.roundNum,
                    type: 'income',
                    detail: `第${round.roundNum}局佣金收入`,
                    amount: round.commission,
                    time: round.time,
                    timestamp: round.timestamp
                };
                
                allDetails.push(incomeRecord);
            }
        });
        
        // 按时间顺序排序
        allDetails.sort((a, b) => a.timestamp - b.timestamp);
        
        // 重新计算每笔记录后的余额
        currentBalance = 0;
        allDetails.forEach(detail => {
            if (detail.type === 'income') {
                currentBalance += detail.amount;
            } else if (detail.type === 'expense') {
                currentBalance -= detail.amount;
            }
            detail.balance = currentBalance;
        });
    } catch (error) {
        console.error('获取明细记录失败:', error);
    }
    
    return allDetails;
}

// 计算统计信息
function calculateStats(details) {
    let totalIncome = 0;
    let totalExpense = 0;
    
    details.forEach(detail => {
        if (detail.type === 'income') {
            totalIncome += detail.amount;
        } else if (detail.type === 'expense') {
            totalExpense += detail.amount;
        }
    });
    
    // 当前余额 = 总收入 - 总支出
    const currentBalance = totalIncome - totalExpense;
    
    return {
        totalIncome: totalIncome,
        totalExpense: totalExpense,
        currentBalance: currentBalance
    };
}

// 更新统计信息显示
    function updateStatsDisplay(stats) {
        document.getElementById('total-income').textContent = Math.round(stats.totalIncome);
        document.getElementById('total-expense').textContent = Math.round(stats.totalExpense);
        document.getElementById('current-balance').textContent = Math.round(stats.currentBalance);
    }

// 显示明细记录
function displayDetails(details) {
    const detailsList = document.getElementById('details-list');
    detailsList.innerHTML = '';
    
    // 如果没有记录
    if (details.length === 0) {
        detailsList.innerHTML = '<p class="no-records">暂无明细记录</p>';
        return;
    }
    
    // 显示所有记录
    details.forEach(detail => {
        const detailItem = document.createElement('div');
        detailItem.className = `detail-item ${detail.type}`;
        
        // 构建记录内容
        const amountDisplay = detail.type === 'income' ? `+${Math.round(detail.amount)}` : `-${Math.round(detail.amount)}`;
        const typeDisplay = detail.type === 'income' ? '收入' : '支出';
        
        detailItem.innerHTML = `
            <div class="detail-header">
                <span class="detail-type">${typeDisplay}</span>
                <span class="detail-amount ${detail.type}">${amountDisplay}</span>
            </div>
            <div class="detail-content">
                <p class="detail-detail">${detail.detail}</p>
                <div class="detail-footer">
                    <span class="detail-time">${detail.time}</span>
                    <span class="detail-balance">余额: ¥${Math.round(detail.balance)}</span>
                </div>
            </div>
        `;
        
        detailsList.appendChild(detailItem);
    });
}

// 确保样式能正确加载，使用更直接的方式添加样式
// 1. 先移除可能存在的旧样式
const existingStyle = document.getElementById('details-page-style');
if (existingStyle) {
    existingStyle.remove();
}

// 2. 创建新的样式元素
const style = document.createElement('style');
style.id = 'details-page-style';

// 3. 使用更精确的选择器，确保样式能正确应用
style.textContent = `
    /* 确保样式能覆盖全局样式 */
    #details-stats .stat-item .stat-value.income {
        color: #27ae60 !important;
        font-weight: bold;
        font-size: 1.5em;
    }
    
    #details-stats .stat-item .stat-value.expense {
        color: #e74c3c !important;
        font-weight: bold;
        font-size: 1.5em;
    }
    
    #details-stats .stat-item .stat-value.balance {
        color: #f39c12 !important;
        font-weight: bold;
        font-size: 1.5em;
    }
    
    /* 明细列表中的颜色样式 */
    #details-list .detail-item .detail-header .detail-amount.income {
        color: #27ae60 !important;
        font-weight: bold;
        font-size: 1.2em;
    }
    
    #details-list .detail-item .detail-header .detail-amount.expense {
        color: #e74c3c !important;
        font-weight: bold;
        font-size: 1.2em;
    }
    
    /* 确保统计项整体样式正确 */
    #details-stats {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
        gap: 15px;
        margin: 20px 0;
    }
    
    #details-stats .stat-item {
        background-color: #ecf0f1;
        padding: 15px;
        border-radius: 8px;
        text-align: center;
    }
    
    #details-stats .stat-item .stat-label {
        display: block;
        font-size: 0.9em;
        color: #666;
        margin-bottom: 5px;
    }
    
    /* 明细项样式 */
    #details-list .detail-item {
        background-color: #fff;
        border-radius: 8px;
        padding: 15px;
        margin-bottom: 15px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        border-left: 4px solid;
    }
    
    #details-list .detail-item.income {
        border-left-color: #27ae60;
    }
    
    #details-list .detail-item.expense {
        border-left-color: #e74c3c;
    }
    
    /* 其他样式 */
    .details-section {
        margin-top: 20px;
    }
    
    .detail-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 10px;
    }
    
    .detail-type {
        font-weight: bold;
        font-size: 0.9em;
        padding: 3px 8px;
        border-radius: 4px;
        color: white;
    }
    
    .detail-type.income {
        background-color: #27ae60;
    }
    
    .detail-type.expense {
        background-color: #e74c3c;
    }
    
    .detail-content {
        font-size: 0.9em;
    }
    
    .detail-detail {
        margin: 0 0 10px 0;
        color: #333;
    }
    
    .detail-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        color: #999;
        font-size: 0.85em;
    }
    
    .no-records {
        text-align: center;
        color: #999;
        padding: 40px 0;
        font-style: italic;
    }
`;

// 4. 添加到head标签的最前面，确保样式优先级
const firstStyle = document.head.querySelector('style, link[rel="stylesheet"]');
if (firstStyle) {
    document.head.insertBefore(style, firstStyle);
} else {
    document.head.appendChild(style);
}