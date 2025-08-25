#!/bin/bash

echo "🧪 测试 Ollama 服务状态..."

SERVICE_URL="https://ollama-ai-travel.onrender.com"
SERVICE_ID="srv-d2lea7ripnbc7384lf20"

echo "🌐 服务 URL: $SERVICE_URL"
echo "🆔 服务 ID: $SERVICE_ID"
echo ""

# 测试服务端点
test_endpoints() {
    echo "🔍 测试服务端点..."
    
    # 测试根路径
    echo "1️⃣ 测试根路径 /"
    ROOT_RESPONSE=$(curl -s -w "HTTP_STATUS:%{http_code}" "$SERVICE_URL/")
    HTTP_STATUS=$(echo "$ROOT_RESPONSE" | grep -o "HTTP_STATUS:[0-9]*" | cut -d: -f2)
    RESPONSE_BODY=$(echo "$ROOT_RESPONSE" | sed 's/HTTP_STATUS:[0-9]*//')
    
    if [ "$HTTP_STATUS" = "200" ]; then
        echo "✅ 根路径正常 (HTTP $HTTP_STATUS)"
        echo "📄 响应: $RESPONSE_BODY"
    else
        echo "❌ 根路径失败 (HTTP $HTTP_STATUS)"
        echo "📄 响应: $RESPONSE_BODY"
    fi
    
    echo ""
    
    # 测试健康检查
    echo "2️⃣ 测试健康检查 /health"
    HEALTH_RESPONSE=$(curl -s -w "HTTP_STATUS:%{http_code}" "$SERVICE_URL/health")
    HTTP_STATUS=$(echo "$HEALTH_RESPONSE" | grep -o "HTTP_STATUS:[0-9]*" | cut -d: -f2)
    RESPONSE_BODY=$(echo "$HEALTH_RESPONSE" | sed 's/HTTP_STATUS:[0-9]*//')
    
    if [ "$HTTP_STATUS" = "200" ]; then
        echo "✅ 健康检查正常 (HTTP $HTTP_STATUS)"
        echo "📄 响应: $RESPONSE_BODY"
    else
        echo "❌ 健康检查失败 (HTTP $HTTP_STATUS)"
        echo "📄 响应: $RESPONSE_BODY"
    fi
    
    echo ""
    
    # 测试测试端点
    echo "3️⃣ 测试测试端点 /test"
    TEST_RESPONSE=$(curl -s -w "HTTP_STATUS:%{http_code}" "$SERVICE_URL/test")
    HTTP_STATUS=$(echo "$TEST_RESPONSE" | grep -o "HTTP_STATUS:[0-9]*" | cut -d: -f2)
    RESPONSE_BODY=$(echo "$TEST_RESPONSE" | sed 's/HTTP_STATUS:[0-9]*//')
    
    if [ "$HTTP_STATUS" = "200" ]; then
        echo "✅ 测试端点正常 (HTTP $HTTP_STATUS)"
        echo "📄 响应: $RESPONSE_BODY"
    else
        echo "❌ 测试端点失败 (HTTP $HTTP_STATUS)"
        echo "📄 响应: $RESPONSE_BODY"
    fi
    
    echo ""
    
    # 测试 Ollama API
    echo "4️⃣ 测试 Ollama API /api/tags"
    API_RESPONSE=$(curl -s -w "HTTP_STATUS:%{http_code}" "$SERVICE_URL/api/tags")
    HTTP_STATUS=$(echo "$API_RESPONSE" | grep -o "HTTP_STATUS:[0-9]*" | cut -d: -f2)
    RESPONSE_BODY=$(echo "$API_RESPONSE" | sed 's/HTTP_STATUS:[0-9]*//')
    
    if [ "$HTTP_STATUS" = "200" ]; then
        echo "✅ Ollama API 正常 (HTTP $HTTP_STATUS)"
        echo "📄 响应: $RESPONSE_BODY"
    else
        echo "❌ Ollama API 失败 (HTTP $HTTP_STATUS)"
        echo "📄 响应: $RESPONSE_BODY"
    fi
}

# 检查服务状态
check_service_status() {
    echo "📡 检查 Render 服务状态..."
    render services --output text | grep "ollama-ai-travel"
    echo ""
}

# 显示服务日志
show_service_logs() {
    echo "📋 显示服务日志 (最近 10 行)..."
    render logs $SERVICE_ID --tail 10
    echo ""
}

# 主函数
main() {
    echo "🎯 开始测试 Ollama 服务..."
    echo "=================================="
    echo ""
    
    # 检查服务状态
    check_service_status
    
    # 测试服务端点
    test_endpoints
    
    # 显示服务日志
    show_service_logs
    
    echo "✅ 测试完成！"
    echo ""
    echo "💡 如果服务返回 404 错误，可能还在启动中"
    echo "⏱️ 请等待几分钟后再次运行此脚本"
}

# 运行主函数
main
