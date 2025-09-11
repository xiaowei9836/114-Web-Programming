# 前端組件說明文檔

## 組件列表

### 1. AIChatbot.tsx - AI 聊天機器人
**檔案位置**: `frontend/src/components/AIChatbot.tsx`

**功能描述**:
- 全域 AI 聊天機器人組件
- 支援多種 AI 提供者（OpenAI、Ollama、Hugging Face）
- 浮動對話框界面
- 旅遊相關的智能問答

**主要功能**:
- 聊天界面（最小化/展開）
- 多種 AI 模型支援
- 旅遊專業問答
- 訊息歷史管理
- 載入狀態顯示

**技術特點**:
- Context API 狀態管理
- 多提供者架構
- 動畫效果
- 響應式設計

---

### 2. GoogleMap.tsx - Google 地圖組件
**檔案位置**: `frontend/src/components/GoogleMap.tsx`

**功能描述**:
- Google Maps 地圖顯示組件
- 地點標記和路線規劃
- 地圖互動功能

**主要功能**:
- 地圖渲染
- 標記點管理
- 路線繪製
- 地圖控制

**技術特點**:
- Google Maps API 整合
- 動態標記管理
- 事件處理

---

### 3. GoogleMapsLoader.tsx - Google 地圖載入器
**檔案位置**: `frontend/src/components/GoogleMapsLoader.tsx`

**功能描述**:
- Google Maps API 的動態載入
- 載入狀態管理
- 錯誤處理

**主要功能**:
- API 腳本載入
- 載入狀態顯示
- 錯誤處理
- 回調管理

**技術特點**:
- 動態腳本載入
- Promise 處理
- 狀態管理

---

### 4. MarkdownRenderer.tsx - Markdown 渲染器
**檔案位置**: `frontend/src/components/MarkdownRenderer.tsx`

**功能描述**:
- Markdown 內容渲染
- 支援基本 Markdown 語法
- 自定義樣式

**主要功能**:
- Markdown 解析
- HTML 渲染
- 樣式應用
- 安全渲染

**技術特點**:
- Markdown 解析庫
- XSS 防護
- 自定義樣式

---

### 5. Navbar.tsx - 導航欄
**檔案位置**: `frontend/src/components/Navbar.tsx`

**功能描述**:
- 網站導航欄
- 響應式設計
- 滾動效果

**主要功能**:
- 導航連結
- 響應式選單
- 滾動背景效果
- 用戶互動

**技術特點**:
- 響應式設計
- 滾動監聽
- 動畫效果

---

### 6. ScrollToTop.tsx - 滾動到頂部
**檔案位置**: `frontend/src/components/ScrollToTop.tsx`

**功能描述**:
- 路由變更時自動滾動到頁面頂部
- 改善用戶體驗

**主要功能**:
- 路由監聽
- 自動滾動
- 平滑動畫

**技術特點**:
- React Router 整合
- 滾動動畫
- 生命週期管理

---

## 組件架構

### 狀態管理
- **Context API**: AIChatbot 使用 Context 進行全域狀態管理
- **Local State**: 各組件使用 useState 管理本地狀態

### 樣式系統
- **Tailwind CSS**: 主要樣式框架
- **自定義 CSS**: 特定動畫和效果
- **響應式設計**: 支援多種螢幕尺寸

### 外部依賴
- **Google Maps API**: 地圖功能
- **React Router**: 路由管理
- **Lucide React**: 圖標庫

## 組件使用指南

### 1. AIChatbot 使用
```tsx
import { AIChatProvider, useAIChat } from './contexts/AIChatContext';

// 在 App 中提供 Context
<AIChatProvider>
  <App />
</AIChatProvider>

// 在組件中使用
const { openChat, isOpen } = useAIChat();
```

### 2. GoogleMap 使用
```tsx
import GoogleMap from './components/GoogleMap';

<GoogleMap
  points={points}
  onPointAdd={handlePointAdd}
  onPointUpdate={handlePointUpdate}
/>
```

### 3. 組件組合
- 所有頁面都包含 Navbar
- 主要頁面包含 AIChatbot
- 地圖相關頁面使用 GoogleMap 和 GoogleMapsLoader
