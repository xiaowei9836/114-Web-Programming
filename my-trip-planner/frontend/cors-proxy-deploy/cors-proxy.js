import express from 'express';
import cors from 'cors';
import { createProxyMiddleware } from 'http-proxy-middleware';

const app = express();
const PORT = process.env.PORT || 3001;

// 啟用 CORS
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// 通用代理中间件 - 处理编码的 URL
app.use('/', createProxyMiddleware({
  target: 'https://ollama-ai-travel.onrender.com',
  changeOrigin: true,
  pathRewrite: {
    '^/': '/'
  },
  onProxyReq: function (proxyReq, req, res) {
    // 解码 URL 路径
    if (req.url) {
      try {
        const decodedUrl = decodeURIComponent(req.url);
        console.log(`🔄 代理请求: ${req.method} ${req.url} -> ${decodedUrl}`);
      } catch (error) {
        console.log(`⚠️ URL 解码失败: ${req.url}`);
      }
    }
  },
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

// 健康檢查端點
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'CORS Proxy is running',
    target: 'https://ollama-ai-travel.onrender.com',
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

app.listen(PORT, () => {
  console.log(`🚀 CORS Proxy 服務器運行在端口 ${PORT}`);
  console.log(`📡 代理目標: https://ollama-ai-travel.onrender.com`);
  console.log(`🌐 CORS: 已啟用，允許所有來源`);
});


