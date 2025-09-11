# 部署說明文檔

## 部署架構

### 系統架構
```
前端 (Vercel/Netlify) ←→ 後端 (Render/Railway) ←→ 資料庫 (MongoDB Atlas)
```

### 技術棧
- **前端**: React + Vite + Tailwind CSS
- **後端**: Node.js + Express + TypeScript
- **資料庫**: MongoDB Atlas
- **部署平台**: Vercel (前端) + Render (後端)

---

## 前端部署

### 1. Vercel 部署

#### 部署步驟
1. 連接 GitHub 倉庫到 Vercel
2. 設定環境變數
3. 配置建構設定
4. 部署

#### 環境變數設定
```env
VITE_API_BASE_URL=https://your-backend-url.onrender.com
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
VITE_OPENAI_API_KEY=your_openai_api_key
```

#### vercel.json 配置
```json
{
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "https://your-backend-url.onrender.com/api/$1"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        }
      ]
    }
  ]
}
```

### 2. Netlify 部署

#### netlify.toml 配置
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/api/*"
  to = "https://your-backend-url.onrender.com/api/:splat"
  status = 200

[build.environment]
  NODE_VERSION = "18"
```

---

## 後端部署

### 1. Render 部署

#### render.yaml 配置
```yaml
services:
  - type: web
    name: trip-planner-backend
    env: node
    plan: free
    buildCommand: npm install && npm run build
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: MONGODB_URI
        fromDatabase:
          name: mongodb-atlas
          property: connectionString
      - key: PORT
        value: 10000
```

#### package.json 腳本
```json
{
  "scripts": {
    "start": "node dist/server.js",
    "build": "tsc",
    "dev": "ts-node-dev src/server.ts"
  }
}
```

### 2. Railway 部署

#### railway.json 配置
```json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm start",
    "healthcheckPath": "/api/health"
  }
}
```

---

## 資料庫部署

### MongoDB Atlas 設定

#### 1. 創建叢集
1. 登入 MongoDB Atlas
2. 創建新專案
3. 選擇免費層級 (M0)
4. 選擇地區 (建議選擇離用戶最近的)

#### 2. 網路存取設定
```javascript
// 允許所有 IP 存取 (開發環境)
0.0.0.0/0

// 生產環境建議限制特定 IP
your-server-ip/32
```

#### 3. 資料庫用戶設定
```javascript
// 創建資料庫用戶
Username: trip-planner-user
Password: strong-password
Database User Privileges: Read and write to any database
```

#### 4. 連接字串
```env
MONGODB_URI=mongodb+srv://trip-planner-user:password@cluster0.xxxxx.mongodb.net/trip-planner?retryWrites=true&w=majority
```

---

## 環境變數管理

### 1. 開發環境
```env
# .env.local
VITE_API_BASE_URL=http://localhost:5001
VITE_GOOGLE_MAPS_API_KEY=dev_key
VITE_OPENAI_API_KEY=dev_key
```

### 2. 生產環境
```env
# 後端環境變數
NODE_ENV=production
MONGODB_URI=mongodb+srv://...
PORT=10000
CORS_ORIGIN=https://your-frontend-domain.vercel.app

# 前端環境變數
VITE_API_BASE_URL=https://your-backend-url.onrender.com
VITE_GOOGLE_MAPS_API_KEY=prod_key
VITE_OPENAI_API_KEY=prod_key
```

---

## CI/CD 配置

### 1. GitHub Actions

#### .github/workflows/deploy.yml
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run build
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}

  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run build
      - name: Deploy to Render
        uses: render-actions/deploy@v1
        with:
          service-id: ${{ secrets.RENDER_SERVICE_ID }}
          api-key: ${{ secrets.RENDER_API_KEY }}
```

### 2. 自動化部署流程
1. 推送程式碼到 main 分支
2. GitHub Actions 觸發
3. 自動建構前端和後端
4. 部署到對應平台
5. 執行測試
6. 發送通知

---

## 監控和日誌

### 1. 應用程式監控
```typescript
// 健康檢查端點
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});
```

### 2. 錯誤監控
```typescript
// 全域錯誤處理
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'production' ? 'Something went wrong' : err.message
  });
});
```

### 3. 日誌記錄
```typescript
// 使用 winston 記錄日誌
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
```

---

## 安全性配置

### 1. CORS 設定
```typescript
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));
```

### 2. 環境變數保護
```typescript
// 驗證必要的環境變數
const requiredEnvVars = ['MONGODB_URI', 'PORT'];
requiredEnvVars.forEach(envVar => {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
});
```

### 3. HTTPS 強制
```typescript
// 強制 HTTPS (生產環境)
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.header('x-forwarded-proto') !== 'https') {
      res.redirect(`https://${req.header('host')}${req.url}`);
    } else {
      next();
    }
  });
}
```

---

## 效能優化

### 1. 快取策略
```typescript
// Redis 快取 (可選)
import Redis from 'ioredis';
const redis = new Redis(process.env.REDIS_URL);

// 快取熱門查詢
app.get('/api/trips', async (req, res) => {
  const cacheKey = 'trips:all';
  const cached = await redis.get(cacheKey);
  
  if (cached) {
    return res.json(JSON.parse(cached));
  }
  
  const trips = await Trip.find();
  await redis.setex(cacheKey, 300, JSON.stringify(trips)); // 5分鐘快取
  res.json(trips);
});
```

### 2. 資料庫優化
```typescript
// 建立索引
TripSchema.index({ createdAt: -1 });
TripSchema.index({ destination: 1, startDate: 1 });
```

### 3. 壓縮和靜態資源
```typescript
import compression from 'compression';
app.use(compression());
```

---

## 故障排除

### 1. 常見問題
- **CORS 錯誤**: 檢查 CORS 設定和域名
- **資料庫連接失敗**: 檢查 MongoDB URI 和網路設定
- **環境變數未載入**: 確認 .env 檔案位置和格式
- **建構失敗**: 檢查 Node.js 版本和依賴

### 2. 除錯工具
```typescript
// 開發環境除錯
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
```

### 3. 日誌查詢
```bash
# 查看 Render 日誌
render logs --service your-service-name

# 查看 Vercel 日誌
vercel logs your-deployment-url
```
