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
