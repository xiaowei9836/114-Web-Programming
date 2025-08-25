#!/bin/bash

echo "🚀 自动部署 CORS 代理服务到 Render..."

# 检查是否安装了必要的工具
check_dependencies() {
    echo "🔍 检查依赖..."
    
    if ! command -v git &> /dev/null; then
        echo "❌ Git 未安装"
        exit 1
    fi
    
    if ! command -v node &> /dev/null; then
        echo "❌ Node.js 未安装"
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        echo "❌ npm 未安装"
        exit 1
    fi
    
    echo "✅ 所有依赖已安装"
}

# 创建临时仓库
create_temp_repo() {
    echo "📁 创建临时部署仓库..."
    
    TEMP_REPO="temp-cors-proxy-repo"
    rm -rf $TEMP_REPO
    mkdir -p $TEMP_REPO
    cd $TEMP_REPO
    
    # 初始化 Git 仓库
    git init
    git config user.name "Deploy Bot"
    git config user.email "deploy@example.com"
    
    # 复制必要文件
    cp ../cors-proxy.js ./
    cp ../cors-proxy-package.json ./package.json
    
    # 创建 render.yaml
    cat > render.yaml << 'EOF'
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
    cat > README.md << 'EOF'
# CORS Proxy for Ollama

This service acts as a CORS proxy for Ollama AI service.

## Features
- CORS enabled for all origins
- Proxies requests to https://ollama-ai-travel.onrender.com
- Health check endpoint at /health
- Test endpoint at /test

## Usage
The service automatically proxies all requests to the target Ollama service.
EOF
    
    # 创建 .gitignore
    cat > .gitignore << 'EOF'
node_modules/
.env
*.log
EOF
    
    echo "✅ 临时仓库创建完成"
}

# 安装依赖并测试
setup_and_test() {
    echo "🔧 安装依赖..."
    npm install
    
    echo "🧪 测试本地服务..."
    timeout 10s node cors-proxy.js &
    PID=$!
    sleep 3
    
    if curl -s http://localhost:10000/health > /dev/null; then
        echo "✅ 本地测试通过"
        kill $PID 2>/dev/null
    else
        echo "⚠️ 本地测试失败，但继续部署"
        kill $PID 2>/dev/null
    fi
}

# 提交到 Git
commit_to_git() {
    echo "📝 提交到 Git..."
    git add .
    git commit -m "Initial commit: CORS Proxy for Ollama"
    echo "✅ Git 提交完成"
}

# 部署说明
show_deployment_steps() {
    echo ""
    echo "🎯 部署步骤："
    echo "=================="
    echo ""
    echo "1️⃣ 访问 https://render.com 并登录"
    echo "2️⃣ 点击 'New +' → 'Web Service'"
    echo "3️⃣ 选择 'Connect a repository'"
    echo "4️⃣ 选择这个临时仓库: $TEMP_REPO"
    echo "5️⃣ 设置服务名称: cors-proxy-ollama"
    echo "6️⃣ 环境选择: Node"
    echo "7️⃣ 构建命令: npm install"
    echo "8️⃣ 启动命令: npm start"
    echo "9️⃣ 点击 'Create Web Service'"
    echo ""
    echo "⏱️ 部署完成后，服务将在几分钟内可用"
    echo "🔗 服务 URL 格式: https://cors-proxy-ollama.onrender.com"
    echo ""
    echo "📋 部署完成后，请运行以下命令更新前端配置："
    echo "   cd .. && ./update-frontend-config.sh"
}

# 主函数
main() {
    check_dependencies
    create_temp_repo
    setup_and_test
    commit_to_git
    show_deployment_steps
    
    echo ""
    echo "🎉 部署准备完成！"
    echo "📁 临时仓库位置: $(pwd)"
    echo "🌐 请按照上述步骤在 Render 上部署服务"
}

# 运行主函数
main
