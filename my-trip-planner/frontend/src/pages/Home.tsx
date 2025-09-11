import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MapPin, Calendar, DollarSign, BookOpen, Bell, Globe, Bot, ChevronRight, MessageCircle } from 'lucide-react';
import { useAIChat } from '../contexts/AIChatContext';

const Home: React.FC = () => {
  const { openChat, isMinimized } = useAIChat();
  const navigate = useNavigate();
  const [navBackground, setNavBackground] = useState(false);
  const [hoveredNavItem, setHoveredNavItem] = useState<string | null>(null);
  
  // 添加refs用于滚动动画
  const featuresRef = useRef<HTMLElement>(null);
  const galleryRef = useRef<HTMLElement>(null);
  const quickStartRef = useRef<HTMLElement>(null);
  
  // 添加动画状态
  const [isFeaturesVisible, setIsFeaturesVisible] = useState(false);
  const [isGalleryVisible, setIsGalleryVisible] = useState(false);
  const [isQuickStartVisible, setIsQuickStartVisible] = useState(false);
  
  // 手動捲動相關狀態
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  // 動畫控制狀態
  const [shouldAnimate, setShouldAnimate] = useState(false);
  
  // 直接使用霞鶩文楷字體
  const fontClass = 'font-["LXGW-WenKai"]';
  
  // 浮動小區塊內容
  const featuresItems = [
    { icon: <Globe className="h-4 w-4" />, text: '地圖規劃' },
    { icon: <Calendar className="h-4 w-4" />, text: '行程安排' },
    { icon: <DollarSign className="h-4 w-4" />, text: '預算管理' },
    { icon: <Bell className="h-4 w-4" />, text: '旅行提醒' },
    { icon: <BookOpen className="h-4 w-4" />, text: '旅行日記' },
    { icon: <Bot className="h-4 w-4" />, text: 'AI諮詢' }
  ];
  
  const quickStartItems = [
    { icon: <Globe className="h-4 w-4" />, text: '地圖規劃' },
    { icon: <Calendar className="h-4 w-4" />, text: '創建行程' },
    { icon: <BookOpen className="h-4 w-4" />, text: '享受旅行' }
  ];
  
  const planNowItems = [
    { icon: <Globe className="h-4 w-4" />, text: '地圖規劃' },
    { icon: <Calendar className="h-4 w-4" />, text: '創建旅行' },
    { icon: <Bot className="h-4 w-4" />, text: 'AI諮詢' }
  ];
  
  const features = [
    {
      icon: <Globe className="h-12 w-12 text-blue-500" />,
      title: '地圖規劃',
      description: '規劃專屬旅行路線\n探索目的景點和餐廳',
      backgroundImage: '/images/card01.jpg'
    },
    {
      icon: <Calendar className="h-12 w-12 text-green-500" />,
      title: '行程安排',
      description: '建立詳細行程\n包含活動、時間和住宿等',
      backgroundImage: '/images/card02.jpg'
    },
    {
      icon: <DollarSign className="h-12 w-12 text-yellow-500" />,
      title: '預算管理',
      description: '追蹤旅行支出\n設定預算限制和管理財務',
      backgroundImage: '/images/card03.jpg'
    },
    {
      icon: <Bell className="h-12 w-12 text-purple-500" />,
      title: '旅行提醒',
      description: '設置重要提醒\n如航班時間、飯店入住等',
      backgroundImage: '/images/card04.jpg'
    },
    {
      icon: <BookOpen className="h-12 w-12 text-red-500" />,
      title: '旅行日記',
      description: '記錄旅行中的精彩時刻\n分享照片與回憶',
      backgroundImage: '/images/card05.jpg'
    },
    {
      icon: <Bot className="h-12 w-12 text-indigo-500" />,
      title: 'AI 諮詢',
      description: '智能助理\n提供旅遊行程、或預算等建議',
      backgroundImage: '/images/card06.jpg'
    }
  ];

  // 手動捲動事件處理
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.pageX - (scrollContainerRef.current?.offsetLeft || 0));
    setScrollLeft(scrollContainerRef.current?.scrollLeft || 0);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollContainerRef.current) return;
    e.preventDefault();
    const x = e.pageX - (scrollContainerRef.current.offsetLeft || 0);
    const walk = (x - startX) * 2;
    scrollContainerRef.current.scrollLeft = scrollLeft - walk;
  };

  // 觸控事件處理
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setStartX(e.touches[0].pageX - (scrollContainerRef.current?.offsetLeft || 0));
    setScrollLeft(scrollContainerRef.current?.scrollLeft || 0);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !scrollContainerRef.current) return;
    e.preventDefault();
    const x = e.touches[0].pageX - (scrollContainerRef.current.offsetLeft || 0);
    const walk = (x - startX) * 2;
    scrollContainerRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // 滚动动画效果
  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const featuresObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setIsFeaturesVisible(true);
          setShouldAnimate(true);
        } else {
          // 當離開視窗時重置動畫狀態，讓下次進入時能重新觸發
          setShouldAnimate(false);
        }
      });
    }, observerOptions);

    const galleryObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setIsGalleryVisible(true);
        }
      });
    }, observerOptions);

    const quickStartObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setIsQuickStartVisible(true);
        }
      });
    }, observerOptions);

    if (featuresRef.current) {
      featuresObserver.observe(featuresRef.current);
    }
    if (galleryRef.current) {
      galleryObserver.observe(galleryRef.current);
    }
    if (quickStartRef.current) {
      quickStartObserver.observe(quickStartRef.current);
    }

    return () => {
      featuresObserver.disconnect();
      galleryObserver.disconnect();
      quickStartObserver.disconnect();
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // 設置背景
      setNavBackground(currentScrollY > 24);
      
      // 控制導航欄的顯示/隱藏
      const nav = document.querySelector('nav');
      if (nav) {
        if (currentScrollY > 120 && currentScrollY > (window as any).lastScrollY) {
          // 向下滾動超過120px時隱藏導航欄
          nav.style.transform = 'translateY(-100%)';
        } else {
          // 向上滾動或回到頂部時顯示導航欄
          nav.style.transform = 'translateY(0)';
        }
      }
      
      (window as any).lastScrollY = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 背景切換功能
  useEffect(() => {
    let video1: HTMLVideoElement | null = null;
    let video2: HTMLVideoElement | null = null;
    let video3: HTMLVideoElement | null = null;
    let currentVideoIndex = 0;

    const initializeVideos = () => {
      video1 = document.getElementById('video1') as HTMLVideoElement;
      video2 = document.getElementById('video2') as HTMLVideoElement;
      video3 = document.getElementById('video3') as HTMLVideoElement;

      if (video1 && video2 && video3) {
        // 設置所有影片的初始狀態
        video1.style.opacity = '1';
        video2.style.opacity = '0';
        video3.style.opacity = '0';
        
        // 添加過渡效果
        video1.style.transition = 'opacity 1s ease-in-out';
        video2.style.transition = 'opacity 1s ease-in-out';
        video3.style.transition = 'opacity 1s ease-in-out';

        // 添加影片結束事件監聽器
        video1.addEventListener('ended', () => playNextVideo());
        video2.addEventListener('ended', () => playNextVideo());
        video3.addEventListener('ended', () => playNextVideo());
      }
    };

    const playNextVideo = () => {
      if (!video1 || !video2 || !video3) return;

      // 隱藏當前影片
      const videos = [video1, video2, video3];
      videos[currentVideoIndex].style.opacity = '0';

      // 切換到下一個影片
      currentVideoIndex = (currentVideoIndex + 1) % 3;
      const nextVideo = videos[currentVideoIndex];

      // 顯示下一個影片
      nextVideo.style.opacity = '1';
      nextVideo.currentTime = 0; // 重置影片到開始位置
      nextVideo.play();
    };

    const startVideoPlayback = () => {
      if (video1) {
        video1.play();
      }
    };

    // 初始化影片
    initializeVideos();
    
    // 延遲一下再開始播放，確保DOM元素已經準備好
    setTimeout(() => {
      startVideoPlayback();
    }, 100);

    // 手動切換功能（點擊或觸摸時切換到下一個影片）
    const handleManualSwitch = () => {
      if (video1 && video2 && video3) {
        // 隱藏當前影片
        const videos = [video1, video2, video3];
        videos[currentVideoIndex].style.opacity = '0';
        
        // 切換到下一個影片
        currentVideoIndex = (currentVideoIndex + 1) % 3;
        const nextVideo = videos[currentVideoIndex];
        
        // 顯示下一個影片
        nextVideo.style.opacity = '1';
        nextVideo.currentTime = 0;
        nextVideo.play();
      }
    };

    const videoContainer = document.getElementById('video-container');
    if (videoContainer) {
      videoContainer.addEventListener('click', handleManualSwitch);
      videoContainer.addEventListener('touchstart', handleManualSwitch);
    }

    return () => {
      if (video1) video1.removeEventListener('ended', () => playNextVideo());
      if (video2) video2.removeEventListener('ended', () => playNextVideo());
      if (video3) video3.removeEventListener('ended', () => playNextVideo());

      if (videoContainer) {
        videoContainer.removeEventListener('click', handleManualSwitch);
        videoContainer.removeEventListener('touchstart', handleManualSwitch);
      }
    };
  }, []);

  return (
    <div className={`w-full min-h-screen bg-black text-[#e9eef2] ${fontClass}`}>
      {/* 導航欄 */}
      <nav className={`fixed top-0 left-0 right-0 h-16 z-50 transition-all duration-500 ${
        navBackground 
          ? 'bg-black/60 backdrop-blur-md shadow-2xl' 
          : 'bg-transparent'
      }`}>
        <div className="w-full max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
          <Link to="/" className={`${fontClass} text-2xl font-semibold`}>
            <span className="text-[#c7a559]">Voyage</span> Planner
          </Link>
          <div className="flex items-center gap-5">
            <div className="relative">
              <a 
                href="#features" 
                className="px-4 py-2 rounded-full border border-white/20 hover:bg-white/10 transition-colors"
                onMouseEnter={() => setHoveredNavItem('features')}
                onMouseLeave={() => setHoveredNavItem(null)}
              >
                功能亮點
              </a>
              {hoveredNavItem === 'features' && (
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-white/70 backdrop-blur-sm border border-white/20 rounded-lg shadow-xl p-3 min-w-[250px] z-50">
                  <div className="grid grid-cols-2 gap-2">
                    {featuresItems.map((item, index) => (
                      <div key={index} className="flex items-center gap-2 px-2 py-1 rounded hover:bg-white/20 transition-colors">
                        <span className="text-gray-700">{item.icon}</span>
                        <span className="text-sm text-gray-700">{item.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <a href="#gallery" className="px-4 py-2 rounded-full border border-white/20 hover:bg-white/10 transition-colors">
              靈感圖集
            </a>
            <div className="relative">
              <a 
                href="#quick-start" 
                className="px-4 py-2 rounded-full border border-white/20 hover:bg-white/10 transition-colors"
                onMouseEnter={() => setHoveredNavItem('quick-start')}
                onMouseLeave={() => setHoveredNavItem(null)}
              >
                快速開始
              </a>
              {hoveredNavItem === 'quick-start' && (
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-white/70 backdrop-blur-sm border border-white/20 rounded-lg shadow-xl p-3 min-w-[125px] z-50">
                  <div className="space-y-2">
                    {quickStartItems.map((item, index) => (
                      <div key={index} className="flex items-center gap-2 px-2 py-1 rounded hover:bg-white/20 transition-colors">
                        <span className="text-gray-700">{item.icon}</span>
                        <span className="text-sm text-gray-700">{item.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="relative">
              <Link 
                to="/map-planning" 
                className="px-4 py-3 rounded-full bg-gradient-to-r from-[#c7a559] to-[#efc56a] text-[#162022] font-semibold hover:shadow-2xl hover:-translate-y-0.5 transition-all"
                onMouseEnter={() => setHoveredNavItem('plan-now')}
                onMouseLeave={() => setHoveredNavItem(null)}
              >
                立即規劃
              </Link>
              {hoveredNavItem === 'plan-now' && (
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-white/70 backdrop-blur-sm border border-white/20 rounded-lg shadow-xl p-3 min-w-[125px] z-50">
                  <div className="space-y-2">
                    {planNowItems.map((item, index) => (
                      <div key={index} className="flex items-center gap-2 px-2 py-1 rounded hover:bg-white/20 transition-colors">
                        <span className="text-gray-700">{item.icon}</span>
                        <span className="text-sm text-gray-700">{item.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* 英雄區域 */}
      <header className="relative w-full min-h-screen flex items-center justify-center overflow-hidden pt-16">
        {/* 影片背景容器 */}
        <div className="absolute inset-0 w-full h-full overflow-hidden">
          <div 
            className="w-full h-full transform transition-transform duration-1000 ease-out"
            id="video-container"
          >
            {/* 第一層：image-bg.png */}
            <div 
              className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat"
              style={{
                backgroundImage: "url('/images/image-bg.png')"
              }}
            />
            
            {/* 第二層：影片1 - musha-masthead-3.mp4 */}
            <video
              className="absolute inset-0 w-full h-full object-cover"
              muted
              loop={false}
              playsInline
              id="video1"
            >
              <source src="/images/musha-masthead-3.mp4" type="video/mp4" />
            </video>
            
            {/* 第三層：影片2 - Homepage-Trailer-3-1.mp4 */}
            <video
              className="absolute inset-0 w-full h-full object-cover"
              muted
              loop={false}
              playsInline
              id="video2"
            >
              <source src="/images/Homepage-Trailer-3-1.mp4" type="video/mp4" />
            </video>
            
            {/* 第四層：影片3 - BRUBRU-HOME-25.mp4 */}
            <video
              className="absolute inset-0 w-full h-full object-cover"
              muted
              loop={false}
              playsInline
              id="video3"
            >
              <source src="/images/BRUBRU-HOME-25.mp4" type="video/mp4" />
            </video>
          </div>
        </div>
        
        {/* 調整亮度，讓影片更亮 */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black/60" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/5 via-transparent to-black/10" />
        
        {/* 上邊界模糊效果 */}
        <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-black/80 via-black/40 to-transparent"></div>
        
        {/* 下邊界模糊效果 */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>

        <div className="relative z-10 w-full max-w-6xl mx-auto px-6 text-center">
          <span className="inline-block text-[#3fb6b2] font-semibold tracking-widest uppercase text-base mb-6">
            沉浸式旅遊體驗 · AI 智能規劃
          </span>
          <h1 className={`text-7xl ${fontClass} leading-tight mb-6`}>
            規劃你的專屬旅行
          </h1>
          <p className="text-2xl text-[#a9b6c3] max-w-3xl mx-auto mb-10 leading-relaxed">
            以奢華敘事風格，從地圖規劃、預算管理到旅行日記，自我實現旅行需求
          </p>
          <div className="flex flex-row gap-4 justify-center">
            <Link
              to="/map-planning"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-[#c7a559] to-[#efc56a] text-[#162022] font-semibold text-lg hover:shadow-2xl hover:-translate-y-1 transition-all"
            >
              立即開始
              <ChevronRight className="h-5 w-5" />
            </Link>
            <a
              href="#features"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full border border-white/20 text-white font-semibold text-lg hover:bg-white/10 transition-colors"
            >
              看看功能
            </a>
          </div>
        </div>
      </header>

      {/* 功能亮點 */}
      <section 
        ref={featuresRef}
        id="features" 
        className={`w-full py-24 transition-all duration-1000 ease-out ${
          isFeaturesVisible 
            ? 'opacity-100 translate-y-0' 
            : 'opacity-0 translate-y-16'
        }`}
      >
        <div className="w-full max-w-7xl mx-auto px-6">
          <div className={`text-center mb-16 transition-all duration-1000 delay-300 ${
            isFeaturesVisible 
              ? 'opacity-100 translate-y-0' 
              : 'opacity-0 translate-y-8'
          }`}>
            <h2 className={`${fontClass} text-5xl mb-4`}>
              功能亮點
            </h2>
            <p className="text-xl text-[#a9b6c3] max-w-2xl mx-auto">
              用極簡操作與細緻互動，快速完成你的完美行程。
            </p>
          </div>
          
          <div 
            className="overflow-x-auto overflow-y-visible cursor-grab active:cursor-grabbing pt-8"
            ref={scrollContainerRef}
            onMouseDown={handleMouseDown}
            onMouseLeave={handleMouseLeave}
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            <div 
              className={`flex gap-3 ${!isDragging && shouldAnimate ? 'animate-scroll' : ''}`} 
              style={{ width: 'calc(120% + 0.5rem)' }}
            >
              {/* 第一組卡片 */}
              {features.map((feature, index) => (
                <div 
                  key={`first-${index}`}
                  className={`group relative overflow-hidden rounded-2xl p-6 h-64 hover:shadow-lg hover:-translate-y-2 transition-all duration-300 flex-shrink-0 ${
                    isFeaturesVisible 
                      ? 'opacity-100 translate-y-0' 
                      : 'opacity-0 translate-y-12'
                  }`}
                  style={{
                    transitionDelay: `${(index + 1) * 100}ms`,
                    backgroundImage: `url(${feature.backgroundImage})`,
                    backgroundSize: 'cover',
                    backgroundPosition: '60% 35%',
                    backgroundRepeat: 'no-repeat',
                    width: 'calc(20% - 0.5rem)'
                  }}
                >
                  {/* 背景遮罩層，確保文字可讀性 */}
                  <div className="absolute inset-0 bg-black bg-opacity-40 group-hover:bg-opacity-30 transition-all duration-300 rounded-2xl"></div>
                  
                  {/* 內容區域 */}
                  <div className="relative z-10 h-full flex flex-col items-center justify-center">
                    <div className="flex justify-center mb-4">
                      <div className="w-16 h-16 bg-white bg-opacity-20 backdrop-blur-sm rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        {feature.icon}
                      </div>
                    </div>
                    <h3 className="text-xl font-semibold mb-3 text-center text-white group-hover:text-white transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-white text-opacity-90 leading-relaxed text-center group-hover:text-white transition-colors whitespace-pre-line">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
              {/* 第二組卡片（重複，用於循環效果） */}
              {features.map((feature, index) => (
                <div 
                  key={`second-${index}`}
                  className={`group relative overflow-hidden rounded-2xl p-6 h-64 hover:shadow-lg hover:-translate-y-2 transition-all duration-300 flex-shrink-0 ${
                    isFeaturesVisible 
                      ? 'opacity-100 translate-y-0' 
                      : 'opacity-0 translate-y-12'
                  }`}
                  style={{
                    transitionDelay: `${(index + 1) * 100}ms`,
                    backgroundImage: `url(${feature.backgroundImage})`,
                    backgroundSize: 'cover',
                    backgroundPosition: '73% 35%',
                    backgroundRepeat: 'no-repeat',
                    width: 'calc(20% - 0.5rem)'
                  }}
                >
                  {/* 背景遮罩層，確保文字可讀性 */}
                  <div className="absolute inset-0 bg-black bg-opacity-40 group-hover:bg-opacity-30 transition-all duration-300 rounded-2xl"></div>
                  
                  {/* 內容區域 */}
                  <div className="relative z-10 h-full flex flex-col items-center justify-center">
                    <div className="flex justify-center mb-4">
                      <div className="w-16 h-16 bg-white bg-opacity-20 backdrop-blur-sm rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        {feature.icon}
                      </div>
                    </div>
                    <h3 className="text-xl font-semibold mb-3 text-center text-white group-hover:text-white transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-white text-opacity-90 leading-relaxed text-center group-hover:text-white transition-colors whitespace-pre-line">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 靈感圖集 - 調整為DOCTYPE.html的比例 */}
      <section 
        ref={galleryRef}
        id="gallery" 
        className={`w-full py-24 transition-all duration-1000 ease-out ${
          isGalleryVisible 
            ? 'opacity-100 translate-y-0' 
            : 'opacity-0 translate-y-16'
        }`}
      >
        <div className="w-full max-w-7xl mx-auto px-6">
          <div className={`text-center mb-16 transition-all duration-1000 delay-300 ${
            isGalleryVisible 
              ? 'opacity-100 translate-y-0' 
              : 'opacity-0 translate-y-8'
          }`}>
            <h2 className={`${fontClass} text-5xl mb-4`}>
              靈感圖集
            </h2>
            <p className="text-xl text-[#a9b6c3] max-w-2xl mx-auto">
              大片視覺搭配留白，傳遞高端而寧靜的敘事節奏。
            </p>
          </div>

          {/* 主要大圖 - 調整為48vh高度，與DOCTYPE.html一致 */}
          <div className={`relative h-[48vh] rounded-3xl overflow-hidden shadow-2xl mb-8 transition-all duration-1000 delay-500 ${
            isGalleryVisible 
              ? 'opacity-100 translate-y-0 scale-100' 
              : 'opacity-0 translate-y-12 scale-95'
          }`}>
            <img 
              src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1920&auto=format&fit=crop" 
              alt="海面與夕陽的廣幅照片"
              className="w-full h-full object-cover"
            />
          </div>

          {/* 小圖網格 - 調整為DOCTYPE.html的2fr 1fr比例和16:10比例 */}
          <div className="grid grid-cols-3 gap-6" style={{ marginTop: '32px' }}>
            <div className={`col-span-2 transition-all duration-1000 delay-700 ${
              isGalleryVisible 
                ? 'opacity-100 translate-y-0 scale-100' 
                : 'opacity-0 translate-y-12 scale-95'
            }`}>
              <div className="relative aspect-[16/10] rounded-2xl overflow-hidden border border-white/10">
                <img 
                  src="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1200&auto=format&fit=crop" 
                  alt="私人沙灘與碼頭"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                />
              </div>
            </div>
            <div className="space-y-6">
              <div className={`transition-all duration-1000 delay-800 ${
                isGalleryVisible 
                  ? 'opacity-100 translate-y-0 scale-100' 
                  : 'opacity-0 translate-y-12 scale-95'
              }`}>
                <div className="relative aspect-[16/10] rounded-2xl overflow-hidden border border-white/10">
                  <img 
                    src="https://images.unsplash.com/photo-1528183429752-a97d0bf99b5a?q=80&w=800&auto=format&fit=crop" 
                    alt="熱帶植物與小徑"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                  />
                </div>
              </div>
              <div className={`transition-all duration-1000 delay-900 ${
                isGalleryVisible 
                  ? 'opacity-100 translate-y-0 scale-100' 
                  : 'opacity-0 translate-y-12 scale-95'
              }`}>
                <div className="relative aspect-[16/10] rounded-2xl overflow-hidden border border-white/10">
                  <img 
                    src="https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?q=80&w=800&auto=format&fit=crop" 
                    alt="日落時分的海邊晚宴"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 快速開始 */}
      <section 
        ref={quickStartRef}
        id="quick-start" 
        className={`w-full py-20 bg-black transition-all duration-1000 ease-out ${
          isQuickStartVisible 
            ? 'opacity-100 translate-y-0' 
            : 'opacity-0 translate-y-16'
        }`}
      >
        <div className="w-full max-w-7xl mx-auto px-6">
          <div className={`text-center mb-16 transition-all duration-1000 delay-300 ${
            isQuickStartVisible 
              ? 'opacity-100 translate-y-0' 
              : 'opacity-0 translate-y-8'
          }`}>
            <h2 className={`text-5xl ${fontClass} mb-4`}>
              快速開始
            </h2>
            <p className="text-xl text-[#a9b6c3] max-w-2xl mx-auto">
              三步驟完成你的完美旅行規劃
            </p>
          </div>
          
          <div className="w-full grid md:grid-cols-3 gap-8 mb-16">
            {/* 步驟 1 */}
            <div className={`w-full text-center transition-all duration-1000 delay-500 ${
              isQuickStartVisible 
                ? 'opacity-100 translate-y-0 scale-100' 
                : 'opacity-0 translate-y-12 scale-95'
            }`}>
              <div className="w-full bg-gray-800 border border-gray-700 rounded-2xl p-8 hover:bg-gray-700 hover:border-gray-600 transition-all duration-300">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <MapPin className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-2xl font-semibold mb-4">地圖規劃</h3>
                <p className="text-[#a9b6c3] leading-relaxed">
                  使用 Google Maps 選擇目的地
                </p>
              </div>
            </div>
            
            {/* 步驟 2 */}
            <div className={`w-full text-center transition-all duration-1000 delay-700 ${
              isQuickStartVisible 
                ? 'opacity-100 translate-y-0 scale-100' 
                : 'opacity-0 translate-y-12 scale-95'
            }`}>
              <div className="w-full bg-gray-800 border border-gray-700 rounded-2xl p-8 hover:bg-gray-700 hover:border-gray-600 transition-all duration-300">
                <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Calendar className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-2xl font-semibold mb-4">創建行程</h3>
                <p className="text-[#a9b6c3] leading-relaxed">
                  設置日期、預算和詳細安排
                </p>
              </div>
            </div>
            
            {/* 步驟 3 */}
            <div className={`w-full text-center transition-all duration-1000 delay-900 ${
              isQuickStartVisible 
                ? 'opacity-100 translate-y-0 scale-100' 
                : 'opacity-0 translate-y-12 scale-95'
            }`}>
              <div className="w-full bg-gray-800 border border-gray-700 rounded-2xl p-8 hover:bg-gray-700 hover:border-gray-600 transition-all duration-300">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-violet-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <BookOpen className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-2xl font-semibold mb-4">享受旅行</h3>
                <p className="text-[#a9b6c3] leading-relaxed">
                  記錄美好回憶，分享精彩故事
                </p>
              </div>
            </div>
          </div>
          
          <div className={`text-center mt-12 transition-all duration-1000 delay-1100 ${
            isQuickStartVisible 
              ? 'opacity-100 translate-y-0 scale-100' 
              : 'opacity-0 translate-y-12 scale-95'
          }`}>
            <button
              onClick={() => navigate('/map-planning')}
              className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold px-8 py-4 rounded-full text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-2xl"
            >
              免費開始規劃
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </section>

      {/* AI旅遊顧問浮動按鈕 - 只在未最小化時顯示 */}
      {!isMinimized && (
        <button
          onClick={openChat}
          className="fixed bottom-6 right-6 z-50 w-16 h-16 bg-gradient-to-r from-[#c7a559] to-[#efc56a] hover:from-[#b8954f] hover:to-[#d4b05a] text-[#162022] rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-110 flex items-center justify-center group"
          title="AI旅遊顧問"
        >
          <MessageCircle className="h-8 w-8 group-hover:scale-110 transition-transform duration-300" />
        </button>
      )}

      {/* 頁腳 */}
      <footer className="w-full border-t border-[#1e2a36] py-12">
        <div className="w-full max-w-7xl mx-auto px-6 flex flex-col md:flex-row gap-6 items-center justify-between">
          <span className="text-[#a9b6c3]">
            © {new Date().getFullYear()} Voyage Planner developed by Kuanwei
          </span>
          <div className="flex gap-6">
            <a href="#features" className="px-4 py-2 rounded-full border border-white/20 hover:bg-white/10 transition-colors">
              功能
            </a>
            <a href="#gallery" className="px-4 py-2 rounded-full border border-white/20 hover:bg-white/10 transition-colors">
              圖集
            </a>
            <a href="#top" className="px-4 py-2 rounded-full border border-white/20 hover:bg-white/10 transition-colors">
              回到頂部
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
