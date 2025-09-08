import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Bot } from 'lucide-react';
import { useAIChat } from '../contexts/AIChatContext';

const Navbar: React.FC = () => {
  const location = useLocation();
  const { openChat, isOpen } = useAIChat();
  
  // 直接使用霞鶩文楷字體
  const fontClass = 'font-["LXGW-WenKai"]';

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <nav className="bg-black/60 backdrop-blur-md shadow-2xl">
      <div className="w-full max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className={`${fontClass} text-2xl font-semibold`}>
          <span className="text-[#c7a559]">Voyage</span> <span className="text-white">Planner</span>
        </Link>
        <div className="flex items-center gap-5">
          <Link 
            to="/" 
            className={`px-4 py-2 rounded-full transition-colors ${fontClass} ${
              isActive('/')
                ? 'bg-gradient-to-r from-[#c7a559] to-[#efc56a] text-[#162022] font-semibold'
                : 'border border-white/20 hover:bg-white/10 text-white'
            }`}
          >
            首頁
          </Link>
          <Link 
            to="/map-planning" 
            className={`px-4 py-2 rounded-full transition-colors ${fontClass} ${
              isActive('/map-planning')
                ? 'bg-gradient-to-r from-[#c7a559] to-[#efc56a] text-[#162022] font-semibold'
                : 'border border-white/20 hover:bg-white/10 text-white'
            }`}
          >
            地圖規劃
          </Link>
          <Link 
            to="/trips" 
            className={`px-4 py-2 rounded-full transition-colors ${fontClass} ${
              isActive('/trips')
                ? 'bg-gradient-to-r from-[#c7a559] to-[#efc56a] text-[#162022] font-semibold'
                : 'border border-white/20 hover:bg-white/10 text-white'
            }`}
          >
            我的旅行
          </Link>
          <Link 
            to="/create" 
            className={`px-4 py-2 rounded-full transition-colors ${fontClass} ${
              isActive('/create')
                ? 'bg-gradient-to-r from-[#c7a559] to-[#efc56a] text-[#162022] font-semibold'
                : 'border border-white/20 hover:bg-white/10 text-white'
            }`}
          >
            創建旅行
          </Link>
          <button
            onClick={openChat}
            className={`px-4 py-2 rounded-full transition-colors inline-flex items-center gap-2 ${fontClass} ${
              isOpen
                ? 'bg-gradient-to-r from-[#c7a559] to-[#efc56a] text-[#162022] font-semibold'
                : 'border border-white/20 hover:bg-white/10 text-white'
            }`}
          >
            <Bot className="h-4 w-4" />
            AI諮詢
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
