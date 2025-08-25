#!/bin/bash

echo "🔧 更新前端配置..."

# 获取用户输入的服务 URL
echo "📡 请输入你的 CORS 代理服务 URL："
echo "   格式: https://your-service-name.onrender.com"
echo "   例如: https://cors-proxy-ollama.onrender.com"
echo ""
read -p "🌐 服务 URL: " SERVICE_URL

if [ -z "$SERVICE_URL" ]; then
    echo "❌ 服务 URL 不能为空"
    exit 1
fi

# 移除末尾的斜杠
SERVICE_URL=$(echo $SERVICE_URL | sed 's/\/$//')

echo "🔍 验证服务可用性..."
if curl -s "$SERVICE_URL/health" > /dev/null; then
    echo "✅ 服务健康检查通过"
else
    echo "⚠️ 服务健康检查失败，但继续更新配置"
fi

# 更新 AI 提供者配置
echo "📝 更新 AI 提供者配置..."
CONFIG_FILE="src/config/ai-providers.ts"

if [ -f "$CONFIG_FILE" ]; then
    # 备份原文件
    cp "$CONFIG_FILE" "${CONFIG_FILE}.backup"
    echo "✅ 已备份原配置文件"
    
    # 更新 CORS 代理 URL
    sed -i.bak "s|CORS_PROXY_URL: 'https://cors-proxy-ollama.onrender.com/'|CORS_PROXY_URL: '${SERVICE_URL}/'|g" "$CONFIG_FILE"
    
    if [ $? -eq 0 ]; then
        echo "✅ CORS 代理 URL 更新成功"
        echo "🔄 从: https://cors-proxy-ollama.onrender.com/"
        echo "🔄 到: ${SERVICE_URL}/"
    else
        echo "❌ 更新失败，恢复备份文件"
        cp "${CONFIG_FILE}.backup" "$CONFIG_FILE"
        exit 1
    fi
else
    echo "❌ 配置文件不存在: $CONFIG_FILE"
    exit 1
fi

# 创建环境变量文件
echo "📝 创建环境变量文件..."
ENV_FILE=".env.local"
cat > "$ENV_FILE" << EOF
# Ollama 配置
VITE_OLLAMA_BASE_URL=${SERVICE_URL}
VITE_OLLAMA_MODEL=llama2:7b

# 其他配置
VITE_APP_NAME=My Trip Planner
VITE_APP_VERSION=1.0.0
EOF

echo "✅ 环境变量文件创建完成: $ENV_FILE"

# 显示更新后的配置
echo ""
echo "📋 更新后的配置："
echo "=================="
echo "🌐 CORS 代理服务: $SERVICE_URL"
echo "🤖 默认模型: llama2:7b"
echo "📁 配置文件: $CONFIG_FILE"
echo "🔧 环境变量: $ENV_FILE"
echo ""

# 测试配置
echo "🧪 测试配置..."
echo "请访问你的前端页面，检查控制台是否还有 CORS 错误"
echo "如果一切正常，你应该能看到 Ollama 服务正常工作的日志"

# 清理备份文件
echo ""
echo "🧹 清理临时文件..."
rm -f "${CONFIG_FILE}.backup"
rm -f "${CONFIG_FILE}.bak"

echo "✅ 配置更新完成！"
echo ""
echo "🎯 下一步："
echo "1. 重新构建并部署前端"
echo "2. 测试 AI 聊天功能"
echo "3. 验证 llama2:7b 模型是否正常工作"
