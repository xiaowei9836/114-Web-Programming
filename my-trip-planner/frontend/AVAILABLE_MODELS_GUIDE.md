# 🤖 可用開源模型指南

## ❌ 不存在的模型

您提到的 `gpt-oss-120b` 和 `gpt-oss-20b` **不是真實存在的開源模型**。這些名稱可能是：
- 混淆或誤解的名稱
- 不準確的資訊來源
- 假想的模型名稱

## ✅ **真實可用的優秀開源模型**

### 🥇 **推薦模型 (中文支援佳)**

#### 1. **Qwen (通義千問) - 阿里巴巴**
```bash
# Ollama 使用
ollama pull qwen:7b     # 7B 參數，中文優化
ollama pull qwen:14b    # 14B 參數，更強性能
ollama pull qwen:72b    # 72B 參數，最佳品質

# Hugging Face 使用
Qwen/Qwen2-7B-Instruct
Qwen/Qwen2-72B-Instruct
```

**優點**：
- ✅ 中文支援優秀
- ✅ 推理速度快
- ✅ 指令跟隨能力強
- ✅ 適合繁體中文

#### 2. **Meta Llama 3.1 - Meta**
```bash
# Ollama 使用
ollama pull llama3.1:8b     # 8B 參數
ollama pull llama3.1:70b    # 70B 參數
ollama pull llama3.1:405b   # 405B 參數 (最大)

# Hugging Face 使用
meta-llama/Llama-3.1-8B-Instruct
meta-llama/Llama-3.1-70B-Instruct
```

**優點**：
- ✅ 最新技術
- ✅ 多語言支援
- ✅ 推理能力強
- ✅ 開源社群活躍

#### 3. **Mistral 系列 - Mistral AI**
```bash
# Ollama 使用
ollama pull mistral:7b      # 7B 參數
ollama pull mixtral:8x7b    # 8x7B 專家混合模型

# Hugging Face 使用
mistralai/Mistral-7B-Instruct-v0.2
mistralai/Mixtral-8x7B-Instruct-v0.1
```

**優點**：
- ✅ 效率極高
- ✅ 部署簡單
- ✅ 商業友好授權
- ✅ 多語言支援

## 📊 **模型比較表**

| 模型 | 參數量 | 記憶體需求 | 中文支援 | 推理速度 | 整體品質 |
|------|--------|------------|----------|----------|----------|
| **Qwen 7B** | 7B | 8GB | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Llama 3.1 8B** | 8B | 8GB | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Mistral 7B** | 7B | 8GB | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Qwen 14B** | 14B | 16GB | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Llama 3.1 70B** | 70B | 40GB | ⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐⭐ |

## 🎯 **使用建議**

### 🏠 **本地使用 (Ollama)**

#### 輕量級設備 (8GB RAM)
```bash
# 最佳選擇
ollama pull qwen:7b

# 備選方案
ollama pull llama3.1:8b
ollama pull mistral:7b
```

#### 中等設備 (16GB RAM)
```bash
# 推薦
ollama pull qwen:14b
ollama pull llama3.1:8b
```

#### 高端設備 (32GB+ RAM)
```bash
# 最佳體驗
ollama pull llama3.1:70b
ollama pull qwen:72b
ollama pull mixtral:8x7b
```

### ☁️ **雲端使用 (Hugging Face)**

#### 免費額度使用
```bash
# 推薦順序
VITE_HUGGINGFACE_MODEL=Qwen/Qwen2-7B-Instruct          # 中文最佳
VITE_HUGGINGFACE_MODEL=meta-llama/Llama-3.1-8B-Instruct # 通用最佳
VITE_HUGGINGFACE_MODEL=mistralai/Mistral-7B-Instruct-v0.2 # 效率最佳
```

## 🛠 **如何切換模型**

### 1. **本地 Ollama**
```bash
# 下載新模型
ollama pull qwen:7b

# 更新環境變數
echo "VITE_OLLAMA_MODEL=qwen:7b" >> .env.local

# 重啟服務
npm run dev
```

### 2. **Hugging Face**
```bash
# 更新環境變數
echo "VITE_HUGGINGFACE_MODEL=Qwen/Qwen2-7B-Instruct" >> .env.local

# 重啟服務
npm run dev
```

### 3. **在網頁中切換**
- 點擊 AI 諮詢按鈕
- 進入設置選項
- 選擇不同的提供者和模型
- 即時切換，無需重啟

## 🌟 **特別推薦組合**

### 🎯 **旅遊顧問最佳配置**
```bash
# 主要：中文優化
VITE_OLLAMA_MODEL=qwen:7b
VITE_HUGGINGFACE_MODEL=Qwen/Qwen2-7B-Instruct

# 備選：通用能力
VITE_OLLAMA_MODEL=llama3.1:8b
VITE_HUGGINGFACE_MODEL=meta-llama/Llama-3.1-8B-Instruct
```

### 💰 **免費最佳方案**
```bash
# 本地免費
ollama pull qwen:7b

# 雲端免費
VITE_HUGGINGFACE_MODEL=Qwen/Qwen2-7B-Instruct
```

### 🚀 **性能最佳方案**
```bash
# 如果硬體允許
ollama pull llama3.1:70b
ollama pull qwen:72b
```

## 🔍 **模型詳細資訊**

### **Qwen (通義千問)**
- **開發者**: 阿里巴巴
- **特點**: 中文優化，多模態支援
- **授權**: Apache 2.0
- **下載**: [Ollama](https://ollama.ai/library/qwen), [Hugging Face](https://huggingface.co/Qwen)

### **Llama 3.1**
- **開發者**: Meta
- **特點**: 最新架構，強大推理能力
- **授權**: Llama 3.1 Community License
- **下載**: [Ollama](https://ollama.ai/library/llama3.1), [Hugging Face](https://huggingface.co/meta-llama)

### **Mistral**
- **開發者**: Mistral AI
- **特點**: 高效率，商業友好
- **授權**: Apache 2.0
- **下載**: [Ollama](https://ollama.ai/library/mistral), [Hugging Face](https://huggingface.co/mistralai)

## 🆘 **如何選擇？**

### 💭 **考慮因素**
1. **主要語言**: 中文 → Qwen，多語言 → Llama 3.1
2. **硬體配置**: 8GB RAM → 7B 模型，16GB+ → 14B+ 模型
3. **使用場景**: 對話 → Qwen，推理 → Llama 3.1，效率 → Mistral
4. **部署方式**: 本地 → Ollama，雲端 → Hugging Face

### 🎯 **我的建議**
對於您的旅遊顧問應用：
1. **首選**: Qwen 7B (中文支援最佳)
2. **備選**: Llama 3.1 8B (綜合能力強)
3. **輕量**: Mistral 7B (效率最高)

---

**記住：沒有完美的模型，只有最適合您需求的模型！** 🎯

您可以根據實際使用情況和用戶反饋來調整模型選擇。
