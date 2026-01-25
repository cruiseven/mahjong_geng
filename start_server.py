# -*- coding: utf-8 -*-
"""
服务器启动脚本
用于启动Flask应用服务器
"""

import os
import sys
import subprocess

# 检查是否已安装依赖
print("检查并安装依赖...")
try:
    import flask
    import flask_sqlalchemy
except ImportError:
    # 安装依赖
    print("正在安装依赖包...")
    subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])

# 启动服务器
print("启动服务器...")
print("服务器将在 http://localhost:5000 上运行")
print("按 Ctrl+C 停止服务器")
print("=" * 50)

# 运行Flask应用
os.environ["FLASK_APP"] = "app.py"
os.environ["FLASK_ENV"] = "development"

subprocess.call([sys.executable, "-m", "flask", "run", "--host=0.0.0.0", "--port=5000"])
