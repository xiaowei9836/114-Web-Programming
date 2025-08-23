import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Calendar, DollarSign, BookOpen, Bell, Globe, Bot } from 'lucide-react';
import { useAIChat } from '../contexts/AIChatContext';

const Home: React.FC = () => {
  const { openChat } = useAIChat();
  
  const features = [
    {
      icon: <Globe className="h-12 w-12 text-blue-600" />,
      title: '地圖規劃',
      description: '規劃您的旅行路線，探索目的地景點和餐廳',
      color: 'bg-blue-50',
      link: '/map-planning'
    },
    {
      icon: <Calendar className="h-12 w-12 text-green-600" />,
      title: '行程安排',
      description: '建立每日詳細行程，包含活動、時間和地點',
      color: 'bg-green-50',
      link: '/trips'
    },
    {
      icon: <DollarSign className="h-12 w-12 text-yellow-600" />,
      title: '預算管理',
      description: '追蹤旅行支出，設定預算限制，與管理財務',
      color: 'bg-yellow-50',
      link: '/trips'
    },
    {
      icon: <Bell className="h-12 w-12 text-purple-600" />,
      title: '旅行提醒',
      description: '設置重要提醒，如航班時間、酒店入住等',
      color: 'bg-purple-50',
      link: '/trips'
    },
    {
      icon: <BookOpen className="h-12 w-12 text-red-600" />,
      title: '旅行日記',
      description: '記錄旅行中的美好時刻，分享照片和感受',
      color: 'bg-red-50',
      link: '/trips'
    },
    {
      icon: <Bot className="h-12 w-12 text-indigo-600" />,
      title: 'AI諮詢',
      description: '智能顧問，提供旅遊行程、預算等專業建議',
      color: 'bg-indigo-50'
    }
  ];

  return (
    <div className="space-y-12">
      {/* 英雄区域 */}
      <section 
        className="text-center py-16 bg-cover bg-center bg-no-repeat rounded-3xl relative"
        style={{
          backgroundImage: "url('/images/image-bg.png')"
        }}
      >
        {/* 半透明黑色遮罩，確保文字可讀性 */}
        <div className="absolute inset-0 bg-black bg-opacity-5 rounded-3xl"></div>
        
        {/* 內容區域 */}
        <div className="relative z-10 max-w-4xl mx-auto px-6">
          <h1 className="text-5xl font-bold text-white mb-6">
            規劃您的完美旅行
          </h1>
          <p className="text-xl text-white mb-8 max-w-2xl mx-auto">
            從地圖規劃到預算管理，從行程安排到旅行日記，一站式解決所有旅行需求
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/map-planning"
              className="btn-primary text-lg px-5 py-3 inline-flex items-center space-x-2"
            >
              <Globe className="h-5 w-5" />
              <span>開始地圖規劃</span>
            </Link>
            <Link
              to="/create"
              className="btn-secondary text-lg px-5 py-3 inline-flex items-center space-x-2"
            >
              <MapPin className="h-5 w-5" />
              <span>創建旅行</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 功能特性 */}
      <section>
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          為什麼選擇完美旅行規劃器？
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index}>
              {feature.link ? (
                <Link
                  to={feature.link}
                  className={`${feature.color} p-8 rounded-2xl text-center hover:shadow-lg transition-shadow duration-300 block`}
                >
                  <div className="flex justify-center mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                  <div className="mt-4">
                    {feature.title === '地圖規劃' ? (
                      <span className="text-blue-600 text-sm font-medium">點擊體驗 →</span>
                    ) : feature.title === '行程安排' ? (
                      <span className="text-green-600 text-sm font-medium">點擊安排 →</span>
                    ) : feature.title === '預算管理' ? (
                      <span className="text-yellow-600 text-sm font-medium">點擊管理 →</span>
                    ) : feature.title === '旅行提醒' ? (
                      <span className="text-purple-600 text-sm font-medium">點擊提醒 →</span>
                    ) : feature.title === '旅行日記' ? (
                      <span className="text-red-600 text-sm font-medium">點擊記錄 →</span>
                    ) : null}
                  </div>
                </Link>
              ) : feature.title === 'AI諮詢' ? (
                <button
                  onClick={openChat}
                  className={`${feature.color} p-8 rounded-2xl text-center hover:shadow-lg transition-shadow duration-300 block w-full`}
                >
                  <div className="flex justify-center mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                  <div className="mt-4">
                    <span className="text-indigo-600 text-sm font-medium">點擊諮詢 →</span>
                  </div>
                </button>
              ) : (
                <div className={`${feature.color} p-8 rounded-2xl text-center`}>
                  <div className="flex justify-center mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 快速开始 */}
      <section className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          快速開始
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-blue-700">1</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">地圖規劃</h3>
            <p className="text-gray-600 text-sm">使用搜尋引擎和標記地點</p>
          </div>
          <div className="text-center">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-blue-700">2</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">創建行程</h3>
            <p className="text-gray-600 text-sm">設置日期、預算和詳細安排</p>
          </div>
          <div className="text-center">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-blue-700">3</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">享受旅行</h3>
            <p className="text-gray-600 text-sm">記錄美好時刻，管理預算</p>
          </div>
        </div>
      </section>
      
    </div>
  );
};

export default Home;
