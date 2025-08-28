#!/bin/bash

echo "🔧 更新前端配置，直接使用现有的 Ollama 服务..."

# 备份原配置文件
CONFIG_FILE="src/config/ai-providers.ts"
if [ -f "$CONFIG_FILE" ]; then
    cp "$CONFIG_FILE" "${CONFIG_FILE}.backup.$(date +%Y%m%d_%H%M%S)"
    echo "✅ 已备份原配置文件"
else
    echo "❌ 配置文件不存在: $CONFIG_FILE"
    exit 1
fi

echo ""
echo "🎯 当前配置分析："
echo "=================="
echo "🌐 CLOUD_URL: https://ollama-ai-travel.onrender.com"
echo "🌐 CORS_PROXY_URL: https://cors-proxy-ollama.onrender.com/ (不存在)"
echo "🌐 BASE_URL: https://ollama-ai-travel.onrender.com"
echo ""

echo "💡 修复策略："
echo "1. 将 CORS_PROXY_URL 更新为现有的 Ollama 服务"
echo "2. 确保前端优先使用可用的服务"
echo "3. 移除对不存在服务的依赖"
echo ""

# 更新 CORS_PROXY_URL
echo "📝 更新 CORS_PROXY_URL..."
sed -i.bak "s|CORS_PROXY_URL: 'https://cors-proxy-ollama.onrender.com/'|CORS_PROXY_URL: 'https://ollama-ai-travel.onrender.com/'|g" "$CONFIG_FILE"

if [ $? -eq 0 ]; then
    echo "✅ CORS_PROXY_URL 更新成功"
    echo "🔄 从: https://cors-proxy-ollama.onrender.com/"
    echo "🔄 到: https://ollama-ai-travel.onrender.com/"
else
    echo "❌ 更新失败，恢复备份文件"
    cp "${CONFIG_FILE}.backup."* "$CONFIG_FILE" 2>/dev/null
    exit 1
fi

# 创建环境变量文件
echo ""
echo "📝 创建环境变量文件..."
ENV_FILE=".env.local"
cat > "$ENV_FILE" << EOF
# Ollama 配置
VITE_OLLAMA_BASE_URL=https://ollama-ai-travel.onrender.com
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
echo "🌐 Ollama 服务: https://ollama-ai-travel.onrender.com"
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
rm -f "${CONFIG_FILE}.bak"

echo "✅ 配置更新完成！"
echo ""
echo "🎯 下一步："
echo "1. 重新构建并部署前端"
echo "2. 测试 AI 聊天功能"
echo "3. 验证 llama2:7b 模型是否正常工作"
echo ""
echo "💡 注意：如果仍然有 CORS 错误，我们可能需要"
echo "   在 Ollama 服务上直接添加 CORS 支持"
