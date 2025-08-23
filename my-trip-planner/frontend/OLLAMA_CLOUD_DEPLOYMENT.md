# 🚀 Ollama 雲端部署指南

## 🎯 為什麼需要雲端部署？

Ollama 是本地部署的 AI 服務，這意味著：
- ✅ **您自己使用**：完全免費，隱私保護
- ❌ **其他使用者**：無法訪問您的本地服務

要讓其他使用者也能使用 AI 諮詢功能，我們需要將 Ollama 部署到雲端伺服器。

## 🌐 雲端部署選項

### 1. **免費雲端平台 (推薦新手)**

#### Render (免費層)
- **優點**: 完全免費，簡單易用
- **缺點**: 有休眠機制，首次請求較慢
- **適合**: 個人專案、測試環境

#### Railway (免費層)
- **優點**: 免費額度，部署簡單
- **缺點**: 免費額度有限
- **適合**: 小型專案

#### Fly.io (免費層)
- **優點**: 免費額度，全球分佈
- **缺點**: 配置較複雜
- **適合**: 有經驗的開發者

### 2. **付費雲端平台**

#### DigitalOcean
- **費用**: $5-10/月
- **優點**: 穩定可靠，支援 Docker
- **適合**: 生產環境

#### AWS EC2
- **費用**: $10-20/月
- **優點**: 功能強大，擴展性好
- **適合**: 企業級應用

#### Google Cloud
- **費用**: $10-20/月
- **優點**: 性能優秀，整合性好
- **適合**: 企業級應用

## 🐳 使用 Docker 部署 (推薦)

### 1. **準備 Dockerfile**

創建 `Dockerfile` 文件：

```dockerfile
# 使用官方 Ollama 鏡像
FROM ollama/ollama:latest

# 暴露 Ollama 端口
EXPOSE 11434

# 設置環境變數
ENV OLLAMA_HOST=0.0.0.0
ENV OLLAMA_ORIGINS=*

# 啟動 Ollama 服務
CMD ["ollama", "serve"]
```

### 2. **創建 docker-compose.yml**

```yaml
version: '3.8'

services:
  ollama:
    build: .
    ports:
      - "11434:11434"
    volumes:
      - ollama_data:/root/.ollama
    environment:
      - OLLAMA_HOST=0.0.0.0
      - OLLAMA_ORIGINS=*
    restart: unless-stopped

volumes:
  ollama_data:
```

### 3. **部署到 Render**

#### 步驟 1: 準備 GitHub 倉庫
```bash
# 創建新的 GitHub 倉庫
git init
git add Dockerfile docker-compose.yml
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/ollama-deployment.git
git push -u origin main
```

#### 步驟 2: 在 Render 部署
1. 前往 [Render](https://render.com/)
2. 點擊 "New +" → "Web Service"
3. 連接您的 GitHub 倉庫
4. 設置服務名稱：`ollama-service`
5. 選擇分支：`main`
6. 設置環境變數：
   ```
   OLLAMA_HOST=0.0.0.0
   OLLAMA_ORIGINS=*
   ```
7. 點擊 "Create Web Service"

#### 步驟 3: 下載模型
部署完成後，在 Render 的終端中執行：
```bash
# 下載 Llama 3.1 8B 模型
ollama pull llama3.1:8b

# 或下載其他模型
ollama pull mistral:7b
ollama pull qwen:7b
```

### 4. **部署到 Railway**

#### 步驟 1: 準備 railway.json
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "DOCKERFILE",
    "dockerfilePath": "Dockerfile"
  },
  "deploy": {
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

#### 步驟 2: 在 Railway 部署
1. 前往 [Railway](https://railway.app/)
2. 點擊 "New Project" → "Deploy from GitHub repo"
3. 選擇您的倉庫
4. 設置環境變數
5. 等待部署完成

## 🔧 環境變數配置

### 1. **更新 .env.local**
```bash
# Ollama 雲端服務
VITE_OLLAMA_CLOUD_URL=https://your-ollama-service.onrender.com
# 或
VITE_OLLAMA_CLOUD_URL=https://your-ollama-service.railway.app
```

### 2. **網頁自動檢測**
系統會自動檢測可用的提供者：
- 本地使用者：自動使用本地 Ollama
- 遠端使用者：自動使用雲端 Ollama
- 備選方案：Hugging Face 或 OpenAI

## 🌍 域名和 HTTPS

### 1. **自定義域名 (可選)**
如果您有自己的域名，可以在 Render 或 Railway 中設置：
```
https://ollama.yourdomain.com
```

### 2. **HTTPS 自動配置**
- Render 和 Railway 自動提供 HTTPS
- 確保安全連接
- 支援現代瀏覽器

## 📊 性能優化

### 1. **模型選擇**
```bash
# 輕量級模型 (推薦雲端部署)
ollama pull llama3.1:8b      # 4.7GB
ollama pull mistral:7b        # 4.1GB
ollama pull qwen:7b           # 4.1GB

# 重量級模型 (需要更多資源)
ollama pull llama3.1:70b      # 40GB
```

### 2. **資源配置**
- **免費層**: 512MB RAM, 0.1 CPU
- **付費層**: 1-4GB RAM, 0.5-2 CPU
- **建議**: 至少 1GB RAM 用於 8B 模型

### 3. **緩存策略**
```bash
# 預下載常用模型
ollama pull llama3.1:8b
ollama pull mistral:7b

# 定期清理未使用的模型
ollama list
ollama rm unused_model
```

## 🔒 安全配置

### 1. **防火牆設置**
```bash
# 只允許必要端口
ufw allow 11434
ufw enable
```

### 2. **訪問控制 (可選)**
```bash
# 設置基本認證
export OLLAMA_AUTH=username:password
```

### 3. **監控和日誌**
```bash
# 查看服務狀態
docker logs ollama_container

# 監控資源使用
docker stats ollama_container
```

## 🚨 常見問題

### Q: 雲端服務啟動很慢？
A: 免費平台有休眠機制，首次請求需要 1-2 分鐘啟動。

### Q: 模型下載失敗？
A: 檢查網路連接，或使用國內鏡像源。

### Q: 記憶體不足？
A: 升級到付費層，或使用更小的模型。

### Q: 如何擴展服務？
A: 在雲端平台中調整資源配置。

## 💰 成本估算

| 平台 | 免費層 | 付費層 | 推薦用途 |
|------|--------|--------|----------|
| **Render** | 免費 | $7/月 | 個人專案 |
| **Railway** | 免費額度 | $5/月 | 小型專案 |
| **DigitalOcean** | 無 | $5/月 | 生產環境 |
| **AWS EC2** | 免費層 | $10/月 | 企業級 |

## 🎉 部署完成後

### 1. **測試服務**
```bash
# 測試 Ollama 服務
curl https://your-ollama-service.onrender.com/api/tags
```

### 2. **更新網頁配置**
在 `.env.local` 中設置：
```bash
VITE_OLLAMA_CLOUD_URL=https://your-ollama-service.onrender.com
```

### 3. **分享給其他使用者**
現在其他使用者可以：
- 訪問您的網頁
- 使用 AI 諮詢功能
- 享受免費的 AI 服務

## 🔄 維護和更新

### 1. **定期更新模型**
```bash
# 更新到最新版本
ollama pull llama3.1:8b
```

### 2. **監控服務狀態**
- 檢查服務運行狀態
- 監控資源使用情況
- 查看錯誤日誌

### 3. **備份和恢復**
```bash
# 備份模型數據
docker cp ollama_container:/root/.ollama ./ollama_backup

# 恢復模型數據
docker cp ./ollama_backup ollama_container:/root/.ollama
```

---

**總結**: 通過雲端部署 Ollama，您可以讓所有使用者都能享受免費的 AI 諮詢服務，同時保持本地部署的優勢！🚀
