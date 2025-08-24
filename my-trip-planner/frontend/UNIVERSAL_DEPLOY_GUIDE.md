# 🌐 通用 AI 旅遊顧問部署指南

## 📋 **部署概述**

無論您使用哪個平台，都可以成功部署 AI 旅遊顧問功能！

## 🚀 **平台 1: Render (推薦)**

### **如果看到 Docker 選項**
1. **Runtime**: `Docker`
2. **Dockerfile Path**: `./Dockerfile`
3. **Docker Context**: `.`

### **如果沒有 Docker 選項**
1. **Runtime**: `Shell` 或 `Node`
2. **Build Command**: 留空
3. **Start Command**: 留空

### **環境變數**
```
OLLAMA_HOST=0.0.0.0
OLLAMA_MODELS=gpt-oss:20b,gpt-oss:120b
```

## 🚄 **平台 2: Railway**

### **部署步驟**
1. 前往 [Railway](https://railway.app/)
2. 連接 GitHub 倉庫
3. 選擇 "Deploy from GitHub repo"
4. 選擇您的倉庫
5. 選擇 "Deploy Now"

### **配置**
- **Build Command**: 留空
- **Start Command**: `ollama serve`
- **環境變數**: 同 Render

## 🦅 **平台 3: Fly.io**

### **部署步驟**
1. 安裝 Fly CLI: `brew install flyctl`
2. 登錄: `fly auth login`
3. 創建應用: `fly apps create ollama-ai-travel`
4. 部署: `fly deploy`

### **配置**
- 使用我們準備的 Dockerfile
- 自動配置端口和環境變數

## 🎯 **平台 4: Heroku**

### **部署步驟**
1. 安裝 Heroku CLI
2. 創建應用: `heroku create ollama-ai-travel`
3. 設置構建包: `heroku buildpacks:set heroku/ubuntu`
4. 部署: `git push heroku main`

## 🔧 **通用配置更新**

### **無論使用哪個平台，都需要：**

#### **1. 更新前端配置**
運行我們的腳本：
```bash
./update-frontend-config.sh
```

#### **2. 輸入線上服務 URL**
例如：
- Render: `https://ollama-ai-travel.onrender.com`
- Railway: `https://ollama-ai-travel.railway.app`
- Fly.io: `https://ollama-ai-travel.fly.dev`

#### **3. 重新部署前端**
```bash
npm run deploy
```

## 🧪 **部署後測試**

### **1. 健康檢查**
```bash
curl https://your-service-url/api/tags
```

### **2. AI 功能測試**
```bash
curl -X POST https://your-service-url/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-oss:20b",
    "prompt": "推薦台北週末兩日遊",
    "stream": false
  }'
```

## 🆘 **常見問題解決**

### **問題 1: 找不到 Docker 選項**
**解決方案**: 使用 Shell 運行時，手動安裝 Ollama

### **問題 2: 構建失敗**
**解決方案**: 檢查環境變數和構建命令

### **問題 3: 服務無法啟動**
**解決方案**: 檢查啟動命令和端口配置

### **問題 4: 模型下載失敗**
**解決方案**: 等待更長時間，檢查網路連接

## 💡 **最佳實踐**

### **1. 平台選擇**
- **新手**: Render (最簡單)
- **進階**: Railway (功能豐富)
- **專業**: Fly.io (性能最好)

### **2. 模型選擇**
- **測試**: gpt-oss:20b (13GB)
- **生產**: gpt-oss:120b (65GB)

### **3. 配置管理**
- 使用環境變數管理敏感信息
- 定期備份配置
- 監控服務狀態

## 🎉 **成功標準**

部署成功後，您應該看到：
- ✅ 服務狀態為 "Live" 或 "Running"
- ✅ 健康檢查通過
- ✅ 可以訪問 `/api/tags` 端點
- ✅ AI 旅遊顧問功能正常工作
- ✅ 其他使用者可以正常使用

## 🚀 **立即開始**

**選擇您喜歡的平台，開始部署吧！**

1. **選擇部署平台**
2. **創建服務**
3. **等待部署完成**
4. **更新前端配置**
5. **測試功能**
6. **分享給朋友使用**

**您的 AI 旅遊顧問即將上線！** 🌟✨

---

## 📋 **快速檢查清單**

- [ ] 選擇部署平台
- [ ] 創建服務
- [ ] 配置環境變數
- [ ] 等待部署完成
- [ ] 獲取服務 URL
- [ ] 更新前端配置
- [ ] 重新部署前端
- [ ] 測試 AI 功能
- [ ] 確認其他使用者可訪問

**完成所有項目後，您的 AI 旅遊顧問就成功上線了！** 🎊
