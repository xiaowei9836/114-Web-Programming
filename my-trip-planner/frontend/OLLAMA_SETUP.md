# Ollama 本地 AI 模型安裝指南

## 🚀 什麼是 Ollama？

Ollama 是一個開源的本地大語言模型運行平台，讓您可以在自己的電腦上運行各種 AI 模型，**完全免費**，不需要網路連接或 API Key。

## 📥 安裝 Ollama

### macOS
```bash
# 使用 Homebrew 安裝
brew install ollama

# 或者下載官方安裝包
# 前往 https://ollama.ai/download/mac
```

### Windows
```bash
# 下載官方安裝包
# 前往 https://ollama.ai/download/windows
```

### Linux
```bash
# 使用官方安裝腳本
curl -fsSL https://ollama.ai/install.sh | sh
```

## 🎯 推薦模型

### 1. **Llama 3.1 (推薦)**
```bash
# 下載 8B 參數版本 (約 4.7GB)
ollama pull llama3.1:8b

# 下載 70B 參數版本 (約 40GB，需要更多記憶體)
ollama pull llama3.1:70b
```

### 2. **Mistral (輕量級)**
```bash
# 下載 7B 參數版本 (約 4.1GB)
ollama pull mistral:7b
```

### 3. **CodeLlama (程式碼專用)**
```bash
# 下載 7B 參數版本
ollama pull codellama:7b
```

### 4. **中文優化模型**
```bash
# Qwen (通義千問) - 中文支援良好
ollama pull qwen:7b

# Chinese-Llama-2 - 專門針對中文優化
ollama pull chinese-llama-2:7b
```

## ⚡ 快速開始

### 1. 啟動 Ollama 服務
```bash
# 啟動 Ollama 服務
ollama serve
```

### 2. 測試模型
```bash
# 在新的終端視窗中測試
ollama run llama3.1:8b
```

### 3. 在網頁中使用
- 啟動您的網頁應用
- 點擊 "AI諮詢" 按鈕
- 在設置中選擇 "Ollama (本地)"
- 開始與 AI 對話！

## 🔧 配置選項

### 環境變數設置
在 `.env.local` 文件中添加：

```bash
# Ollama 配置
VITE_OLLAMA_BASE_URL=http://localhost:11434
VITE_OLLAMA_MODEL=llama3.1:8b
```

### 自定義模型參數
```bash
# 創建自定義模型配置
ollama create my-travel-advisor -f Modelfile

# Modelfile 內容示例：
FROM llama3.1:8b
PARAMETER temperature 0.7
PARAMETER top_p 0.9
PARAMETER top_k 40
SYSTEM "你是一位專業的台灣旅遊顧問..."
```

## 💡 使用技巧

### 1. **記憶體管理**
- 8B 模型需要約 8GB RAM
- 70B 模型需要約 40GB RAM
- 建議關閉其他應用程式以釋放記憶體

### 2. **回應品質**
- 較大的模型 (70B) 提供更好的回應品質
- 較小的模型 (8B) 回應更快但品質稍低
- 可以根據需求選擇合適的模型

### 3. **離線使用**
- Ollama 完全離線運行
- 不需要網路連接
- 保護您的隱私和資料安全

## 🐛 常見問題

### Q: Ollama 啟動失敗
A: 檢查是否有其他服務佔用 11434 端口：
```bash
# macOS/Linux
lsof -i :11434

# Windows
netstat -an | findstr 11434
```

### Q: 模型下載很慢
A: 使用國內鏡像源：
```bash
# 設置環境變數
export OLLAMA_HOST=https://mirror.ghproxy.com/https://github.com/ollama/ollama/releases
```

### Q: 回應速度慢
A: 
- 使用較小的模型 (8B 而非 70B)
- 關閉其他應用程式釋放記憶體
- 檢查電腦性能是否足夠

### Q: 中文回應不理想
A: 使用專門的中文模型：
```bash
ollama pull qwen:7b
ollama pull chinese-llama-2:7b
```

## 🔍 進階配置

### 1. **多模型管理**
```bash
# 列出已安裝的模型
ollama list

# 刪除不需要的模型
ollama rm model_name

# 複製模型
ollama cp source_model new_model
```

### 2. **性能優化**
```bash
# 設置 GPU 加速 (如果支援)
export OLLAMA_GPU_LAYERS=35

# 設置 CPU 核心數
export OLLAMA_NUM_PARALLEL=4
```

### 3. **自定義提示詞**
```bash
# 創建旅遊顧問專用模型
ollama create travel-advisor -f Modelfile

# Modelfile 內容：
FROM llama3.1:8b
SYSTEM "你是一位專業的台灣旅遊顧問，專門提供旅遊規劃、景點推薦、預算管理等服務。請用繁體中文回答，提供實用、具體的建議。"
PARAMETER temperature 0.7
PARAMETER top_p 0.9
```

## 📊 性能比較

| 模型 | 大小 | 記憶體需求 | 回應速度 | 品質 |
|------|------|------------|----------|------|
| llama3.1:8b | 4.7GB | 8GB RAM | 快 | 良好 |
| llama3.1:70b | 40GB | 40GB RAM | 慢 | 優秀 |
| mistral:7b | 4.1GB | 8GB RAM | 快 | 良好 |
| qwen:7b | 4.1GB | 8GB RAM | 快 | 優秀 |

## 🎉 開始使用

1. **安裝 Ollama**
2. **下載推薦模型**
3. **啟動服務**
4. **在網頁中選擇 Ollama 提供者**
5. **開始享受免費的 AI 旅遊顧問服務！**

---

**優勢總結：**
- ✅ 完全免費
- ✅ 本地運行，保護隱私
- ✅ 不需要網路連接
- ✅ 支援多種模型
- ✅ 可自定義和優化
- ✅ 無使用限制

**推薦給：**
- 注重隱私的用戶
- 想要免費 AI 服務的用戶
- 有本地部署需求的開發者
- 需要離線 AI 功能的用戶
