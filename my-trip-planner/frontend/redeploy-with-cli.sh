#!/bin/bash

echo "🚀 使用 Render CLI 重新部署 Ollama 服务..."

# 检查是否已登录 Render
check_login() {
    echo "🔍 检查 Render 登录状态..."
    if render whoami &> /dev/null; then
        echo "✅ 已登录 Render: $(render whoami)"
        return 0
    else
        echo "❌ 未登录 Render，请先登录："
        echo "   render login"
        return 1
    fi
}

# 创建部署目录
create_deploy_dir() {
    echo "📁 创建部署目录..."
    DEPLOY_DIR="cli-redeploy"
    rm -rf $DEPLOY_DIR
    mkdir -p $DEPLOY_DIR
    
    echo "✅ 部署目录创建完成: $DEPLOY_DIR"
}

# 准备部署文件
prepare_files() {
    echo "📝 准备部署文件..."
    
    # 复制简化的文件
    cp simple-ollama-update/* $DEPLOY_DIR/
    
    echo "✅ 部署文件准备完成"
}

# 初始化 Git 仓库
init_git_repo() {
    echo "🔧 初始化 Git 仓库..."
    cd $DEPLOY_DIR
    
    git init
    git config user.name "Deploy Bot"
    git config user.email "deploy@example.com"
    
    git add .
    git commit -m "Redeploy Ollama with CORS support"
    
    echo "✅ Git 仓库初始化完成"
}

# 重新部署服务
redeploy_service() {
    echo "🚀 重新部署服务..."
    
    # 获取服务 ID
    SERVICE_ID="srv-d2lea7ripnbc7384lf20"
    echo "🆔 服务 ID: $SERVICE_ID"
    
    # 重新部署服务
    echo "🔄 开始重新部署..."
    render deploys create $SERVICE_ID --wait
    
    if [ $? -eq 0 ]; then
        echo "✅ 服务重新部署成功！"
        echo "⏱️ 服务已完全启动"
    else
        echo "❌ 服务重新部署失败"
        exit 1
    fi
}

# 显示部署状态
show_deployment_status() {
    echo ""
    echo "🎯 部署状态检查："
    echo "=================="
    echo ""
    echo "📡 检查服务状态..."
    render services --output text | grep "ollama-ai-travel"
    
    echo ""
    echo "🌐 服务 URL: https://ollama-ai-travel.onrender.com"
    echo "⏱️ 部署完成后，测试以下端点："
    echo "   - 健康检查: /health"
    echo "   - 测试端点: /test"
    echo "   - Ollama API: /api/tags"
}

# 主函数
main() {
    echo "🎯 开始使用 Render CLI 重新部署..."
    echo ""
    
    # 检查登录状态
    if ! check_login; then
        exit 1
    fi
    
    # 创建部署目录
    create_deploy_dir
    
    # 准备部署文件
    prepare_files
    
    # 初始化 Git 仓库
    init_git_repo
    
    # 重新部署服务
    redeploy_service
    
    # 显示部署状态
    show_deployment_status
    
    echo ""
    echo "🎉 重新部署完成！"
    echo "📁 部署目录: $(pwd)/$DEPLOY_DIR"
    echo "🌐 请等待服务完全启动后测试功能"
}

# 运行主函数
main
