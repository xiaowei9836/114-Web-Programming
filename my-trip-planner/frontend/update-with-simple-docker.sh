#!/bin/bash

echo "🔄 使用简化的 Dockerfile 更新 Ollama 服务..."

# 创建更新目录
UPDATE_DIR="simple-ollama-update"
rm -rf $UPDATE_DIR
mkdir -p $UPDATE_DIR

echo "📁 创建更新目录: $UPDATE_DIR"

# 复制简化的 Dockerfile
cp simple-dockerfile $UPDATE_DIR/Dockerfile

# 复制 CORS 代理文件
cp ollama-cors-update/cors-proxy.js $UPDATE_DIR/
cp ollama-cors-update/package.json $UPDATE_DIR/

# 创建 render.yaml
cat > $UPDATE_DIR/render.yaml << 'EOF'
services:
  - type: web
    name: ollama-ai-travel
    env: docker
    plan: free
    dockerfilePath: ./Dockerfile
    envVars:
      - key: OLLAMA_HOST
        value: 0.0.0.0
      - key: PORT
        value: 10000
EOF

# 创建 README
cat > $UPDATE_DIR/README.md << 'EOF'
# Simple Ollama Service with CORS

简化的 Ollama 服务，内置 CORS 支持。

## 特性
- Ollama AI 服务 (端口 11434)
- CORS 代理服务 (端口 10000)
- 简化的 Docker 配置
- 自动启动脚本

## 部署
1. 上传所有文件到 Render
2. 环境选择: Docker
3. 自动构建和部署
EOF

cd $UPDATE_DIR

echo "📁 更新文件准备完成！"
echo "🎯 现在你可以："
echo ""
echo "1️⃣ 访问 https://render.com 并登录"
echo "2️⃣ 找到 'ollama-ai-travel' 服务"
echo "3️⃣ 点击进入服务详情页"
echo "4️⃣ 选择 'Manual Deploy' → 'Upload files'"
echo "5️⃣ 上传当前目录中的所有文件："
echo "   - Dockerfile"
echo "   - cors-proxy.js"
echo "   - package.json"
echo "   - render.yaml"
echo "   - README.md"
echo ""
echo "⚠️  注意：这将更新现有的服务配置"
echo "✅ 更新后，服务将同时运行 Ollama 和 CORS 代理"
echo "🌐 前端将能够正常访问，不再有 CORS 错误"

echo ""
echo "✅ 更新文件准备完成！"
echo "📁 更新目录: $(pwd)"
echo "🌐 请按照上述步骤更新现有的 ollama-ai-travel 服务"
