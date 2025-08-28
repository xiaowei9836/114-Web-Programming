#!/bin/bash

echo "🔧 直接修复现有服务的 CORS 问题..."

echo "🎯 当前问题分析："
echo "✅ Ollama 服务正在运行"
echo "✅ 服务可以访问"
echo "❌ 缺少 CORS 头，导致前端无法跨域访问"
echo ""

echo "💡 解决方案："
echo "由于 Ollama 服务已经在运行，我们可以："
echo "1. 直接在现有服务上添加 CORS 头"
echo "2. 或者修改前端配置，使用现有的服务"
echo ""

echo "🌐 测试当前服务状态..."
echo "根路径:"
curl -s "https://ollama-ai-travel.onrender.com/"
echo ""
echo ""

echo "Ollama API:"
curl -s "https://ollama-ai-travel.onrender.com/api/tags"
echo ""
echo ""

echo "🔍 检查 CORS 问题..."
echo "测试跨域请求:"
curl -H "Origin: https://my-trip-planner-lc34rbbeu-kuanweis-projects.vercel.app" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS \
     -v "https://ollama-ai-travel.onrender.com/api/tags" 2>&1 | grep -E "(Access-Control|HTTP/)"
echo ""

echo "📋 立即行动建议："
echo ""
echo "方案 A：修改前端配置（推荐）"
echo "1. 更新 ai-providers.ts 中的 CORS_PROXY_URL"
echo "2. 直接使用现有的 Ollama 服务"
echo "3. 重新部署前端"
echo ""

echo "方案 B：在现有服务上添加 CORS 支持"
echo "1. 访问 Render 控制台"
echo "2. 找到 'ollama-ai-travel' 服务"
echo "3. 检查服务配置和日志"
echo "4. 可能需要重新部署支持 CORS 的版本"
echo ""

echo "🧪 测试前端是否已经可以正常工作："
echo "访问你的前端页面，尝试使用 AI 聊天功能"
echo "如果仍然有 CORS 错误，我们需要进一步修复"
echo ""

echo "✅ 分析完成！"
