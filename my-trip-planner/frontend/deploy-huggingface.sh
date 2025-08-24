#!/bin/bash

echo "🚀 開始部署 AI 旅遊顧問到 Hugging Face Spaces..."

# 顏色定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 檢查必要文件
echo "📋 檢查必要文件..."

required_files=("app.py" "requirements.txt" "README-HuggingFace.md")
missing_files=()

for file in "${required_files[@]}"; do
    if [ ! -f "$file" ]; then
        missing_files+=("$file")
    fi
done

if [ ${#missing_files[@]} -ne 0 ]; then
    echo -e "${RED}❌ 缺少必要文件:${NC}"
    for file in "${missing_files[@]}"; do
        echo -e "   - ${YELLOW}$file${NC}"
    done
    echo -e "${RED}請確保所有必要文件都存在後再執行部署。${NC}"
    exit 1
fi

echo -e "${GREEN}✅ 所有必要文件檢查完成${NC}"

# 顯示部署信息
echo ""
echo -e "${BLUE}📚 部署信息:${NC}"
echo "   - 應用名稱: AI 旅遊顧問"
echo "   - 模型: Qwen 2.5 7B Instruct"
echo "   - 框架: Gradio"
echo "   - 語言: 繁體中文"
echo "   - 費用: 完全免費"

echo ""
echo -e "${YELLOW}⚠️  重要提醒:${NC}"
echo "   1. 您需要先註冊 Hugging Face 帳號"
echo "   2. 確保有足夠的磁盤空間 (至少 20GB)"
echo "   3. 首次部署可能需要 5-10 分鐘"

echo ""
echo -e "${BLUE}🚀 部署步驟:${NC}"
echo "   1. 前往 https://huggingface.co/spaces"
echo "   2. 點擊 'Create new Space'"
echo "   3. 選擇 'Gradio SDK'"
echo "   4. 填寫 Space 信息"
echo "   5. 上傳以下文件:"
echo "      - app.py"
echo "      - requirements.txt"
echo "      - README-HuggingFace.md"

echo ""
echo -e "${GREEN}📁 準備上傳的文件:${NC}"
ls -la *.py *.txt README-HuggingFace.md 2>/dev/null | grep -E "\.(py|txt|md)$"

echo ""
echo -e "${BLUE}🔧 可選的優化步驟:${NC}"
echo "   1. 連接 GitHub 倉庫自動部署"
echo "   2. 設置自定義域名"
echo "   3. 配置環境變量"
echo "   4. 添加監控和日誌"

echo ""
echo -e "${YELLOW}💡 部署完成後:${NC}"
echo "   1. 您會得到一個公網 URL"
echo "   2. 任何人都可以訪問您的 AI 旅遊顧問"
echo "   3. 完全免費，無使用限制"
echo "   4. 自動擴展，無需維護"

echo ""
echo -e "${GREEN}🎉 準備開始部署了嗎？${NC}"
echo "請按照上述步驟在 Hugging Face 上創建您的 Space！"

# 檢查是否安裝了 git
if command -v git &> /dev/null; then
    echo ""
    echo -e "${BLUE}🔗 如果您想連接 GitHub 自動部署:${NC}"
    echo "   1. 將這些文件推送到 GitHub 倉庫"
    echo "   2. 在 Hugging Face Space 中選擇 'Repository'"
    echo "   3. 輸入您的 GitHub 倉庫 URL"
    echo "   4. 自動同步和部署"
fi

echo ""
echo -e "${GREEN}✅ 部署腳本執行完成！${NC}"
echo -e "${BLUE}📖 詳細說明請查看: README-HuggingFace.md${NC}"
echo ""
echo -e "${YELLOW}🚀 立即前往 Hugging Face 開始部署吧！${NC}"
echo "   https://huggingface.co/spaces"
