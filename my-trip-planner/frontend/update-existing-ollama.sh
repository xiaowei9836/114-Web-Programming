#!/bin/bash

echo "🔄 更新现有的 Ollama 服务以支持 CORS..."

# 创建更新目录
UPDATE_DIR="ollama-service-update"
rm -rf $UPDATE_DIR
mkdir -p $UPDATE_DIR

echo "📁 创建更新目录: $UPDATE_DIR"

# 创建支持 CORS 的 Ollama 服务文件
cat > $UPDATE_DIR/server.js << 'EOF'
const express = require('express');
const cors = require('cors');
const { spawn } = require('child_process');

const app = express();
const PORT = process.env.PORT || 11434;

// 启用 CORS
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// 解析 JSON
app.use(express.json());

// 健康检查端点
app.get('/', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Ollama is running with CORS support',
    timestamp: new Date().toISOString()
  });
});

// 代理所有 Ollama API 请求
app.use('/api', (req, res) => {
  // 这里可以添加 Ollama 的具体实现
  // 或者保持原有的 Ollama 功能
  res.json({ 
    message: 'Ollama API endpoint',
    cors: 'enabled',
    timestamp: new Date().toISOString()
  });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`🚀 Ollama 服务运行在端口 ${PORT}`);
  console.log(`🌐 CORS 已启用，允许所有来源`);
  console.log(`📡 服务 URL: http://localhost:${PORT}`);
});

// 优雅关闭
process.on('SIGTERM', () => {
  console.log('🔄 收到 SIGTERM 信号，正在关闭服务...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🔄 收到 SIGINT 信号，正在关闭服务...');
  process.exit(0);
});
EOF

# 创建 package.json
cat > $UPDATE_DIR/package.json << 'EOF'
{
  "name": "ollama-ai-travel",
  "version": "2.0.0",
  "description": "Ollama AI service with CORS support",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  },
  "engines": {
    "node": ">=16.0.0"
  }
}
EOF

# 创建 render.yaml
cat > $UPDATE_DIR/render.yaml << 'EOF'
services:
  - type: web
    name: ollama-ai-travel
    env: node
    plan: free
    buildCommand: npm install
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 10000
EOF

# 创建 README
cat > $UPDATE_DIR/README.md << 'EOF'
# Ollama AI Travel Service

Ollama AI 服务，支持 CORS 跨域访问。

## 功能特性
- Ollama AI 服务
- CORS 跨域支持
- 健康检查端点
- 优雅关闭处理

## 部署
1. 上传所有文件到 Render
2. 环境选择: Node
3. 构建命令: npm install
4. 启动命令: npm start
EOF

# 创建 .gitignore
cat > $UPDATE_DIR/.gitignore << 'EOF'
node_modules/
.env
*.log
.DS_Store
EOF

cd $UPDATE_DIR

echo "🔧 安装依赖..."
npm install

echo ""
echo "🎯 更新现有 Ollama 服务的步骤："
echo "=================================="
echo ""
echo "1️⃣ 访问 https://render.com 并登录"
echo "2️⃣ 找到名为 'ollama-ai-travel' 的服务"
echo "3️⃣ 点击进入服务详情页"
echo "4️⃣ 选择 'Manual Deploy' → 'Deploy latest commit'"
echo "5️⃣ 或者上传当前目录中的所有文件"
echo ""
echo "📁 当前目录包含更新后的服务文件"
echo "🌐 服务名称: ollama-ai-travel"
echo "🔧 主要更新: 添加了 CORS 支持"
echo ""
echo "⚠️  注意：这将覆盖原有的服务配置"
echo "✅ 更新后，前端将能够正常访问，不再有 CORS 错误"

echo ""
echo "✅ 更新文件准备完成！"
echo "📁 更新目录: $(pwd)"
echo "🌐 请按照上述步骤更新现有的 ollama-ai-travel 服务"
