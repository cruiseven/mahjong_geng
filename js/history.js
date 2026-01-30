// 历史记录页面 - JavaScript 逻辑

// 导入数据库模块
import { DB } from './db_local.js';

// 全局变量
let allRounds = []; // 所有局记录
let currentPage = 1; // 当前页码
const perPage = 20; // 每页显示20局
let totalPages = 1; // 总页数

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', async function() {
    // 加载所有记录
    await loadAllRounds();
    
    // 绑定分页按钮事件
    bindPaginationEvents();
    
    // 显示第一页记录
    displayCurrentPage();
});

// 加载所有记录
async function loadAllRounds() {
    try {
        // 从数据库获取所有记录
        allRounds = await DB.rounds.getAll();
        
        // 按局数倒序排列（最新的在前面）
        allRounds.sort((a, b) => b.roundNum - a.roundNum);
        
        // 计算总页数
        totalPages = Math.ceil(allRounds.length / perPage);
        if (totalPages < 1) totalPages = 1;
        
        // 更新页面信息
        updatePageInfo();
    } catch (error) {
        console.error('加载历史记录失败:', error);
    }
}

// 更新页面信息
function updatePageInfo() {
    document.getElementById('total-rounds').textContent = allRounds.length;
    document.getElementById('per-page').textContent = perPage;
    document.getElementById('current-page').textContent = currentPage;
    document.getElementById('total-pages').textContent = totalPages;
    
    // 更新跳转输入框的最大值
    const jumpInput = document.getElementById('jump-page');
    jumpInput.max = totalPages;
}

// 显示当前页记录
function displayCurrentPage() {
    const historyList = document.getElementById('history-list');
    historyList.innerHTML = '';
    
    // 如果没有记录
    if (allRounds.length === 0) {
        historyList.innerHTML = '<p class="no-records">暂无记录</p>';
        return;
    }
    
    // 显示所有记录
    allRounds.forEach((round, index) => {
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
        
        // 设置记录内容，显示完整信息
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
            
            // 添加样式，确保可见
            roundItem.style.display = 'block';
            roundItem.style.border = '1px solid #3498db';
            roundItem.style.padding = '10px';
            roundItem.style.marginBottom = '10px';
            
            historyList.appendChild(roundItem);
        } catch (error) {
            console.error(`显示第 ${index + 1} 条记录失败:`, error);
        }
    });
    
    // 更新页面信息
    updatePageInfo();
}

// 绑定分页按钮事件
function bindPaginationEvents() {
    // 首页按钮
    document.getElementById('first-page').addEventListener('click', function() {
        if (currentPage > 1) {
            currentPage = 1;
            displayCurrentPage();
        }
    });
    
    // 上一页按钮
    document.getElementById('prev-page').addEventListener('click', function() {
        if (currentPage > 1) {
            currentPage--;
            displayCurrentPage();
        }
    });
    
    // 下一页按钮
    document.getElementById('next-page').addEventListener('click', function() {
        if (currentPage < totalPages) {
            currentPage++;
            displayCurrentPage();
        }
    });
    
    // 末页按钮
    document.getElementById('last-page').addEventListener('click', function() {
        if (currentPage < totalPages) {
            currentPage = totalPages;
            displayCurrentPage();
        }
    });
    
    // 跳转到指定页码按钮
    document.getElementById('go-to-page').addEventListener('click', function() {
        const jumpPage = parseInt(document.getElementById('jump-page').value);
        if (jumpPage && jumpPage >= 1 && jumpPage <= totalPages) {
            currentPage = jumpPage;
            displayCurrentPage();
        } else {
            alert(`请输入有效的页码（1-${totalPages}）`);
        }
    });
}

// 添加无记录样式
const style = document.createElement('style');
style.textContent = `
    .no-records {
        text-align: center;
        color: #999;
        padding: 20px;
        font-style: italic;
    }
    
    .back-link-container {
        text-align: center;
        margin-bottom: 20px;
    }
    
    .back-link {
        display: inline-block;
        padding: 8px 16px;
        background-color: #3498db;
        color: white;
        text-decoration: none;
        border-radius: 4px;
        font-size: 14px;
        transition: background-color 0.3s ease;
    }
    
    .back-link:hover {
        background-color: #2980b9;
    }
    
    .pagination-info {
        text-align: center;
        margin-bottom: 20px;
        color: #666;
        font-size: 14px;
    }
    
    .history-section {
        margin-bottom: 30px;
    }
    
    .pagination-container {
        background-color: #ecf0f1;
        padding: 20px;
        border-radius: 8px;
        margin-top: 20px;
    }
    
    .pagination-controls {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 10px;
        margin-bottom: 15px;
    }
    
    .page-btn {
        padding: 8px 16px;
        border: none;
        border-radius: 4px;
        background-color: #3498db;
        color: white;
        cursor: pointer;
        transition: background-color 0.3s ease;
        font-size: 14px;
    }
    
    .page-btn:hover {
        background-color: #2980b9;
    }
    
    .page-btn:disabled {
        background-color: #bdc3c7;
        cursor: not-allowed;
    }
    
    .page-info {
        font-size: 16px;
        font-weight: bold;
        color: #2c3e50;
        min-width: 80px;
        text-align: center;
    }
    
    .page-jump {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 10px;
    }
    
    .page-jump label {
        font-size: 14px;
        color: #666;
    }
    
    .page-jump input {
        padding: 8px;
        border: 1px solid #ddd;
        border-radius: 4px;
        width: 80px;
        text-align: center;
        font-size: 14px;
    }
`;
document.head.appendChild(style);