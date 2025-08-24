// AI 提供者配置
export interface AIProvider {
  name: string;
  type: 'ollama' | 'huggingface' | 'openai';
  isConfigured: () => boolean;
  sendMessage: (message: string, history: Message[]) => Promise<string>;
  getModels?: () => Promise<string[]>;
  isLocal?: boolean; // 新增：是否為本地服務
  isAvailable?: () => Promise<boolean>; // 新增：檢查服務是否可用
}

export interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

// Ollama 配置
export const OLLAMA_CONFIG = {
  BASE_URL: import.meta.env.VITE_OLLAMA_BASE_URL || 'https://ollama-ai-travel.onrender.com',
  DEFAULT_MODEL: import.meta.env.VITE_OLLAMA_MODEL || 'llama2:7b',
  TIMEOUT: 120000, // 增加到 120 秒超時 (2分鐘)
  // 新增：雲端部署支援
  CLOUD_URL: import.meta.env.VITE_OLLAMA_CLOUD_URL || '',
  IS_CLOUD: import.meta.env.VITE_OLLAMA_CLOUD_URL ? true : false,
  // 可用模型列表
  AVAILABLE_MODELS: [
    'llama3.1:8b',      // Meta Llama 3.1 8B
    'llama3.1:70b',     // Meta Llama 3.1 70B  
    'qwen:7b',          // 阿里通義千問 7B
    'qwen:14b',         // 阿里通義千問 14B
    'mistral:7b',       // Mistral 7B
    'mixtral:8x7b',     // Mixtral 8x7B
    'gemma:7b',         // Google Gemma 7B
    'phi3:mini',        // Microsoft Phi-3 Mini
    'chatglm3:6b',      // 清華 ChatGLM3 6B
  ]
};

// Hugging Face 配置
export const HUGGINGFACE_CONFIG = {
  API_KEY: import.meta.env.VITE_HUGGINGFACE_API_KEY || '',
  BASE_URL: 'https://api-inference.huggingface.co',
  DEFAULT_MODEL: import.meta.env.VITE_HUGGINGFACE_MODEL || 'Qwen/Qwen2.5-7B-Instruct',
  TIMEOUT: 60000, // 增加到 60 秒，Qwen 模型需要更多時間
  // 可用模型列表 - 優先推薦 Qwen 系列
  AVAILABLE_MODELS: [
    'Qwen/Qwen2.5-7B-Instruct',           // 🆕 阿里通義千問 2.5 7B (推薦)
    'Qwen/Qwen2.5-14B-Instruct',          // 🆕 阿里通義千問 2.5 14B
    'Qwen/Qwen2.5-32B-Instruct',          // 🆕 阿里通義千問 2.5 32B
    'Qwen/Qwen2.5-72B-Instruct',          // 🆕 阿里通義千問 2.5 72B
    'Qwen/Qwen2-7B-Instruct',             // 阿里通義千問 2.0 7B
    'Qwen/Qwen2-14B-Instruct',            // 阿里通義千問 2.0 14B
    'Qwen/Qwen2-72B-Instruct',            // 阿里通義千問 2.0 72B
    'meta-llama/Llama-3.1-8B-Instruct',   // Meta Llama 3.1 8B
    'mistralai/Mistral-7B-Instruct-v0.2', // Mistral 7B v0.2
    'google/gemma-7b-it',                  // Google Gemma 7B
    'microsoft/Phi-3-mini-4k-instruct',   // Microsoft Phi-3 Mini
    'HuggingFaceH4/zephyr-7b-beta',       // Zephyr 7B Beta
    'tiiuae/falcon-7b-instruct',          // Falcon 7B
  ]
};

// OpenAI 開源模型配置 (通過 Hugging Face)
export const OPENAI_OSS_CONFIG = {
  API_KEY: import.meta.env.VITE_OPENAI_API_KEY || '',
  BASE_URL: 'https://api.openai.com',
  DEFAULT_MODEL: import.meta.env.VITE_OPENAI_MODEL || 'gpt-3.5-turbo',
  TIMEOUT: 30000,
};

// 旅遊系統提示詞
export const TRAVEL_SYSTEM_PROMPT = `你是一位專業的台灣旅遊顧問，擁有豐富的旅遊規劃經驗。你的主要職責是：

1. **旅遊路線規劃**：根據用戶需求制定合理的旅遊行程
2. **預算管理建議**：提供實用的預算分配和節省技巧
3. **景點推薦**：推薦適合的景點和活動
4. **交通建議**：提供最佳的交通方式和路線
5. **住宿建議**：推薦合適的住宿選擇
6. **季節性建議**：根據不同季節提供旅遊建議

請用繁體中文回答，提供實用、具體的建議。回答要結構化，使用表情符號和項目符號讓內容更易讀。

**重要：** 當用戶詢問旅遊規劃時，請提供完整、詳細的回答，包括：
- 完整的行程安排（時間、地點、活動）
- 具體的交通建議和費用
- 實用的旅遊小貼士
- 預算分配建議
- 季節性注意事項

不要因為字數限制而截斷回答，確保提供完整的旅遊建議。

如果用戶的問題超出旅遊範圍，請禮貌地引導回旅遊相關話題。`;

// Ollama 提供者
export class OllamaProvider implements AIProvider {
  name = 'Ollama (llama2:7b)';
  type = 'ollama' as const;
  isLocal = true;

  isConfigured(): boolean {
    return true; // Ollama 總是可用的（如果本地運行）
  }

  async isAvailable(): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(`${OLLAMA_CONFIG.BASE_URL}/api/tags`, {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      return response.ok;
    } catch (error) {
      console.log('Ollama 可用性檢查失敗:', error);
      return false;
    }
  }

  async sendMessage(message: string, history: Message[]): Promise<string> {
    try {
      // 預載入模型以減少回應延遲
      await this.preloadModel();
      
      const messages = [
        { role: 'system', content: TRAVEL_SYSTEM_PROMPT },
        ...history,
        { role: 'user', content: message }
      ];

      // 創建 AbortController 來處理超時
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), OLLAMA_CONFIG.TIMEOUT);

      const response = await fetch(`${OLLAMA_CONFIG.BASE_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: OLLAMA_CONFIG.DEFAULT_MODEL,
          messages: messages,
          stream: false,
          options: {
            temperature: 0.7,
            top_p: 0.9,
            top_k: 40,
            repeat_penalty: 1.1,
            num_predict: 8192, // 大幅增加回應長度限制，支持超長詳細回答
            num_ctx: 8192,     // 大幅增加上下文長度，支持完整對話
            seed: 42,          // 固定種子以增加一致性
          }
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Ollama API 錯誤: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.message?.content || '抱歉，我無法生成回應。';
    } catch (error) {
      console.error('Ollama 錯誤:', error);
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error(`Ollama 回應超時 (${OLLAMA_CONFIG.TIMEOUT / 1000}秒)，請稍後再試。\n\n建議：\n1. 檢查系統資源是否充足\n2. 嘗試使用較小的模型 (如 gpt-oss:20b)\n3. 重新啟動 Ollama 服務`);
        } else if (error.message.includes('API 錯誤')) {
          throw new Error(`Ollama API 錯誤: ${error.message}`);
        } else if (error.message.includes('fetch')) {
          throw new Error('無法連接到 Ollama 服務，請檢查服務是否正在運行。');
        }
      }
      
      throw new Error(`Ollama 錯誤: ${error instanceof Error ? error.message : '未知錯誤'}`);
    }
  }

  async preloadModel(): Promise<void> {
    try {
      // 發送一個輕量級的請求來預載入模型
      const response = await fetch(`${OLLAMA_CONFIG.BASE_URL}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: OLLAMA_CONFIG.DEFAULT_MODEL,
          prompt: 'hi',
          stream: false,
          options: {
            num_predict: 1, // 只生成一個 token 來預載入模型
          }
        })
      });
      
      if (response.ok) {
        console.log('模型預載入成功');
      }
    } catch (error) {
      console.log('模型預載入失敗，繼續正常流程:', error);
    }
  }

  async getModels(): Promise<string[]> {
    try {
      const response = await fetch(`${OLLAMA_CONFIG.BASE_URL}/api/tags`);
      if (response.ok) {
        const data = await response.json();
        return data.models?.map((model: any) => model.name) || [];
      }
      return [];
    } catch (error) {
      console.error('獲取 Ollama 模型失敗:', error);
      return [];
    }
  }
}

// Ollama 雲端提供者
export class OllamaCloudProvider implements AIProvider {
  name = 'Ollama (llama2:7b)';
  type = 'ollama' as const;
  isLocal = false;

  isConfigured(): boolean {
    return !!OLLAMA_CONFIG.CLOUD_URL;
  }

  async isAvailable(): Promise<boolean> {
    if (!this.isConfigured()) return false;
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(`${OLLAMA_CONFIG.CLOUD_URL}/api/tags`, {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      return response.ok;
    } catch (error) {
      console.log('Ollama 雲端可用性檢查失敗:', error);
      return false;
    }
  }

  async sendMessage(message: string, history: Message[]): Promise<string> {
    if (!this.isConfigured()) {
      throw new Error('Ollama 雲端服務未配置');
    }

    try {
      const messages = [
        { role: 'system', content: TRAVEL_SYSTEM_PROMPT },
        ...history,
        { role: 'user', content: message }
      ];

      const response = await fetch(`${OLLAMA_CONFIG.CLOUD_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: OLLAMA_CONFIG.DEFAULT_MODEL,
          messages: messages,
          stream: false,
          options: {
            temperature: 0.7,
            top_p: 0.9,
            top_k: 40,
            repeat_penalty: 1.1,
            num_predict: 8192, // 大幅增加回應長度限制，支持超長詳細回答
            num_ctx: 8192,     // 大幅增加上下文長度，支持完整對話
            seed: 42,          // 固定種子以增加一致性
          }
        }),
        signal: AbortSignal.timeout(OLLAMA_CONFIG.TIMEOUT)
      });

      if (!response.ok) {
        throw new Error(`Ollama 雲端 API 錯誤: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.message?.content || '抱歉，我無法生成回應。';
    } catch (error) {
      console.error('Ollama 雲端錯誤:', error);
      throw new Error('Ollama 雲端服務不可用，請稍後再試。');
    }
  }

  async getModels(): Promise<string[]> {
    if (!this.isConfigured()) return [];
    
    try {
      const response = await fetch(`${OLLAMA_CONFIG.CLOUD_URL}/api/tags`);
      if (response.ok) {
        const data = await response.json();
        return data.models?.map((model: any) => model.name) || [];
      }
      return [];
    } catch (error) {
      console.error('獲取 Ollama 雲端模型失敗:', error);
      return [];
    }
  }
}

// Hugging Face 提供者
export class HuggingFaceProvider implements AIProvider {
  name = 'Hugging Face (開源模型)';
  type = 'huggingface' as const;
  isLocal = false;

  isConfigured(): boolean {
    return !!HUGGINGFACE_CONFIG.API_KEY;
  }

  async isAvailable(): Promise<boolean> {
    if (!this.isConfigured()) return false;
    
    try {
      // 測試 API 連接
      const response = await fetch(`${HUGGINGFACE_CONFIG.BASE_URL}/models/${HUGGINGFACE_CONFIG.DEFAULT_MODEL}`, {
        method: 'HEAD',
        headers: {
          'Authorization': `Bearer ${HUGGINGFACE_CONFIG.API_KEY}`,
        },
        signal: AbortSignal.timeout(5000)
      });
      return response.ok;
    } catch (error) {
      console.error('Hugging Face 連接測試失敗:', error);
      return false;
    }
  }

  async sendMessage(message: string, history: Message[]): Promise<string> {
    if (!this.isConfigured()) {
      throw new Error('Hugging Face API Key 未設置');
    }

    try {
      // 簡化歷史記錄，只保留最近的對話
      const recentHistory = history.slice(-4); // 保留最近4條訊息
      const prompt = this.buildPrompt(message, recentHistory);

      // 根據模型類型選擇不同的參數
      const isQwenModel = HUGGINGFACE_CONFIG.DEFAULT_MODEL.includes('Qwen');
      const parameters = {
        max_new_tokens: isQwenModel ? 6000 : 4000, // Qwen 模型支持更長回應
        temperature: 0.7,
        do_sample: true,
        return_full_text: false,
        // Qwen 模型特殊參數
        ...(isQwenModel && {
          top_p: 0.9,
          top_k: 40,
          repetition_penalty: 1.1,
          pad_token_id: 151643, // Qwen 特殊 token
          eos_token_id: 151645, // Qwen 結束 token
        })
      };

      const response = await fetch(`${HUGGINGFACE_CONFIG.BASE_URL}/models/${HUGGINGFACE_CONFIG.DEFAULT_MODEL}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${HUGGINGFACE_CONFIG.API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters
        }),
        signal: AbortSignal.timeout(HUGGINGFACE_CONFIG.TIMEOUT)
      });

      if (!response.ok) {
        throw new Error(`Hugging Face API 錯誤: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return this.parseHuggingFaceResponse(data);
    } catch (error) {
      console.error('Hugging Face 錯誤:', error);
      if (error instanceof Error) {
        throw new Error(`Hugging Face API 錯誤: ${error.message}`);
      }
      throw new Error('Hugging Face API 請求失敗，請稍後再試。');
    }
  }

  private buildPrompt(message: string, history: Message[]): string {
    let prompt = TRAVEL_SYSTEM_PROMPT + '\n\n';
    
    // 添加對話歷史
    history.forEach(msg => {
      prompt += `${msg.role === 'user' ? '用戶' : '助手'}: ${msg.content}\n`;
    });
    
    prompt += `用戶: ${message}\n助手:`;
    return prompt;
  }

  private parseHuggingFaceResponse(data: any): string {
    if (Array.isArray(data) && data.length > 0) {
      return data[0].generated_text || '抱歉，我無法生成回應。';
    }
    return data.generated_text || '抱歉，我無法生成回應。';
  }
}

// OpenAI 開源模型提供者 (通過 Hugging Face)
export class OpenAIOSSProvider implements AIProvider {
  name = 'OpenAI API';
  type = 'openai' as const;
  isLocal = false;

  isConfigured(): boolean {
    return !!OPENAI_OSS_CONFIG.API_KEY;
  }

  async isAvailable(): Promise<boolean> {
    return this.isConfigured();
  }

  async sendMessage(message: string, history: Message[]): Promise<string> {
    if (!this.isConfigured()) {
      throw new Error('OpenAI API Key 未設置');
    }

    try {
      const messages = [
        { role: 'system', content: TRAVEL_SYSTEM_PROMPT },
        ...history,
        { role: 'user', content: message }
      ];

      const response = await fetch(`${OPENAI_OSS_CONFIG.BASE_URL}/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_OSS_CONFIG.API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: OPENAI_OSS_CONFIG.DEFAULT_MODEL,
          messages: messages,
          max_tokens: 1000,
          temperature: 0.7,
        }),
        signal: AbortSignal.timeout(OPENAI_OSS_CONFIG.TIMEOUT)
      });

      if (!response.ok) {
        throw new Error(`OpenAI API 錯誤: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.choices?.[0]?.message?.content || '抱歉，我無法生成回應。';
    } catch (error) {
      console.error('OpenAI 錯誤:', error);
      throw new Error('OpenAI API 請求失敗，請稍後再試。');
    }
  }
}

// 模擬回應提供者 (用於測試)
export class MockProvider implements AIProvider {
  name = '模擬回應 (測試)';
  type = 'ollama' as const;
  isLocal = false;

  isConfigured(): boolean {
    return true;
  }

  async isAvailable(): Promise<boolean> {
    return true;
  }

  async sendMessage(message: string, history: Message[]): Promise<string> {
    // 模擬 API 延遲
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    const lowerInput = message.toLowerCase();
    
    if (lowerInput.includes('預算') || lowerInput.includes('經費') || lowerInput.includes('花費')) {
      return `關於預算管理，我建議您：\n\n💰 **預算分配原則：**\n• 住宿：30-40%\n• 交通：20-25%\n• 餐飲：20-25%\n• 景點門票：10-15%\n• 購物娛樂：5-10%\n\n💡 **節省技巧：**\n• 提前預訂機票和住宿\n• 選擇當地特色小吃\n• 使用公共交通\n• 尋找免費景點\n\n需要我幫您計算具體預算嗎？`;
    }
    
    if (lowerInput.includes('路線') || lowerInput.includes('行程') || lowerInput.includes('規劃')) {
      return `旅遊路線規劃建議：\n\n🗺️ **規劃步驟：**\n1. 確定目的地和天數\n2. 列出必訪景點\n3. 按地理位置分組\n4. 考慮交通時間\n5. 預留彈性時間\n\n⏰ **時間安排：**\n• 上午：戶外景點\n• 下午：室內景點或休息\n• 晚上：美食、夜景\n\n📍 **熱門路線推薦：**\n• 台北3日遊\n• 花東縱谷5日遊\n• 環島7日遊\n\n您想去哪裡呢？我可以為您量身定制行程！`;
    }
    
    if (lowerInput.includes('景點') || lowerInput.includes('推薦') || lowerInput.includes('好玩')) {
      return `根據您的需求，我推薦以下景點類型：\n\n🏛️ **文化景點：**\n• 故宮博物院\n• 中正紀念堂\n• 龍山寺\n\n🏞️ **自然景觀：**\n• 阿里山\n• 日月潭\n• 太魯閣峽谷\n\n🎡 **娛樂景點：**\n• 九份老街\n• 淡水漁人碼頭\n• 西門町\n\n🍜 **美食景點：**\n• 士林夜市\n• 永康街\n• 迪化街\n\n您比較喜歡哪種類型的景點呢？`;
    }
    
    if (lowerInput.includes('交通') || lowerInput.includes('怎麼去') || lowerInput.includes('到達')) {
      return `台灣交通方式指南：\n\n🚄 **大眾運輸：**\n• 高鐵：城市間快速移動\n• 台鐵：經濟實惠的選擇\n• 捷運：台北、高雄市區交通\n• 公車：連接各景點\n\n🚗 **自駕遊：**\n• 優點：靈活自由\n• 注意：左駕、國際駕照\n• 建議：提前租車預訂\n\n🚲 **其他選擇：**\n• 計程車：短程便利\n• 腳踏車：市區觀光\n• 步行：深度體驗\n\n您計劃去哪裡？我可以提供具體的交通建議！`;
    }
    
    if (lowerInput.includes('住宿') || lowerInput.includes('飯店') || lowerInput.includes('住哪裡')) {
      return `住宿選擇建議：\n\n🏨 **住宿類型：**\n• 星級飯店：舒適豪華\n• 精品旅館：特色體驗\n• 民宿：在地文化\n• 青年旅館：經濟實惠\n\n📍 **位置考量：**\n• 市中心：交通便利\n• 景區附近：節省時間\n• 機場附近：早班機首選\n\n💰 **價格區間：**\n• 經濟型：$800-2000/晚\n• 中檔：$2000-5000/晚\n• 高檔：$5000+/晚\n\n🔍 **預訂建議：**\n• 旺季提前3-6個月\n• 淡季提前1-2個月\n• 使用比價網站\n\n需要我推薦特定地區的住宿嗎？`;
    }
    
    if (lowerInput.includes('天氣') || lowerInput.includes('季節') || lowerInput.includes('什麼時候去')) {
      return `台灣最佳旅遊季節：\n\n🌸 **春季 (3-5月)：**\n• 櫻花盛開\n• 氣候宜人\n• 適合賞花\n\n☀️ **夏季 (6-8月)：**\n• 海灘活動\n• 高山避暑\n• 注意颱風\n\n🍂 **秋季 (9-11月)：**\n• 天氣穩定\n• 楓葉美景\n• 最佳旅遊季節\n\n❄️ **冬季 (12-2月)：**\n• 溫泉季節\n• 賞雪機會\n• 較少降雨\n\n🌦️ **天氣提醒：**\n• 北部：多雨潮濕\n• 中部：四季分明\n• 南部：溫暖少雨\n• 東部：地形影響大\n\n您計劃什麼時候出發？我可以根據季節推薦適合的行程！`;
    }
    
    return `感謝您的提問！作為您的智能旅遊顧問，我可以幫助您：\n\n📋 **主要服務：**\n• 旅遊路線規劃\n• 預算管理建議\n• 景點推薦\n• 交通安排\n• 住宿選擇\n• 季節性建議\n\n💬 **請具體描述：**\n• 想去哪裡旅遊？\n• 預算大概多少？\n• 喜歡什麼類型的景點？\n• 計劃旅遊幾天？\n\n我會根據您的需求提供個性化建議！`;
  }
}

// 提供者管理器
export class AIProviderManager {
  private providers: AIProvider[] = [
    new OllamaProvider(),
    new OllamaCloudProvider(),
    new OpenAIOSSProvider(),
    new MockProvider(),
  ];

  getAvailableProviders(): AIProvider[] {
    return this.providers.filter(provider => provider.isConfigured());
  }

  getProviderByName(name: string): AIProvider | undefined {
    return this.providers.find(provider => provider.name === name);
  }

  // 新增：智能選擇最佳提供者
  async getBestProvider(): Promise<AIProvider> {
    const available = this.getAvailableProviders();
    
    // 優先順序：雲端 Ollama (llama2:7b) > 本地 Ollama (llama2:7b) > OpenAI > 模擬回應
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
    
    console.log('所有 AI 提供者都不可用，使用模擬回應');
    // 如果都沒有可用的，返回模擬回應
    return new MockProvider();
  }

  // 新增：獲取本地提供者
  getLocalProviders(): AIProvider[] {
    return this.providers.filter(provider => provider.isLocal && provider.isConfigured());
  }

  // 新增：獲取雲端提供者
  getCloudProviders(): AIProvider[] {
    return this.providers.filter(provider => !provider.isLocal && provider.isConfigured());
  }

  async getDefaultProvider(): Promise<AIProvider> {
    // 優先使用雲端 Ollama，其次是本地 Ollama，最後是其他服務
    const available = this.getAvailableProviders();
    
    // 優先檢查雲端 Ollama (llama2:7b)
    const cloudOllama = available.find(p => p.type === 'ollama' && !p.isLocal);
    if (cloudOllama && cloudOllama.isAvailable) {
      try {
        if (await cloudOllama.isAvailable()) {
          console.log('選擇雲端 Ollama (llama2:7b) 作為默認提供者');
          return cloudOllama;
        }
      } catch (error) {
        console.log('雲端 Ollama 不可用，嘗試其他提供者');
      }
    }
    
    // 檢查本地 Ollama (llama2:7b)
    const localOllama = available.find(p => p.type === 'ollama' && p.isLocal);
    if (localOllama && localOllama.isAvailable) {
      try {
        if (await localOllama.isAvailable()) {
          console.log('選擇本地 Ollama (llama2:7b) 作為默認提供者');
          return localOllama;
        }
      } catch (error) {
        console.log('本地 Ollama 不可用，嘗試其他提供者');
      }
    }
    
    // 檢查 OpenAI
    const openai = available.find(p => p.type === 'openai');
    if (openai && openai.isAvailable) {
      try {
        if (await openai.isAvailable()) {
          console.log('選擇 OpenAI 作為默認提供者');
          return openai;
        }
      } catch (error) {
        console.log('OpenAI 不可用，使用模擬回應');
      }
    }
    
    console.log('所有 AI 提供者都不可用，使用模擬回應');
    return new MockProvider();
  }

  async testProvider(provider: AIProvider): Promise<boolean> {
    try {
      await provider.sendMessage('測試訊息', []);
      return true;
    } catch (error) {
      console.error(`測試 ${provider.name} 失敗:`, error);
      return false;
    }
  }

  // 新增：檢查所有提供者狀態
  async checkAllProviders(): Promise<{ provider: AIProvider; status: boolean }[]> {
    const results = [];
    for (const provider of this.getAvailableProviders()) {
      const status = provider.isAvailable ? await provider.isAvailable() : false;
      results.push({ provider, status });
    }
    return results;
  }
}

// 導出單例
export const aiProviderManager = new AIProviderManager();
