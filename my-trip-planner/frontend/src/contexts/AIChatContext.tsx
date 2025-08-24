import React, { createContext, useContext, useState, ReactNode } from 'react';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AIChatContextType {
  isOpen: boolean;
  isMinimized: boolean;
  messages: Message[];
  openChat: () => void;
  closeChat: () => void;
  toggleChat: () => void;
  minimizeChat: () => void;
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void;
  clearMessages: () => void;
}

const AIChatContext = createContext<AIChatContextType | undefined>(undefined);

export const useAIChat = () => {
  const context = useContext(AIChatContext);
  if (context === undefined) {
    throw new Error('useAIChat must be used within an AIChatProvider');
  }
  return context;
};

interface AIChatProviderProps {
  children: ReactNode;
}

export const AIChatProvider: React.FC<AIChatProviderProps> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
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
    }
  ]);

  const openChat = () => {
    setIsOpen(true);
    setIsMinimized(false);
  };

  const closeChat = () => {
    setIsOpen(false);
    setIsMinimized(false);
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (isOpen) {
      setIsMinimized(false);
    }
  };

  const minimizeChat = () => {
    setIsMinimized(!isMinimized);
  };

  const addMessage = (message: Omit<Message, 'id' | 'timestamp'>) => {
    const newMessage: Message = {
      ...message,
      id: (Date.now() + Math.random()).toString(),
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const clearMessages = () => {
    setMessages([]);
  };

  const value: AIChatContextType = {
    isOpen,
    isMinimized,
    messages,
    openChat,
    closeChat,
    toggleChat,
    minimizeChat,
    addMessage,
    clearMessages,
  };

  return (
    <AIChatContext.Provider value={value}>
      {children}
    </AIChatContext.Provider>
  );
};
