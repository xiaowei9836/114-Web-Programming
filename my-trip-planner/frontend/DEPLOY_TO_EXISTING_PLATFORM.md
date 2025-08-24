# 🚀 部署 Qwen AI 到現有前後端平台

## 🎯 **目標**
將 Qwen AI 旅遊顧問整合到您現有的旅行規劃網頁應用中，讓所有使用者都能享受免費的 AI 服務。

## 🌟 **部署方案選擇**

### **方案 1: 前端部署 (推薦 - 最簡單)**

#### **優點**
- ✅ **即時生效**: 修改後立即可用
- ✅ **無需後端**: 直接使用 Hugging Face API
- ✅ **免費使用**: 無需額外伺服器成本
- ✅ **全球可用**: 任何地區都能訪問

#### **適用場景**
- 現有前端已部署 (Vercel, Netlify, GitHub Pages)
- 想要快速啟用 AI 功能
- 預算有限，希望免費使用

### **方案 2: 後端部署 (推薦 - 更穩定)**

#### **優點**
- ✅ **更穩定**: 後端控制 AI 服務
- ✅ **更安全**: API Key 不會暴露給前端
- ✅ **更靈活**: 可以添加緩存、日誌等功能
- ✅ **更專業**: 企業級部署方案

#### **適用場景**
- 有現有後端服務
- 需要企業級穩定性
- 需要自定義 AI 邏輯

### **方案 3: 混合部署 (推薦 - 最佳平衡)**

#### **優點**
- ✅ **靈活切換**: 前端/後端 AI 服務可切換
- ✅ **故障轉移**: 一個服務故障時自動切換
- ✅ **性能優化**: 根據需求選擇最佳服務
- ✅ **成本控制**: 平衡免費和付費服務

#### **適用場景**
- 需要高可用性
- 有多個 AI 服務選擇
- 希望優化成本和性能

## 🚀 **方案 1: 前端部署 (5分鐘完成)**

### **步驟 1: 獲取 Hugging Face API Key**

1. **註冊帳號**: [Hugging Face](https://huggingface.co/join)
2. **創建 Token**: [Settings > Tokens](https://huggingface.co/settings/tokens)
3. **選擇權限**: 選擇 "Read" 權限
4. **複製 Key**: 複製生成的 API Key

### **步驟 2: 配置環境變數**

#### **Vercel 部署**
1. 在 Vercel 項目設置中添加環境變數：
   ```
   VITE_HUGGINGFACE_API_KEY=hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   VITE_HUGGINGFACE_MODEL=Qwen/Qwen2.5-7B-Instruct
   ```

2. 重新部署項目

#### **Netlify 部署**
1. 在 Netlify 項目設置中添加環境變數
2. 重新部署項目

#### **GitHub Pages 部署**
1. 在 GitHub 倉庫設置中添加 Secrets
2. 更新 GitHub Actions 工作流程

### **步驟 3: 測試部署**

1. 訪問您的網站
2. 點擊 "AI諮詢" 按鈕
3. 測試提問：`我想去日本東京旅遊5天，請幫我規劃`

## 🖥️ **方案 2: 後端部署 (15分鐘完成)**

### **步驟 1: 更新後端代碼**

#### **安裝依賴**
```bash
cd backend
npm install axios
```

#### **創建 AI 服務**
```typescript
// backend/src/services/aiService.ts
import axios from 'axios';

export class AIService {
  private apiKey: string;
  private model: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = process.env.HUGGINGFACE_API_KEY || '';
    this.model = process.env.HUGGINGFACE_MODEL || 'Qwen/Qwen2.5-7B-Instruct';
    this.baseUrl = 'https://api-inference.huggingface.co';
  }

  async generateResponse(prompt: string): Promise<string> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/models/${this.model}`,
        {
          inputs: prompt,
          parameters: {
            max_new_tokens: 6000,
            temperature: 0.7,
            do_sample: true,
            return_full_text: false,
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 60000,
        }
      );

      return response.data[0].generated_text;
    } catch (error) {
      console.error('AI 服務錯誤:', error);
      throw new Error('AI 回應生成失敗');
    }
  }
}
```

#### **創建 AI 路由**
```typescript
// backend/src/routes/aiRoutes.ts
import express from 'express';
import { AIService } from '../services/aiService';

const router = express.Router();
const aiService = new AIService();

router.post('/chat', async (req, res) => {
  try {
    const { message, history } = req.body;
    
    // 構建完整提示詞
    const prompt = buildPrompt(message, history);
    
    // 生成 AI 回應
    const response = await aiService.generateResponse(prompt);
    
    res.json({ response });
  } catch (error) {
    res.status(500).json({ error: 'AI 服務暫時不可用' });
  }
});

function buildPrompt(message: string, history: any[]): string {
  const systemPrompt = `你是一位專業的AI旅遊顧問...`;
  // 構建完整提示詞邏輯
  return `${systemPrompt}\n\n用戶: ${message}\n助手:`;
}

export default router;
```

#### **更新主服務器**
```typescript
// backend/src/server.ts
import aiRoutes from './routes/aiRoutes';

// ... 其他代碼 ...

app.use('/api/ai', aiRoutes);
```

### **步驟 2: 配置環境變數**

#### **後端 .env 文件**
```bash
# AI 服務配置
HUGGINGFACE_API_KEY=hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
HUGGINGFACE_MODEL=Qwen/Qwen2.5-7B-Instruct
```

### **步驟 3: 更新前端配置**

#### **更新 ai-providers.ts**
```typescript
// 添加後端 AI 提供者
class BackendAIProvider implements AIProvider {
  name = '後端 AI 服務';
  type = 'backend' as const;
  isLocal = false;

  async sendMessage(message: string, history: Message[]): Promise<string> {
    const response = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, history })
    });

    if (!response.ok) {
      throw new Error('後端 AI 服務暫時不可用');
    }

    const data = await response.json();
    return data.response;
  }

  isConfigured(): boolean {
    return true; // 後端服務總是可用的
  }
}
```

### **步驟 4: 部署後端**

#### **本地部署**
```bash
cd backend
npm run build
npm start
```

#### **雲端部署**
- **Render**: 使用 `render.yaml` 配置
- **Railway**: 連接 GitHub 自動部署
- **Heroku**: 使用 Procfile 配置

## 🔄 **方案 3: 混合部署 (最佳平衡)**

### **配置多個 AI 提供者**

```typescript
// 智能選擇最佳 AI 提供者
async getBestProvider(): Promise<AIProvider> {
  const available = this.getAvailableProviders();
  
  // 優先順序：後端 > 本地 Ollama > Hugging Face > 模擬回應
  for (const provider of available) {
    try {
      if (provider.isAvailable && await provider.isAvailable()) {
        console.log(`選擇 AI 提供者: ${provider.name}`);
        return provider;
      }
    } catch (error) {
      console.error(`檢查 ${provider.name} 可用性時出錯:`, error);
      continue;
    }
  }
  
  return new MockProvider();
}
```

## 🌐 **部署到現有平台**

### **Vercel 部署**

1. **連接 GitHub 倉庫**
2. **配置環境變數**:
   ```
   VITE_HUGGINGFACE_API_KEY=hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   VITE_HUGGINGFACE_MODEL=Qwen/Qwen2.5-7B-Instruct
   ```
3. **自動部署**

### **Netlify 部署**

1. **連接 GitHub 倉庫**
2. **配置環境變數**
3. **設置構建命令**: `npm run build`
4. **設置發布目錄**: `dist`

### **GitHub Pages 部署**

1. **創建 GitHub Actions 工作流程**
2. **配置環境變數**
3. **自動構建和部署**

## 🔧 **性能優化**

### **前端優化**

1. **回應緩存**: 緩存相同問題的回應
2. **流式回應**: 實時顯示 AI 回應
3. **錯誤處理**: 優雅的錯誤處理和重試

### **後端優化**

1. **回應緩存**: Redis 緩存常用回應
2. **負載均衡**: 多個 AI 服務實例
3. **監控告警**: 服務狀態監控

## 📊 **監控和日誌**

### **前端監控**

```typescript
// 記錄 AI 使用統計
const logAIUsage = (provider: string, question: string, responseTime: number) => {
  console.log(`AI 使用記錄: ${provider}, 問題: ${question}, 回應時間: ${responseTime}ms`);
};
```

### **後端監控**

```typescript
// 記錄 AI 服務性能
const logAIPerformance = (model: string, responseTime: number, success: boolean) => {
  console.log(`AI 性能: ${model}, 回應時間: ${responseTime}ms, 成功: ${success}`);
};
```

## 🚨 **故障排除**

### **常見問題**

1. **API Key 無效**
   - 檢查環境變數配置
   - 確認 API Key 權限

2. **模型載入失敗**
   - 檢查模型名稱
   - 確認模型訪問權限

3. **回應超時**
   - 增加超時時間
   - 檢查網路連接

4. **免費額度用完**
   - 等待下個月重置
   - 升級到付費計劃

## 🎉 **部署完成檢查清單**

- [ ] 環境變數配置完成
- [ ] 代碼構建成功
- [ ] 前端部署完成
- [ ] 後端部署完成 (如果選擇)
- [ ] AI 功能測試通過
- [ ] 性能監控設置
- [ ] 錯誤處理完善

## 💡 **最佳實踐建議**

1. **漸進式部署**: 先在測試環境驗證
2. **監控設置**: 設置性能監控和告警
3. **備份方案**: 準備多個 AI 服務備選
4. **用戶反饋**: 收集用戶使用反饋並改進

## 🌟 **立即開始部署**

1. **選擇部署方案**: 前端、後端或混合
2. **配置環境變數**: 設置 Hugging Face API Key
3. **部署代碼**: 部署到現有平台
4. **測試驗證**: 測試 AI 功能
5. **監控優化**: 設置監控和優化

**讓您的旅行規劃網站立即擁有專業的 AI 旅遊顧問！** ✨

---

**需要幫助？** 查看相關文檔或聯繫技術支援。
