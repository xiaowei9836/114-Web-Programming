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

// 代理 Ollama 服務
app.use('/api', createProxyMiddleware({
  target: 'https://ollama-ai-travel.onrender.com',
  changeOrigin: true,
  pathRewrite: {
    '^/api': '/api'
  },
  onProxyRes: function (proxyRes, req, res) {
    // 添加 CORS 頭
    proxyRes.headers['Access-Control-Allow-Origin'] = '*';
    proxyRes.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS';
    proxyRes.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization';
  }
}));

// 健康檢查端點
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'CORS Proxy is running' });
});

app.listen(PORT, () => {
  console.log(`🚀 CORS Proxy 服務器運行在端口 ${PORT}`);
  console.log(`📡 代理目標: https://ollama-ai-travel.onrender.com`);
});


