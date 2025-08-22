#!/bin/bash

echo "🚀 使用 PM2 启动旅行规划器应用..."

# 检查是否安装了 PM2
if ! command -v pm2 &> /dev/null; then
    echo "📦 安装 PM2..."
    npm install -g pm2
fi

# 检查是否安装了必要的工具
if ! command -v node &> /dev/null; then
    echo "❌ 错误: 请先安装 Node.js"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "❌ 错误: 请先安装 npm"
    exit 1
fi

# 安装依赖
echo "📦 安装后端依赖..."
cd backend
if [ ! -d "node_modules" ]; then
    npm install
fi
cd ..

echo "📦 安装前端依赖..."
cd frontend
if [ ! -d "node_modules" ]; then
    npm install
fi
cd ..

# 检查环境变量文件
if [ ! -f "backend/.env" ]; then
    echo "⚠️  警告: 未找到 .env 文件，请复制 env.example 并配置环境变量"
    echo "   特别是 MongoDB 连接字符串和 Google Maps API Key"
fi

# 使用 PM2 启动应用
echo "🚀 使用 PM2 启动应用..."
pm2 start ecosystem.config.js

echo ""
echo "✅ 应用启动完成！"
echo "📡 后端 API: http://localhost:5001"
echo "🌐 前端应用: http://localhost:5173"
echo ""
echo "📋 PM2 管理命令:"
echo "  pm2 list                    # 查看所有进程"
echo "  pm2 logs                    # 查看日志"
echo "  pm2 restart all             # 重启所有应用"
echo "  pm2 stop all                # 停止所有应用"
echo "  pm2 delete all              # 删除所有应用"
echo ""
echo "💡 现在你可以关闭终端，应用会继续在后台运行！"
