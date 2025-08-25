#!/bin/bash

echo "🚀 部署 CORS 代理到 Render..."

# 檢查是否已安裝 Render CLI
if ! command -v render &> /dev/null; then
    echo "❌ Render CLI 未安裝，請先安裝："
    echo "   brew install render"
    echo "   或者訪問 https://render.com/docs/cli"
    exit 1
fi

# 檢查是否已登入 Render
if ! render whoami &> /dev/null; then
    echo "❌ 未登入 Render，請先登入："
    echo "   render login"
    exit 1
fi

echo "✅ 已登入 Render"

# 創建 Render 服務
echo "📡 創建 CORS 代理服務..."
render service create --name cors-proxy-ollama --type web --env node --plan free --build-command "npm install" --start-command "node cors-proxy.js" --auto-deploy

if [ $? -eq 0 ]; then
    echo "✅ CORS 代理服務創建成功！"
    echo "🌐 服務將在幾分鐘內部署完成"
    echo "📋 請訪問 Render 儀表板查看部署狀態"
else
    echo "❌ 服務創建失敗"
    exit 1
fi

echo ""
echo "🎯 部署完成後，請更新前端配置中的 CORS_PROXY_URL"
echo "   從 'https://cors-anywhere.herokuapp.com/'"
echo "   改為 'https://cors-proxy-ollama.onrender.com/'"
