# -*- coding: utf-8 -*-
"""
麻将记账应用服务器端
使用Flask框架和SQLite数据库
"""

# 导入必要的模块
import os
import json
from datetime import datetime
from flask import Flask, request, jsonify, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS

# 创建Flask应用实例，使用__name__作为参数
app = Flask(__name__)

# 初始化CORS，允许所有跨域请求
CORS(app)

# 配置SQLite数据库
# 确保instance文件夹存在
os.makedirs(os.path.join(os.getcwd(), 'instance'), exist_ok=True)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(os.getcwd(), 'instance', 'mahjong.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# 初始化数据库
db = SQLAlchemy(app)

# 定义数据库模型
class Round(db.Model):
    """游戏记录模型"""
    __tablename__ = 'rounds'
    
    roundNum = db.Column(db.Integer, primary_key=True)
    playersData = db.Column(db.Text, nullable=False)
    commission = db.Column(db.Float, nullable=False)
    rate = db.Column(db.Float, nullable=False)
    threshold = db.Column(db.Float, nullable=False, default=500)
    time = db.Column(db.String(50), nullable=False)
    timestamp = db.Column(db.BigInteger, nullable=False)
    
    def to_dict(self):
        """转换为字典格式"""
        return {
            'roundNum': self.roundNum,
            'playersData': json.loads(self.playersData),
            'commission': self.commission,
            'rate': self.rate,
            'threshold': self.threshold,
            'time': self.time,
            'timestamp': self.timestamp
        }

class Detail(db.Model):
    """金额明细模型"""
    __tablename__ = 'details'
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    type = db.Column(db.String(20), nullable=False)
    detail = db.Column(db.String(200), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    time = db.Column(db.String(50), nullable=False)
    timestamp = db.Column(db.BigInteger, nullable=False)
    balance = db.Column(db.Float, nullable=False)
    
    def to_dict(self):
        """转换为字典格式"""
        return {
            'id': self.id,
            'type': self.type,
            'detail': self.detail,
            'amount': self.amount,
            'time': self.time,
            'timestamp': self.timestamp,
            'balance': self.balance
        }

class Setting(db.Model):
    """设置信息模型"""
    __tablename__ = 'settings'
    
    id = db.Column(db.Integer, primary_key=True, default=1)
    commissionRate = db.Column(db.Float, nullable=False)
    commissionThreshold = db.Column(db.Float, nullable=False)
    
    def to_dict(self):
        """转换为字典格式"""
        return {
            'commissionRate': self.commissionRate,
            'commissionThreshold': self.commissionThreshold
        }

class Stat(db.Model):
    """统计数据模型"""
    __tablename__ = 'stats'
    
    id = db.Column(db.Integer, primary_key=True, default=1)
    totalCommission = db.Column(db.Float, nullable=False)
    roundCount = db.Column(db.Integer, nullable=False)
    
    def to_dict(self):
        """转换为字典格式"""
        return {
            'totalCommission': self.totalCommission,
            'roundCount': self.roundCount
        }

# 初始化数据库
with app.app_context():
    db.create_all()
    
    # 检查是否需要创建默认设置
    setting = Setting.query.first()
    if not setting:
        setting = Setting(
            commissionRate=20,
            commissionThreshold=500
        )
        db.session.add(setting)
        db.session.commit()
    
    # 检查是否需要创建默认统计数据
    stat = Stat.query.first()
    if not stat:
        stat = Stat(
            totalCommission=0,
            roundCount=0
        )
        db.session.add(stat)
        db.session.commit()

# 首页路由
@app.route('/')
def index():
    """首页路由，返回index.html文件"""
    print("根路由被调用！")
    try:
        # 使用open函数直接读取index.html文件
        with open('index.html', 'r', encoding='utf-8') as f:
            content = f.read()
        return content, 200, {'Content-Type': 'text/html; charset=utf-8'}
    except FileNotFoundError:
        # 如果文件不存在，返回404错误
        return "<h1>404 Not Found</h1><p>index.html文件不存在</p>", 404
    except Exception as e:
        # 处理其他可能的错误
        return f"<h1>Error</h1><p>{str(e)}</p>", 500

# 测试静态文件访问
@app.route('/test-static')
def test_static():
    """测试静态文件访问"""
    try:
        with open('index.html', 'r', encoding='utf-8') as f:
            content = f.read()
        return content, 200, {'Content-Type': 'text/html; charset=utf-8'}
    except Exception as e:
        return f"Error: {str(e)}", 500

# 静态文件路由
@app.route('/css/<path:filename>')
def serve_css(filename):
    """CSS文件路由"""
    return send_from_directory('css', filename)

@app.route('/js/<path:filename>')
def serve_js(filename):
    """JS文件路由"""
    return send_from_directory('js', filename)

@app.route('/html/<path:filename>')
def serve_html(filename):
    """HTML文件路由"""
    return send_from_directory('html', filename)

# API路由

# 获取所有游戏记录
@app.route('/api/rounds', methods=['GET'])
def get_rounds():
    """获取所有游戏记录"""
    rounds = Round.query.all()
    return jsonify([round.to_dict() for round in rounds])

# 添加游戏记录
@app.route('/api/rounds', methods=['POST'])
def add_round():
    """添加游戏记录"""
    data = request.json
    
    new_round = Round(
        roundNum=data['roundNum'],
        playersData=json.dumps(data['playersData']),
        commission=data['commission'],
        rate=data['rate'],
        threshold=data.get('threshold', 500),
        time=data['time'],
        timestamp=data['timestamp']
    )
    
    stat = Stat.query.first()
    stat.totalCommission += data['commission']
    stat.roundCount += 1
    
    db.session.add(new_round)
    db.session.commit()
    
    return jsonify(new_round.to_dict()), 201

# 保存所有游戏记录
@app.route('/api/rounds/all', methods=['POST'])
def save_all_rounds():
    """保存所有游戏记录"""
    rounds = request.json
    
    Round.query.delete()
    
    for round_data in rounds:
        new_round = Round(
            roundNum=round_data['roundNum'],
            playersData=json.dumps(round_data['playersData']),
            commission=round_data['commission'],
            rate=round_data['rate'],
            threshold=round_data.get('threshold', 500),
            time=round_data['time'],
            timestamp=round_data['timestamp']
        )
        db.session.add(new_round)
    
    stat = Stat.query.first()
    stat.roundCount = len(rounds)
    stat.totalCommission = sum(round_data['commission'] for round_data in rounds)
    
    db.session.commit()
    
    return jsonify({'message': f'Saved {len(rounds)} rounds'}), 200

# 获取所有金额明细
@app.route('/api/details', methods=['GET'])
def get_details():
    """获取所有金额明细"""
    details = Detail.query.all()
    return jsonify([detail.to_dict() for detail in details])

# 添加金额明细
@app.route('/api/details', methods=['POST'])
def add_detail():
    """添加金额明细"""
    data = request.json
    
    new_detail = Detail(
        type=data['type'],
        detail=data['detail'],
        amount=data['amount'],
        time=data['time'],
        timestamp=data['timestamp'],
        balance=data['balance']
    )
    
    db.session.add(new_detail)
    db.session.commit()
    
    return jsonify(new_detail.to_dict()), 201

# 保存所有金额明细
@app.route('/api/details/all', methods=['POST'])
def save_all_details():
    """保存所有金额明细"""
    details = request.json
    
    Detail.query.delete()
    
    for detail_data in details:
        new_detail = Detail(
            type=detail_data['type'],
            detail=detail_data['detail'],
            amount=detail_data['amount'],
            time=detail_data['time'],
            timestamp=detail_data['timestamp'],
            balance=detail_data['balance']
        )
        db.session.add(new_detail)
    
    db.session.commit()
    
    return jsonify({'message': f'Saved {len(details)} details'}), 200

# 获取设置信息
@app.route('/api/settings', methods=['GET'])
def get_settings():
    """获取设置信息"""
    setting = Setting.query.first()
    return jsonify(setting.to_dict())

# 保存设置信息
@app.route('/api/settings', methods=['POST'])
def save_settings():
    """保存设置信息"""
    data = request.json
    
    setting = Setting.query.first()
    setting.commissionRate = data['commissionRate']
    setting.commissionThreshold = data['commissionThreshold']
    
    db.session.commit()
    
    return jsonify(setting.to_dict()), 200

# 获取统计数据
@app.route('/api/stats', methods=['GET'])
def get_stats():
    """获取统计数据"""
    stat = Stat.query.first()
    return jsonify(stat.to_dict())

# 更新统计数据
@app.route('/api/stats/total', methods=['PUT'])
def update_total_commission():
    """更新累计佣金"""
    data = request.json
    
    stat = Stat.query.first()
    stat.totalCommission = data['totalCommission']
    
    db.session.commit()
    
    return jsonify(stat.to_dict()), 200

# 导出所有数据
@app.route('/api/export', methods=['GET'])
def export_data():
    """导出所有数据"""
    rounds = Round.query.all()
    details = Detail.query.all()
    setting = Setting.query.first()
    stat = Stat.query.first()
    
    export_data = {
        'allRounds': [round.to_dict() for round in rounds],
        'totalCommission': stat.totalCommission,
        'goldDetails': [detail.to_dict() for detail in details],
        'commissionSettings': setting.to_dict(),
        'exportTime': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    }
    
    return jsonify(export_data), 200

# 清空数据库
@app.route('/api/clear', methods=['DELETE'])
def clear_db():
    """清空数据库"""
    Round.query.delete()
    Detail.query.delete()
    
    setting = Setting.query.first()
    setting.commissionRate = 20
    setting.commissionThreshold = 500
    
    stat = Stat.query.first()
    stat.totalCommission = 0
    stat.roundCount = 0
    
    db.session.commit()
    
    return jsonify({'message': 'Database cleared successfully'}), 200

# 健康检查端点
@app.route('/api/healthz')
def health_check():
    """健康检查端点"""
    return jsonify({'status': 'ok'})

# 主函数
if __name__ == '__main__':
    """启动服务器"""
    print("启动麻将记账应用服务器...")
    print("服务器将运行在 http://127.0.0.1:5050")
    app.run(host='0.0.0.0', port=5050, debug=True)
