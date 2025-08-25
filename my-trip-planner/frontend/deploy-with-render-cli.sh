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
    DEPLOY_DIR="render-cli-deploy"
    rm -rf $DEPLOY_DIR
    mkdir -p $DEPLOY_DIR
    
    echo "✅ 部署目录创建完成: $DEPLOY_DIR"
}

# 准备部署文件
prepare_files() {
    echo "📝 准备部署文件..."
    
    # 复制必要的文件
    cp -r ollama-cors-update/* $DEPLOY_DIR/
    
    # 创建 .renderignore
    cat > $DEPLOY_DIR/.renderignore << 'EOF'
node_modules/
*.log
.DS_Store
.env
EOF
    
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
    git commit -m "Add CORS support to Ollama service"
    
    echo "✅ Git 仓库初始化完成"
}

# 部署到 Render
deploy_to_render() {
    echo "🚀 部署到 Render..."
    
    # 检查服务是否存在
    echo "🔍 检查服务是否存在..."
    
    # 使用文本输出格式列出服务
    SERVICES_OUTPUT=$(render services --output text 2>/dev/null)
    
    if [ $? -eq 0 ] && echo "$SERVICES_OUTPUT" | grep -q "ollama-ai-travel"; then
        echo "✅ 找到现有服务: ollama-ai-travel"
        
        # 获取服务 ID（从文本输出中提取）
        SERVICE_ID=$(echo "$SERVICES_OUTPUT" | grep "ollama-ai-travel" | awk '{print $NF}')
        
        if [ -n "$SERVICE_ID" ]; then
            echo "🆔 服务 ID: $SERVICE_ID"
            
            # 重新部署服务
            echo "🔄 重新部署服务..."
            render deploys create $SERVICE_ID --wait
            
            if [ $? -eq 0 ]; then
                echo "✅ 服务重新部署成功！"
                echo "⏱️ 服务已完全启动"
            else
                echo "❌ 服务重新部署失败"
                exit 1
            fi
        else
            echo "❌ 无法获取服务 ID"
            exit 1
        fi
    else
        echo "❌ 未找到服务: ollama-ai-travel"
        echo "💡 请先在 Render 控制台创建服务，或检查服务名称"
        echo ""
        echo "🔍 当前可用的服务："
        render services --output text
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
    render services --output text | grep "ollama-ai-travel" || echo "未找到服务"
    
    echo ""
    echo "🔍 查看服务日志..."
    echo "使用以下命令查看实时日志："
    echo "   render logs [serviceID] --follow"
    
    echo ""
    echo "🌐 服务 URL: https://ollama-ai-travel.onrender.com"
    echo "⏱️ 部署完成后，测试以下端点："
    echo "   - 健康检查: /health"
    echo "   - 测试端点: /test"
    echo "   - Ollama API: /api/tags"
}

# 主函数
main() {
    echo "🎯 开始使用 Render CLI 部署..."
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
    
    # 部署到 Render
    deploy_to_render
    
    # 显示部署状态
    show_deployment_status
    
    echo ""
    echo "🎉 部署流程完成！"
    echo "📁 部署目录: $(pwd)/$DEPLOY_DIR"
    echo "🌐 请等待服务完全启动后测试功能"
}

# 运行主函数
main
