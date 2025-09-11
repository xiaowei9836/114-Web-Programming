#!/bin/bash

echo "🚀 将 CORS 修复代码推送到现有 GitHub 仓库..."

# 检查当前 Git 状态
check_git_status() {
    echo "🔍 检查当前 Git 状态..."
    
    if [ -d ".git" ]; then
        echo "✅ 当前目录是 Git 仓库"
        echo "🌐 远程仓库:"
        git remote -v
        
        # 检查是否有未提交的更改
        if [ -n "$(git status --porcelain)" ]; then
            echo "⚠️  有未提交的更改，需要先提交"
            git status --short
            return 1
        else
            echo "✅ 没有未提交的更改"
            return 0
        fi
    else
        echo "❌ 当前目录不是 Git 仓库"
        return 1
    fi
}

# 创建 CORS 修复分支
create_cors_branch() {
    echo "🌿 创建 CORS 修复分支..."
    
    # 创建并切换到新分支
    git checkout -b cors-fix-ollama
    
    if [ $? -eq 0 ]; then
        echo "✅ 分支 'cors-fix-ollama' 创建成功"
    else
        echo "❌ 分支创建失败"
        return 1
    fi
}

# 添加 CORS 支持文件
add_cors_files() {
    echo "📝 添加 CORS 支持文件..."
    
    # 复制必要的文件到项目根目录
    cp simple-ollama-update/Dockerfile ../ollama-cors.Dockerfile
    cp simple-ollama-update/cors-proxy.js ../ollama-cors-proxy.js
    cp simple-ollama-update/package.json ../ollama-cors-package.json
    cp simple-ollama-update/render.yaml ../ollama-cors-render.yaml
    
    # 创建说明文档
    cat > ../OLLAMA_CORS_DEPLOYMENT.md << 'EOF'
# Ollama CORS 部署指南

## 文件说明

- `ollama-cors.Dockerfile` - 支持 CORS 的 Docker 配置
- `ollama-cors-proxy.js` - CORS 代理服务
- `ollama-cors-package.json` - Node.js 依赖配置
- `ollama-cors-render.yaml` - Render 部署配置

## 部署步骤

1. 在 Render 控制台中，找到 'ollama-ai-travel' 服务
2. 在 'Settings' 标签页中找到 'Build & Deploy' 部分
3. 确保连接到正确的 GitHub 仓库分支
4. 更新服务配置以使用新的 Dockerfile
5. 重新部署服务

## 配置说明

新的配置将：
- 启动 Ollama 服务
- 启动 CORS 代理服务
- 解决跨域访问问题
EOF
    
    echo "✅ CORS 支持文件已添加到项目根目录"
}

# 提交更改
commit_changes() {
    echo "📝 提交更改..."
    
    # 添加所有新文件
    git add ../ollama-cors.* ../OLLAMA_CORS_DEPLOYMENT.md
    
    # 提交更改
    git commit -m "Add CORS support for Ollama service

- Add Dockerfile with CORS support
- Add CORS proxy service
- Add deployment configuration
- Add deployment guide

This will resolve CORS issues when accessing Ollama from frontend."
    
    if [ $? -eq 0 ]; then
        echo "✅ 更改提交成功"
    else
        echo "❌ 更改提交失败"
        return 1
    fi
}

# 推送到 GitHub
push_to_github() {
    echo "🚀 推送到 GitHub..."
    
    # 推送新分支到远程仓库
    git push origin cors-fix-ollama
    
    if [ $? -eq 0 ]; then
        echo "✅ 分支推送成功"
        echo "🌐 新分支: cors-fix-ollama"
        echo "🔗 仓库: https://github.com/xiaowei9836/114-Web-Programming"
    else
        echo "❌ 分支推送失败"
        return 1
    fi
}

# 显示部署说明
show_deployment_steps() {
    echo ""
    echo "🎯 在 Render 中部署 CORS 修复版本："
    echo "====================================="
    echo ""
    echo "1️⃣ 访问 https://render.com 并登录"
    echo "2️⃣ 找到 'ollama-ai-travel' 服务"
    echo "3️⃣ 点击进入服务详情页"
    echo "4️⃣ 在 'Settings' 标签页中找到 'Build & Deploy' 部分"
    echo "5️⃣ 确保连接到正确的 GitHub 仓库："
    echo "   https://github.com/xiaowei9836/114-Web-Programming"
    echo "6️⃣ 设置分支为: cors-fix-ollama"
    echo "7️⃣ 更新服务配置："
    echo "   - 环境: Docker"
    echo "   - Dockerfile: ollama-cors.Dockerfile"
    echo "   - 构建命令: 自动检测"
    echo "   - 启动命令: 自动检测"
    echo "8️⃣ 保存配置并重新部署"
    echo ""
    echo "⏱️ 部署完成后，服务将支持 CORS，前端可以正常访问"
}

# 主函数
main() {
    echo "🎯 开始推送 CORS 修复代码到现有仓库..."
    echo ""
    
    # 检查 Git 状态
    if ! check_git_status; then
        echo "❌ Git 状态检查失败，请先处理未提交的更改"
        exit 1
    fi
    
    # 创建 CORS 修复分支
    if ! create_cors_branch; then
        exit 1
    fi
    
    # 添加 CORS 支持文件
    add_cors_files
    
    # 提交更改
    if ! commit_changes; then
        exit 1
    fi
    
    # 推送到 GitHub
    if ! push_to_github; then
        exit 1
    fi
    
    # 显示部署说明
    show_deployment_steps
    
    echo ""
    echo "🎉 CORS 修复代码推送完成！"
    echo "🌐 新分支: cors-fix-ollama"
    echo "🔗 仓库: https://github.com/xiaowei9836/114-Web-Programming"
    echo "📁 文件已添加到项目根目录"
    echo ""
    echo "💡 下一步：在 Render 中更新服务配置并重新部署"
}

# 运行主函数
main
