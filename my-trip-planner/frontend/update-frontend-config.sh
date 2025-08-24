#!/bin/bash

# 🔧 前端配置更新腳本
# 更新前端配置以使用線上 Ollama 服務

set -e

# 顏色定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔧 前端配置更新腳本${NC}"
echo -e "${BLUE}====================${NC}\n"

# 檢查 .env 文件
if [ ! -f ".env" ]; then
    echo -e "${RED}❌ .env 文件不存在${NC}"
    echo -e "${YELLOW}💡 請先創建 .env 文件${NC}"
    exit 1
fi

echo -e "${YELLOW}🔍 當前 .env 配置:${NC}"
cat .env

echo ""

# 獲取線上服務 URL
echo -e "${BLUE}🌐 請輸入您的線上 Ollama 服務 URL:${NC}"
echo -e "${YELLOW}例如: https://ollama-ai-travel.onrender.com${NC}"
read -p "URL: " OLLAMA_URL

if [ -z "$OLLAMA_URL" ]; then
    echo -e "${RED}❌ URL 不能為空${NC}"
    exit 1
fi

# 移除 http:// 或 https:// 前綴以獲取域名
DOMAIN=$(echo "$OLLAMA_URL" | sed 's|^https?://||')

echo ""

echo -e "${YELLOW}🔧 更新 .env 文件...${NC}"

# 備份原文件
cp .env .env.backup.$(date +%Y%m%d_%H%M%S)
echo -e "${GREEN}✅ 已備份原 .env 文件${NC}"

# 更新配置
sed -i.bak "s|VITE_API_BASE_URL=.*|VITE_API_BASE_URL=http://localhost:5001|g" .env
sed -i.bak "s|VITE_OLLAMA_BASE_URL=.*|VITE_OLLAMA_BASE_URL=$OLLAMA_URL|g" .env
sed -i.bak "s|VITE_OLLAMA_MODEL=.*|VITE_OLLAMA_MODEL=gpt-oss:20b|g" .env

# 添加新的配置行（如果不存在）
if ! grep -q "VITE_OLLAMA_BASE_URL" .env; then
    echo "VITE_OLLAMA_BASE_URL=$OLLAMA_URL" >> .env
fi

if ! grep -q "VITE_OLLAMA_MODEL" .env; then
    echo "VITE_OLLAMA_MODEL=gpt-oss:20b" >> .env
fi

# 清理備份文件
rm -f .env.bak

echo -e "${GREEN}✅ .env 文件更新完成${NC}"

echo ""

echo -e "${YELLOW}🔍 更新後的 .env 配置:${NC}"
cat .env

echo ""

# 更新 AI 提供者配置
echo -e "${YELLOW}🔧 更新 AI 提供者配置...${NC}"

# 檢查 ai-providers.ts 文件
if [ -f "src/config/ai-providers.ts" ]; then
    echo -e "${GREEN}✅ 找到 ai-providers.ts 文件${NC}"
    
    # 備份原文件
    cp src/config/ai-providers.ts src/config/ai-providers.ts.backup.$(date +%Y%m%d_%H%M%S)
    
    # 更新 Ollama 配置
    sed -i.bak "s|localhost:11434|$DOMAIN|g" src/config/ai-providers.ts
    
    # 清理備份文件
    rm -f src/config/ai-providers.ts.bak
    
    echo -e "${GREEN}✅ ai-providers.ts 文件更新完成${NC}"
else
    echo -e "${YELLOW}⚠️  未找到 ai-providers.ts 文件${NC}"
fi

echo ""

# 構建項目
echo -e "${YELLOW}🔨 構建項目...${NC}"
if npm run build; then
    echo -e "${GREEN}✅ 項目構建成功${NC}"
else
    echo -e "${RED}❌ 項目構建失敗${NC}"
    echo -e "${YELLOW}💡 請檢查配置並重試${NC}"
    exit 1
fi

echo ""

# 部署建議
echo -e "${BLUE}🚀 部署建議:${NC}"
echo -e "   1. 將更新後的代碼推送到 GitHub"
echo -e "   2. 在 Render 上重新部署 Ollama 服務"
echo -e "   3. 重新部署前端應用"
echo -e "   4. 測試 AI 旅遊顧問功能"

echo ""

echo -e "${GREEN}🎉 配置更新完成！${NC}"
echo -e "${GREEN}現在可以部署到線上了！🚀${NC}"

echo ""

# 測試配置
echo -e "${YELLOW}🧪 測試線上服務連接...${NC}"
if curl -s "$OLLAMA_URL/api/tags" > /dev/null; then
    echo -e "${GREEN}✅ 線上服務連接正常${NC}"
else
    echo -e "${YELLOW}⚠️  線上服務連接失敗，可能還在部署中${NC}"
    echo -e "${YELLOW}💡 請等待部署完成後再測試${NC}"
fi
