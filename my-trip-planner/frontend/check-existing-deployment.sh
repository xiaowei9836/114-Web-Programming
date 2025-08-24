#!/bin/bash

# 🔍 檢查現有部署狀態腳本
# 檢查您的前後端部署狀態，並準備添加 AI 旅遊顧問

set -e

# 顏色定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔍 檢查現有部署狀態${NC}"
echo -e "${BLUE}====================${NC}\n"

# 檢查當前目錄
echo -e "${YELLOW}📁 檢查當前目錄...${NC}"
if [[ "$PWD" == *"my-trip-planner/frontend"* ]]; then
    echo -e "${GREEN}✅ 當前在正確的目錄${NC}"
else
    echo -e "${RED}❌ 請在 my-trip-planner/frontend 目錄中運行此腳本${NC}"
    exit 1
fi

echo ""

# 檢查部署配置文件
echo -e "${YELLOW}📋 檢查部署配置文件...${NC}"

DEPLOYMENT_FILES=("vercel.json" "netlify.toml" "render.yaml" "ecosystem.config.js")
EXISTING_DEPLOYMENTS=()

for file in "${DEPLOYMENT_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✅ 找到: $file${NC}"
        EXISTING_DEPLOYMENTS+=("$file")
    fi
done

if [ ${#EXISTING_DEPLOYMENTS[@]} -eq 0 ]; then
    echo -e "${YELLOW}⚠️  未找到常見的部署配置文件${NC}"
    echo -e "${BLUE}💡 請告訴我您使用哪個平台部署的${NC}"
else
    echo -e "${GREEN}📊 發現 ${#EXISTING_DEPLOYMENTS[@]} 個部署配置文件${NC}"
fi

echo ""

# 檢查 package.json 中的部署腳本
echo -e "${YELLOW}📦 檢查 package.json 部署腳本...${NC}"
if [ -f "package.json" ]; then
    echo -e "${GREEN}✅ 找到 package.json${NC}"
    
    # 檢查部署腳本
    if grep -q "deploy" package.json; then
        echo -e "${BLUE}📝 發現部署腳本:${NC}"
        grep "deploy" package.json | grep -v "node_modules" | while read -r line; do
            echo -e "   $line"
        done
    else
        echo -e "${YELLOW}⚠️  未發現部署腳本${NC}"
    fi
else
    echo -e "${RED}❌ 未找到 package.json${NC}"
fi

echo ""

# 檢查環境變數配置
echo -e "${YELLOW}🔧 檢查環境變數配置...${NC}"
if [ -f ".env" ]; then
    echo -e "${GREEN}✅ 找到 .env 文件${NC}"
    echo -e "${BLUE}📝 當前配置:${NC}"
    
    # 顯示非敏感配置
    grep -v "API_KEY\|SECRET\|PASSWORD" .env | while read -r line; do
        if [[ ! -z "$line" && ! "$line" =~ ^# ]]; then
            echo -e "   $line"
        fi
    done
else
    echo -e "${YELLOW}⚠️  未找到 .env 文件${NC}"
fi

echo ""

# 檢查 Ollama 本地狀態
echo -e "${YELLOW}🤖 檢查 Ollama 本地狀態...${NC}"
if command -v ollama &> /dev/null; then
    echo -e "${GREEN}✅ Ollama 已安裝${NC}"
    
    # 檢查服務狀態
    if curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Ollama 服務正在運行${NC}"
        
        # 檢查可用模型
        echo -e "${BLUE}📋 可用模型:${NC}"
        ollama list | while read -r line; do
            echo -e "   $line"
        done
    else
        echo -e "${YELLOW}⚠️  Ollama 服務未運行${NC}"
        echo -e "${BLUE}💡 運行 'ollama serve' 啟動服務${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Ollama 未安裝${NC}"
    echo -e "${BLUE}💡 將在線上部署時自動安裝${NC}"
fi

echo ""

# 檢查 AI 提供者配置
echo -e "${YELLOW}🧠 檢查 AI 提供者配置...${NC}"
if [ -f "src/config/ai-providers.ts" ]; then
    echo -e "${GREEN}✅ 找到 AI 提供者配置文件${NC}"
    
    # 檢查 Ollama 配置
    if grep -q "OLLAMA_CONFIG" src/config/ai-providers.ts; then
        echo -e "${GREEN}✅ 已配置 Ollama 提供者${NC}"
        
        # 檢查基礎 URL 配置
        if grep -q "localhost:11434" src/config/ai-providers.ts; then
            echo -e "${YELLOW}⚠️  當前配置指向本地服務${NC}"
            echo -e "${BLUE}💡 部署後需要更新為線上服務地址${NC}"
        else
            echo -e "${GREEN}✅ 配置已指向線上服務${NC}"
        fi
    else
        echo -e "${YELLOW}⚠️  未找到 Ollama 配置${NC}"
    fi
else
    echo -e "${RED}❌ 未找到 AI 提供者配置文件${NC}"
fi

echo ""

# 部署建議
echo -e "${BLUE}🚀 部署建議${NC}"
echo -e "${BLUE}==========${NC}"

if [ ${#EXISTING_DEPLOYMENTS[@]} -gt 0 ]; then
    echo -e "${GREEN}🎯 基於您的現有部署，建議:${NC}"
    
    for file in "${EXISTING_DEPLOYMENTS[@]}"; do
        case "$file" in
            "vercel.json")
                echo -e "   🌐 Vercel 部署: 在 Vercel 環境變數中添加 Ollama 服務地址"
                ;;
            "netlify.toml")
                echo -e "   🌐 Netlify 部署: 在 Netlify 環境變數中添加 Ollama 服務地址"
                ;;
            "render.yaml")
                echo -e "   🌐 Render 部署: 創建新的 Ollama Web Service"
                ;;
            "ecosystem.config.js")
                echo -e "   🖥️  PM2 部署: 在現有服務器上部署 Ollama 服務"
                ;;
        esac
    done
else
    echo -e "${YELLOW}💡 建議使用 Render 部署 Ollama 服務:${NC}"
    echo -e "   1. 完全免費"
    echo -e "   2. 簡單部署"
    echo -e "   3. 自動擴展"
fi

echo ""

# 下一步行動
echo -e "${GREEN}📋 下一步行動清單${NC}"
echo -e "${GREEN}================${NC}"

echo -e "1. 🌐 部署 Ollama 服務到線上平台"
echo -e "2. 🔧 更新前端配置指向線上服務"
echo -e "3. 🚀 重新部署前端應用"
echo -e "4. 🧪 測試 AI 旅遊顧問功能"
echo -e "5. 🌍 分享給朋友使用"

echo ""

# 快速部署選項
echo -e "${BLUE}⚡ 快速部署選項${NC}"
echo -e "${BLUE}==============${NC}"

echo -e "🚀 Render 部署 (推薦):"
echo -e "   • 前往 https://dashboard.render.com/"
echo -e "   • 創建新的 Web Service"
echo -e "   • 使用我們準備的 Dockerfile 和 render.yaml"

echo ""

echo -e "🔧 配置更新:"
echo -e "   • 運行 ./update-frontend-config.sh"
echo -e "   • 輸入線上服務 URL"
echo -e "   • 自動更新所有配置"

echo ""

echo -e "${GREEN}🎯 準備好開始部署了嗎？${NC}"
echo -e "${GREEN}您的 AI 旅遊顧問即將上線！🚀${NC}"

echo ""

# 檢查清單
echo -e "${YELLOW}✅ 部署準備檢查清單${NC}"
echo -e "${YELLOW}====================${NC}"

echo -e "   [ ] 選擇部署平台 (Render 推薦)"
echo -e "   [ ] 創建 Ollama Web Service"
echo -e "   [ ] 等待部署完成"
echo -e "   [ ] 獲取服務 URL"
echo -e "   [ ] 更新前端配置"
echo -e "   [ ] 重新部署前端"
echo -e "   [ ] 測試 AI 功能"
echo -e "   [ ] 分享給朋友使用"

echo ""

echo -e "${GREEN}🎉 完成所有項目後，您的 AI 旅遊顧問就成功上線了！${NC}"
