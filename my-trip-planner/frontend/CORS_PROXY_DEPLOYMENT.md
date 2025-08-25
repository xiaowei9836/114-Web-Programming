# CORS 代理部署說明

## 🎯 目標
解決線上網頁訪問 Ollama 服務時的 CORS 跨域問題。

## 🚀 部署步驟

### 1. 安裝 Render CLI
```bash
# macOS
brew install render

# 或者訪問 https://render.com/docs/cli
```

### 2. 登入 Render
```bash
render login
```

### 3. 部署 CORS 代理
```bash
./deploy-cors-proxy.sh
```

### 4. 等待部署完成
- 訪問 Render 儀表板查看部署狀態
- 服務名稱：`cors-proxy-ollama`
- 類型：Web Service
- 環境：Node.js
- 計劃：Free

## 🔧 配置更新

部署完成後，CORS 代理的 URL 將是：
```
https://cors-proxy-ollama.onrender.com
```

前端配置已經更新為使用這個 URL。

## 📡 工作原理

1. **前端請求** → `https://cors-proxy-ollama.onrender.com/api/*`
2. **CORS 代理** → 轉發到 `https://ollama-ai-travel.onrender.com/api/*`
3. **Ollama 服務** → 處理 AI 請求並返回結果
4. **CORS 代理** → 添加 CORS 頭並返回給前端

## 🧪 測試

部署完成後，可以測試：
```bash
curl "https://cors-proxy-ollama.onrender.com/health"
curl "https://cors-proxy-ollama.onrender.com/api/tags"
```

## 🆘 故障排除

### 如果部署失敗：
1. 檢查 Render CLI 是否正確安裝
2. 確認是否已登入 Render
3. 檢查 `package.json` 中的依賴是否正確
4. 查看 Render 儀表板中的錯誤日誌

### 如果 CORS 仍然有問題：
1. 確認 CORS 代理服務正在運行
2. 檢查前端配置中的 URL 是否正確
3. 清除瀏覽器緩存並重新測試
