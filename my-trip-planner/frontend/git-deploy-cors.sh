#!/bin/bash

echo "🚀 使用 Git 部署支持 CORS 的 Ollama 服务..."

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

# 创建 Git 部署目录
create_git_deploy_dir() {
    echo "📁 创建 Git 部署目录..."
    GIT_DEPLOY_DIR="git-deploy-cors"
    rm -rf $GIT_DEPLOY_DIR
    mkdir -p $GIT_DEPLOY_DIR
    
    echo "✅ Git 部署目录创建完成: $GIT_DEPLOY_DIR"
}

# 准备部署文件
prepare_deploy_files() {
    echo "📝 准备部署文件..."
    
    # 复制简化的部署文件
    cp -r simple-ollama-update/* $GIT_DEPLOY_DIR/
    
    # 创建 .gitignore
    cat > $GIT_DEPLOY_DIR/.gitignore << 'EOF'
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
    cd $GIT_DEPLOY_DIR
    
    git init
    git config user.name "Deploy Bot"
    git config user.email "deploy@example.com"
    
    git add .
    git commit -m "Add CORS support to Ollama service"
    
    echo "✅ Git 仓库初始化完成"
}

# 显示部署说明
show_deployment_steps() {
    echo ""
    echo "🎯 Git 部署步骤："
    echo "=================="
    echo ""
    echo "1️⃣ 访问 https://render.com 并登录"
    echo "2️⃣ 找到 'ollama-ai-travel' 服务"
    echo "3️⃣ 点击进入服务详情页"
    echo "4️⃣ 在 'Settings' 标签页中找到 'Build & Deploy' 部分"
    echo "5️⃣ 点击 'Connect repository' 或 'Change repository'"
    echo "6️⃣ 选择 'Connect a Git repository'"
    echo "7️⃣ 选择这个临时仓库: $GIT_DEPLOY_DIR"
    echo "8️⃣ 设置分支为 'master'"
    echo "9️⃣ 点击 'Connect' 或 'Save'"
    echo ""
    echo "📁 当前目录包含所有必要文件"
    echo "🌐 可以直接上传到 GitHub 或使用本地 Git 仓库"
    echo ""
    echo "⏱️ 连接成功后，Render 会自动重新部署"
    echo "🔗 服务 URL: https://ollama-ai-travel.onrender.com"
}

# 创建 GitHub 部署说明
create_github_instructions() {
    echo ""
    echo "🌐 GitHub 部署说明："
    echo "===================="
    echo ""
    echo "如果你想使用 GitHub 部署："
    echo "1. 在 GitHub 上创建新的仓库"
    echo "2. 将当前目录推送到 GitHub："
    echo ""
    echo "   cd $GIT_DEPLOY_DIR"
    echo "   git remote add origin https://github.com/你的用户名/仓库名.git"
    echo "   git branch -M main"
    echo "   git push -u origin main"
    echo ""
    echo "3. 在 Render 中连接这个 GitHub 仓库"
    echo ""
}

# 主函数
main() {
    echo "🎯 开始准备 Git 部署..."
    echo ""
    
    # 检查登录状态
    if ! check_login; then
        exit 1
    fi
    
    # 创建 Git 部署目录
    create_git_deploy_dir
    
    # 准备部署文件
    prepare_deploy_files
    
    # 初始化 Git 仓库
    init_git_repo
    
    # 显示部署说明
    show_deployment_steps
    
    # 创建 GitHub 部署说明
    create_github_instructions
    
    echo ""
    echo "🎉 Git 部署准备完成！"
    echo "📁 Git 仓库位置: $(pwd)"
    echo "🌐 请按照上述步骤在 Render 中连接 Git 仓库"
    echo ""
    echo "💡 提示："
    echo "- 可以使用本地 Git 仓库"
    echo "- 也可以推送到 GitHub 后连接"
    echo "- 连接成功后 Render 会自动重新部署"
}

# 运行主函数
main
