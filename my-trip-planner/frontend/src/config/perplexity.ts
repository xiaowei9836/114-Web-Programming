// Perplexity API 配置
export const PERPLEXITY_CONFIG = {
  // 請在環境變數中設置您的 Perplexity API Key
  API_KEY: import.meta.env.VITE_PERPLEXITY_API_KEY || '',
  API_BASE_URL: 'https://api.perplexity.ai',
  MODEL: 'llama-3.1-sonar-small-128k-online', // 或其他可用模型
  MAX_TOKENS: 1000,
  TEMPERATURE: 0.7,
};

// Perplexity API 請求介面
export interface PerplexityRequest {
  model: string;
  messages: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string;
  }>;
  max_tokens?: number;
  temperature?: number;
  top_p?: number;
  top_k?: number;
  stream?: boolean;
}

// Perplexity API 回應介面
export interface PerplexityResponse {
  id: string;
  model: string;
  created: number;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

// 旅遊相關的系統提示詞
export const TRAVEL_SYSTEM_PROMPT = `你是一位專業的台灣旅遊顧問，擁有豐富的旅遊規劃經驗。你的主要職責是：

1. **旅遊路線規劃**：根據用戶需求制定合理的旅遊行程
2. **預算管理建議**：提供實用的預算分配和節省技巧
3. **景點推薦**：推薦適合的景點和活動
4. **交通建議**：提供最佳的交通方式和路線
5. **住宿建議**：推薦合適的住宿選擇
6. **季節性建議**：根據不同季節提供旅遊建議

請用繁體中文回答，提供實用、具體的建議。回答要結構化，使用表情符號和項目符號讓內容更易讀。

如果用戶的問題超出旅遊範圍，請禮貌地引導回旅遊相關話題。`;

// 發送請求到 Perplexity API
export const sendToPerplexity = async (
  userMessage: string,
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }> = []
): Promise<string> => {
  if (!PERPLEXITY_CONFIG.API_KEY) {
    throw new Error('Perplexity API Key 未設置');
  }

  try {
    const messages = [
      { role: 'system' as const, content: TRAVEL_SYSTEM_PROMPT },
      ...conversationHistory,
      { role: 'user' as const, content: userMessage }
    ];

    const requestBody: PerplexityRequest = {
      model: PERPLEXITY_CONFIG.MODEL,
      messages,
      max_tokens: PERPLEXITY_CONFIG.MAX_TOKENS,
      temperature: PERPLEXITY_CONFIG.TEMPERATURE,
      stream: false,
    };

    const response = await fetch(`${PERPLEXITY_CONFIG.API_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PERPLEXITY_CONFIG.API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`API 請求失敗: ${response.status} ${response.statusText}`);
    }

    const data: PerplexityResponse = await response.json();
    
    if (data.choices && data.choices.length > 0) {
      return data.choices[0].message.content;
    } else {
      throw new Error('API 回應格式錯誤');
    }
  } catch (error) {
    console.error('Perplexity API 錯誤:', error);
    throw error;
  }
};

// 檢查 API Key 是否已設置
export const isPerplexityConfigured = (): boolean => {
  return !!PERPLEXITY_CONFIG.API_KEY;
};

// 獲取可用的模型列表
export const getAvailableModels = async (): Promise<string[]> => {
  if (!PERPLEXITY_CONFIG.API_KEY) {
    throw new Error('Perplexity API Key 未設置');
  }

  try {
    const response = await fetch(`${PERPLEXITY_CONFIG.API_BASE_URL}/models`, {
      headers: {
        'Authorization': `Bearer ${PERPLEXITY_CONFIG.API_KEY}`,
      },
    });

    if (!response.ok) {
      throw new Error(`API 請求失敗: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.data.map((model: any) => model.id);
  } catch (error) {
    console.error('獲取模型列表失敗:', error);
    throw error;
  }
};
