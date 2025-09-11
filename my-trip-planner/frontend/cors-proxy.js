import express from 'express';
import cors from 'cors';
import { createProxyMiddleware } from 'http-proxy-middleware';

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
