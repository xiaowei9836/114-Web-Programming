# 🚀 快速部署到 Render (無需 Docker)

## 📋 **部署概述**

將您的 Ollama 模型快速部署到 Render，讓其他使用者也能使用 "AI旅遊顧問" 功能！

## 🌐 **為什麼選擇 Render**

- ✅ **完全免費**: 免費計劃包含 750 小時/月
- ✅ **簡單部署**: 無需複雜配置
- ✅ **自動擴展**: 根據需求自動啟動/停止
- ✅ **全球 CDN**: 快速訪問速度

## 🚀 **快速部署步驟**

### **步驟 1: 準備 GitHub 倉庫**

1. **確保代碼已推送**: 將所有更改推送到 GitHub
2. **檢查文件**: 確認以下文件存在：
   - `render.yaml`
   - `Dockerfile`
   - `.dockerignore`

### **步驟 2: 前往 Render Dashboard**

1. 打開 [Render Dashboard](https://dashboard.render.com/)
2. 點擊 "New +"
3. 選擇 "Web Service"

### **步驟 3: 連接 GitHub 倉庫**

1. 選擇 "Connect a repository"
2. 選擇您的 GitHub 帳號
3. 選擇 `114-Web-Programming` 倉庫
4. 點擊 "Connect"

### **步驟 4: 配置服務**

1. **Name**: `ollama-ai-travel` (或您喜歡的名稱)
2. **Region**: 選擇離您最近的區域
3. **Branch**: `main`
4. **Root Directory**: `my-trip-planner/frontend`
5. **Runtime**: `Docker`
6. **Dockerfile Path**: `./Dockerfile`
7. **Docker Context**: `.`

### **步驟 5: 環境變數配置**

添加以下環境變數：
- `OLLAMA_HOST`: `0.0.0.0`
- `OLLAMA_MODELS`: `gpt-oss:20b,gpt-oss:120b`

### **步驟 6: 部署設置**

1. **Health Check Path**: `/api/tags`
2. **Auto-Deploy**: 啟用
3. **Build Command**: 留空 (使用 Dockerfile)
4. **Start Command**: 留空 (使用 Dockerfile)

### **步驟 7: 創建服務**

點擊 "Create Web Service" 開始部署

## ⏱️ **部署時間**

- **首次部署**: 10-15 分鐘 (下載模型)
- **後續更新**: 2-5 分鐘
- **冷啟動**: 1-2 分鐘 (免費計劃)

## 🔍 **部署後測試**

### **1. 健康檢查**
```bash
curl https://your-service.onrender.com/api/tags
```

### **2. 模型測試**
```bash
curl -X POST https://your-service.onrender.com/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-oss:20b",
    "prompt": "你好，請簡單介紹一下自己",
    "stream": false
  }'
```

### **3. 旅遊顧問測試**
```bash
curl -X POST https://your-service.onrender.com/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-oss:20b",
    "prompt": "推薦台北週末兩日遊的景點和美食",
    "stream": false,
    "options": {
      "temperature": 0.7,
      "num_predict": 500
    }
  }'
```

## 🔧 **前端配置更新**

部署完成後，更新前端配置：

### **1. 運行配置更新腳本**
```bash
./update-frontend-config.sh
```

### **2. 輸入線上服務 URL**
例如: `https://ollama-ai-travel.onrender.com`

### **3. 重新部署前端**
將更新後的代碼推送到 GitHub

## 📊 **部署狀態監控**

### **部署階段**
1. **Building**: 構建 Docker 鏡像
2. **Starting**: 啟動服務
3. **Downloading Models**: 下載 AI 模型
4. **Live**: 服務運行中

### **常見狀態**
- 🟡 **Building**: 正在構建
- 🟡 **Starting**: 正在啟動
- 🟡 **Downloading**: 正在下載模型
- 🟢 **Live**: 服務正常運行
- 🔴 **Failed**: 部署失敗

## 🆘 **故障排除**

### **部署失敗**
1. **檢查日誌**: 查看 Render 日誌
2. **檢查配置**: 確認 Dockerfile 和 render.yaml 正確
3. **檢查資源**: 免費計劃有資源限制

### **服務無法啟動**
1. **檢查端口**: 確認端口 11434 正確
2. **檢查模型**: 確認模型名稱正確
3. **檢查依賴**: 確認所有依賴已安裝

### **模型下載失敗**
1. **檢查網路**: 確認網路連接正常
2. **檢查模型名稱**: 確認模型名稱正確
3. **檢查磁盤空間**: 確認有足夠空間

## 💡 **優化建議**

### **性能優化**
1. **使用較小模型**: 優先使用 `gpt-oss:20b` (13GB)
2. **啟用緩存**: 避免重複下載模型
3. **設置超時**: 合理的請求超時時間

### **成本優化**
1. **免費計劃**: 利用 750 小時/月免費額度
2. **自動休眠**: 免費計劃會自動休眠不活躍的服務
3. **模型選擇**: 根據需求選擇合適的模型

## 🎯 **成功標準**

部署成功後，您應該看到：
- ✅ 服務狀態為 "Live"
- ✅ 健康檢查通過
- ✅ 可以訪問 `/api/tags` 端點
- ✅ 模型可以正常回應
- ✅ 旅遊顧問功能正常工作

## 🎉 **部署完成後**

1. **測試功能**: 確認 AI 旅遊顧問正常工作
2. **分享應用**: 讓朋友測試功能
3. **監控性能**: 關注服務狀態和回應時間
4. **收集反饋**: 根據用戶反饋優化功能

---

## 🚀 **立即開始部署**

**準備好讓您的 AI 旅遊顧問上線了嗎？**

1. **前往 Render Dashboard**
2. **連接您的 GitHub 倉庫**
3. **創建 Web Service**
4. **等待部署完成**
5. **測試功能**
6. **分享給朋友使用**

**您的 AI 旅遊顧問即將上線，讓全世界都能使用！** 🌍✨
