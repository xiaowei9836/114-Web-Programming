#!/bin/bash

echo "🚀 開始配置 Qwen AI 旅遊顧問..."

# 顏色定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 檢查是否在正確的目錄
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ 錯誤：請在 frontend 目錄中執行此腳本${NC}"
    exit 1
fi

echo -e "${GREEN}✅ 當前目錄檢查完成${NC}"

# 步驟 1: 檢查環境變數文件
echo ""
echo -e "${BLUE}📋 步驟 1: 檢查環境變數配置${NC}"

if [ ! -f ".env" ]; then
    if [ -f "env.example" ]; then
        echo -e "${YELLOW}⚠️  未找到 .env 文件，正在從 env.example 創建...${NC}"
        cp env.example .env
        echo -e "${GREEN}✅ 已創建 .env 文件${NC}"
    else
        echo -e "${RED}❌ 錯誤：未找到 env.example 文件${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✅ 找到 .env 文件${NC}"
fi

# 步驟 2: 檢查 Hugging Face API Key
echo ""
echo -e "${BLUE}🔑 步驟 2: 檢查 Hugging Face API Key${NC}"

if grep -q "VITE_HUGGINGFACE_API_KEY=your_huggingface_api_key_here" .env; then
    echo -e "${YELLOW}⚠️  需要配置 Hugging Face API Key${NC}"
    echo ""
    echo -e "${BLUE}📖 如何獲取 API Key:${NC}"
    echo "   1. 前往 https://huggingface.co/join 註冊帳號"
    echo "   2. 登入後前往 https://huggingface.co/settings/tokens"
    echo "   3. 點擊 'New token'，選擇 'Read' 權限"
    echo "   4. 複製生成的 API Key"
    echo ""
    echo -e "${YELLOW}請編輯 .env 文件，將您的 API Key 填入：${NC}"
    echo "   VITE_HUGGINGFACE_API_KEY=hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
    echo ""
    read -p "按 Enter 鍵繼續..."
else
    echo -e "${GREEN}✅ Hugging Face API Key 已配置${NC}"
fi

# 步驟 3: 檢查模型配置
echo ""
echo -e "${BLUE}🤖 步驟 3: 檢查 Qwen 模型配置${NC}"

if grep -q "VITE_HUGGINGFACE_MODEL=Qwen/Qwen2.5-7B-Instruct" .env; then
    echo -e "${GREEN}✅ Qwen 2.5 7B 模型已配置為默認模型${NC}"
else
    echo -e "${YELLOW}⚠️  建議更新為 Qwen 2.5 7B 模型${NC}"
    echo ""
    echo -e "${BLUE}推薦模型配置：${NC}"
    echo "   VITE_HUGGINGFACE_MODEL=Qwen/Qwen2.5-7B-Instruct"
    echo ""
    echo -e "${YELLOW}其他可選模型：${NC}"
    echo "   - Qwen/Qwen2.5-14B-Instruct (性能更好)"
    echo "   - Qwen/Qwen2.5-32B-Instruct (專業級)"
    echo "   - Qwen/Qwen2.5-72B-Instruct (頂級性能)"
    echo ""
    read -p "按 Enter 鍵繼續..."
fi

# 步驟 4: 檢查依賴
echo ""
echo -e "${BLUE}📦 步驟 4: 檢查依賴包${NC}"

if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}⚠️  未找到 node_modules，正在安裝依賴...${NC}"
    npm install
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ 依賴安裝完成${NC}"
    else
        echo -e "${RED}❌ 依賴安裝失敗${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✅ 依賴包已安裝${NC}"
fi

# 步驟 5: 構建檢查
echo ""
echo -e "${BLUE}🔨 步驟 5: 檢查構建${NC}"

echo -e "${YELLOW}正在檢查代碼構建...${NC}"
npm run build
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ 代碼構建成功${NC}"
else
    echo -e "${RED}❌ 代碼構建失敗，請檢查錯誤信息${NC}"
    exit 1
fi

# 步驟 6: 啟動說明
echo ""
echo -e "${BLUE}🚀 步驟 6: 啟動應用${NC}"

echo -e "${GREEN}🎉 Qwen AI 配置完成！${NC}"
echo ""
echo -e "${BLUE}📱 啟動應用：${NC}"
echo "   npm run dev"
echo ""
echo -e "${BLUE}🌐 訪問地址：${NC}"
echo "   http://localhost:5173"
echo ""
echo -e "${BLUE}🤖 測試 AI 功能：${NC}"
echo "   1. 點擊 'AI諮詢' 按鈕"
echo "   2. 測試提問：'我想去日本東京旅遊5天，請幫我規劃'"
echo "   3. 享受專業的 AI 旅遊顧問服務！"
echo ""

# 步驟 7: 可選配置
echo -e "${BLUE}🔧 可選配置：${NC}"
echo "   1. 雲端部署：讓其他使用者也能使用"
echo "   2. 自定義模型：選擇其他 Qwen 模型"
echo "   3. 性能優化：調整回應長度和速度"
echo ""

echo -e "${GREEN}✅ 配置腳本執行完成！${NC}"
echo -e "${BLUE}📖 詳細說明請查看：${NC}"
echo "   - QWEN_SETUP.md (Qwen 配置指南)"
echo "   - README.md (項目說明)"
echo "   - env.example (環境變數範例)"
echo ""
echo -e "${YELLOW}🚀 立即開始使用 Qwen AI 旅遊顧問吧！${NC}"
