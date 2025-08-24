import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, X, Minimize2, Maximize2, Settings, RefreshCw } from 'lucide-react';
import { aiProviderManager, type AIProvider, MockProvider } from '../config/ai-providers';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AIChatbotProps {
  isOpen: boolean;
  onToggle: () => void;
  isMinimized?: boolean;
  onMinimize?: () => void;
  className?: string;
  messages?: Message[];
  onAddMessage?: (message: Omit<Message, 'id' | 'timestamp'>) => void;
}

const AIChatbot: React.FC<AIChatbotProps> = ({
  isOpen,
  onToggle,
  isMinimized = false,
  onMinimize,
  className = '',
  messages: externalMessages,
  onAddMessage
}) => {
  // 使用外部消息狀態，如果沒有則使用內部狀態
  const [internalMessages, setInternalMessages] = useState<Message[]>([]);
  
  const messages = externalMessages && externalMessages.length > 0 ? externalMessages : internalMessages;
  const setMessages = onAddMessage ? 
    (updater: Message[] | ((prev: Message[]) => Message[])) => {
      if (typeof updater === 'function') {
        const newMessages = updater(messages);
        // 只添加最後一條新消息
        const lastMessage = newMessages[newMessages.length - 1];
        if (lastMessage && onAddMessage) {
          onAddMessage({
            type: lastMessage.type,
            content: lastMessage.content
          });
        }
      }
    } : 
    setInternalMessages;
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentProvider, setCurrentProvider] = useState<AIProvider | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [availableProviders, setAvailableProviders] = useState<AIProvider[]>([]);
  const [isTestingProvider, setIsTestingProvider] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 初始化 AI 提供者
  useEffect(() => {
    const initializeProvider = async () => {
      try {
        const defaultProvider = await aiProviderManager.getDefaultProvider();
        setCurrentProvider(defaultProvider);
        console.log('初始化 AI 提供者:', defaultProvider.name);
      } catch (error) {
        console.error('初始化 AI 提供者失敗:', error);
        // 如果初始化失敗，使用模擬回應
        setCurrentProvider(new MockProvider());
      }
    };
    
    initializeProvider();
    setAvailableProviders(aiProviderManager.getAvailableProviders());
  }, []);

  // 如果沒有外部消息且內部消息也為空，添加歡迎訊息
  useEffect(() => {
    if ((!externalMessages || externalMessages.length === 0) && internalMessages.length === 0) {
      const welcomeMessage: Message = {
        id: 'welcome',
        type: 'assistant',
        content: `🎉 歡迎使用 AI 旅遊顧問！我是您的專屬旅遊規劃助手 🤖

💡 **我可以幫助您：**
• 🗺️ 規劃旅遊路線和行程安排
• 💰 提供預算管理和節省建議
• 🏛️ 推薦熱門景點和隱藏美食
• ⏰ 優化行程時間安排
• 🏨 酒店和交通建議
• 🌍 目的地文化和注意事項
• 📱 實用的旅遊小貼士

🚀 **快速開始：**
您可以這樣問我：
• "我想去日本東京旅遊5天，預算3萬台幣，請幫我規劃"
• "推薦台北週末兩日遊的景點和美食"
• "如何規劃歐洲背包旅行？"
• "去泰國旅遊需要注意什麼？"

💬 請告訴我您的旅遊需求，我會為您量身定制專業建議！`,
        timestamp: new Date()
      };
      setInternalMessages([welcomeMessage]);
    }
  }, [externalMessages, internalMessages.length]);

  // 測試提供者連接
  const testProvider = async (provider: AIProvider) => {
    setIsTestingProvider(true);
    try {
      const isWorking = await aiProviderManager.testProvider(provider);
      if (isWorking) {
        alert(`${provider.name} 連接成功！`);
        setCurrentProvider(provider);
      } else {
        alert(`${provider.name} 連接失敗，請檢查配置。`);
      }
    } catch (error) {
      alert(`${provider.name} 測試失敗: ${error}`);
    } finally {
      setIsTestingProvider(false);
    }
  };

  // 檢查回應是否被截斷
  const checkIfTruncated = (response: string): boolean => {
    // 檢查常見的截斷跡象
    const truncationIndicators = [
      /\.\.\.$/,           // 以省略號結尾
      /…$/,               // 以省略號結尾（中文）
      /---$/,             // 以破折號結尾
      /===$/,             // 以等號結尾
      /表格不完整/,        // 表格不完整提示
      /未完待續/,          // 未完待續提示
      /請稍後/,            // 請稍後提示
      /更多內容/,          // 更多內容提示
    ];
    
    // 檢查是否以不完整的句子結尾
    const incompleteSentenceEndings = [
      /[^。！？\n]$/,     // 不以句號、感嘆號、問號或換行結尾
      /[^。！？\n]\s*$/,  // 不以句號、感嘆號、問號或換行結尾（可能有空格）
    ];
    
    // 檢查回應長度（如果太短可能是截斷的）
    const isTooShort = response.length < 100;
    
    // 檢查是否有截斷跡象
    const hasTruncationIndicator = truncationIndicators.some(pattern => pattern.test(response));
    
    // 檢查是否以不完整句子結尾
    const hasIncompleteEnding = incompleteSentenceEndings.some(pattern => pattern.test(response));
    
    return hasTruncationIndicator || hasIncompleteEnding || isTooShort;
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading || !currentProvider) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // 使用當前選擇的 AI 提供者
      const conversationHistory = messages
        .filter(msg => msg.type === 'user' || msg.type === 'assistant')
        .map(msg => ({
          role: msg.type as 'user' | 'assistant',
          content: msg.content
        }));
      
      const response = await currentProvider.sendMessage(inputValue.trim(), conversationHistory);
      
      // 檢查回應是否被截斷
      const isTruncated = checkIfTruncated(response);
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
      
      // 如果回應被截斷，自動添加"繼續"提示
      if (isTruncated) {
        setTimeout(() => {
          const continueMessage: Message = {
            id: (Date.now() + 2).toString(),
            type: 'assistant',
            content: `⚠️ **回應可能被截斷**\n\n看起來我的回答沒有完整顯示。您可以：\n\n1. **重新提問**：用更簡潔的方式描述您的需求\n2. **分段提問**：將複雜問題分成幾個小問題\n3. **具體提問**：針對特定方面詢問（如只問交通、只問住宿等）\n\n或者，您可以告訴我您最關心的部分，我會重點回答！`,
            timestamp: new Date()
          };
          setMessages(prev => [...prev, continueMessage]);
        }, 1000);
      }
    } catch (error) {
      console.error('AI回應錯誤:', error);
      let errorContent = '抱歉，我遇到了一些問題。請稍後再試，或者重新描述您的需求。';
      
      if (error instanceof Error) {
        if (error.message.includes('Hugging Face API 錯誤')) {
          errorContent = `AI 服務暫時不可用：${error.message}\n\n請檢查：\n1. 網路連接是否正常\n2. API Key 是否正確\n3. 模型是否可用`;
        } else if (error.message.includes('timeout')) {
          errorContent = 'AI 回應超時，請稍後再試。這可能是因為模型正在載入或網路較慢。';
        } else {
          errorContent = `AI 錯誤：${error.message}\n\n請稍後再試或聯繫技術支援。`;
        }
      }
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: errorContent,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const simulateAIResponse = async (userInput: string): Promise<string> => {
    // 模擬API延遲
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    const lowerInput = userInput.toLowerCase();
    
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
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) return null;

  if (isMinimized) {
    return (
      <div className={`fixed bottom-4 right-4 z-50 ${className}`}>
        <button
          onClick={onMinimize}
          className="bg-indigo-600 text-white p-3 rounded-full shadow-lg hover:bg-indigo-700 transition-colors"
          title="展開AI諮詢"
        >
          <Maximize2 className="h-6 w-6" />
        </button>
      </div>
    );
  }

  return (
    <div className={`fixed bottom-4 right-4 z-50 w-96 h-[500px] bg-white rounded-lg shadow-2xl border border-gray-200 flex flex-col ${className}`}>
      {/* 標題欄 */}
      <div className="bg-indigo-600 text-white p-4 rounded-t-lg flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Bot className="h-5 w-5" />
          <h3 className="font-semibold">AI旅遊顧問</h3>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="text-white hover:text-indigo-200 transition-colors"
            title="設置"
          >
            <Settings className="h-4 w-4" />
          </button>
          {onMinimize && (
            <button
              onClick={onMinimize}
              className="text-white hover:text-indigo-200 transition-colors"
              title="最小化"
            >
              <Minimize2 className="h-4 w-4" />
            </button>
          )}
          <button
            onClick={onToggle}
            className="text-white hover:text-indigo-200 transition-colors"
            title="關閉"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* 訊息區域 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-lg ${
                message.type === 'user'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-800 border border-gray-200'
              }`}
            >
              <div className="whitespace-pre-line text-sm text-left">{message.content}</div>
              <div className={`text-xs mt-2 text-left ${
                message.type === 'user' ? 'text-indigo-200' : 'text-gray-500'
              }`}>
                {message.timestamp.toLocaleTimeString('zh-TW', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </div>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white text-gray-800 border border-gray-200 p-3 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></div>
                <span className="text-sm text-gray-600 text-left">
                  {currentProvider ? `${currentProvider.name}正在思考中...` : 'AI正在思考中...'}
                </span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* 設置區域 */}
      {showSettings && (
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <h4 className="font-medium text-gray-900 mb-3">AI 設置</h4>
          <div className="space-y-3">
            {/* AI 提供者選擇 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                選擇 AI 提供者
              </label>
              <select
                value={currentProvider?.name || ''}
                onChange={(e) => {
                  const provider = availableProviders.find(p => p.name === e.target.value);
                  if (provider) {
                    setCurrentProvider(provider);
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              >
                {availableProviders.map((provider) => (
                  <option key={provider.name} value={provider.name}>
                    {provider.name}
                  </option>
                ))}
              </select>
            </div>

            {/* 提供者狀態 */}
            <div className="text-xs text-gray-500">
              <div className="flex items-center justify-between">
                <span>當前提供者：{currentProvider?.name || '未選擇'}</span>
                <button
                  onClick={() => currentProvider && testProvider(currentProvider)}
                  disabled={isTestingProvider || !currentProvider}
                  className="text-indigo-600 hover:text-indigo-700 disabled:opacity-50 flex items-center space-x-1"
                >
                  <RefreshCw className={`h-3 w-3 ${isTestingProvider ? 'animate-spin' : ''}`} />
                  <span>測試連接</span>
                </button>
              </div>
            </div>

            {/* 提供者說明 */}
            <div className="text-xs text-gray-500 space-y-1">
              {currentProvider?.type === 'ollama' && (
                <div>
                  <span className="text-green-600">✓ 本地 Ollama 服務</span>
                  <br />
                  <span>請確保 Ollama 正在本地運行 (http://localhost:11434)</span>
                </div>
              )}
              {currentProvider?.type === 'huggingface' && (
                <div>
                  <span className="text-blue-600">✓ Hugging Face 開源模型</span>
                  <br />
                  <span>需要設置 VITE_HUGGINGFACE_API_KEY</span>
                </div>
              )}
              {currentProvider?.type === 'openai' && (
                <div>
                  <span className="text-purple-600">✓ OpenAI API</span>
                  <br />
                  <span>需要設置 VITE_OPENAI_API_KEY</span>
                </div>
              )}
              {currentProvider?.name === '模擬回應 (測試)' && (
                <div>
                  <span className="text-orange-600">⚠ 模擬回應模式</span>
                  <br />
                  <span>僅供測試，回應內容固定</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 輸入區域 */}
      <div className="p-4 border-t border-gray-200 bg-white rounded-b-lg">
        <div className="flex space-x-2">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="詢問旅遊相關問題..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
            disabled={isLoading}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isLoading}
            className="bg-indigo-600 text-white p-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="發送訊息"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2 text-center">
          按 Enter 發送，Shift + Enter 換行
        </p>
      </div>
    </div>
  );
};

export default AIChatbot;
