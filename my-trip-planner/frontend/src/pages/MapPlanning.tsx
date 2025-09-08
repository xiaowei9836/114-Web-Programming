import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import GoogleMap, { type GoogleMapRef } from '../components/GoogleMap';
import { Bot, MessageCircle } from 'lucide-react';
import { useAIChat } from '../contexts/AIChatContext';

// 穩定的 ID 生成器
let idCounter = 0;
const generateStableId = () => {
  idCounter += 1;
  return `point-${idCounter}-${Date.now()}`;
};

// 行程點數量限制
const MAX_TRIP_POINTS = 99;

// 定義類型
interface Location {
  lat: number;
  lng: number;
  name: string;
  address?: string;
}

interface TripPoint {
  id: string;
  location: Location;
  estimatedCost?: number;
  estimatedTime?: number;
  notes?: string;
}

interface TripData {
  id: string;
  name: string;
  title: string;
  createdAt: string;
  totalPoints: number;
  totalEstimatedCost: number;
  totalEstimatedTime: number;
  points: Array<{
    order: number;
    name: string;
    address?: string;
    coordinates: {
      lat: number;
      lng: number;
    };
    estimatedCost?: number;
    estimatedTime?: number;
    notes?: string;
  }>;
}

const MapPlanning: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<google.maps.places.PlaceResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [tripPoints, setTripPoints] = useState<TripPoint[]>([]);
  const [newPoint, setNewPoint] = useState({
    estimatedCost: '',
    estimatedTime: '',
    notes: ''
  });
  const [showOrderEdit, setShowOrderEdit] = useState(false);
  const [savedTripData, setSavedTripData] = useState<TripData | null>(null);
  const [savedTripSummary, setSavedTripSummary] = useState<string>('');
  const [showSavedTrip, setShowSavedTrip] = useState(false);
  const [savedTrips, setSavedTrips] = useState<TripData[]>([]); // 新增狀態來保存所有行程
  const { openChat, isMinimized } = useAIChat();
  const searchTimeoutRef = useRef<number>();
  const mapRef = useRef<GoogleMapRef>(null);
  
  // 後端 API 端點配置
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';
  
  // 直接使用霞鶩文楷字體
  const fontClass = 'font-["LXGW-WenKai"]';

  // 使用 useCallback 穩定 handleLocationSelect 函數
  const handleLocationSelect = useCallback((location: {
    lat: number;
    lng: number;
    name: string;
    address?: string;
  }) => {
    console.log('MapPlanning: 收到地點選擇:', location);
    setSelectedLocation(location);
    setShowAddForm(true);
  }, []);

  // 清除臨時標記的函數
  const clearTempMarker = useCallback(() => {
    if (mapRef.current) {
      mapRef.current.clearTempMarker();
    }
  }, []);

  // 清除所有地點
  const handleClearAll = () => {
    setTripPoints([]);
    setSelectedLocation(null);
  };


  // 使用 useEffect 來管理地點狀態
  useEffect(() => {
    console.log('MapPlanning: tripPoints 變化，更新地點狀態');
    console.log('MapPlanning: 當前 tripPoints:', tripPoints.map(p => ({ id: p.id, name: p.location.name })));
  }, [tripPoints]);

  // 移除拖曳相關的狀態和函數
  // 不再需要 droppableId 和 stableTripPoints

  // 搜尋地點
  const searchPlaces = async (query: string) => {
    if (!query.trim() || !window.google) return;

    setIsSearching(true);
    try {
      const service = new google.maps.places.PlacesService(document.createElement('div'));
      
      const request: google.maps.places.TextSearchRequest = {
        query: query,
        type: 'establishment'
      };

      service.textSearch(request, (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && results) {
          setSearchResults(results.slice(0, 5)); // 限制結果數量
        } else {
          setSearchResults([]);
        }
        setIsSearching(false);
      });
    } catch (error) {
      console.error('搜尋失敗:', error);
      setIsSearching(false);
    }
  };

  // 處理搜尋輸入
  const handleSearchInput = (value: string) => {
    setSearchQuery(value);
    
    // 清除之前的超時
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    // 設置新的搜尋超時
    searchTimeoutRef.current = setTimeout(() => {
      if (value.trim()) {
        searchPlaces(value);
      } else {
        setSearchResults([]);
      }
    }, 500);
  };

  // 選擇搜尋結果
  const handleSelectSearchResult = (place: google.maps.places.PlaceResult) => {
    if (place.geometry && place.geometry.location) {
      const location = {
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
        name: place.name || '未知地點',
        address: place.formatted_address
      };
      
      setSelectedLocation(location);
      setShowAddForm(true);
      setSearchResults([]);
      setSearchQuery(place.name || '');
    }
  };

  // 添加地點到行程
  const handleAddPoint = () => {
    if (!selectedLocation) return;

    // 檢查是否達到地點數量上限
    if (tripPoints.length >= MAX_TRIP_POINTS) {
      alert(`已達到行程地點數量上限（最多 ${MAX_TRIP_POINTS} 個地點）`);
      return;
    }

    const newTripPoint: TripPoint = {
      id: generateStableId(),
      location: selectedLocation,
      estimatedCost: newPoint.estimatedCost ? parseInt(newPoint.estimatedCost) : undefined,
      estimatedTime: newPoint.estimatedTime ? parseInt(newPoint.estimatedTime) : undefined,
      notes: newPoint.notes || undefined
    };

    setTripPoints(prev => [...prev, newTripPoint]);
    setSelectedLocation(null);
    setShowAddForm(false);
    setNewPoint({ estimatedCost: '', estimatedTime: '', notes: '' });
    
    console.log('MapPlanning: 添加新地點，ID:', newTripPoint.id);
  };

  const handleRemovePoint = (id: string) => {
    setTripPoints(prev => prev.filter(point => point.id !== id));
  };

  // 保存行程功能 - 保存到雲端數據庫
  const handleSaveTrip = async () => {
    if (tripPoints.length === 0) {
      alert('請先添加至少一個地點才能保存行程');
      return;
    }

    const tripData = {
      title: `地圖行程 - ${new Date().toLocaleDateString('zh-TW')}`,
      destination: tripPoints.map(p => p.location.name).join(', '),
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      description: `包含 ${tripPoints.length} 個地點的地圖行程`,
      budget: {
        total: tripPoints
          .filter(p => p.estimatedCost)
          .reduce((sum, p) => sum + (p.estimatedCost || 0), 0),
        spent: 0,
        currency: 'NTD'
      },
      // 添加地圖行程特有的數據
      mapTripData: {
        id: generateStableId(),
        createdAt: new Date().toISOString(),
        totalPoints: tripPoints.length,
        totalEstimatedCost: tripPoints
          .filter(p => p.estimatedCost)
          .reduce((sum, p) => sum + (p.estimatedCost || 0), 0),
        totalEstimatedTime: tripPoints
          .filter(p => p.estimatedTime)
          .reduce((sum, p) => sum + (p.estimatedTime || 0), 0),
        points: tripPoints.map((point, index) => ({
          order: index + 1,
          name: point.location.name,
          address: point.location.address,
          coordinates: {
            lat: point.location.lat,
            lng: point.location.lng
          },
          estimatedCost: point.estimatedCost,
          estimatedTime: point.estimatedTime,
          notes: point.notes
        }))
      }
    };

    try {
      const response = await fetch(`${API_BASE_URL}/api/trips`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tripData),
      });

      if (response.ok) {
        const savedTrip = await response.json();
        console.log('MapPlanning: 行程已保存到雲端數據庫');
        
        // 更新本地狀態
        const localTripData: TripData = {
          id: savedTrip._id,
          name: savedTrip.title,
          title: savedTrip.title,
          createdAt: savedTrip.createdAt,
          totalPoints: tripData.mapTripData.totalPoints,
          totalEstimatedCost: tripData.mapTripData.totalEstimatedCost,
          totalEstimatedTime: tripData.mapTripData.totalEstimatedTime,
          points: tripData.mapTripData.points
        };
        
        // 創建行程摘要
        const tripSummary = generateTripSummary(localTripData);
        
        // 在畫面上顯示行程數據
        setSavedTripData(localTripData);
        setSavedTripSummary(tripSummary);
        setShowSavedTrip(true);
        
        // 重新載入已保存的行程列表
        fetchSavedTrips();
      } else {
        throw new Error(`保存失敗: ${response.statusText}`);
      }
    } catch (error) {
      console.error('MapPlanning: 保存行程失敗:', error);
      alert('保存行程失敗，請稍後再試');
    }
  };

  // 生成行程摘要
  const generateTripSummary = (tripData: TripData) => {
    const { title, totalPoints, totalEstimatedCost, totalEstimatedTime, points } = tripData;
    
    let summary = `${title}\n`;
    summary += `行程總覽\n`;
    summary += `總地點數：${totalPoints} 個\n`;
    summary += `總預估費用：${totalEstimatedCost > 0 ? `$${totalEstimatedCost} NTD` : '未設定'}\n`;
    summary += `總預估時間：${totalEstimatedTime > 0 ? `${totalEstimatedTime} 分鐘` : '未設定'}\n`;
    summary += `\n詳細行程：\n`;
    
    points.forEach((point) => {
      summary += `${point.order}. ${point.name}\n`;
      if (point.address) {
        summary += `   地址：${point.address}\n`;
      }
      if (point.estimatedCost) {
        summary += `   預估費用：$${point.estimatedCost} NTD\n`;
      }
      if (point.estimatedTime) {
        summary += `   預估時間：${point.estimatedTime} 分鐘\n`;
      }
      if (point.notes) {
        summary += `   備註：${point.notes}\n`;
      }
      summary += `\n`;
    });
    
    return summary;
  };



  // 從雲端獲取已保存的行程
  const fetchSavedTrips = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/trips`);
      if (response.ok) {
        const trips = await response.json();
        // 只顯示有mapTripData的行程（地圖行程）
        const mapTrips = trips
          .filter((trip: any) => trip.mapTripData)
          .map((trip: any) => ({
            id: trip._id,
            name: trip.title,
            title: trip.title,
            createdAt: trip.createdAt,
            totalPoints: trip.mapTripData.totalPoints,
            totalEstimatedCost: trip.mapTripData.totalEstimatedCost,
            totalEstimatedTime: trip.mapTripData.totalEstimatedTime,
            points: trip.mapTripData.points
          }));
        setSavedTrips(mapTrips);
        console.log('MapPlanning: 已從雲端載入地圖行程數據');
      } else {
        throw new Error(`載入失敗: ${response.statusText}`);
      }
    } catch (error) {
      console.error('MapPlanning: 載入地圖行程失敗:', error);
      // 如果雲端載入失敗，嘗試從localStorage載入
      try {
        const savedTripsData = JSON.parse(localStorage.getItem('savedTrips') || '[]');
        setSavedTrips(savedTripsData);
        console.log('MapPlanning: 已從localStorage恢復保存的行程數據');
      } catch (localError) {
        console.error('MapPlanning: 從localStorage恢復失敗:', localError);
      }
    }
  };

  // 在頁面載入時獲取已保存的行程數據
  useEffect(() => {
    fetchSavedTrips();
  }, []);

  // 清理超時
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);


  const externalMarkers = useMemo(() => {
    return tripPoints.map(point => point.location);
  }, [tripPoints]);

  return (
    <div className={`min-h-screen bg-black text-[#e9eef2] ${fontClass}`}>
      <div className="container mx-auto px-2 py-0">
        <div className="mb-2">
          <div className="relative mb-4">
            <div className="text-center">
              <h1 className={`text-3xl font-bold text-[#e9eef2] mb-2 ${fontClass}`}>地圖行程規劃</h1>
              <p className="text-[#a9b6c3]">在地圖上規劃您的旅行地點，創建完美的行程安排</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 左側控制面板 */}
          <div className="lg:col-span-1 space-y-6">
            {/* 搜尋欄位 */}
            <div className="bg-gray-700 border border-gray-600 rounded-lg shadow-md p-6">
              <h2 className={`text-xl font-semibold text-[#e9eef2] mb-4 ${fontClass}`}>搜尋地點</h2>
              <div className="space-y-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="輸入地點名稱或地址..."
                    value={searchQuery}
                    onChange={(e) => handleSearchInput(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 text-[#e9eef2] placeholder-gray-400 rounded-lg focus:ring-2 focus:ring-[#c7a559] focus:border-[#c7a559]"
                  />
                  {isSearching && (
                    <div className="absolute right-3 top-3">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                    </div>
                  )}
                </div>
                
                {/* 搜尋結果 */}
                {searchResults.length > 0 && (
                  <div className="border border-gray-600 rounded-lg bg-gray-700 shadow-lg">
                    {searchResults.map((place, index) => (
                      <button
                        key={index}
                        onClick={() => handleSelectSearchResult(place)}
                        className="w-full text-left px-4 py-3 hover:bg-gray-600 border-b border-gray-600 last:border-b-0 transition-colors"
                      >
                        <div className="font-medium text-[#e9eef2]">{place.name}</div>
                        {place.formatted_address && (
                          <div className="text-sm text-[#a9b6c3]">{place.formatted_address}</div>
                        )}
                      </button>
                    ))}
                  </div>
                )}
                
                <p className="text-sm text-[#a9b6c3]">
                  搜尋地點或直接點擊地圖添加標記
                </p>
              </div>
            </div>

            {/* 添加地點表單 */}
            {showAddForm && selectedLocation && (
              <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-md p-6 border-2 border-[#c7a559]">
                <h3 className={`text-lg font-semibold text-[#e9eef2] mb-4 ${fontClass}`}>
                  添加地點：{selectedLocation.name}
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[#e9eef2] mb-1">
                      預估費用 (NTD)
                    </label>
                    <input
                      type="number"
                      placeholder="0"
                      value={newPoint.estimatedCost}
                      onChange={(e) => setNewPoint(prev => ({ ...prev, estimatedCost: e.target.value }))}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-[#e9eef2] placeholder-gray-400 rounded-md focus:ring-2 focus:ring-[#c7a559] focus:border-[#c7a559]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#e9eef2] mb-1">
                      預估時間 (分鐘)
                    </label>
                    <input
                      type="number"
                      placeholder="30"
                      step="5"
                      value={newPoint.estimatedTime}
                      onChange={(e) => setNewPoint(prev => ({ ...prev, estimatedTime: e.target.value }))}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-[#e9eef2] placeholder-gray-400 rounded-md focus:ring-2 focus:ring-[#c7a559] focus:border-[#c7a559]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#e9eef2] mb-1">
                      備註
                    </label>
                    <textarea
                      placeholder="添加地點相關的備註..."
                      value={newPoint.notes}
                      onChange={(e) => setNewPoint(prev => ({ ...prev, notes: e.target.value }))}
                      rows={1}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-[#e9eef2] placeholder-gray-400 rounded-md focus:ring-2 focus:ring-[#c7a559] focus:border-[#c7a559]"
                    />
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={handleAddPoint}
                      className="flex-1 bg-gradient-to-r from-[#c7a559] to-[#efc56a] hover:from-[#b8954f] hover:to-[#d4b05a] text-[#162022] py-2 px-4 rounded-md transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
                    >
                      添加地點
                    </button>
                    <button
                      onClick={() => {
                        setShowAddForm(false);
                        setSelectedLocation(null);
                        setNewPoint({ estimatedCost: '', estimatedTime: '', notes: '' });
                      }}
                      className="flex-1 bg-gray-600 text-[#e9eef2] py-2 px-4 rounded-md hover:bg-gray-500 transition-colors"
                    >
                      取消
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 行程地點列表 */}
            <div className="bg-gray-700 border border-gray-600 rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <h2 className={`text-xl font-semibold text-[#e9eef2] ${fontClass}`}>行程地點</h2>
                <div className="flex items-center space-x-2">
                  {tripPoints.length > 0 && (
                    <>
                      <button
                        onClick={() => setShowOrderEdit(!showOrderEdit)}
                        className="text-[#c7a559] hover:text-[#efc56a] text-sm font-medium"
                        title={showOrderEdit ? '關閉順序編輯' : '開啟順序編輯'}
                      >
                        {showOrderEdit ? '關閉編輯' : '修改順序'}
                      </button>
                      <button
                        onClick={handleClearAll}
                        className="text-red-400 hover:text-red-300 text-sm font-medium"
                      >
                        清除全部
                      </button>
                    </>
                  )}
                </div>
              </div>
              
              {tripPoints.length === 0 ? (
                <div className="text-center py-8 text-[#a9b6c3]">
                  <p>還沒有添加任何地點</p>
                  <p className="text-sm">搜尋地點或點擊地圖來開始規劃行程</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {tripPoints.map((point, index) => {
                    return (
                      <div
                        key={`${point.id}-${index}`}
                        className={`border border-gray-600 rounded-lg p-4 bg-gray-700`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center mb-2">
                               {showOrderEdit ? (
                                 <input
                                   type="number"
                                   min="1"
                                   max={tripPoints.length}
                                   value={index + 1}
                                   onChange={(e) => {
                                     const newPosition = parseInt(e.target.value);
                                     if (newPosition >= 1 && newPosition <= tripPoints.length && newPosition !== index + 1) {
                                       // 創建新的順序數組
                                       const newOrder = [...tripPoints];
                                       // 移除當前地點
                                       const [movedItem] = newOrder.splice(index, 1);
                                       // 插入到新位置（減1是因為數組索引從0開始）
                                       newOrder.splice(newPosition - 1, 0, movedItem);
                                       setTripPoints(newOrder);
                                       console.log(`MapPlanning: 將 "${point.location.name}" 從第 ${index + 1} 位移動到第 ${newPosition} 位`);
                                     }
                                   }}
                                   className="w-12 px-2 py-1 text-xs font-medium bg-[#c7a559] text-[#162022] rounded-full text-center focus:ring-2 focus:ring-[#c7a559] focus:border-[#c7a559] border border-[#c7a559]"
                                   title={`輸入 1-${tripPoints.length} 來調整順序`}
                                 />
                               ) : (
                                 <span className="bg-[#c7a559] text-[#162022] text-xs font-medium px-2 py-1 rounded-full mr-2">
                                   {index + 1}
                                 </span>
                               )}
                               <h3 className={`font-medium text-[#e9eef2] ${fontClass}`}>{point.location.name}</h3>
                               <span className="ml-2 text-red-500" title="地圖標記">📍</span>
                             </div>
                             
                             {/* 詳細訊息區域 - 與"⬆️"按鈕上緣對齊 */}
                             <div className="mt-6">
                               {point.location.address && (
                                 <p className="text-sm text-[#a9b6c3] mb-2">{point.location.address}</p>
                               )}
                               <div className="flex items-center space-x-4 text-sm text-[#a9b6c3]">
                                 {point.estimatedCost && (
                                   <span>💰 ${point.estimatedCost} NTD</span>
                                 )}
                                 {point.estimatedTime && (
                                   <span>⏰ {point.estimatedTime} 分鐘</span>
                                 )}
                               </div>
                               {point.notes && (
                                 <p className="text-sm text-[#a9b6c3] mt-2 italic">"{point.notes}"</p>
                               )}
                             </div>
                           </div>
                          <div className="flex flex-col items-center space-y-1 ml-2">
                            {/* 移除按鈕 - 放在最上面 */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemovePoint(point.id);
                              }}
                              onMouseDown={(e) => e.stopPropagation()}
                              className="text-red-400 hover:text-red-300 hover:bg-red-900/20 p-1 rounded w-8 h-8 flex items-center justify-center"
                              title="移除地點"
                            >
                              ✕
                            </button>
                            
                            {/* 上移按鈕 */}
                            <button
                              onClick={() => {
                                if (index > 0) {
                                  const newOrder = [...tripPoints];
                                  const temp = newOrder[index];
                                  newOrder[index] = newOrder[index - 1];
                                  newOrder[index - 1] = temp;
                                  setTripPoints(newOrder);
                                  console.log(`MapPlanning: 將 "${point.location.name}" 上移一位`);
                                }
                              }}
                              disabled={index === 0}
                              className={`p-1 rounded w-8 h-8 flex items-center justify-center ${
                                index === 0 
                                  ? 'text-gray-500 cursor-not-allowed' 
                                  : 'text-[#c7a559] hover:text-[#efc56a] hover:bg-[#c7a559]/20'
                              }`}
                              title={index === 0 ? '已是第一個' : '上移一位'}
                            >
                              ⬆️
                            </button>
                            
                            {/* 下移按鈕 */}
                            <button
                              onClick={() => {
                                if (index < tripPoints.length - 1) {
                                  const newOrder = [...tripPoints];
                                  const temp = newOrder[index];
                                  newOrder[index] = newOrder[index + 1];
                                  newOrder[index + 1] = temp;
                                  setTripPoints(newOrder);
                                  console.log(`MapPlanning: 將 "${point.location.name}" 下移一位`);
                                }
                              }}
                              disabled={index === tripPoints.length - 1}
                              className={`p-1 rounded w-8 h-8 flex items-center justify-center ${
                                index === tripPoints.length - 1 
                                  ? 'text-gray-500 cursor-not-allowed' 
                                  : 'text-[#c7a559] hover:text-[#efc56a] hover:bg-[#c7a559]/20'
                              }`}
                              title={index === tripPoints.length - 1 ? '已是最後一個' : '下移一位'}
                            >
                              ⬇️
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* 右側地圖區域 */}
          <div className="lg:col-span-2">
            <div className="bg-gray-700 rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-[#e9eef2] mb-4">地圖視圖</h2>
              <GoogleMap
                onLocationSelect={handleLocationSelect}
                showLocationSearch={false}
                className="h-[500px] rounded-lg overflow-hidden"
                externalMarkers={externalMarkers}
                onMarkerClick={(location) => {
                  console.log('點擊地圖標記:', location);
                  // 可以添加點擊標記後的邏輯，比如顯示地點詳情
                }}
                ref={mapRef}
              />
            </div>

            {/* 行程摘要區塊 - 移動到地圖視圖下方 */}
            <div className="mt-6 bg-gray-700 rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-[#e9eef2]">行程摘要</h3>
                  <p className="text-[#a9b6c3]">
                    {tripPoints.length > 0 ? (
                      <>
                        已規劃 {tripPoints.length} 個地點
                        {tripPoints.length >= MAX_TRIP_POINTS && (
                          <span className="ml-2 text-orange-400 font-medium">
                            (已達上限 {MAX_TRIP_POINTS} 個)
                          </span>
                        )}
                        {tripPoints.some(p => p.estimatedCost) && (
                          <span className="ml-2">
                            • 總預估費用：$
                            {tripPoints
                              .filter(p => p.estimatedCost)
                              .reduce((sum, p) => sum + (p.estimatedCost || 0), 0)
                              .toFixed(0)} NTD
                          </span>
                        )}
                        {tripPoints.some(p => p.estimatedTime) && (
                          <span className="ml-2">
                            • 總預估時間：
                            {tripPoints
                              .filter(p => p.estimatedTime)
                              .reduce((sum, p) => sum + (p.estimatedTime || 0), 0)} 分鐘
                          </span>
                        )}
                      </>
                    ) : (
                      '尚未添加任何地點，請先搜尋並添加地點到行程中'
                    )}
                  </p>
                  {tripPoints.length > 0 && (
                    <p className="text-sm text-[#a9b6c3] mt-2">
                      地點數量限制：{tripPoints.length}/{MAX_TRIP_POINTS}
                    </p>
                  )}
                  {savedTrips.length > 0 && (
                    <p className="text-sm text-blue-400 mt-2">
                      已保存 {savedTrips.length} 個行程
                    </p>
                  )}
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={handleSaveTrip}
                    disabled={tripPoints.length === 0}
                    className={`px-6 py-2 rounded-lg transition-colors ${fontClass} ${
                      tripPoints.length === 0
                        ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                        : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                    }`}
                  >
                    保存行程
                  </button>
                  <button
                    onClick={handleClearAll}
                    disabled={tripPoints.length === 0}
                    className={`px-6 py-2 rounded-lg transition-colors ${fontClass} ${
                      tripPoints.length === 0
                        ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                        : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                    }`}
                  >
                    清除全部
                  </button>
                </div>
              </div>
            </div>

            {/* 保存的行程顯示區域 */}
            {savedTrips.length > 0 && (
              <div className="mt-6 bg-gray-700 rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-[#e9eef2]">已保存的行程</h3>
                  <button
                    onClick={async () => {
                      if (window.confirm('確定要刪除所有已保存的地圖行程嗎？')) {
                        try {
                          // 批量刪除所有地圖行程
                          const deletePromises = savedTrips.map(trip => 
                            fetch(`${API_BASE_URL}/api/trips/${trip.id}`, {
                              method: 'DELETE',
                            })
                          );
                          
                          await Promise.all(deletePromises);
                          
                          setSavedTrips([]);
                          setShowSavedTrip(false);
                          console.log('MapPlanning: 已清除所有保存的地圖行程');
                        } catch (error) {
                          console.error('MapPlanning: 清除地圖行程失敗:', error);
                          alert('清除行程失敗，請稍後再試');
                        }
                      }
                    }}
                    className="text-blue-400 hover:text-blue-300 text-sm font-medium"
                  >
                    清除全部
                  </button>
                </div>
                <div className="space-y-4">
                  {savedTrips.map((trip, index) => (
                    <div key={trip.id} className="bg-gray-200 rounded-lg p-4 border border-gray-300">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-blue-600">
                          行程 {index + 1} 保存於：{new Date(trip.createdAt).toLocaleString('zh-TW')}
                        </h4>
                        <button
                          onClick={async () => {
                            try {
                              const response = await fetch(`${API_BASE_URL}/api/trips/${trip.id}`, {
                                method: 'DELETE',
                              });
                              
                              if (response.ok) {
                                console.log('MapPlanning: 已從雲端刪除行程:', trip.id);
                                // 重新載入已保存的行程列表
                                fetchSavedTrips();
                              } else {
                                throw new Error(`刪除失敗: ${response.statusText}`);
                              }
                            } catch (error) {
                              console.error('MapPlanning: 刪除行程失敗:', error);
                              alert('刪除行程失敗，請稍後再試');
                            }
                          }}
                          className="text-red-500 hover:text-red-700 text-sm"
                        >
                          刪除
                        </button>
                      </div>
                      <div className="text-sm text-gray-700 mb-2">
                        {trip.points.map((point, pointIndex) => (
                          <span key={pointIndex}>
                            {point.name}
                            {pointIndex < trip.points.length - 1 && ' → '}
                          </span>
                        ))}
                      </div>
                      <div className="text-sm text-gray-700">
                        {trip.totalEstimatedCost > 0 && (
                          <div>總預估費用：${trip.totalEstimatedCost} NTD</div>
                        )}
                        {trip.totalEstimatedTime > 0 && (
                          <div>總預估時間：{trip.totalEstimatedTime} 分鐘</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
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

export default MapPlanning;
