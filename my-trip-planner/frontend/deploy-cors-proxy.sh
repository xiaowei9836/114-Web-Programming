#!/bin/bash

echo "🚀 部署 CORS 代理服务到 Render..."

# 检查是否安装了 Render CLI
if ! command -v render &> /dev/null; then
    echo "❌ Render CLI 未安装，请先安装："
    echo "   brew install render"
    exit 1
fi

# 创建临时部署目录
TEMP_DIR="temp-cors-proxy-deploy"
mkdir -p $TEMP_DIR

# 复制必要文件
cp cors-proxy.js $TEMP_DIR/
cp cors-proxy-package.json $TEMP_DIR/package.json

# 创建 render.yaml 配置
cat > $TEMP_DIR/render.yaml << 'EOF'
services:
  - type: web
    name: cors-proxy-ollama
    env: node
    plan: free
    buildCommand: npm install
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 10000
EOF

# 进入部署目录
cd $TEMP_DIR

echo "📁 部署目录内容："
ls -la

echo "🔧 安装依赖..."
npm install

echo "🚀 部署到 Render..."
render deploy

# 清理临时目录
cd ..
rm -rf $TEMP_DIR

echo "✅ 部署完成！"
echo "📡 服务将在几分钟内可用"
echo "🔗 请检查 Render 控制台获取服务 URL"
