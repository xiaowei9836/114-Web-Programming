# 後端 API 說明文檔

## API 架構

### 技術棧
- **Node.js**: 運行環境
- **Express.js**: Web 框架
- **TypeScript**: 程式語言
- **MongoDB**: 資料庫
- **Mongoose**: ODM

### 專案結構
```
backend/
├── src/
│   ├── config/
│   │   └── database.ts          # 資料庫配置
│   ├── controllers/
│   │   └── tripController.ts    # 旅行控制器
│   ├── models/
│   │   └── Trip.ts              # 旅行資料模型
│   ├── routes/
│   │   └── tripRoutes.ts        # 旅行路由
│   └── server.ts                # 伺服器入口
├── package.json
└── tsconfig.json
```

---

## API 端點

### 1. 旅行管理 API

#### GET /api/trips
**功能**: 獲取所有旅行列表
**回應**:
```json
[
  {
    "_id": "string",
    "title": "string",
    "description": "string",
    "destination": "string",
    "startDate": "2024-01-01T00:00:00.000Z",
    "endDate": "2024-01-07T00:00:00.000Z",
    "budget": {
      "total": 1000,
      "spent": 0,
      "currency": "USD"
    },
    "mapTripData": {
      "points": [
        {
          "name": "string",
          "address": "string",
          "estimatedCost": 100,
          "currency": "USD"
        }
      ]
    },
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

#### GET /api/trips/:id
**功能**: 獲取單個旅行詳情
**參數**: `id` - 旅行 ID
**回應**: 單個旅行物件

#### POST /api/trips
**功能**: 創建新旅行
**請求體**:
```json
{
  "title": "string",
  "description": "string",
  "destination": "string",
  "startDate": "2024-01-01T00:00:00.000Z",
  "endDate": "2024-01-07T00:00:00.000Z",
  "budget": {
    "total": 1000,
    "currency": "USD"
  }
}
```

#### PUT /api/trips/:id
**功能**: 更新旅行資訊
**參數**: `id` - 旅行 ID
**請求體**: 完整的旅行物件

#### DELETE /api/trips/:id
**功能**: 刪除旅行
**參數**: `id` - 旅行 ID

---

### 2. 日記管理 API

#### POST /api/trips/:id/journal
**功能**: 添加日記條目
**參數**: `id` - 旅行 ID
**請求體**:
```json
{
  "title": "string",
  "content": "string",
  "mood": "good"
}
```

#### DELETE /api/trips/:id/journal/:journalId
**功能**: 刪除日記條目
**參數**: 
- `id` - 旅行 ID
- `journalId` - 日記條目 ID

---

## 資料模型

### Trip 模型
```typescript
interface ITrip {
  title: string;                    // 旅行標題
  description: string;              // 旅行描述
  startDate: Date;                  // 開始日期
  endDate: Date;                    // 結束日期
  destination: string;              // 目的地
  budget: {
    total: number;                  // 預算總額
    spent: number;                  // 已花費金額
    currency: string;               // 貨幣類型
  };
  mapTripData?: {
    points: Array<{
      name: string;                 // 地點名稱
      address: string;              // 地址
      estimatedCost?: number;       // 預估費用
      currency?: string;            // 貨幣類型
      estimatedTime?: number;       // 預估時間
      notes?: string;               // 備註
    }>;
  };
  journal: Array<{
    title: string;                  // 日記標題
    content: string;                // 日記內容
    date: Date;                     // 日期
    mood: 'excellent' | 'good' | 'okay' | 'bad';
  }>;
  createdAt: Date;
  updatedAt: Date;
}
```

---

## 錯誤處理

### 標準錯誤回應
```json
{
  "message": "錯誤描述",
  "error": "詳細錯誤資訊"
}
```

### 常見錯誤碼
- `400`: 請求參數錯誤
- `404`: 資源不存在
- `500`: 伺服器內部錯誤

---

## 配置說明

### 環境變數
```env
MONGODB_URI=mongodb://localhost:27017/trip-planner
PORT=5001
NODE_ENV=development
```

### 資料庫配置
- **MongoDB**: 使用 Mongoose 連接
- **集合名稱**: trips
- **索引**: 自動創建時間戳索引

---

## 部署說明

### 本地開發
```bash
cd backend
npm install
npm run dev
```

### 生產環境
```bash
npm run build
npm start
```

### Docker 部署
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 5001
CMD ["npm", "start"]
```

---

## API 使用範例

### 創建旅行
```javascript
const response = await fetch('/api/trips', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    title: '東京之旅',
    destination: '東京',
    startDate: '2024-03-01',
    endDate: '2024-03-07',
    budget: {
      total: 50000,
      currency: 'TWD'
    }
  })
});
```

### 更新旅行
```javascript
const response = await fetch(`/api/trips/${tripId}`, {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(updatedTrip)
});
```
