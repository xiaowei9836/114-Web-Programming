#!/bin/bash

echo "🔄 更新现有的 Ollama 服务以支持 CORS..."

# 创建更新目录
UPDATE_DIR="ollama-cors-update"
rm -rf $UPDATE_DIR
mkdir -p $UPDATE_DIR

echo "📁 创建更新目录: $UPDATE_DIR"

# 创建支持 CORS 的 Ollama 服务文件
cat > $UPDATE_DIR/Dockerfile << 'EOF'
FROM ubuntu:22.04

# 安装必要的包
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

# 下载并安装 Ollama
RUN curl -L https://github.com/ollama/ollama/releases/download/v0.1.29/ollama-linux-amd64 -o /usr/local/bin/ollama \
    && chmod +x /usr/local/bin/ollama

# 创建启动脚本
RUN echo '#!/bin/bash' > /start.sh && \
    echo 'echo "🚀 启动 Ollama 服务..."' >> /start.sh && \
    echo 'export OLLAMA_HOST=0.0.0.0' >> /start.sh && \
    echo 'ollama serve &' >> /start.sh && \
    echo 'sleep 5' >> /start.sh && \
    echo 'echo "🌐 启动 CORS 代理..."' >> /start.sh && \
    echo 'node /app/cors-proxy.js' >> /start.sh && \
    chmod +x /start.sh

# 设置工作目录
WORKDIR /app

# 复制 CORS 代理文件
COPY cors-proxy.js .
COPY package.json .

# 安装 Node.js 依赖
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get install -y nodejs \
    && npm install

# 暴露端口
EXPOSE 10000 11434

# 启动服务
CMD ["/start.sh"]
EOF

# 创建 CORS 代理文件
cat > $UPDATE_DIR/cors-proxy.js << 'EOF'
const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = process.env.PORT || 10000;

// 启用 CORS
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// 健康检查端点
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Ollama CORS Proxy is running',
    timestamp: new Date().toISOString()
  });
});

// 测试端点
app.get('/test', (req, res) => {
  res.json({ 
    message: 'CORS Proxy test endpoint',
    cors: 'enabled',
    timestamp: new Date().toISOString()
  });
});

// 代理所有 Ollama API 请求
app.use('/api', createProxyMiddleware({
  target: 'http://localhost:11434',
  changeOrigin: true,
  onProxyRes: function (proxyRes, req, res) {
    // 添加 CORS 头
    proxyRes.headers['Access-Control-Allow-Origin'] = '*';
    proxyRes.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS';
    proxyRes.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization';
    
    console.log(`✅ 代理响应: ${req.method} ${req.url} -> ${proxyRes.statusCode}`);
  },
  onError: function (err, req, res) {
    console.error(`❌ 代理错误: ${err.message}`);
    res.status(500).json({ 
      error: '代理服务错误', 
      message: err.message,
      path: req.url 
    });
  }
}));

// 启动服务器
app.listen(PORT, () => {
  console.log(`🚀 CORS 代理服务运行在端口 ${PORT}`);
  console.log(`🌐 CORS 已启用，允许所有来源`);
  console.log(`📡 代理目标: http://localhost:11434 (Ollama)`);
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
  "name": "ollama-cors-proxy",
  "version": "1.0.0",
  "description": "Ollama service with CORS support",
  "main": "cors-proxy.js",
  "scripts": {
    "start": "node cors-proxy.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "http-proxy-middleware": "^2.0.6"
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
# Ollama AI Travel Service with CORS

Ollama AI 服务，内置 CORS 支持，解决跨域问题。

## 功能特性
- Ollama AI 服务 (端口 11434)
- CORS 代理服务 (端口 10000)
- 健康检查端点: /health
- 测试端点: /test
- 自动代理所有 Ollama API 请求

## 部署
1. 上传所有文件到 Render
2. 环境选择: Docker
3. 自动构建和部署
4. 服务将在几分钟内可用

## 访问
- 主服务: https://ollama-ai-travel.onrender.com
- CORS 代理: https://ollama-ai-travel.onrender.com (通过代理访问)
EOF

echo "📁 更新文件准备完成！"
echo "🎯 现在你可以："
echo ""
echo "1️⃣ 访问 https://render.com 并登录"
echo "2️⃣ 找到 'ollama-ai-travel' 服务"
echo "3️⃣ 点击进入服务详情页"
echo "4️⃣ 选择 'Manual Deploy' → 'Upload files'"
echo "5️⃣ 上传 $UPDATE_DIR 目录中的所有文件"
echo ""
echo "⚠️  注意：这将更新现有的服务配置"
echo "✅ 更新后，服务将同时运行 Ollama 和 CORS 代理"
echo "🌐 前端将能够正常访问，不再有 CORS 错误"

echo ""
echo "✅ 更新文件准备完成！"
echo "📁 更新目录: $(pwd)/$UPDATE_DIR"
echo "🌐 请按照上述步骤更新现有的 ollama-ai-travel 服务"
