// 添加消费记录页面 - JavaScript 逻辑

// 导入数据库模块
import { DB } from './db.js';

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', async function() {
    // 加载当前公共账户余额
    await loadCurrentGold();
    
    // 直接在DOMContentLoaded事件中实现自动更新时间，确保可靠性
    // 立即设置一次当前时间
    updateCurrentTime();
    // 每秒更新一次
    setInterval(updateCurrentTime, 1000);
    
    // 绑定表单事件
    bindFormEvents();
});

// 更新当前时间到输入框
function updateCurrentTime() {
    try {
        const now = new Date();
        // 转换为YYYY-MM-DDTHH:MM格式，这是datetime-local输入框要求的格式
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        
        // 手动构建格式，确保兼容性
        const formattedTime = `${year}-${month}-${day}T${hours}:${minutes}`;
        
        // 获取时间输入框元素
        const timeInput = document.getElementById('expense-time');
        if (timeInput) {
            timeInput.value = formattedTime;
            console.log('时间已更新:', formattedTime);
        } else {
            console.error('未找到id为expense-time的元素');
        }
    } catch (error) {
        console.error('更新时间时出错:', error);
    }
}

// 加载当前公共账户余额
async function loadCurrentGold() {
    try {
        // 获取所有明细记录，计算正确的余额
        const allDetails = await loadAllDetails();
        const rounds = await DB.rounds.getAll();
        
        // 按照details.js中的逻辑计算余额
        let currentBalance = 0;
        
        // 创建所有记录的数组，包含佣金收入和消费支出
        const allRecords = [];
        
        // 添加所有金额明细
        allRecords.push(...allDetails);
        
        // 添加佣金收入记录
        rounds.forEach(round => {
            if (round.commission > 0) {
                const incomeRecord = {
                    type: 'income',
                    amount: round.commission
                };
                allRecords.push(incomeRecord);
            }
        });
        
        // 计算总收入和总支出
        let totalIncome = 0;
        let totalExpense = 0;
        
        allRecords.forEach(record => {
            if (record.type === 'income') {
                totalIncome += record.amount;
            } else if (record.type === 'expense') {
                totalExpense += record.amount;
            }
        });
        
        // 当前余额 = 总收入 - 总支出
        currentBalance = totalIncome - totalExpense;
        
        document.getElementById('current-gold-amount').textContent = currentBalance.toFixed(2);
    } catch (error) {
        console.error('加载公共账户余额失败:', error);
        document.getElementById('current-gold-amount').textContent = '0.00';
    }
}



// 绑定表单事件
function bindFormEvents() {
    const expenseForm = document.getElementById('expense-form');
    const cancelButton = document.getElementById('cancel-expense');
    
    // 表单提交事件
    expenseForm.addEventListener('submit', function(e) {
        e.preventDefault();
        saveExpense();
    });
    
    // 取消按钮事件
    cancelButton.addEventListener('click', function() {
        window.location.href = '../index.html';
    });
}

// 保存消费记录
async function saveExpense() {
    // 获取表单数据
    const detail = document.getElementById('expense-detail').value;
    const amount = parseFloat(document.getElementById('expense-amount').value);
    const time = document.getElementById('expense-time').value;
    
    // 验证金额是否大于0
    if (amount <= 0) {
        alert('请输入有效的消费金额');
        return;
    }
    
    // 获取当前公共账户余额
    let currentGold = 0;
    try {
        // 使用与loadCurrentGold相同的逻辑计算余额
        const allDetails = await loadAllDetails();
        const rounds = await DB.rounds.getAll();
        
        // 创建所有记录的数组，包含佣金收入和消费支出
        const allRecords = [];
        
        // 添加所有金额明细
        allRecords.push(...allDetails);
        
        // 添加佣金收入记录
        rounds.forEach(round => {
            if (round.commission > 0) {
                const incomeRecord = {
                    type: 'income',
                    amount: round.commission
                };
                allRecords.push(incomeRecord);
            }
        });
        
        // 计算总收入和总支出
        let totalIncome = 0;
        let totalExpense = 0;
        
        allRecords.forEach(record => {
            if (record.type === 'income') {
                totalIncome += record.amount;
            } else if (record.type === 'expense') {
                totalExpense += record.amount;
            }
        });
        
        // 当前余额 = 总收入 - 总支出
        currentGold = totalIncome - totalExpense;
    } catch (error) {
        console.error('获取公共账户余额失败:', error);
        alert('获取公共账户余额失败，请重试！');
        return;
    }
    
    // 检查余额是否足够
    if (amount > currentGold) {
        alert('公共账户余额不足，当前余额为：' + currentGold.toFixed(2) + '元');
        return;
    }
    
    // 转换时间格式
    const expenseDate = new Date(time);
    const timeString = expenseDate.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
    
    // 创建消费记录对象
    const expenseRecord = {
        id: Date.now(),
        type: 'expense',
        detail: detail,
        amount: amount,
        time: timeString,
        timestamp: expenseDate.getTime(),
        balance: currentGold - amount
    };
    
    // 加载所有金额明细
    let allDetails = await loadAllDetails();
    
    // 添加消费记录到明细
    allDetails.push(expenseRecord);
    
    // 保存明细到数据库
    await saveAllDetails(allDetails);
    
    // 提示保存成功
    alert('消费记录保存成功！公共账户余额已更新。');
    
    // 返回首页
    window.location.href = '../index.html';
}

// 加载所有金额明细
async function loadAllDetails() {
    try {
        return await DB.details.getAll();
    } catch (error) {
        console.error('加载金额明细失败:', error);
        return [];
    }
}

// 保存所有金额明细
async function saveAllDetails(details) {
    try {
        await DB.details.saveAll(details);
    } catch (error) {
        console.error('保存金额明细失败:', error);
        alert('保存消费记录失败，请重试！');
    }
}

// 添加表单样式
const style = document.createElement('style');
style.textContent = `
    .expense-form-section {
        background-color: #ecf0f1;
        padding: 20px;
        border-radius: 8px;
        margin-bottom: 20px;
    }
    
    .form-item {
        margin-bottom: 20px;
    }
    
    .form-item label {
        display: block;
        margin-bottom: 8px;
        font-weight: bold;
        color: #2c3e50;
    }
    
    .form-item input {
        width: 100%;
        padding: 12px;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 16px;
    }
    
    .current-gold-info {
        text-align: center;
        background-color: #fff3cd;
        color: #856404;
        padding: 15px;
        border-radius: 8px;
        border: 1px solid #ffeeba;
    }
    
    .current-gold-info h3 {
        margin: 0;
    }
    
    #current-gold-amount {
        font-weight: bold;
        color: #d4af37;
    }
`;
document.head.appendChild(style);