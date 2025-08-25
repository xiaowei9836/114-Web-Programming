#!/bin/bash

echo "🚀 简单部署 CORS 代理服务..."

# 创建部署目录
DEPLOY_DIR="cors-proxy-deploy"
rm -rf $DEPLOY_DIR
mkdir -p $DEPLOY_DIR

echo "📁 创建部署目录: $DEPLOY_DIR"

# 复制必要文件
cp cors-proxy.js $DEPLOY_DIR/
cp cors-proxy-package.json $DEPLOY_DIR/package.json

# 创建 render.yaml
cat > $DEPLOY_DIR/render.yaml << 'EOF'
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

# 创建 README
cat > $DEPLOY_DIR/README.md << 'EOF'
# CORS Proxy for Ollama

This service acts as a CORS proxy for Ollama AI service.

## Features
- CORS enabled for all origins
- Proxies requests to https://ollama-ai-travel.onrender.com
- Health check endpoint at /health
- Test endpoint at /test

## Quick Deploy
1. Upload all files to Render
2. Set environment to Node
3. Build command: npm install
4. Start command: npm start
EOF

# 创建 .gitignore
cat > $DEPLOY_DIR/.gitignore << 'EOF'
node_modules/
.env
*.log
.DS_Store
EOF

cd $DEPLOY_DIR

echo "🔧 安装依赖..."
npm install

echo ""
echo "🎯 部署步骤："
echo "=================="
echo ""
echo "1️⃣ 访问 https://render.com 并登录"
echo "2️⃣ 点击 'New +' → 'Web Service'"
echo "3️⃣ 选择 'Build and deploy from a Git repository'"
echo "4️⃣ 连接 GitHub 或手动上传文件"
echo "5️⃣ 设置服务名称: cors-proxy-ollama"
echo "6️⃣ 环境选择: Node"
echo "7️⃣ 构建命令: npm install"
echo "8️⃣ 启动命令: npm start"
echo "9️⃣ 点击 'Create Web Service'"
echo ""
echo "📁 当前目录包含所有必要文件"
echo "🌐 可以直接上传到 Render 进行部署"
echo ""
echo "⏱️ 部署完成后，服务将在几分钟内可用"
echo "🔗 服务 URL 格式: https://cors-proxy-ollama.onrender.com"
echo ""
echo "📋 部署完成后，请运行以下命令更新前端配置："
echo "   cd .. && ./update-frontend-config.sh"

echo ""
echo "✅ 部署准备完成！"
echo "📁 部署目录: $(pwd)"
echo "🌐 请按照上述步骤在 Render 上部署服务"
