#!/bin/bash

echo "🚀 验证环境变量设置并触发重新部署..."

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
    echo "=================="
    render services --output text | grep "ollama-ai-travel"
    echo ""
}

# 显示服务详情
show_service_details() {
    echo "🔍 服务详细信息..."
    echo "=================="
    SERVICE_ID="srv-d2lea7ripnbc7384lf20"
    echo "🆔 服务 ID: $SERVICE_ID"
    echo ""
    
    echo "📋 服务详情："
    render services $SERVICE_ID --output text
    echo ""
}

# 显示环境变量
show_environment_vars() {
    echo "🌍 环境变量检查..."
    echo "=================="
    echo "✅ 你已经在 Render 控制台中设置了："
    echo "   Key: GIT_BRANCH"
    echo "   Value: cors-fix-ollama"
    echo ""
    echo "💡 这个设置应该会让 Render 使用 'cors-fix-ollama' 分支"
    echo ""
}

# 触发重新部署
trigger_redeploy() {
    echo "🚀 触发重新部署..."
    echo "=================="
    
    SERVICE_ID="srv-d2lea7ripnbc7384lf20"
    
    echo "🔄 正在触发重新部署..."
    echo "⏳ 这可能需要几分钟时间..."
    echo ""
    
    # 创建新的部署
    echo "📦 创建新部署..."
    render deploys create $SERVICE_ID --wait
    
    echo ""
    echo "✅ 部署完成！"
    echo ""
}

# 检查部署状态
check_deploy_status() {
    echo "📊 检查部署状态..."
    echo "=================="
    
    SERVICE_ID="srv-d2lea7ripnbc7384lf20"
    
    echo "🔍 最近的部署："
    render deploys --service $SERVICE_ID --output text | head -10
    echo ""
}

# 测试服务
test_service() {
    echo "🧪 测试服务..."
    echo "=================="
    
    echo "🌐 测试 CORS 代理端点..."
    echo ""
    
    # 测试健康检查端点
    echo "1️⃣ 测试 /health 端点："
    curl -s "https://ollama-ai-travel.onrender.com/health" | head -5
    echo ""
    
    # 测试测试端点
    echo "2️⃣ 测试 /test 端点："
    curl -s "https://ollama-ai-travel.onrender.com/test" | head -5
    echo ""
    
    # 测试 Ollama API
    echo "3️⃣ 测试 /api/tags 端点："
    curl -s "https://ollama-ai-travel.onrender.com/api/tags" | head -5
    echo ""
}

# 显示下一步操作
show_next_steps() {
    echo "🎯 下一步操作..."
    echo "=================="
    echo ""
    echo "1️⃣ 等待部署完成（通常需要 5-10 分钟）"
    echo "2️⃣ 检查服务日志是否有错误"
    echo "3️⃣ 测试 CORS 代理端点"
    echo "4️⃣ 在前端测试 llama2:7b 模型"
    echo ""
    echo "💡 如果部署成功，你应该能看到："
    echo "   - /health 端点返回健康状态"
    echo "   - /test 端点返回测试信息"
    echo "   - /api/tags 端点返回模型列表"
    echo ""
}

# 主函数
main() {
    echo "🎯 开始验证和部署流程..."
    echo ""
    
    # 检查登录状态
    if ! check_login; then
        echo "❌ 请先登录 Render，然后重新运行脚本"
        exit 1
    fi
    
    # 显示当前服务状态
    show_service_status
    
    # 显示服务详情
    show_service_details
    
    # 显示环境变量
    show_environment_vars
    
    # 触发重新部署
    trigger_redeploy
    
    # 检查部署状态
    check_deploy_status
    
    # 等待一下让部署开始
    echo "⏳ 等待部署开始..."
    sleep 10
    
    # 测试服务
    test_service
    
    # 显示下一步操作
    show_next_steps
    
    echo "✅ 验证和部署流程完成！"
    echo ""
    echo "🚀 现在请："
    echo "1. 在 Render 控制台中查看部署进度"
    echo "2. 等待部署完成"
    echo "3. 测试服务是否正常工作"
}

# 运行主函数
main
