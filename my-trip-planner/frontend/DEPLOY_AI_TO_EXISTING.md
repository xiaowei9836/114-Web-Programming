# 🚀 為現有線上部署添加 AI 旅遊顧問

## 📋 **部署概述**

您已經有前後端部署到線上，現在只需要將 Ollama AI 服務也部署到線上，讓其他使用者也能使用 "AI旅遊顧問" 功能！

## 🌐 **部署架構**

```
用戶 → 您的網站 → 線上 Ollama 服務 → AI 模型回應
```

### **組件說明**
- **前端**: 已部署的旅遊規劃網站
- **後端**: 已部署的後端服務
- **AI 服務**: 新部署的 Ollama 服務 (Render)
- **AI 模型**: gpt-oss:20b, gpt-oss:120b

## 🚀 **部署步驟**

### **步驟 1: 部署 Ollama 服務到 Render**

#### **1.1 前往 Render Dashboard**
- 打開 [Render Dashboard](https://dashboard.render.com/)
- 點擊 "New +"
- 選擇 "Web Service"

#### **1.2 連接 GitHub 倉庫**
- 選擇 "Connect a repository"
- 選擇您的 GitHub 帳號
- 選擇 `114-Web-Programming` 倉庫
- 點擊 "Connect"

#### **1.3 配置服務**
- **Name**: `ollama-ai-travel` (或您喜歡的名稱)
- **Region**: 選擇離您最近的區域
- **Branch**: `main`
- **Root Directory**: `my-trip-planner/frontend`
- **Runtime**: `Docker`
- **Dockerfile Path**: `./Dockerfile`
- **Docker Context**: `.`

#### **1.4 環境變數配置**
添加以下環境變數：
```
OLLAMA_HOST=0.0.0.0
OLLAMA_MODELS=gpt-oss:20b,gpt-oss:120b
```

#### **1.5 部署設置**
- **Health Check Path**: `/api/tags`
- **Auto-Deploy**: 啟用
- **Build Command**: 留空 (使用 Dockerfile)
- **Start Command**: 留空 (使用 Dockerfile)

#### **1.6 創建服務**
點擊 "Create Web Service" 開始部署

### **步驟 2: 等待部署完成**

#### **部署階段**
1. **Building**: 構建 Docker 鏡像 (2-3 分鐘)
2. **Starting**: 啟動服務 (1-2 分鐘)
3. **Downloading Models**: 下載 AI 模型 (10-15 分鐘)
4. **Live**: 服務運行中

#### **部署時間**
- **總時間**: 15-20 分鐘
- **首次啟動**: 1-2 分鐘 (冷啟動)

### **步驟 3: 獲取線上服務 URL**

部署完成後，您會得到一個 URL，例如：
```
https://ollama-ai-travel.onrender.com
```

## 🔧 **更新現有部署配置**

### **選項 1: 使用配置更新腳本 (推薦)**

運行我們準備的腳本：
```bash
./update-frontend-config.sh
```

輸入您的線上 Ollama 服務 URL，腳本會自動：
- 更新 `.env` 文件
- 更新 `ai-providers.ts` 配置
- 重新構建項目

### **選項 2: 手動更新配置**

#### **2.1 更新前端環境變數**
在您的前端部署平台 (Vercel/Netlify/GitHub Pages) 添加：
```
VITE_OLLAMA_BASE_URL=https://ollama-ai-travel.onrender.com
VITE_OLLAMA_MODEL=gpt-oss:20b
```

#### **2.2 更新 AI 提供者配置**
修改 `src/config/ai-providers.ts` 中的 Ollama 配置：
```typescript
const OLLAMA_CONFIG = {
  BASE_URL: import.meta.env.VITE_OLLAMA_BASE_URL || 'https://ollama-ai-travel.onrender.com',
  // ... 其他配置
};
```

### **選項 3: 後端代理 (如果使用後端)**

如果您想通過後端代理 AI 請求，在後端添加：

```javascript
// 後端路由
app.post('/api/ai/generate', async (req, res) => {
  try {
    const response = await fetch('https://ollama-ai-travel.onrender.com/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req.body),
    });
    
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'AI 服務暫時不可用' });
  }
});
```

## 🧪 **部署後測試**

### **1. 測試 Ollama 服務**
```bash
# 健康檢查
curl https://ollama-ai-travel.onrender.com/api/tags

# 測試 AI 回應
curl -X POST https://ollama-ai-travel.onrender.com/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-oss:20b",
    "prompt": "推薦台北週末兩日遊的景點和美食",
    "stream": false
  }'
```

### **2. 測試網站功能**
- 打開您的網站
- 點擊 "AI諮詢" 按鈕
- 發送旅遊相關問題
- 確認 AI 回應正常

### **3. 測試跨頁面持久性**
- 在不同頁面間切換
- 確認聊天記錄保持
- 確認聊天窗口狀態保持

## 📊 **部署狀態監控**

### **Render 服務狀態**
- 🟢 **Live**: 服務正常運行
- 🟡 **Building**: 正在構建
- 🟡 **Starting**: 正在啟動
- 🔴 **Failed**: 部署失敗

### **健康檢查**
- 每 30 秒自動檢查 `/api/tags` 端點
- 如果檢查失敗，服務會自動重啟

## 🆘 **故障排除**

### **常見問題**

#### **1. 部署失敗**
- 檢查 Render 日誌
- 確認 Dockerfile 配置正確
- 檢查資源限制 (免費計劃)

#### **2. 模型下載失敗**
- 檢查網路連接
- 確認模型名稱正確
- 等待更長時間 (大模型需要時間)

#### **3. 前端無法連接**
- 確認環境變數已設置
- 檢查 CORS 設置
- 確認服務 URL 正確

### **調試命令**
```bash
# 檢查服務狀態
curl -v https://ollama-ai-travel.onrender.com/api/tags

# 檢查模型
curl -X POST https://ollama-ai-travel.onrender.com/api/generate \
  -H "Content-Type: application/json" \
  -d '{"model":"gpt-oss:20b","prompt":"測試","stream":false}'
```

## 💡 **優化建議**

### **性能優化**
1. **使用較小模型**: 優先使用 `gpt-oss:20b` (13GB)
2. **設置合理超時**: 避免長時間等待
3. **啟用緩存**: 避免重複請求

### **成本優化**
1. **免費計劃**: 利用 750 小時/月免費額度
2. **自動休眠**: 免費計劃會自動休眠不活躍的服務
3. **模型選擇**: 根據需求選擇合適的模型

## 🎯 **成功標準**

部署成功後，您應該看到：
- ✅ Ollama 服務狀態為 "Live"
- ✅ 健康檢查通過
- ✅ 網站 AI 諮詢功能正常工作
- ✅ 其他使用者可以正常使用 AI 功能
- ✅ 跨頁面對話持久性正常

## 🎉 **部署完成後**

### **立即行動**
1. **測試功能**: 確認 AI 旅遊顧問正常工作
2. **分享應用**: 讓朋友測試功能
3. **監控性能**: 關注服務狀態和回應時間

### **長期維護**
1. **監控使用情況**: 了解用戶使用模式
2. **收集反饋**: 根據用戶反饋優化功能
3. **定期更新**: 更新模型和依賴

## 🚀 **立即開始部署**

**準備好為您的現有部署添加 AI 旅遊顧問了嗎？**

1. **前往 Render Dashboard**
2. **創建 Ollama Web Service**
3. **等待部署完成**
4. **更新前端配置**
5. **測試功能**
6. **分享給朋友使用**

**您的 AI 旅遊顧問即將上線，讓現有網站的用戶都能享受 AI 功能！** 🌟✨

---

## 📋 **部署檢查清單**

- [ ] 創建 Render Web Service
- [ ] 等待部署完成
- [ ] 獲取服務 URL
- [ ] 更新前端配置
- [ ] 重新部署前端
- [ ] 測試 AI 功能
- [ ] 確認跨頁面持久性
- [ ] 分享給朋友測試

**完成所有項目後，您的 AI 旅遊顧問就成功上線了！** 🎊
