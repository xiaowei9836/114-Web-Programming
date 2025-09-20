#!/bin/bash

# 🚀 Ollama 線上部署腳本
# 將您的本地 Ollama 模型部署到線上平台

set -e

# 顏色定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Ollama 線上部署腳本${NC}"
echo -e "${BLUE}========================${NC}\n"

# 檢查必要工具
echo -e "${YELLOW}🔍 檢查必要工具...${NC}"

if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker 未安裝，請先安裝 Docker${NC}"
    exit 1
fi

if ! command -v git &> /dev/null; then
    echo -e "${RED}❌ Git 未安裝，請先安裝 Git${NC}"
    exit 1
fi

echo -e "${GREEN}✅ 所有必要工具已安裝${NC}\n"

# 檢查必要文件
echo -e "${YELLOW}🔍 檢查必要文件...${NC}"

REQUIRED_FILES=("Dockerfile" "render.yaml" ".dockerignore")
for file in "${REQUIRED_FILES[@]}"; do
    if [ ! -f "$file" ]; then
        echo -e "${RED}❌ 缺少必要文件: $file${NC}"
        exit 1
    fi
done

echo -e "${GREEN}✅ 所有必要文件存在${NC}\n"

# 檢查 Ollama 模型
echo -e "${YELLOW}🔍 檢查本地 Ollama 模型...${NC}"

if ! command -v ollama &> /dev/null; then
    echo -e "${YELLOW}⚠️  Ollama 未安裝，將在部署時下載模型${NC}"
else
    echo -e "${GREEN}✅ Ollama 已安裝${NC}"
    echo -e "${BLUE}📋 可用模型:${NC}"
    ollama list
fi

echo ""

# 構建 Docker 鏡像
echo -e "${YELLOW}🔨 構建 Docker 鏡像...${NC}"
docker build -t ollama-travel .
echo -e "${GREEN}✅ Docker 鏡像構建完成${NC}\n"

# 測試本地 Docker 運行
echo -e "${YELLOW}🧪 測試本地 Docker 運行...${NC}"
docker run -d -p 11434:11434 --name ollama-test ollama-travel

echo -e "${BLUE}⏳ 等待服務啟動...${NC}"
sleep 30

# 測試 API
echo -e "${BLUE}🔍 測試 API 連接...${NC}"
if curl -s http://localhost:11434/api/tags > /dev/null; then
    echo -e "${GREEN}✅ 本地測試成功${NC}"
    
    # 測試模型回應
    echo -e "${BLUE}🧪 測試模型回應...${NC}"
    RESPONSE=$(curl -s -X POST http://localhost:11434/api/generate \
        -H "Content-Type: application/json" \
        -d '{
            "model": "gpt-oss:20b",
            "prompt": "你好，請簡單介紹一下自己",
            "stream": false,
            "options": {
                "temperature": 0.7,
                "num_predict": 50
            }
        }')
    
    if echo "$RESPONSE" | grep -q "response"; then
        echo -e "${GREEN}✅ 模型回應測試成功${NC}"
        echo -e "${BLUE}📝 回應: $(echo "$RESPONSE" | jq -r '.response' 2>/dev/null || echo '無法解析')${NC}"
    else
        echo -e "${YELLOW}⚠️  模型回應測試異常${NC}"
    fi
    
else
    echo -e "${RED}❌ 本地測試失敗${NC}"
fi

# 清理測試容器
echo -e "${BLUE}🧹 清理測試容器...${NC}"
docker stop ollama-test 2>/dev/null || true
docker rm ollama-test 2>/dev/null || true

echo ""

# 部署準備
echo -e "${GREEN}🎉 本地測試完成！現在可以部署到線上平台了${NC}\n"

echo -e "${BLUE}📋 部署選項:${NC}"
echo -e "   1. 🌐 Render (推薦 - 免費、簡單)"
echo -e "   2. 🚄 Railway (快速、穩定)"
echo -e "   3. 🦅 Fly.io (全球邊緣部署)"
echo -e "   4. 🤗 Hugging Face Spaces (AI 專用)"

echo ""

echo -e "${YELLOW}🚀 Render 部署步驟:${NC}"
echo -e "   1. 前往 https://dashboard.render.com/"
echo -e "   2. 連接您的 GitHub 倉庫"
echo -e "   3. 選擇 'New Web Service'"
echo -e "   4. 選擇您的倉庫"
echo -e "   5. 配置環境變數 (已包含在 render.yaml)"
echo -e "   6. 點擊 'Create Web Service'"

echo ""

echo -e "${YELLOW}🔧 部署後配置:${NC}"
echo -e "   1. 更新前端 .env 文件:"
echo -e "      VITE_OLLAMA_BASE_URL=https://your-service.onrender.com"
echo -e "      VITE_OLLAMA_MODEL=gpt-oss:20b"
echo -e "   2. 重新部署前端"
echo -e "   3. 測試 AI 旅遊顧問功能"

echo ""

echo -e "${GREEN}💡 提示:${NC}"
echo -e "   • 免費計劃有冷啟動延遲，首次請求可能需要 1-2 分鐘"
echo -e "   • 建議使用 gpt-oss:20b 模型 (13GB) 以節省資源"
echo -e "   • 可以設置自動部署，每次推送代碼時自動更新"

echo ""

echo -e "${BLUE}🔍 部署後測試命令:${NC}"
echo -e "   # 健康檢查"
echo -e "   curl https://your-service.onrender.com/api/tags"
echo -e ""
echo -e "   # 測試旅遊顧問"
echo -e "   curl -X POST https://your-service.onrender.com/api/generate \\"
echo -e "     -H 'Content-Type: application/json' \\"
echo -e "     -d '{\"model\":\"gpt-oss:20b\",\"prompt\":\"推薦台北週末兩日遊\",\"stream\":false}'"

echo ""

echo -e "${GREEN}🎯 準備好開始部署了嗎？${NC}"
echo -e "${GREEN}您的 AI 旅遊顧問即將上線！🚀${NC}"
