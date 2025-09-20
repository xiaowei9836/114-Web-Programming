import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, MapPin, Calendar, DollarSign, Edit, Trash2, MessageCircle, Bell, BellOff } from 'lucide-react';
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
  createdAt?: string;
  updatedAt?: string;
  mapTripData?: {
    points: Array<{
      id: string;
      name: string;
      address: string;
      location: { lat: number; lng: number; };
      estimatedCost?: number;
      estimatedTime?: number;
      notes?: string;
      currency?: string;
    }>;
  };
  notificationSettings?: {
    enabled: boolean;
    email: string;
    reminderTime: string; // 提醒時間，例如 "2025-09-20T10:00:00.000Z"
    reminderType: 'start' | 'end' | 'custom'; // 提醒類型
  };
}

const TripList: React.FC = () => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { openChat, isMinimized } = useAIChat();
  
  // 通知相關狀態
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [notificationForm, setNotificationForm] = useState({
    email: '',
    reminderTime: '',
    reminderType: 'start' as 'start' | 'end' | 'custom'
  });
  const [localDateTimeValue, setLocalDateTimeValue] = useState('');

  // 後端 API 端點配置
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';

  // 旅行卡片背景顏色數組
  const cardColors = [
    'bg-[#E8F2FF]', // 淺藍色
    'bg-[#E8F8F0]', // 淺綠色
    'bg-[#FFF8E8]', // 淺黃色
    'bg-[#F8E8FF]', // 淺紫色
    'bg-[#FFE8E8]', // 淺紅色
    'bg-[#E8F2FF]', // 淺藍色 (重複)
  ];

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
        // 只顯示有mapTripData的行程（地圖行程），按創建時間升序排列（最早的在前）
        const mapTrips = data
          .filter((trip: any) => trip.mapTripData)
          .sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        setTrips(mapTrips);
        
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
          // 只顯示有mapTripData的行程（地圖行程），按創建時間升序排列（最早的在前）
          const mapTrips = parsedData
            .filter((trip: any) => trip.mapTripData)
            .sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
          setTrips(mapTrips);
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

  // 通知相關函數
  const handleNotificationToggle = (trip: Trip) => {
    setSelectedTrip(trip);
    
    // 計算預設提醒時間
    let defaultReminderTime = trip.startDate;
    if (trip.notificationSettings?.reminderTime) {
      defaultReminderTime = trip.notificationSettings.reminderTime;
    } else {
      // 根據提醒類型計算預設時間
      const startDate = new Date(trip.startDate);
      const endDate = new Date(trip.endDate);
      const reminderType = trip.notificationSettings?.reminderType || 'start';
      
      if (reminderType === 'start') {
        // 旅行開始前一天凌晨12點提醒
        const dayBeforeStart = new Date(startDate);
        dayBeforeStart.setDate(startDate.getDate() - 1);
        dayBeforeStart.setHours(0, 0, 0, 0); // 設定為凌晨12點
        defaultReminderTime = dayBeforeStart.toISOString();
      } else if (reminderType === 'end') {
        // 旅行結束前一天凌晨12點提醒
        const dayBeforeEnd = new Date(endDate);
        dayBeforeEnd.setDate(endDate.getDate() - 1);
        dayBeforeEnd.setHours(0, 0, 0, 0); // 設定為凌晨12點
        defaultReminderTime = dayBeforeEnd.toISOString();
      }
    }
    
    // 計算本地時間顯示值
    const utcDate = new Date(defaultReminderTime);
    const taiwanDate = new Date(utcDate.getTime() + 8 * 60 * 60 * 1000);
    const localValue = taiwanDate.toISOString().slice(0, 16);
    
    setNotificationForm({
      email: trip.notificationSettings?.email || '',
      reminderTime: defaultReminderTime,
      reminderType: trip.notificationSettings?.reminderType || 'start'
    });
    setLocalDateTimeValue(localValue);
    setShowNotificationModal(true);
  };

  const handleNotificationSave = async () => {
    if (!selectedTrip || !notificationForm.email) {
      alert('請輸入有效的 Gmail 信箱');
      return;
    }

    // 根據提醒類型計算提醒時間
    let reminderTime = '';
    const now = new Date();
    
    switch (notificationForm.reminderType) {
      case 'start':
        // 旅行開始前一天凌晨12點提醒
        const startDate = new Date(selectedTrip.startDate);
        const dayBeforeStart = new Date(startDate);
        dayBeforeStart.setDate(startDate.getDate() - 1);
        dayBeforeStart.setHours(0, 0, 0, 0); // 設定為凌晨12點
        reminderTime = dayBeforeStart.toISOString();
        break;
      case 'end':
        // 旅行結束前一天凌晨12點提醒
        const endDate = new Date(selectedTrip.endDate);
        const dayBeforeEnd = new Date(endDate);
        dayBeforeEnd.setDate(endDate.getDate() - 1);
        dayBeforeEnd.setHours(0, 0, 0, 0); // 設定為凌晨12點
        reminderTime = dayBeforeEnd.toISOString();
        break;
      case 'custom':
        // 使用使用者自訂的時間
        reminderTime = notificationForm.reminderTime;
        break;
    }

    // 檢查提醒時間是否在過去（基於台灣時間）
    const reminderDateTime = new Date(reminderTime);
    const taiwanReminderTime = new Date(reminderDateTime.getTime() + 8 * 60 * 60 * 1000);
    const taiwanNow = new Date(now.getTime() + 8 * 60 * 60 * 1000);
    const timeDiff = taiwanReminderTime.getTime() - taiwanNow.getTime();
    const minutesDiff = Math.round(timeDiff / (1000 * 60));
    
    console.log('調試信息:');
    console.log('當前台灣時間:', taiwanNow.toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' }));
    console.log('提醒台灣時間:', taiwanReminderTime.toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' }));
    console.log('時間差（分鐘）:', minutesDiff);
    
    // 如果時間在過去，不允許
    if (minutesDiff <= 0) {
      alert('提醒時間不能設定在過去！請設定未來的時間。');
      return;
    }
    
    // 如果時間在未來5分鐘內，給出提醒
    if (minutesDiff < 5) {
      const confirmed = window.confirm(`提醒時間設定在 ${minutesDiff} 分鐘後，確定要設定嗎？`);
      if (!confirmed) {
        return;
      }
    }

    try {
      console.log('發送通知設定請求...');
      console.log('API URL:', `${API_BASE_URL}/api/trips/${selectedTrip._id}/notification`);
      console.log('請求數據:', {
        notificationSettings: {
          enabled: true,
          email: notificationForm.email,
          reminderTime: reminderTime,
          reminderType: notificationForm.reminderType
        }
      });

      const response = await fetch(`${API_BASE_URL}/api/trips/${selectedTrip._id}/notification`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          notificationSettings: {
            enabled: true,
            email: notificationForm.email,
            reminderTime: reminderTime,
            reminderType: notificationForm.reminderType
          }
        }),
      });

      console.log('響應狀態:', response.status);
      console.log('響應狀態文本:', response.statusText);

      if (response.ok) {
        const updatedTrip = await response.json();
        console.log('更新後的旅行數據:', updatedTrip);
        setTrips(trips.map(trip => 
          trip._id === selectedTrip._id ? updatedTrip : trip
        ));
        setShowNotificationModal(false);
        // 直接顯示用戶輸入的台灣時間
        const userInputTime = localDateTimeValue ? new Date(localDateTimeValue).toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' }) : '未設定';
        alert(`通知設定已保存！將在台灣時間 ${userInputTime} 發送提醒`);
      } else {
        const errorData = await response.json();
        console.error('API 錯誤響應:', errorData);
        throw new Error(`保存通知設定失敗: ${errorData.message || response.statusText}`);
      }
    } catch (error) {
      console.error('保存通知設定失敗:', error);
      alert(`保存失敗: ${error instanceof Error ? error.message : '未知錯誤'}`);
    }
  };

  const handleNotificationDisable = async (tripId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/trips/${tripId}/notification`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          notificationSettings: {
            enabled: false,
            email: '',
            reminderTime: '',
            reminderType: 'start'
          }
        }),
      });

      if (response.ok) {
        const updatedTrip = await response.json();
        setTrips(trips.map(trip => 
          trip._id === tripId ? updatedTrip : trip
        ));
        alert('通知已關閉');
      } else {
        throw new Error('關閉通知失敗');
      }
    } catch (error) {
      console.error('關閉通知失敗:', error);
      alert('關閉失敗，請稍後再試');
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

  // 計算地點預算總和（按貨幣分組）
  const calculateTotalSpent = (trip: Trip) => {
    if (!trip.mapTripData?.points) return [];
    
    const currencyTotals: { [key: string]: number } = {};
    
    trip.mapTripData.points.forEach(point => {
      const cost = point.estimatedCost || 0;
      const currency = (point as any).currency || trip.budget.currency;
      
      if (currencyTotals[currency]) {
        currencyTotals[currency] += cost;
      } else {
        currencyTotals[currency] = cost;
      }
    });
    
    return Object.entries(currencyTotals)
      .filter(([_, amount]) => amount > 0)
      .map(([currency, amount]) => `${amount} ${currency}`)
      .join(', ');
  };

  if (loading) {
    return (
      <div className={`min-h-screen bg-black text-[#e9eef2] font-["LXGW-WenKai"]`}>
        <div className="container mx-auto px-2 py-0">
          <div className="mb-2">
            <div className="relative mb-4">
              <div className="text-center">
                <h1 className={`text-3xl font-bold text-[#e9eef2] mb-2 font-["LXGW-WenKai"]`}>我的旅行列表</h1>
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
                <h1 className={`text-3xl font-bold text-[#e9eef2] mb-2 font-["LXGW-WenKai"]`}>我的旅行列表</h1>
                <p className="text-[#a9b6c3]">管理您的旅行計劃，查看行程安排和預算狀況</p>
              </div>
            </div>
          </div>
          <div className="space-y-6">
            <div className="relative mb-4">
              <div className="absolute -top-8 right-0 flex items-center space-x-3">
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
              <h1 className={`text-3xl font-bold text-[#e9eef2] mb-2 font-["LXGW-WenKai"]`}>我的旅行列表</h1>
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
          <div className="flex justify-end mb-4">
            <Link
              to="/create"
              className="px-4 py-2 rounded-full bg-gradient-to-r from-[#c7a559] to-[#efc56a] text-[#162022] font-semibold hover:shadow-lg transition-all inline-flex items-center space-x-2"
            >
              <Plus className="h-5 w-5" />
              <span>創建旅行</span>
            </Link>
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
        <div className="grid gap-6 grid-cols-3">
          {trips.map((trip, index) => {
            const cardColor = cardColors[index % cardColors.length];
            return (
              <div key={trip._id} className={`${cardColor} border border-gray-200 rounded-lg shadow-md p-6 hover:shadow-lg transition-all duration-200`}>
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
                      行程 {index + 1}
                    </span>
                    <h3 className="text-xl font-semibold text-gray-900">{trip.title}</h3>
                  </div>
                  <div className="flex space-x-2">
                    {/* 通知按鈕 */}
                    <button
                      onClick={() => handleNotificationToggle(trip)}
                      className={`transition-colors ${
                        trip.notificationSettings?.enabled 
                          ? 'text-yellow-600 hover:text-yellow-700' 
                          : 'text-gray-700 hover:text-yellow-600'
                      }`}
                      title={trip.notificationSettings?.enabled ? '關閉通知' : '開啟通知'}
                    >
                      {trip.notificationSettings?.enabled ? (
                        <Bell className="h-4 w-4" />
                      ) : (
                        <BellOff className="h-4 w-4" />
                      )}
                    </button>
                    <Link
                      to={`/trips/${trip._id}`}
                      className="text-gray-700 hover:text-[#3fb6b2] transition-colors"
                    >
                      <Edit className="h-4 w-4" />
                    </Link>
                    <button
                      onClick={() => deleteTrip(trip._id)}
                      className="text-gray-700 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center space-x-2 text-gray-800">
                    <MapPin className="h-4 w-4 text-blue-600 flex-shrink-0 min-w-[16px] min-h-[16px]" />
                    <span className="text-sm">
                      {trip.mapTripData && trip.mapTripData.points && trip.mapTripData.points.length > 0
                        ? trip.mapTripData.points
                            .map((point: { name: string }) => point.name)
                            .join(' → ')
                            .length > 48
                          ? trip.mapTripData.points
                              .map((point: { name: string }) => point.name)
                              .join(' → ')
                              .substring(0, 48) + ' ...'
                          : trip.mapTripData.points
                              .map((point: { name: string }) => point.name)
                              .join(' → ')
                        : trip.destination
                      }
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-800">
                    <Calendar className="h-4 w-4 text-green-600 flex-shrink-0 min-w-[16px] min-h-[16px]" />
                    <span>
                      {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-800">
                    <DollarSign className="h-4 w-4 text-yellow-600 flex-shrink-0 min-w-[16px] min-h-[16px]" />
                    <span>
                      {calculateTotalSpent(trip).length > 0 ? calculateTotalSpent(trip) : '0 ' + trip.budget.currency} / {trip.budget.total} {trip.budget.currency}
                    </span>
                  </div>
                </div>

                {trip.description && (
                  <p className="text-gray-800 text-sm mb-4 line-clamp-2">
                    {trip.description}
                  </p>
                )}

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-800">
                    {calculateDuration(trip.startDate, trip.endDate)} 天
                  </span>
                  <Link
                    to={`/trips/${trip._id}`}
                    className="text-[#3fb6b2] hover:text-[#3fb6b2]/80 font-medium text-sm"
                  >
                    查看詳情 →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
        </div>
      </div>

      {/* 通知設定彈窗 */}
      {showNotificationModal && selectedTrip && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              設定旅行通知
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gmail 信箱
                </label>
                <input
                  type="email"
                  value={notificationForm.email}
                  onChange={(e) => setNotificationForm({
                    ...notificationForm,
                    email: e.target.value
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  placeholder="your-email@gmail.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  提醒類型
                </label>
                <select
                  value={notificationForm.reminderType}
                  onChange={(e) => {
                    const newReminderType = e.target.value as 'start' | 'end' | 'custom';
                    let newReminderTime = notificationForm.reminderTime;
                    let newLocalValue = localDateTimeValue;
                    
                    // 根據提醒類型自動計算時間
                    if (selectedTrip && newReminderType !== 'custom') {
                      if (newReminderType === 'start') {
                        // 旅行開始前一天凌晨12點提醒
                        const startDate = new Date(selectedTrip.startDate);
                        const dayBeforeStart = new Date(startDate);
                        dayBeforeStart.setDate(startDate.getDate() - 1);
                        dayBeforeStart.setHours(0, 0, 0, 0); // 設定為凌晨12點
                        newReminderTime = dayBeforeStart.toISOString();
                      } else if (newReminderType === 'end') {
                        // 旅行結束前一天凌晨12點提醒
                        const endDate = new Date(selectedTrip.endDate);
                        const dayBeforeEnd = new Date(endDate);
                        dayBeforeEnd.setDate(endDate.getDate() - 1);
                        dayBeforeEnd.setHours(0, 0, 0, 0); // 設定為凌晨12點
                        newReminderTime = dayBeforeEnd.toISOString();
                      }
                      
                      // 計算新的本地時間顯示值
                      const utcDate = new Date(newReminderTime);
                      const taiwanDate = new Date(utcDate.getTime() + 8 * 60 * 60 * 1000);
                      newLocalValue = taiwanDate.toISOString().slice(0, 16);
                    }
                    
                    setNotificationForm({
                      ...notificationForm,
                      reminderType: newReminderType,
                      reminderTime: newReminderTime
                    });
                    setLocalDateTimeValue(newLocalValue);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                >
                  <option value="start">旅行開始前一天凌晨12點</option>
                  <option value="end">旅行結束前一天凌晨12點</option>
                  <option value="custom">自訂時間</option>
                </select>
              </div>

              {notificationForm.reminderType === 'custom' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    提醒時間
                  </label>
                  <input
                    type="datetime-local"
                    value={localDateTimeValue}
                    onChange={(e) => {
                      const newValue = e.target.value;
                      setLocalDateTimeValue(newValue);
                      
                      if (!newValue) {
                        setNotificationForm({
                          ...notificationForm,
                          reminderTime: ''
                        });
                        return;
                      }
                      
                      try {
                        // datetime-local 輸入的是台灣時間，需要轉換為 UTC 存儲
                        const taiwanDateTime = new Date(newValue);
                        const utcDateTime = new Date(taiwanDateTime.getTime() - 8 * 60 * 60 * 1000);
                        setNotificationForm({
                          ...notificationForm,
                          reminderTime: utcDateTime.toISOString()
                        });
                      } catch (error) {
                        console.error('時間轉換錯誤:', error);
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  />
                </div>
              )}

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={handleNotificationSave}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                >
                  保存設定
                </button>
                <button
                  onClick={() => {
                    setShowNotificationModal(false);
                    setLocalDateTimeValue('');
                  }}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors"
                >
                  取消
                </button>
                {selectedTrip.notificationSettings?.enabled && (
                  <button
                    onClick={() => {
                      handleNotificationDisable(selectedTrip._id);
                      setShowNotificationModal(false);
                      setLocalDateTimeValue('');
                    }}
                    className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors"
                  >
                    關閉通知
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

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
