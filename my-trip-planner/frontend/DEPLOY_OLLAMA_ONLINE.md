# 🚀 Ollama 線上部署指南

將您的本地 Ollama 模型部署到線上，讓其他使用者也能使用 "AI旅遊顧問" 功能！

## 📋 **部署選項**

### **選項 1: Render (推薦)**
- **優點**: 免費額度、簡單部署、支持 Docker
- **缺點**: 免費版有冷啟動延遲
- **適合**: 中小型應用、測試環境

### **選項 2: Railway**
- **優點**: 快速部署、自動擴展、支持多種語言
- **缺點**: 免費額度有限
- **適合**: 生產環境、需要穩定性的應用

### **選項 3: Fly.io**
- **優點**: 全球邊緣部署、免費額度慷慨
- **缺點**: 配置相對複雜
- **適合**: 需要全球訪問的應用

### **選項 4: Hugging Face Spaces**
- **優點**: 專門為 AI 應用設計、免費
- **缺點**: 主要支持 Python 應用
- **適合**: AI 專用部署

## 🐳 **Docker 部署方案 (推薦)**

### **創建 Dockerfile**
```dockerfile
FROM ubuntu:22.04

# 安裝依賴
RUN apt-get update && apt-get install -y \
    curl \
    wget \
    && rm -rf /var/lib/apt/lists/*

# 下載 Ollama
RUN curl -fsSL https://ollama.ai/install.sh | sh

# 創建工作目錄
WORKDIR /app

# 複製模型文件 (可選)
COPY models/ /root/.ollama/models/

# 暴露端口
EXPOSE 11434

# 啟動 Ollama
CMD ["ollama", "serve"]
```

### **創建 docker-compose.yml**
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
    restart: unless-stopped

volumes:
  ollama_data:
```

## 🌐 **Render 部署步驟**

### **1. 準備部署文件**
```bash
# 創建 render.yaml
touch render.yaml

# 創建 Dockerfile
touch Dockerfile

# 創建 .dockerignore
touch .dockerignore
```

### **2. 配置 render.yaml**
```yaml
services:
  - type: web
    name: ollama-ai-travel
    env: docker
    plan: free
    dockerfilePath: ./Dockerfile
    dockerContext: .
    envVars:
      - key: OLLAMA_HOST
        value: 0.0.0.0
    healthCheckPath: /api/tags
    autoDeploy: true
```

### **3. 部署到 Render**
1. 前往 [Render Dashboard](https://dashboard.render.com/)
2. 連接您的 GitHub 倉庫
3. 選擇 "New Web Service"
4. 選擇您的倉庫
5. 配置環境變數
6. 點擊 "Create Web Service"

## 🔧 **環境變數配置**

### **前端配置 (.env)**
```bash
# 部署後的 Ollama 服務地址
VITE_OLLAMA_BASE_URL=https://your-ollama-service.onrender.com
VITE_OLLAMA_MODEL=gpt-oss:20b

# 禁用本地 Ollama
# VITE_OLLAMA_BASE_URL=http://localhost:11434
```

### **後端配置 (如果使用)**
```bash
OLLAMA_BASE_URL=https://your-ollama-service.onrender.com
OLLAMA_MODEL=gpt-oss:20b
```

## 📦 **模型部署策略**

### **策略 1: 預下載模型**
```bash
# 在 Dockerfile 中預下載模型
RUN ollama pull gpt-oss:20b
RUN ollama pull gpt-oss:120b
```

### **策略 2: 運行時下載**
```bash
# 在啟動腳本中下載
#!/bin/bash
ollama serve &
sleep 10
ollama pull gpt-oss:20b
wait
```

### **策略 3: 模型文件複製**
```bash
# 將本地模型複製到容器
COPY --from=local /root/.ollama/models/ /root/.ollama/models/
```

## 🚀 **快速部署腳本**

### **創建部署腳本**
```bash
#!/bin/bash
echo "🚀 開始部署 Ollama 到線上..."

# 檢查必要文件
if [ ! -f "Dockerfile" ]; then
    echo "❌ 缺少 Dockerfile"
    exit 1
fi

if [ ! -f "render.yaml" ]; then
    echo "❌ 缺少 render.yaml"
    exit 1
fi

# 構建 Docker 鏡像
echo "🔨 構建 Docker 鏡像..."
docker build -t ollama-travel .

# 測試本地運行
echo "🧪 測試本地 Docker 運行..."
docker run -d -p 11434:11434 --name ollama-test ollama-travel
sleep 10

# 測試 API
curl -s http://localhost:11434/api/tags
if [ $? -eq 0 ]; then
    echo "✅ 本地測試成功"
    docker stop ollama-test
    docker rm ollama-test
else
    echo "❌ 本地測試失敗"
    docker stop ollama-test
    docker rm ollama-test
    exit 1
fi

echo "🎉 準備完成！現在可以部署到 Render 了"
```

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
    "prompt": "你是一位專業的AI旅遊顧問。請推薦台北週末兩日遊的景點和美食",
    "stream": false,
    "options": {
      "temperature": 0.7,
      "num_predict": 500
    }
  }'
```

## 💡 **優化建議**

### **性能優化**
1. **使用較小的模型**: 優先部署 `gpt-oss:20b` (13GB)
2. **啟用模型緩存**: 避免重複下載
3. **設置合理的超時時間**: 避免長時間等待

### **成本優化**
1. **選擇免費計劃**: 利用各平台的免費額度
2. **模型選擇**: 根據需求選擇合適的模型大小
3. **自動擴展**: 只在需要時啟動服務

### **安全性**
1. **限制訪問**: 只允許必要的 API 端點
2. **速率限制**: 防止濫用
3. **日誌監控**: 監控使用情況

## 🆘 **故障排除**

### **常見問題**
1. **冷啟動延遲**: 免費計劃的常見問題，考慮升級
2. **模型下載失敗**: 檢查網路連接和模型名稱
3. **內存不足**: 選擇較小的模型或升級計劃
4. **端口衝突**: 確保端口 11434 可用

### **調試命令**
```bash
# 檢查服務狀態
docker logs <container_id>

# 檢查模型狀態
curl http://localhost:11434/api/tags

# 檢查系統資源
docker stats <container_id>
```

## 🎯 **下一步行動**

1. **選擇部署平台**: 根據需求選擇合適的平台
2. **準備部署文件**: 創建必要的配置文件
3. **測試本地部署**: 確保 Docker 配置正確
4. **部署到線上**: 使用平台提供的部署工具
5. **更新前端配置**: 修改環境變數指向線上服務
6. **測試線上功能**: 驗證 AI 旅遊顧問是否正常工作

---

**準備好開始部署了嗎？讓我們將您的 AI 旅遊顧問帶到線上！** 🚀
