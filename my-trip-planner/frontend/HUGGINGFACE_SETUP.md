# 🚀 Hugging Face 雲端 AI 設置指南

## 🎯 **為什麼選擇 Hugging Face？**

### ✅ **優勢**
- **無需本地硬體** - 模型運行在雲端
- **免費額度** - 每月有免費 API 調用
- **即開即用** - 5分鐘內完成設置
- **穩定可靠** - 企業級雲端服務
- **全球 CDN** - 台灣使用者快速訪問

### 💰 **成本**
- **免費層**: 每月 30,000 次 API 調用
- **付費層**: $9/月起，無限制調用
- **適合**: 個人使用、小型應用、測試階段

## 🔑 **步驟 1: 獲取 API Key**

### 1. **註冊/登入 Hugging Face**
```
前往: https://huggingface.co/join
或直接登入: https://huggingface.co/login
```

### 2. **創建 API Token**
```
1. 點擊右上角頭像
2. 選擇 "Settings"
3. 左側選單點擊 "Access Tokens"
4. 點擊 "New token"
5. 輸入名稱: "Trip Planner AI"
6. 選擇權限: "Read"
7. 點擊 "Generate token"
8. 複製生成的 token (以 hf_ 開頭)
```

### 3. **保存 Token**
```
重要: Token 只顯示一次！
請立即複製並保存到安全的地方
```

## ⚙️ **步驟 2: 配置環境變數**

### 1. **更新 .env 文件**
```bash
# 在專案根目錄的 .env 文件中
# 將 hf_your_token_here 替換為您的真實 token

VITE_HUGGINGFACE_API_KEY=hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
VITE_HUGGINGFACE_MODEL=Qwen/Qwen2-7B-Instruct
```

### 2. **驗證配置**
```bash
# 檢查 .env 文件內容
cat .env

# 應該看到類似內容:
# VITE_API_BASE_URL=http://localhost:5001
# VITE_GOOGLE_MAPS_API_KEY=AIzaSyB...
# 
# # AI 提供者配置
# VITE_HUGGINGFACE_API_KEY=hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
# VITE_HUGGINGFACE_MODEL=Qwen/Qwen2-7B-Instruct
```

## 🚀 **步驟 3: 啟動服務**

### 1. **重啟開發伺服器**
```bash
# 如果正在運行，先停止 (Ctrl+C)
# 然後重新啟動
npm run dev
```

### 2. **驗證 AI 諮詢功能**
```
1. 打開瀏覽器，前往您的應用
2. 點擊 "AI諮詢" 按鈕
3. 在設置中應該看到 "Hugging Face" 提供者
4. 狀態應該顯示為 "可用"
5. 開始測試對話
```

## 🧪 **測試 AI 功能**

### **測試對話示例**
```
用戶: "我想去台北旅遊3天，預算5000元，有什麼建議？"

AI 應該回應:
- 景點推薦
- 行程安排
- 預算分配
- 交通建議
- 美食推薦
```

### **如果遇到問題**
```
1. 檢查 API Key 是否正確
2. 確認 .env 文件已保存
3. 重啟開發伺服器
4. 檢查瀏覽器控制台錯誤訊息
```

## 🔧 **進階配置**

### **切換不同模型**
```bash
# 在 .env 文件中更改模型
VITE_HUGGINGFACE_MODEL=meta-llama/Llama-3.1-8B-Instruct  # Llama 3.1
VITE_HUGGINGFACE_MODEL=mistralai/Mistral-7B-Instruct-v0.2  # Mistral
VITE_HUGGINGFACE_MODEL=Qwen/Qwen2-72B-Instruct            # Qwen 72B
```

### **多提供者配置**
```bash
# 同時配置多個 AI 提供者
VITE_HUGGINGFACE_API_KEY=hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
VITE_HUGGINGFACE_MODEL=Qwen/Qwen2-7B-Instruct

VITE_OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
VITE_OPENAI_MODEL=gpt-3.5-turbo

# 系統會自動選擇最佳可用的提供者
```

## 📊 **使用量監控**

### **免費額度追蹤**
```
1. 前往 https://huggingface.co/settings/billing
2. 查看 "API Usage" 部分
3. 監控每月使用量
4. 接近限制時考慮升級
```

### **API 調用統計**
```
- 每次對話約 1-3 次 API 調用
- 免費額度 30,000 次/月
- 約等於 10,000-30,000 次對話/月
- 足夠個人和小型應用使用
```

## 🆘 **常見問題**

### **Q: API Key 無效？**
```
A: 檢查 token 是否以 hf_ 開頭，是否完整複製
```

### **Q: 模型無法載入？**
```
A: 確認模型名稱拼寫正確，檢查網路連接
```

### **Q: 回應速度慢？**
```
A: 這是正常現象，雲端模型需要時間處理
```

### **Q: 免費額度用完？**
```
A: 可以升級到付費計劃，或切換到本地 Ollama
```

## 🎉 **完成！**

恭喜！您現在已經成功配置了 Hugging Face 雲端 AI 服務。

### **下一步**
1. **測試對話** - 嘗試各種旅遊諮詢問題
2. **優化提示詞** - 調整系統提示以獲得更好的回應
3. **用戶反饋** - 收集使用者對 AI 諮詢的意見
4. **模型調整** - 根據需求切換不同的模型

### **享受您的 AI 旅遊顧問！** 🚀✈️

---

**提示**: 記得定期檢查 API 使用量，確保不超過免費額度限制。
