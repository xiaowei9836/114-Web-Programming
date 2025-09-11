import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Calendar, DollarSign, Edit, ArrowLeft, Save, BookOpen, Trash2, MessageCircle } from 'lucide-react';
import { useAIChat } from '../contexts/AIChatContext';

// 直接使用霞鶩文楷字體
const fontClass = 'font-["LXGW-WenKai"]';

interface Trip {
  _id: string;
  title: string;
  description: string;
  destination: string;
  startDate: string;
  endDate: string;
  budget: {
    total: number;
    spent: number;
    currency: string;
  };
  mapTripData?: {
    points: Array<{
      id: string;
      name: string;
      address: string;
      location: {
        lat: number;
        lng: number;
      };
      estimatedCost?: number;
      estimatedTime?: number;
      notes?: string;
    }>;
  };
  itinerary: Array<{
    date: string;
    activities: Array<{
      title: string;
      description: string;
      location: string;
      time: string;
      cost: number;
    }>;
  }>;
  reminders: Array<{
    _id: string;
    title: string;
    description: string;
    dueDate: string;
    completed: boolean;
  }>;
  journal: Array<{
    _id: string;
    date: string;
    title: string;
    content: string;
    photos: string[];
    mood: 'excellent' | 'good' | 'okay' | 'bad';
  }>;
}

const TripDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { openChat, isMinimized } = useAIChat();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [journalContent, setJournalContent] = useState('');
  const [isEditingJournal, setIsEditingJournal] = useState(false);
  const [journalTitle, setJournalTitle] = useState('');
  
  // 編輯旅行相關狀態
  const [isEditingTrip, setIsEditingTrip] = useState(false);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    destination: '',
    startDate: '',
    endDate: '',
    budgetTotal: 0,
    budgetCurrency: 'NTD'
  });

  useEffect(() => {
    if (id) {
      fetchTrip();
    }
  }, [id]);


  const fetchTrip = async () => {
    try {
      const response = await fetch(`http://localhost:5001/api/trips/${id}`);
      if (response.ok) {
        const data = await response.json();
        setTrip(data);
      }
    } catch (error) {
              console.error('獲取旅行詳情失敗:', error);
    } finally {
      setLoading(false);
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
  const calculateTotalSpent = () => {
    if (!trip?.mapTripData?.points) return [];
    
    const currencyTotals: { [key: string]: number } = {};
    
    trip.mapTripData.points.forEach(point => {
      const cost = point.estimatedCost || 0;
      const currency = point.currency || trip.budget.currency;
      
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

  // 日記相關函數
  const handleSaveJournal = async () => {
    if (!trip || !journalContent.trim()) return;
    
    try {
      const journalEntry = {
        title: journalTitle || `日記 - ${new Date().toLocaleDateString('zh-CN')}`,
        content: journalContent,
        date: new Date().toISOString(),
        mood: 'good' as const
      };

      const response = await fetch(`http://localhost:5001/api/trips/${trip._id}/journal`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(journalEntry),
      });

      if (response.ok) {
        // 從後端獲取更新後的完整旅行數據
        const updatedTripData = await response.json();
        setTrip(updatedTripData);
        
        // 重置編輯狀態
        setIsEditingJournal(false);
        setJournalContent('');
        setJournalTitle('');
      } else {
        const errorData = await response.json();
        console.error('保存日記失敗:', errorData);
        alert(`保存日記失敗：${errorData.message || '請重試'}`);
      }
    } catch (error) {
      console.error('保存日記失敗:', error);
      alert('保存日記失敗，請檢查網路連接');
    }
  };

  const handleEditJournal = () => {
    setIsEditingJournal(true);
    // 如果有現有的日記，載入最新的一篇
    if (trip?.journal && trip.journal.length > 0) {
      const latestJournal = trip.journal[trip.journal.length - 1];
      setJournalTitle(latestJournal.title);
      setJournalContent(latestJournal.content);
    }
  };

  const handleDeleteJournal = async (journalId: string) => {
    if (!trip) return;
    
    try {
      const response = await fetch(`http://localhost:5001/api/trips/${trip._id}/journal/${journalId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        // 從後端獲取更新後的完整旅行數據
        const updatedTripData = await response.json();
        setTrip(updatedTripData);
      } else {
        const errorData = await response.json();
        console.error('刪除日記失敗:', errorData);
      }
    } catch (error) {
      console.error('刪除日記失敗:', error);
    }
  };

  // 編輯旅行相關函數
  const handleEditTrip = () => {
    if (!trip) return;
    
    setEditForm({
      title: trip.title,
      description: trip.description || '',
      destination: trip.destination,
      startDate: trip.startDate.split('T')[0], // 轉換為 YYYY-MM-DD 格式
      endDate: trip.endDate.split('T')[0],
      budgetTotal: trip.budget.total,
      budgetCurrency: trip.budget.currency
    });
    setIsEditingTrip(true);
  };

  const handleSaveTrip = async () => {
    if (!trip) return;
    
    try {
      const updatedTrip = {
        ...trip,
        title: editForm.title,
        description: editForm.description,
        destination: editForm.destination,
        startDate: new Date(editForm.startDate).toISOString(),
        endDate: new Date(editForm.endDate).toISOString(),
        budget: {
          ...trip.budget,
          total: editForm.budgetTotal,
          currency: editForm.budgetCurrency
        },
        mapTripData: trip.mapTripData // 包含修改後的地點預算和貨幣資料
      };

      const response = await fetch(`http://localhost:5001/api/trips/${trip._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedTrip),
      });

      if (response.ok) {
        const updatedTripData = await response.json();
        setTrip(updatedTripData);
        setIsEditingTrip(false);
        alert('旅行資訊更新成功！');
      } else {
        const errorData = await response.json();
        console.error('更新旅行失敗:', errorData);
        alert(`更新旅行失敗：${errorData.message || '請重試'}`);
      }
    } catch (error) {
      console.error('更新旅行失敗:', error);
      alert('更新旅行失敗，請檢查網路連接');
    }
  };

  const handleCancelEdit = () => {
    setIsEditingTrip(false);
    setEditForm({
      title: '',
      description: '',
      destination: '',
      startDate: '',
      endDate: '',
      budgetTotal: 0,
      budgetCurrency: 'NTD'
    });
  };





  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">旅行不存在</h2>
        <button onClick={() => navigate('/trips')} className="btn-primary">
          返回旅行列表
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {/* 头部 */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/trips')}
          className="inline-flex items-center space-x-2 text-white hover:text-blue-100 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className={fontClass}>返回旅行列表</span>
        </button>
        {!isEditingTrip ? (
          <button 
            onClick={handleEditTrip}
            className="px-4 py-2 rounded-full bg-gradient-to-r from-[#c7a559] to-[#efc56a] text-[#162022] font-semibold hover:shadow-lg transition-all inline-flex items-center space-x-2"
          >
            <Edit className="h-5 w-5" />
            <span className={fontClass}>編輯旅行</span>
          </button>
        ) : (
          <div className="flex space-x-3">
            <button
              onClick={handleSaveTrip}
              className="flex items-center space-x-2 px-4 py-2 rounded-full bg-gradient-to-r from-[#c7a559] to-[#efc56a] text-[#162022] font-semibold hover:shadow-lg transition-all"
            >
              <Save className="h-4 w-4" />
              <span className={fontClass}>保存修改</span>
            </button>
            <button
              onClick={handleCancelEdit}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 font-semibold transition-all"
            >
              <span className={fontClass}>取消</span>
            </button>
          </div>
        )}
      </div>

      {/* 主要內容區域 - 統一白色背景 */}
        <div className="bg-blue-50 rounded-lg shadow-lg p-0">
        {/* 旅行標題和基本訊息 */}
        <div className="bg-blue-50 rounded-lg shadow-md p-6 border border-blue-100 mb-0">
          {isEditingTrip ? (
            <div className="space-y-6">
              <div>
                <label className={`block text-sm font-medium text-gray-700 mb-2 ${fontClass}`}>
                  旅行標題
                </label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                  className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className={`block text-sm font-medium text-gray-700 mb-2 ${fontClass}`}>
                  旅行描述
                </label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                />
              </div>
              
              <div>
                <label className={`block text-sm font-medium text-gray-700 mb-2 ${fontClass}`}>
                  目的地
                </label>
                <input
                  type="text"
                  value={editForm.destination}
                  onChange={(e) => setEditForm({...editForm, destination: e.target.value})}
                  className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium text-gray-700 mb-2 ${fontClass}`}>
                    開始日期
                  </label>
                  <input
                    type="date"
                    value={editForm.startDate}
                    onChange={(e) => setEditForm({...editForm, startDate: e.target.value})}
                    className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className={`block text-sm font-medium text-gray-700 mb-2 ${fontClass}`}>
                    結束日期
                  </label>
                  <input
                    type="date"
                    value={editForm.endDate}
                    onChange={(e) => setEditForm({...editForm, endDate: e.target.value})}
                    className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium text-gray-700 mb-2 ${fontClass}`}>
                    預算總額
                  </label>
                  <input
                    type="number"
                    value={editForm.budgetTotal}
                    onChange={(e) => setEditForm({...editForm, budgetTotal: Number(e.target.value)})}
                    className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className={`block text-sm font-medium text-gray-700 mb-2 ${fontClass}`}>
                    貨幣
                  </label>
                  <select
                    value={editForm.budgetCurrency}
                    onChange={(e) => setEditForm({...editForm, budgetCurrency: e.target.value})}
                    className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="NTD">新台幣 (NTD)</option>
                    <option value="USD">美元 (USD)</option>
                    <option value="EUR">歐元 (EUR)</option>
                    <option value="JPY">日圓 (JPY)</option>
                  </select>
                </div>
              </div>
              
              <div className="bg-blue-100 p-4 rounded-lg">
                <p className={`text-sm text-gray-700 ${fontClass}`}>
                  <span className="font-semibold">目前地點預算總和：</span>
                  {calculateTotalSpent().length > 0 ? calculateTotalSpent() : '0 ' + editForm.budgetCurrency}
                </p>
                <p className={`text-sm text-gray-600 ${fontClass}`}>
                  此金額會顯示在預算規劃的 "/" 左側，支援多種貨幣
                </p>
              </div>
              
            </div>
          ) : (
            <>
              <h1 className={`text-3xl font-bold text-gray-900 mb-4 ${fontClass}`}>{trip.title}</h1>
              {trip.description && (
                <p className={`text-gray-700 mb-6 ${fontClass}`}>{trip.description}</p>
              )}
              
              <div className="grid grid-cols-3 gap-6">
                <div className="flex items-center space-x-3">
                  <Calendar className="h-6 w-6 text-green-600" />
                  <div>
                    <p className={`text-lg font-semibold text-gray-900 ${fontClass}`}>旅行日期</p>
                    <p className={`font-medium text-gray-900 ${fontClass}`}>
                      {formatDate(trip.startDate)} - {formatDate(trip.endDate)} ({calculateDuration(trip.startDate, trip.endDate)} 天)
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 col-span-1">
                  <DollarSign className="h-6 w-6 text-yellow-600" />
                  <div>
                    <p className={`text-lg font-semibold text-gray-900 ${fontClass}`}>預算規劃</p>
                    <p className={`font-medium text-gray-900 ${fontClass}`}>
                      {calculateTotalSpent().length > 0 ? calculateTotalSpent() : '0 ' + trip.budget.currency} / {trip.budget.total} {trip.budget.currency}
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* 主要內容區域 - 並排顯示 */}
        <div className="grid grid-cols-2 gap-0">
          {/* 左側：目的地及預算花費 */}
          <div className="bg-blue-50 rounded-lg shadow-md p-6 border border-blue-100">
            <h3 className={`text-lg font-semibold text-gray-900 mb-4 flex items-center ${fontClass}`}>
              <MapPin className="h-5 w-5 mr-2 text-blue-600" />
              目的地＆預算管理
            </h3>
            {isEditingTrip ? (
              <div className="space-y-4">
                {trip.mapTripData && trip.mapTripData.points ? (
                  <div className="space-y-4">
                    {trip.mapTripData.points.map((point, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-white rounded-lg border border-blue-200">
                        <div className="flex items-center space-x-3">
                          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                            {index + 1}
                          </span>
                          <div>
                            <p className={`font-medium text-gray-900 ${fontClass}`}>{point.name}</p>
                            <p className={`text-sm text-gray-700 ${fontClass}`}>{point.address}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center space-x-2">
                            <input
                              type="number"
                              value={point.estimatedCost || ''}
                              onChange={(e) => {
                                // 更新地點預算的邏輯
                                const newPoints = [...(trip.mapTripData?.points || [])];
                                newPoints[index] = {
                                  ...newPoints[index],
                                  estimatedCost: Number(e.target.value) || 0
                                };
                                setTrip({
                                  ...trip,
                                  mapTripData: {
                                    ...trip.mapTripData!,
                                    points: newPoints
                                  }
                                });
                              }}
                              className="w-20 px-2 py-1 border border-blue-200 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="預算"
                            />
                            <select
                              value={point.currency || trip.budget.currency}
                              onChange={(e) => {
                                const newPoints = [...(trip.mapTripData?.points || [])];
                                newPoints[index] = {
                                  ...newPoints[index],
                                  currency: e.target.value
                                };
                                setTrip({
                                  ...trip,
                                  mapTripData: {
                                    ...trip.mapTripData!,
                                    points: newPoints
                                  }
                                });
                              }}
                              className="w-16 px-1 py-1 border border-blue-200 rounded text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                              <option value="NTD">NTD</option>
                              <option value="USD">USD</option>
                              <option value="EUR">EUR</option>
                              <option value="JPY">JPY</option>
                            </select>
                          </div>
                          {point.estimatedTime && (
                            <p className={`text-sm text-gray-700 ${fontClass}`}>{point.estimatedTime} 分鐘</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className={`text-center py-8 text-gray-700 ${fontClass}`}>
                    <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p>此行程沒有地圖規劃資料</p>
                    <p className="text-sm">請前往地圖規劃頁面添加地點</p>
                  </div>
                )}
              </div>
            ) : (
              <>
                {trip.mapTripData && trip.mapTripData.points ? (
                  <div className="space-y-4">
                    {trip.mapTripData.points.map((point, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-white rounded-lg border border-blue-200">
                        <div className="flex items-center space-x-3">
                          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                            {index + 1}
                          </span>
                          <div>
                            <p className={`font-medium text-gray-900 ${fontClass}`}>{point.name}</p>
                            <p className={`text-sm text-gray-700 ${fontClass}`}>{point.address}</p>
                          </div>
                        </div>
                        <div className="text-right">
                            <p className={`font-medium text-gray-900 ${fontClass}`}>
                              {point.estimatedCost ? `${point.estimatedCost} ${point.currency || trip.budget.currency}` : <span className="text-sm">未設定預算</span>}
                            </p>
                          {point.estimatedTime && (
                            <p className={`text-sm text-gray-700 ${fontClass}`}>{point.estimatedTime} 分鐘</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className={`text-center py-8 text-gray-700 ${fontClass}`}>
                    <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p>此行程沒有地圖規劃資料</p>
                    <p className="text-sm">請前往地圖規劃頁面添加地點</p>
                  </div>
                )}
              </>
            )}
          </div>

          {/* 右側：旅行日記 */}
          <div className="bg-blue-50 rounded-lg shadow-md p-6 border border-blue-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-semibold text-gray-900 flex items-center ${fontClass}`}>
                <BookOpen className="h-5 w-5 mr-2 text-red-600" />
                旅行日記
              </h3>
              {!isEditingJournal && (
                <button
                  onClick={handleEditJournal}
                  className={`text-blue-600 hover:text-blue-800 text-sm font-medium ${fontClass}`}
                >
                  新增日記
                </button>
              )}
            </div>

            {isEditingJournal ? (
              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium text-gray-700 mb-2 ${fontClass}`}>
                    日記標題
                  </label>
                  <input
                    type="text"
                    value={journalTitle}
                    onChange={(e) => setJournalTitle(e.target.value)}
                    placeholder="輸入日記標題（可選）"
                    className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium text-gray-700 mb-2 ${fontClass}`}>
                    日記內容
                  </label>
                  <textarea
                    value={journalContent}
                    onChange={(e) => setJournalContent(e.target.value)}
                    placeholder="記錄您的旅行心得和感受..."
                    rows={8}
                    className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  />
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={handleSaveJournal}
                    disabled={!journalContent.trim()}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    <Save className="h-4 w-4" />
                    <span className={fontClass}>保存日記</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsEditingJournal(false);
                      setJournalContent('');
                      setJournalTitle('');
                    }}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    <span className={fontClass}>取消</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {trip.journal && trip.journal.length > 0 ? (
                  <div className="space-y-4">
                    {trip.journal.map((entry, index) => (
                      <div key={entry._id || index} className="bg-white rounded-lg p-4 border border-blue-200">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className={`font-medium text-gray-900 ${fontClass}`}>{entry.title}</h4>
                          <button
                            onClick={() => handleDeleteJournal(index.toString())}
                            className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50"
                            title="刪除日記"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          {new Date(entry.date).toLocaleDateString('zh-CN')}
                        </p>
                        <p className={`text-gray-700 whitespace-pre-wrap ${fontClass}`}>{entry.content}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className={`text-center py-8 text-gray-700 ${fontClass}`}>
                    <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p>還沒有日記記錄</p>
                    <p className="text-sm">點擊「編輯日記」開始記錄您的旅行</p>
                  </div>
                )}
              </div>
            )}
          </div>
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

export default TripDetail;
