#!/bin/bash

# 🚀 Ollama 雲端部署腳本
# 這個腳本會幫助您快速部署 Ollama 到雲端平台

echo "🚀 開始部署 Ollama 到雲端..."

# 檢查是否安裝了必要的工具
check_requirements() {
    echo "📋 檢查部署要求..."
    
    if ! command -v git &> /dev/null; then
        echo "❌ Git 未安裝，請先安裝 Git"
        exit 1
    fi
    
    if ! command -v docker &> /dev/null; then
        echo "❌ Docker 未安裝，請先安裝 Docker"
        exit 1
    fi
    
    echo "✅ 所有要求都已滿足"
}

# 創建部署文件
create_deployment_files() {
    echo "📁 創建部署文件..."
    
    # 創建 Dockerfile
    cat > Dockerfile << 'EOF'
# 使用官方 Ollama 鏡像
FROM ollama/ollama:latest

# 暴露 Ollama 端口
EXPOSE 11434

# 設置環境變數
ENV OLLAMA_HOST=0.0.0.0
ENV OLLAMA_ORIGINS=*

# 啟動 Ollama 服務
CMD ["ollama", "serve"]
EOF

    # 創建 docker-compose.yml
    cat > docker-compose.yml << 'EOF'
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
EOF

    # 創建 railway.json
    cat > railway.json << 'EOF'
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
EOF

    # 創建 .dockerignore
    cat > .dockerignore << 'EOF'
node_modules
npm-debug.log
.git
.gitignore
README.md
.env
EOF

    echo "✅ 部署文件已創建"
}

# 創建 README 文件
create_readme() {
    echo "📖 創建部署說明..."
    
    cat > DEPLOYMENT_README.md << 'EOF'
# 🚀 Ollama 雲端部署

## 📋 部署步驟

### 1. 推送到 GitHub
```bash
git init
git add .
git commit -m "Initial Ollama deployment"
git remote add origin https://github.com/YOUR_USERNAME/ollama-deployment.git
git push -u origin main
```

### 2. 部署到 Render (推薦)
1. 前往 [Render](https://render.com/)
2. 點擊 "New +" → "Web Service"
3. 連接您的 GitHub 倉庫
4. 設置服務名稱：`ollama-service`
5. 選擇分支：`main`
6. 點擊 "Create Web Service"

### 3. 部署到 Railway
1. 前往 [Railway](https://railway.app/)
2. 點擊 "New Project" → "Deploy from GitHub repo"
3. 選擇您的倉庫
4. 等待部署完成

## 🔧 部署完成後

### 下載模型
在雲端平台的終端中執行：
```bash
ollama pull llama3.1:8b
ollama pull mistral:7b
```

### 更新網頁配置
在 `.env.local` 中設置：
```bash
VITE_OLLAMA_CLOUD_URL=https://your-ollama-service.onrender.com
```

## 🌐 服務地址
部署完成後，您會得到一個服務地址，例如：
- Render: `https://ollama-service.onrender.com`
- Railway: `https://ollama-service.railway.app`

## 📞 支援
如果遇到問題，請檢查：
1. Docker 是否正常運行
2. 雲端平台是否支援 Docker
3. 環境變數是否正確設置
EOF

    echo "✅ 部署說明已創建"
}

# 創建 GitHub Actions 工作流 (可選)
create_github_actions() {
    echo "🔄 創建 GitHub Actions 工作流..."
    
    mkdir -p .github/workflows
    
    cat > .github/workflows/deploy.yml << 'EOF'
name: Deploy Ollama

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Build and push Docker image
      run: |
        docker build -t ollama-service .
        echo "Docker image built successfully"
    
    - name: Deploy to Render (可選)
      run: |
        echo "請在 Render 中手動部署，或使用 Render CLI"
EOF

    echo "✅ GitHub Actions 工作流已創建"
}

# 顯示部署說明
show_deployment_instructions() {
    echo ""
    echo "🎉 部署文件創建完成！"
    echo ""
    echo "📋 下一步操作："
    echo "1. 創建 GitHub 倉庫"
    echo "2. 推送代碼到 GitHub"
    echo "3. 在雲端平台部署"
    echo ""
    echo "📚 詳細說明請查看 DEPLOYMENT_README.md"
    echo ""
    echo "🚀 開始部署："
    echo "1. git init"
    echo "2. git add ."
    echo "3. git commit -m 'Initial Ollama deployment'"
    echo "4. git remote add origin YOUR_REPO_URL"
    echo "5. git push -u origin main"
    echo ""
    echo "🌐 然後前往 Render 或 Railway 部署您的服務"
}

# 主函數
main() {
    echo "🚀 Ollama 雲端部署腳本"
    echo "=========================="
    
    check_requirements
    create_deployment_files
    create_readme
    create_github_actions
    show_deployment_instructions
}

# 執行主函數
main
