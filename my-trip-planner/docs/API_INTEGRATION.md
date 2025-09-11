# API 整合說明文檔

## 外部 API 整合

### 1. Google Maps API

#### 功能用途
- 地圖顯示和互動
- 地點搜尋和標記
- 路線規劃
- 地理編碼

#### 設定步驟
1. 前往 [Google Cloud Console](https://console.cloud.google.com/)
2. 創建新專案或選擇現有專案
3. 啟用 Maps JavaScript API
4. 創建 API 金鑰
5. 設定 API 金鑰限制

#### 環境變數設定
```env
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

#### 使用範例
```typescript
// GoogleMapsLoader.tsx
const loadGoogleMaps = (): Promise<typeof google> => {
  return new Promise((resolve, reject) => {
    if (window.google) {
      resolve(window.google);
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve(window.google);
    script.onerror = reject;
    document.head.appendChild(script);
  });
};
```

#### API 限制和配額
- **免費配額**: 每月 $200 信用額度
- **地圖載入**: 每 1000 次載入 $2
- **地點搜尋**: 每 1000 次搜尋 $5
- **路線規劃**: 每 1000 次請求 $5

---

### 2. OpenAI API

#### 功能用途
- AI 聊天機器人
- 旅遊建議生成
- 內容摘要和分析

#### 設定步驟
1. 前往 [OpenAI Platform](https://platform.openai.com/)
2. 創建帳戶並驗證
3. 生成 API 金鑰
4. 設定使用限制

#### 環境變數設定
```env
VITE_OPENAI_API_KEY=your_openai_api_key
```

#### 使用範例
```typescript
// AIChatbot.tsx
const sendMessage = async (message: string) => {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: '你是一個專業的旅遊助手，專門提供旅遊建議和行程規劃。'
          },
          {
            role: 'user',
            content: message
          }
        ],
        max_tokens: 1000,
        temperature: 0.7
      })
    });

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('OpenAI API Error:', error);
    throw error;
  }
};
```

#### API 限制和配額
- **免費配額**: 每月 $5 信用額度
- **GPT-3.5-turbo**: $0.002 per 1K tokens
- **速率限制**: 每分鐘 3 次請求

---

### 3. Ollama API (本地部署)

#### 功能用途
- 本地 AI 模型運行
- 離線 AI 聊天
- 隱私保護的 AI 服務

#### 設定步驟
1. 安裝 Ollama
```bash
# macOS
brew install ollama

# Linux
curl -fsSL https://ollama.ai/install.sh | sh
```

2. 下載模型
```bash
ollama pull llama2
ollama pull qwen
```

3. 啟動服務
```bash
ollama serve
```

#### 使用範例
```typescript
// 本地 Ollama API
const sendMessageToOllama = async (message: string) => {
  try {
    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama2',
        prompt: message,
        stream: false
      })
    });

    const data = await response.json();
    return data.response;
  } catch (error) {
    console.error('Ollama API Error:', error);
    throw error;
  }
};
```

---

### 4. Hugging Face API

#### 功能用途
- 開源 AI 模型
- 多語言支援
- 免費使用額度

#### 設定步驟
1. 前往 [Hugging Face](https://huggingface.co/)
2. 創建帳戶
3. 生成 Access Token
4. 選擇適合的模型

#### 環境變數設定
```env
VITE_HUGGINGFACE_API_KEY=your_huggingface_api_key
```

#### 使用範例
```typescript
// Hugging Face API
const sendMessageToHuggingFace = async (message: string) => {
  try {
    const response = await fetch('https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${HUGGINGFACE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        inputs: message,
        parameters: {
          max_length: 100,
          temperature: 0.7
        }
      })
    });

    const data = await response.json();
    return data[0].generated_text;
  } catch (error) {
    console.error('Hugging Face API Error:', error);
    throw error;
  }
};
```

---

## 內部 API 整合

### 1. 旅行管理 API

#### 端點列表
```typescript
// 基礎 URL
const API_BASE_URL = 'http://localhost:5001/api';

// 旅行管理
GET    /api/trips              // 獲取所有旅行
GET    /api/trips/:id          // 獲取單個旅行
POST   /api/trips              // 創建新旅行
PUT    /api/trips/:id          // 更新旅行
DELETE /api/trips/:id          // 刪除旅行

// 日記管理
POST   /api/trips/:id/journal  // 添加日記
DELETE /api/trips/:id/journal/:journalId  // 刪除日記
```

#### 使用範例
```typescript
// 獲取旅行列表
const fetchTrips = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/trips`);
    if (!response.ok) {
      throw new Error('Failed to fetch trips');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching trips:', error);
    throw error;
  }
};

// 創建新旅行
const createTrip = async (tripData: Partial<Trip>) => {
  try {
    const response = await fetch(`${API_BASE_URL}/trips`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(tripData)
    });
    
    if (!response.ok) {
      throw new Error('Failed to create trip');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error creating trip:', error);
    throw error;
  }
};
```

---

## 錯誤處理

### 1. API 錯誤處理
```typescript
// 統一錯誤處理
const handleApiError = (error: any) => {
  if (error.response) {
    // 伺服器回應錯誤
    console.error('API Error:', error.response.status, error.response.data);
    return `伺服器錯誤: ${error.response.status}`;
  } else if (error.request) {
    // 網路錯誤
    console.error('Network Error:', error.request);
    return '網路連接失敗，請檢查網路設定';
  } else {
    // 其他錯誤
    console.error('Error:', error.message);
    return '發生未知錯誤';
  }
};
```

### 2. 重試機制
```typescript
// 自動重試機制
const fetchWithRetry = async (url: string, options: RequestInit, maxRetries = 3) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url, options);
      if (response.ok) {
        return response;
      }
      throw new Error(`HTTP ${response.status}`);
    } catch (error) {
      if (i === maxRetries - 1) {
        throw error;
      }
      // 等待後重試
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
};
```

---

## 快取策略

### 1. 記憶體快取
```typescript
// 簡單記憶體快取
class ApiCache {
  private cache = new Map<string, { data: any; timestamp: number }>();
  private ttl = 5 * 60 * 1000; // 5分鐘

  get(key: string) {
    const item = this.cache.get(key);
    if (item && Date.now() - item.timestamp < this.ttl) {
      return item.data;
    }
    this.cache.delete(key);
    return null;
  }

  set(key: string, data: any) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }
}

const apiCache = new ApiCache();
```

### 2. 本地儲存快取
```typescript
// 使用 localStorage 快取
const getCachedData = (key: string) => {
  try {
    const cached = localStorage.getItem(key);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < 5 * 60 * 1000) { // 5分鐘
        return data;
      }
    }
  } catch (error) {
    console.error('Cache read error:', error);
  }
  return null;
};

const setCachedData = (key: string, data: any) => {
  try {
    localStorage.setItem(key, JSON.stringify({
      data,
      timestamp: Date.now()
    }));
  } catch (error) {
    console.error('Cache write error:', error);
  }
};
```

---

## 安全性考量

### 1. API 金鑰保護
```typescript
// 環境變數驗證
const validateApiKeys = () => {
  const requiredKeys = [
    'VITE_GOOGLE_MAPS_API_KEY',
    'VITE_OPENAI_API_KEY'
  ];

  const missingKeys = requiredKeys.filter(key => !import.meta.env[key]);
  
  if (missingKeys.length > 0) {
    console.warn('Missing API keys:', missingKeys);
  }
};
```

### 2. 請求限制
```typescript
// 請求頻率限制
class RateLimiter {
  private requests = new Map<string, number[]>();
  private maxRequests = 10;
  private windowMs = 60000; // 1分鐘

  canMakeRequest(key: string): boolean {
    const now = Date.now();
    const requests = this.requests.get(key) || [];
    
    // 移除過期的請求記錄
    const validRequests = requests.filter(time => now - time < this.windowMs);
    
    if (validRequests.length >= this.maxRequests) {
      return false;
    }
    
    validRequests.push(now);
    this.requests.set(key, validRequests);
    return true;
  }
}

const rateLimiter = new RateLimiter();
```

### 3. 資料驗證
```typescript
// 輸入資料驗證
const validateTripData = (data: any): boolean => {
  const requiredFields = ['title', 'destination', 'startDate', 'endDate'];
  
  for (const field of requiredFields) {
    if (!data[field]) {
      throw new Error(`Missing required field: ${field}`);
    }
  }
  
  // 日期驗證
  if (new Date(data.startDate) >= new Date(data.endDate)) {
    throw new Error('Start date must be before end date');
  }
  
  return true;
};
```
