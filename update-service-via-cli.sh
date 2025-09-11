#!/bin/bash

echo "🚀 通过 Render CLI 更新服务配置..."

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

# 显示当前服务状态
show_service_status() {
    echo "📡 当前服务状态..."
    render services --output text | grep "ollama-ai-travel"
    echo ""
}

# 显示可用的更新选项
show_update_options() {
    echo "🎯 可用的更新选项："
    echo "=================="
    echo ""
    echo "1️⃣ 通过 Render 控制台更新（推荐）"
    echo "   - 访问 https://render.com"
    echo "   - 找到 'ollama-ai-travel' 服务"
    echo "   - 查找 'Settings' 或 'Configuration' 标签页"
    echo "   - 查找 'Repository'、'Git' 或 'Source' 相关选项"
    echo ""
    echo "2️⃣ 通过 Render CLI 更新"
    echo "   - 使用命令行工具更新服务配置"
    echo "   - 可能需要特定的权限"
    echo ""
    echo "3️⃣ 重新创建服务"
    echo "   - 删除现有服务"
    echo "   - 使用新的配置创建服务"
    echo ""
}

# 尝试通过 CLI 更新服务
try_cli_update() {
    echo "🔧 尝试通过 CLI 更新服务..."
    
    SERVICE_ID="srv-d2lea7ripnbc7384lf20"
    echo "🆔 服务 ID: $SERVICE_ID"
    
    echo ""
    echo "📋 可用的 CLI 命令："
    echo "=================="
    echo ""
    echo "查看服务详情："
    echo "   render services $SERVICE_ID --output text"
    echo ""
    echo "查看服务日志："
    echo "   render logs $SERVICE_ID --tail 20"
    echo ""
    echo "重新部署服务："
    echo "   render deploys create $SERVICE_ID --wait"
    echo ""
    echo "重启服务："
    echo "   render restart $SERVICE_ID"
    echo ""
}

# 显示手动更新步骤
show_manual_steps() {
    echo "📋 手动更新步骤："
    echo "=================="
    echo ""
    echo "1️⃣ 访问 Render 控制台"
    echo "2️⃣ 找到 'ollama-ai-travel' 服务"
    echo "3️⃣ 点击进入服务详情页"
    echo "4️⃣ 查找以下选项（可能在不同的标签页中）："
    echo "   - 'Repository' 或 'Git'"
    echo "   - 'Source Code' 或 'Build Source'"
    echo "   - 'Configuration' 或 'Settings'"
    echo "   - 'Environment Variables'"
    echo "5️⃣ 如果找到 Git 配置，更新分支为 'cors-fix-ollama'"
    echo "6️⃣ 如果找不到，尝试通过环境变量设置"
    echo ""
}

# 主函数
main() {
    echo "🎯 开始查找 Render 配置选项..."
    echo ""
    
    # 检查登录状态
    if ! check_login; then
        exit 1
    fi
    
    # 显示当前服务状态
    show_service_status
    
    # 显示可用的更新选项
    show_update_options
    
    # 尝试通过 CLI 更新
    try_cli_update
    
    # 显示手动更新步骤
    show_manual_steps
    
    echo "✅ 分析完成！"
    echo ""
    echo "💡 建议："
    echo "1. 先尝试在控制台中查找配置选项"
    echo "2. 如果找不到，告诉我你看到了哪些选项"
    echo "3. 我们可以根据具体情况提供解决方案"
}

# 运行主函数
main
