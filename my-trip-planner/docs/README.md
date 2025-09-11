# 旅行規劃平台 - 完整文檔

## 專案概述

這是一個全端旅行規劃平台，提供完整的旅行管理功能，包括地圖規劃、行程安排、預算管理、旅行日記和 AI 諮詢服務。

### 技術架構
- **前端**: React 18 + TypeScript + Vite + Tailwind CSS
- **後端**: Node.js + Express + TypeScript + MongoDB
- **部署**: Vercel (前端) + Render (後端) + MongoDB Atlas
- **AI 整合**: OpenAI, Ollama, Hugging Face

---

## 📚 文檔目錄

### 前端文檔
- [前端頁面說明](./FRONTEND_PAGES.md) - 所有頁面的功能和使用說明
- [前端組件說明](./FRONTEND_COMPONENTS.md) - 可重用組件的詳細說明
- [前端配置說明](./FRONTEND_CONFIG.md) - 專案配置和環境設定

### 後端文檔
- [後端 API 說明](./BACKEND_API.md) - RESTful API 端點和資料格式
- [後端資料模型](./BACKEND_MODELS.md) - 資料庫模型和 Schema 定義

### 部署文檔
- [部署說明](./DEPLOYMENT.md) - 完整的部署指南和配置
- [API 整合說明](./API_INTEGRATION.md) - 外部 API 整合和設定

---

## 🚀 快速開始

### 環境需求
- Node.js 18+
- MongoDB 4.4+
- npm 或 yarn

### 安裝步驟

1. **克隆專案**
```bash
git clone https://github.com/your-username/trip-planner.git
cd trip-planner
```

2. **安裝依賴**
```bash
# 安裝後端依賴
cd backend
npm install

# 安裝前端依賴
cd ../frontend
npm install
```

3. **環境設定**
```bash
# 後端環境變數
cp backend/env.example backend/.env
# 編輯 backend/.env 設定資料庫連接

# 前端環境變數
cp frontend/env.example frontend/.env.local
# 編輯 frontend/.env.local 設定 API 金鑰
```

4. **啟動開發伺服器**
```bash
# 啟動後端 (終端 1)
cd backend
npm run dev

# 啟動前端 (終端 2)
cd frontend
npm run dev
```

5. **訪問應用程式**
- 前端: http://localhost:3000
- 後端 API: http://localhost:5001

---

## 🏗️ 專案結構

```
trip-planner/
├── frontend/                 # React 前端應用
│   ├── src/
│   │   ├── components/      # 可重用組件
│   │   ├── pages/          # 頁面組件
│   │   ├── contexts/       # Context API
│   │   ├── config/         # 配置檔案
│   │   ├── hooks/          # 自定義 Hooks
│   │   ├── types/          # TypeScript 型別
│   │   └── utils/          # 工具函數
│   ├── public/             # 靜態資源
│   └── package.json
├── backend/                 # Node.js 後端應用
│   ├── src/
│   │   ├── controllers/    # 控制器
│   │   ├── models/         # 資料模型
│   │   ├── routes/         # 路由定義
│   │   └── config/         # 配置檔案
│   └── package.json
├── docs/                   # 專案文檔
└── README.md
```

---

## 🎯 主要功能

### 1. 旅行管理
- ✅ 創建、編輯、刪除旅行計劃
- ✅ 多貨幣預算管理
- ✅ 旅行日期規劃
- ✅ 目的地管理

### 2. 地圖規劃
- ✅ Google Maps 整合
- ✅ 地點標記和搜尋
- ✅ 路線規劃
- ✅ 地點預算設定

### 3. 行程安排
- ✅ 每日行程規劃
- ✅ 活動時間安排
- ✅ 地點順序優化

### 4. 預算管理
- ✅ 總預算設定
- ✅ 地點預算分配
- ✅ 多貨幣支援
- ✅ 預算追蹤

### 5. 旅行日記
- ✅ 日記撰寫和編輯
- ✅ 心情記錄
- ✅ 照片上傳
- ✅ 日記搜尋

### 6. AI 諮詢
- ✅ 多 AI 提供者支援
- ✅ 旅遊建議生成
- ✅ 即時問答
- ✅ 離線模式

---

## 🔧 開發指南

### 程式碼風格
- 使用 TypeScript 進行型別檢查
- 遵循 ESLint 規則
- 使用 Prettier 格式化程式碼
- 組件使用函數式寫法

### Git 工作流程
```bash
# 創建功能分支
git checkout -b feature/new-feature

# 提交變更
git add .
git commit -m "feat: add new feature"

# 推送分支
git push origin feature/new-feature

# 創建 Pull Request
```

### 測試
```bash
# 前端測試
cd frontend
npm run test

# 後端測試
cd backend
npm run test
```

---

## 📱 響應式設計

### 支援的裝置
- 📱 手機 (320px - 768px)
- 📱 平板 (768px - 1024px)
- 💻 桌面 (1024px+)

### 瀏覽器支援
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

---

## 🔒 安全性

### 資料保護
- 環境變數保護敏感資訊
- API 金鑰安全存儲
- CORS 設定限制跨域請求
- 輸入資料驗證和清理

### 隱私考量
- 本地 AI 模型選項 (Ollama)
- 資料加密傳輸
- 用戶資料最小化收集

---

## 🚀 部署

### 生產環境
- **前端**: Vercel 自動部署
- **後端**: Render 雲端部署
- **資料庫**: MongoDB Atlas

### 環境變數
詳見 [部署說明文檔](./DEPLOYMENT.md)

---

## 🤝 貢獻指南

### 如何貢獻
1. Fork 專案
2. 創建功能分支
3. 提交變更
4. 創建 Pull Request

### 問題回報
使用 GitHub Issues 回報問題，請包含：
- 問題描述
- 重現步驟
- 預期行為
- 實際行為
- 環境資訊

---

## 📄 授權

本專案採用 MIT 授權條款。詳見 [LICENSE](LICENSE) 檔案。

---

## 📞 支援

如有問題或建議，請：
- 創建 GitHub Issue
- 發送郵件至 support@trip-planner.com
- 查看文檔目錄中的詳細說明

---

## 🔄 更新日誌

### v1.0.0 (2024-01-01)
- ✨ 初始版本發布
- ✨ 基本旅行管理功能
- ✨ Google Maps 整合
- ✨ AI 聊天機器人
- ✨ 多貨幣支援

---

## 📊 專案統計

- **前端組件**: 6 個主要組件
- **頁面**: 5 個主要頁面
- **API 端點**: 8 個 RESTful 端點
- **資料模型**: 7 個主要模型
- **外部整合**: 3 個 AI 提供者

---

*最後更新: 2025-09-11*
