#!/bin/bash

echo "🚀 開啟旅行規劃器應用..."

# 檢查是否安裝了必要的工具
if ! command -v node &> /dev/null; then
    echo "❌ 錯誤: 請先安裝 Node.js"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "❌ 錯誤: 請先安裝 npm"
    exit 1
fi

# 啟動後端
echo "📡 開啟後端服務器..."
cd backend
if [ ! -d "node_modules" ]; then
    echo "📦 安裝後端依賴程式..."
    npm install
fi

# 檢查環境變量文件
if [ ! -f ".env" ]; then
    echo "⚠️  警告: 未找到 .env 文件，請複製 env.example 並配置環境變量"
    echo "   特別是 MongoDB 連接字符串和 Google Maps API Key"
fi

# 啟動後端 (後台運行)
    echo "🚀 後端服務器開啟中..."
npm run dev &
BACKEND_PID=$!

# 等待後端啟動
sleep 5

# 啟動前端
echo "🌐 開啟前端應用..."
cd ../frontend
if [ ! -d "node_modules" ]; then
    echo "📦 安裝前端依賴..."
    npm install
fi

echo "🚀 前端應用開啟中..."
npm run dev &
FRONTEND_PID=$!

echo ""
echo "✅ 應用開啟完成！"
echo "📡 後端 API: http://localhost:5001"
echo "🌐 前端應用: http://localhost:5173"
echo ""
echo "按 Ctrl+C 停止所有服務"

# 等待用戶中斷
trap "echo ''; echo '🛑 正在停止服務...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit 0" INT

# 保持腳本運行
wait
