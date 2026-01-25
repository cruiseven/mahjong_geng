# -*- coding: utf-8 -*-
"""
麻将记账应用服务器端
使用Flask框架和SQLite数据库
"""

from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import json
from flask_cors import CORS

# 创建Flask应用
app = Flask(__name__)

# 初始化CORS，允许所有跨域请求
CORS(app)

# 设置静态文件夹
app.static_folder = '.'
app.static_url_path = ''

# 配置SQLite数据库
import os
# 确保instance文件夹存在
os.makedirs(os.path.join(os.getcwd(), 'instance'), exist_ok=True)
# 在Render环境中，使用当前目录下的instance文件夹存储数据库文件
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(os.getcwd(), 'instance', 'mahjong.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# 创建数据库实例
db = SQLAlchemy(app)

# 游戏记录模型
class Round(db.Model):
    __tablename__ = 'rounds'
    
    roundNum = db.Column(db.Integer, primary_key=True)
    playersData = db.Column(db.Text, nullable=False)  # 存储JSON格式的玩家数据
    commission = db.Column(db.Float, nullable=False)
    rate = db.Column(db.Float, nullable=False)
    threshold = db.Column(db.Float, nullable=False, default=500)  # 抽佣门槛
    time = db.Column(db.String(50), nullable=False)
    timestamp = db.Column(db.BigInteger, nullable=False)
    
    def to_dict(self):
        return {
            'roundNum': self.roundNum,
            'playersData': json.loads(self.playersData),
            'commission': self.commission,
            'rate': self.rate,
            'threshold': self.threshold,
            'time': self.time,
            'timestamp': self.timestamp
        }

# 金额明细模型
class Detail(db.Model):
    __tablename__ = 'details'
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    type = db.Column(db.String(20), nullable=False)  # 'income' 或 'expense'
    detail = db.Column(db.String(200), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    time = db.Column(db.String(50), nullable=False)
    timestamp = db.Column(db.BigInteger, nullable=False)
    balance = db.Column(db.Float, nullable=False)
    
    def to_dict(self):
        return {
            'id': self.id,
            'type': self.type,
            'detail': self.detail,
            'amount': self.amount,
            'time': self.time,
            'timestamp': self.timestamp,
            'balance': self.balance
        }

# 设置信息模型
class Setting(db.Model):
    __tablename__ = 'settings'
    
    id = db.Column(db.Integer, primary_key=True, default=1)
    commissionRate = db.Column(db.Float, nullable=False)
    commissionThreshold = db.Column(db.Float, nullable=False)
    
    def to_dict(self):
        return {
            'commissionRate': self.commissionRate,
            'commissionThreshold': self.commissionThreshold
        }

# 统计数据模型
class Stat(db.Model):
    __tablename__ = 'stats'
    
    id = db.Column(db.Integer, primary_key=True, default=1)
    totalCommission = db.Column(db.Float, nullable=False)
    roundCount = db.Column(db.Integer, nullable=False)
    
    def to_dict(self):
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

# API路由：获取所有游戏记录
@app.route('/api/rounds', methods=['GET'])
def get_rounds():
    rounds = Round.query.all()
    return jsonify([round.to_dict() for round in rounds])

# API路由：添加游戏记录
@app.route('/api/rounds', methods=['POST'])
def add_round():
    data = request.json
    
    # 创建新的游戏记录
    new_round = Round(
        roundNum=data['roundNum'],
        playersData=json.dumps(data['playersData']),
        commission=data['commission'],
        rate=data['rate'],
        threshold=data.get('threshold', 500),  # 添加抽佣门槛，默认500
        time=data['time'],
        timestamp=data['timestamp']
    )
    
    # 更新统计数据
    stat = Stat.query.first()
    stat.totalCommission += data['commission']
    stat.roundCount += 1
    
    # 保存到数据库
    db.session.add(new_round)
    db.session.commit()
    
    return jsonify(new_round.to_dict()), 201

# API路由：保存所有游戏记录
@app.route('/api/rounds/all', methods=['POST'])
def save_all_rounds():
    rounds = request.json
    
    # 清空现有记录
    Round.query.delete()
    
    # 添加所有新记录
    for round_data in rounds:
        new_round = Round(
            roundNum=round_data['roundNum'],
            playersData=json.dumps(round_data['playersData']),
            commission=round_data['commission'],
            rate=round_data['rate'],
            threshold=round_data.get('threshold', 500),  # 添加抽佣门槛，默认500
            time=round_data['time'],
            timestamp=round_data['timestamp']
        )
        db.session.add(new_round)
    
    # 更新统计数据
    stat = Stat.query.first()
    stat.roundCount = len(rounds)
    stat.totalCommission = sum(round_data['commission'] for round_data in rounds)
    
    # 保存到数据库
    db.session.commit()
    
    return jsonify({'message': f'Saved {len(rounds)} rounds'}), 200

# API路由：获取所有金额明细
@app.route('/api/details', methods=['GET'])
def get_details():
    details = Detail.query.all()
    return jsonify([detail.to_dict() for detail in details])

# API路由：添加金额明细
@app.route('/api/details', methods=['POST'])
def add_detail():
    data = request.json
    
    # 创建新的金额明细
    new_detail = Detail(
        type=data['type'],
        detail=data['detail'],
        amount=data['amount'],
        time=data['time'],
        timestamp=data['timestamp'],
        balance=data['balance']
    )
    
    # 保存到数据库
    db.session.add(new_detail)
    db.session.commit()
    
    return jsonify(new_detail.to_dict()), 201

# API路由：保存所有金额明细
@app.route('/api/details/all', methods=['POST'])
def save_all_details():
    details = request.json
    
    # 清空现有记录
    Detail.query.delete()
    
    # 添加所有新记录
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
    
    # 保存到数据库
    db.session.commit()
    
    return jsonify({'message': f'Saved {len(details)} details'}), 200

# API路由：获取设置信息
@app.route('/api/settings', methods=['GET'])
def get_settings():
    setting = Setting.query.first()
    return jsonify(setting.to_dict())

# API路由：保存设置信息
@app.route('/api/settings', methods=['POST'])
def save_settings():
    data = request.json
    
    # 更新设置信息
    setting = Setting.query.first()
    setting.commissionRate = data['commissionRate']
    setting.commissionThreshold = data['commissionThreshold']
    
    # 保存到数据库
    db.session.commit()
    
    return jsonify(setting.to_dict()), 200

# API路由：获取统计数据
@app.route('/api/stats', methods=['GET'])
def get_stats():
    stat = Stat.query.first()
    return jsonify(stat.to_dict())

# API路由：更新统计数据
@app.route('/api/stats/total', methods=['PUT'])
def update_total_commission():
    data = request.json
    
    # 更新累计佣金
    stat = Stat.query.first()
    stat.totalCommission = data['totalCommission']
    
    # 保存到数据库
    db.session.commit()
    
    return jsonify(stat.to_dict()), 200

# API路由：导出所有数据
@app.route('/api/export', methods=['GET'])
def export_data():
    # 获取所有数据
    rounds = Round.query.all()
    details = Detail.query.all()
    setting = Setting.query.first()
    stat = Stat.query.first()
    
    # 构建导出数据
    export_data = {
        'allRounds': [round.to_dict() for round in rounds],
        'totalCommission': stat.totalCommission,
        'goldDetails': [detail.to_dict() for detail in details],
        'commissionSettings': setting.to_dict(),
        'exportTime': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    }
    
    return jsonify(export_data), 200

# API路由：清空数据库
@app.route('/api/clear', methods=['DELETE'])
def clear_db():
    # 清空所有表
    Round.query.delete()
    Detail.query.delete()
    
    # 重置设置和统计数据
    setting = Setting.query.first()
    setting.commissionRate = 20
    setting.commissionThreshold = 500
    
    stat = Stat.query.first()
    stat.totalCommission = 0
    stat.roundCount = 0
    
    # 保存到数据库
    db.session.commit()
    
    return jsonify({'message': 'Database cleared successfully'}), 200

# 首页
@app.route('/')
def index():
    return app.send_static_file('index.html')

# 健康检查端点
@app.route('/healthz')
def health_check():
    return jsonify({'status': 'ok'})

# 主函数
if __name__ == '__main__':
    # 启动服务器，监听所有地址的5000端口
    app.run(host='0.0.0.0', port=5000, debug=True)
