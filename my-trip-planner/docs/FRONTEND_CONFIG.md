# 前端配置說明文檔

## 專案配置

### 技術棧
- **React 18**: 前端框架
- **TypeScript**: 程式語言
- **Vite**: 建構工具
- **Tailwind CSS**: 樣式框架
- **React Router**: 路由管理

### 專案結構
```
frontend/
├── src/
│   ├── components/          # 可重用組件
│   ├── pages/              # 頁面組件
│   ├── contexts/           # Context API
│   ├── config/             # 配置檔案
│   ├── hooks/              # 自定義 Hooks
│   ├── types/              # TypeScript 型別
│   ├── utils/              # 工具函數
│   └── styles/             # 樣式檔案
├── public/                 # 靜態資源
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── tsconfig.json
```

---

## 配置檔案

### 1. package.json
**檔案位置**: `frontend/package.json`

**主要依賴**:
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.8.0",
    "lucide-react": "^0.263.1",
    "tailwindcss": "^3.3.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@vitejs/plugin-react": "^4.0.0",
    "typescript": "^5.0.0",
    "vite": "^4.4.0"
  }
}
```

### 2. vite.config.ts
**檔案位置**: `frontend/vite.config.ts`

**配置內容**:
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5001',
        changeOrigin: true
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
})
```

### 3. tailwind.config.js
**檔案位置**: `frontend/tailwind.config.js`

**配置內容**:
```javascript
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'lxgw': ['LXGW WenKai', 'sans-serif'],
      },
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          600: '#2563eb',
        }
      }
    },
  },
  plugins: [],
}
```

### 4. tsconfig.json
**檔案位置**: `frontend/tsconfig.json`

**配置內容**:
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

---

## 環境配置

### 1. 環境變數
**檔案位置**: `frontend/.env`

```env
VITE_API_BASE_URL=http://localhost:5001
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
VITE_OPENAI_API_KEY=your_openai_api_key
```

### 2. 環境變數使用
```typescript
// 在組件中使用環境變數
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
```

---

## 路由配置

### 1. App.tsx 路由設定
```typescript
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/trips" element={<TripList />} />
        <Route path="/trips/:id" element={<TripDetail />} />
        <Route path="/create" element={<CreateTrip />} />
        <Route path="/map-planning" element={<MapPlanning />} />
      </Routes>
    </Router>
  );
}
```

### 2. 路由守衛
```typescript
// 受保護的路由
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = checkAuth();
  return isAuthenticated ? children : <Navigate to="/login" />;
};
```

---

## 狀態管理

### 1. Context API
**檔案位置**: `frontend/src/contexts/AIChatContext.tsx`

```typescript
interface AIChatContextType {
  isOpen: boolean;
  toggleChat: () => void;
  isMinimized: boolean;
  minimizeChat: () => void;
  messages: Message[];
  addMessage: (message: Message) => void;
}

export const AIChatProvider: React.FC<AIChatProviderProps> = ({ children }) => {
  // Context 實作
};
```

### 2. 本地狀態管理
```typescript
// 使用 useState 管理組件狀態
const [trips, setTrips] = useState<Trip[]>([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);
```

---

## 樣式配置

### 1. 全域樣式
**檔案位置**: `frontend/src/index.css`

```css
@import 'tailwindcss/base';
@import 'tailwindcss/components';
@import 'tailwindcss/utilities';

@font-face {
  font-family: 'LXGW WenKai';
  src: url('/fonts/lxgw-wenkai.ttf') format('truetype');
}

body {
  font-family: 'LXGW WenKai', sans-serif;
}
```

### 2. 組件樣式
```typescript
// 使用 Tailwind CSS 類別
<div className="bg-blue-50 rounded-lg shadow-md p-6">
  <h1 className="text-3xl font-bold text-gray-900">
    標題
  </h1>
</div>
```

---

## 建構配置

### 1. 開發環境
```bash
npm run dev
# 啟動開發伺服器 (http://localhost:3000)
```

### 2. 生產建構
```bash
npm run build
# 建構生產版本到 dist/ 目錄
```

### 3. 預覽建構
```bash
npm run preview
# 預覽生產建構結果
```

---

## 部署配置

### 1. Vercel 部署
**檔案位置**: `frontend/vercel.json`

```json
{
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "https://your-backend-url.com/api/$1"
    }
  ]
}
```

### 2. Docker 部署
**檔案位置**: `frontend/Dockerfile`

```dockerfile
FROM node:18-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

---

## 效能優化

### 1. 程式碼分割
```typescript
// 動態導入組件
const LazyComponent = React.lazy(() => import('./LazyComponent'));

// 使用 Suspense
<Suspense fallback={<div>Loading...</div>}>
  <LazyComponent />
</Suspense>
```

### 2. 圖片優化
```typescript
// 使用 Vite 的圖片優化
import logoUrl from './logo.svg?url';
import logoComponent from './logo.svg?react';
```

### 3. 快取策略
```typescript
// Service Worker 快取
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js');
}
```

---

## 開發工具

### 1. ESLint 配置
**檔案位置**: `frontend/eslint.config.js`

```javascript
export default [
  {
    rules: {
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
    },
  },
];
```

### 2. TypeScript 配置
- 嚴格模式啟用
- 型別檢查完整
- 路徑別名支援

### 3. 開發伺服器
- 熱重載支援
- 代理設定
- 源碼映射
