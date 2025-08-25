#!/bin/bash

echo "🚀 快速部署 CORS 代理服务..."

# 创建临时目录
TEMP_DIR="temp-cors-deploy"
mkdir -p $TEMP_DIR

# 复制文件
cp cors-proxy.js $TEMP_DIR/
cp cors-proxy-package.json $TEMP_DIR/package.json

# 创建 render.yaml
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

cd $TEMP_DIR

echo "📁 部署文件准备完成："
ls -la

echo "🔧 安装依赖..."
npm install

echo "🚀 开始部署到 Render..."
echo "📋 请按照以下步骤操作："
echo ""
echo "1. 访问 https://render.com"
echo "2. 点击 'New +' -> 'Web Service'"
echo "3. 连接你的 GitHub 仓库或手动上传文件"
echo "4. 设置服务名称为: cors-proxy-ollama"
echo "5. 环境选择: Node"
echo "6. 构建命令: npm install"
echo "7. 启动命令: npm start"
echo "8. 点击 'Create Web Service'"
echo ""
echo "📁 当前目录包含所有必要文件，可以直接上传到 Render"
echo "🔗 部署完成后，请更新前端配置中的 CORS_PROXY_URL"

# 保持目录以便手动上传
echo ""
echo "✅ 部署文件准备完成！"
echo "📁 文件位置: $TEMP_DIR"
echo "🌐 请手动上传到 Render 或使用 Render CLI 部署"
