import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, MapPin, Calendar, DollarSign, Edit, Trash2, MessageCircle } from 'lucide-react';
import { useAIChat } from '../contexts/AIChatContext';

interface Trip {
  _id: string;
  title: string;
  destination: string;
  startDate: string;
  endDate: string;
  description: string;
  budget: {
    total: number;
    spent: number;
    currency: string;
  };
}

const TripList: React.FC = () => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { openChat, isMinimized } = useAIChat();

  // 後端 API 端點配置
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';

  useEffect(() => {
    fetchTrips();
  }, []);

  const fetchTrips = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // 設定請求超時
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10秒超時
      
      const response = await fetch(`${API_BASE_URL}/api/trips`, {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const data = await response.json();
        setTrips(data);
        
        // 將從後端獲取的數據保存到 localStorage 作為備份
        try {
          localStorage.setItem('tripsBackup', JSON.stringify(data));
          console.log('旅行數據已備份到 localStorage');
        } catch (storageError) {
          console.warn('無法保存到 localStorage:', storageError);
        }
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('獲取旅行列表失敗:', error);
      
      // 嘗試從 localStorage 載入備份數據
      try {
        const backupData = localStorage.getItem('tripsBackup');
        if (backupData) {
          const parsedData = JSON.parse(backupData);
          setTrips(parsedData);
              setError('⚠️ 離線模式：顯示上次同步的資料。某些功能可能受限。');
          console.log('從 localStorage 載入備份資料');
        } else {
          // 如果沒有備份數據，設置具體錯誤信息
          if (error instanceof Error) {
            if (error.name === 'AbortError') {
              setError('請求超時，請檢查網路連接或後端服務狀態');
            } else if (error.message.includes('Failed to fetch')) {
              setError('無法連接到後端服務，請檢查後端是否正在運行');
            } else if (error.message.includes('获取旅行列表失败')) {
              setError('資料庫連接問題，請檢查 MongoDB 服務狀態。如果您是開發者，請確保 MongoDB 已啟動；如果是使用者，請稍後再試');
            } else {
              setError(`載入失敗: ${error.message}`);
            }
          } else {
            setError('載入失敗，請稍後再試');
          }
        }
      } catch (storageError) {
        console.error('讀取 localStorage 失敗:', storageError);
        // 如果 localStorage 也失敗，顯示網路錯誤
        if (error instanceof Error) {
          if (error.name === 'AbortError') {
            setError('請求超時，請檢查網路連接或後端服務狀態');
          } else if (error.message.includes('Failed to fetch')) {
            setError('無法連接到後端服務，請檢查後端是否正在運行');
          } else if (error.message.includes('获取旅行列表失败')) {
            setError('資料庫連接問題，請檢查 MongoDB 服務狀態。如果您是開發者，請確保 MongoDB 已啟動；如果是使用者，請稍後再試');
          } else {
            setError(`載入失敗: ${error.message}`);
          }
        } else {
          setError('載入失敗，請稍後再試');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const deleteTrip = async (id: string) => {
    if (window.confirm('確定要刪除這個旅行嗎？')) {
      try {
        const response = await fetch(`${API_BASE_URL}/api/trips/${id}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          setTrips(trips.filter(trip => trip._id !== id));
        } else {
          throw new Error(`刪除失敗: ${response.statusText}`);
        }
      } catch (error) {
        console.error('刪除旅行失敗:', error);
        alert('刪除失敗，請稍後再試');
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN');
  };

  const calculateDuration = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return (
      <div className={`min-h-screen bg-black text-[#e9eef2] font-["LXGW-WenKai"]`}>
        <div className="container mx-auto px-2 py-0">
          <div className="mb-2">
            <div className="relative mb-4">
              <div className="text-center">
                <h1 className={`text-3xl font-bold text-[#e9eef2] mb-2 font-["LXGW-WenKai"]`}>我的旅行規劃</h1>
                <p className="text-[#a9b6c3]">管理您的旅行計劃，查看行程安排和預算狀況</p>
              </div>
            </div>
          </div>
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#c7a559] mx-auto mb-4"></div>
              <p className="text-[#a9b6c3]">正在載入旅行清單...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error && trips.length === 0) {
    return (
      <div className={`min-h-screen bg-black text-[#e9eef2] font-["LXGW-WenKai"]`}>
        <div className="container mx-auto px-2 py-0">
          <div className="mb-2">
            <div className="relative mb-4">
              <div className="text-center">
                <h1 className={`text-3xl font-bold text-[#e9eef2] mb-2 font-["LXGW-WenKai"]`}>我的旅行規劃</h1>
                <p className="text-[#a9b6c3]">管理您的旅行計劃，查看行程安排和預算狀況</p>
              </div>
            </div>
          </div>
          <div className="space-y-6">
            <div className="relative mb-4">
              <div className="absolute top-0 right-0 flex items-center space-x-3">
                <Link
                  to="/create"
                  className="px-4 py-2 rounded-full bg-gradient-to-r from-[#c7a559] to-[#efc56a] text-[#162022] font-semibold hover:shadow-lg transition-all inline-flex items-center space-x-2"
                >
                  <Plus className="h-5 w-5" />
                  <span>創建旅行</span>
                </Link>
              </div>
            </div>
        
            <div className={`text-center py-16 rounded-lg border ${
              error.includes('離線模式') 
                ? 'bg-yellow-50 border-yellow-200' 
                : 'bg-red-50 border-red-200'
            }`}>
              <div className={`mb-4 ${
                error.includes('離線模式') ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {error.includes('離線模式') ? (
                  <svg className="h-16 w-16 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                ) : (
                  <svg className="h-16 w-16 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                )}
                <h3 className="text-xl font-semibold mb-2">
                  {error.includes('離線模式') ? '離線模式' : '載入失敗'}
                </h3>
                <p className={`mb-4 ${
                  error.includes('離線模式') ? 'text-yellow-700' : 'text-red-700'
                }`}>
                  {error}
                </p>
                <button 
                  onClick={fetchTrips}
                  className={`${
                    error.includes('離線模式') 
                      ? 'bg-yellow-600 hover:bg-yellow-700' 
                      : 'btn-primary'
                  } text-white px-4 py-2 rounded-lg transition-colors`}
                >
                  {error.includes('離線模式') ? '重新同步' : '重試'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-black text-[#e9eef2] font-["LXGW-WenKai"]`}>
      <div className="container mx-auto px-2 py-0">
        <div className="mb-2">
          <div className="relative mb-4">
            <div className="text-center">
              <h1 className={`text-3xl font-bold text-[#e9eef2] mb-2 font-["LXGW-WenKai"]`}>我的旅行規劃</h1>
              <p className="text-[#a9b6c3]">管理您的旅行計劃，查看行程安排和預算狀況</p>
              {error && error.includes('離線模式') && (
                <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full text-sm bg-yellow-100 text-yellow-800 border border-yellow-200">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  離線模式 - 顯示緩存資料
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="relative mb-4">
            <div className="absolute top-0 right-0 flex items-center space-x-3">
              <Link
                to="/create"
                className="px-4 py-2 rounded-full bg-gradient-to-r from-[#c7a559] to-[#efc56a] text-[#162022] font-semibold hover:shadow-lg transition-all inline-flex items-center space-x-2"
              >
                <Plus className="h-5 w-5" />
                <span>創建旅行</span>
              </Link>
            </div>
          </div>

          {trips.length === 0 ? (
            <div className="text-center py-16">
              <MapPin className="h-24 w-24 text-[#a9b6c3] mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-[#e9eef2] mb-2">
                還沒有旅行計劃
              </h3>
              <p className="text-[#a9b6c3] mb-6">
                開始創建您的第一個旅行計劃吧！
              </p>
              <Link to="/create" className="px-6 py-3 rounded-full bg-gradient-to-r from-[#c7a559] to-[#efc56a] text-[#162022] font-semibold hover:shadow-lg transition-all">
                創建旅行
              </Link>
            </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {trips.map((trip) => (
            <div key={trip._id} className="bg-gray-700 rounded-lg shadow-md p-6 hover:bg-gray-600 transition-all duration-200">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-semibold text-[#e9eef2]">{trip.title}</h3>
                <div className="flex space-x-2">
                  <Link
                    to={`/trips/${trip._id}`}
                    className="text-[#a9b6c3] hover:text-blue-400 transition-colors"
                  >
                    <Edit className="h-4 w-4" />
                  </Link>
                  <button
                    onClick={() => deleteTrip(trip._id)}
                    className="text-[#a9b6c3] hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center space-x-2 text-[#a9b6c3]">
                  <MapPin className="h-4 w-4" />
                  <span>{trip.destination}</span>
                </div>
                <div className="flex items-center space-x-2 text-[#a9b6c3]">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-[#a9b6c3]">
                  <DollarSign className="h-4 w-4" />
                  <span>
                    {trip.budget.spent} / {trip.budget.total} {trip.budget.currency}
                  </span>
                </div>
              </div>

              {trip.description && (
                <p className="text-[#a9b6c3] text-sm mb-4 line-clamp-2">
                  {trip.description}
                </p>
              )}

              <div className="flex justify-between items-center">
                <span className="text-sm text-[#a9b6c3]">
                  {calculateDuration(trip.startDate, trip.endDate)} 天
                </span>
                <Link
                  to={`/trips/${trip._id}`}
                  className="text-blue-400 hover:text-blue-300 font-medium text-sm"
                >
                  查看詳情 →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
        </div>
      </div>

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
    </div>
  );
};

export default TripList;
