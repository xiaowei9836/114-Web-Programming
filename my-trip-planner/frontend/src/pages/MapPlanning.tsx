import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import GoogleMap, { type GoogleMapRef } from '../components/GoogleMap';

// 穩定的 ID 生成器
let idCounter = 0;
const generateStableId = () => {
  idCounter += 1;
  return `point-${idCounter}-${Date.now()}`;
};

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
  const searchTimeoutRef = useRef<number>();
  const mapRef = useRef<GoogleMapRef>(null);

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

  const handleAddPoint = () => {
    if (!selectedLocation) return;

    const newTripPoint: TripPoint = {
      id: generateStableId(),
      location: selectedLocation,
      estimatedCost: newPoint.estimatedCost ? parseFloat(newPoint.estimatedCost) : undefined,
      estimatedTime: newPoint.estimatedTime ? parseFloat(newPoint.estimatedTime) : undefined,
      notes: newPoint.notes || undefined
    };

    console.log('MapPlanning: 添加新地點，ID:', newTripPoint.id);
    setTripPoints(prev => [...prev, newTripPoint]);
    setSelectedLocation(null);
    setShowAddForm(false);
    setNewPoint({ estimatedCost: '', estimatedTime: '', notes: '' });
    clearTempMarker(); // 添加地點後清除臨時標記
  };

  const handleRemovePoint = (id: string) => {
    setTripPoints(prev => prev.filter(point => point.id !== id));
  };

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
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">地圖行程規劃</h1>
          <p className="text-gray-600">在地圖上規劃您的旅行地點，創建完美的行程安排</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 左側控制面板 */}
          <div className="lg:col-span-1 space-y-6">
            {/* 搜尋欄位 */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">搜尋地點</h2>
              <div className="space-y-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="輸入地點名稱或地址..."
                    value={searchQuery}
                    onChange={(e) => handleSearchInput(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  {isSearching && (
                    <div className="absolute right-3 top-3">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                    </div>
                  )}
                </div>
                
                {/* 搜尋結果 */}
                {searchResults.length > 0 && (
                  <div className="border border-gray-200 rounded-lg bg-white shadow-lg">
                    {searchResults.map((place, index) => (
                      <button
                        key={index}
                        onClick={() => handleSelectSearchResult(place)}
                        className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
                      >
                        <div className="font-medium text-gray-900">{place.name}</div>
                        {place.formatted_address && (
                          <div className="text-sm text-gray-600">{place.formatted_address}</div>
                        )}
                      </button>
                    ))}
                  </div>
                )}
                
                <p className="text-sm text-gray-500">
                  搜尋地點或直接點擊地圖添加標記
                </p>
              </div>
            </div>

            {/* 添加地點表單 */}
            {showAddForm && selectedLocation && (
              <div className="bg-white rounded-lg shadow-md p-6 border-2 border-blue-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  添加地點：{selectedLocation.name}
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      預估費用 (NTD)
                    </label>
                    <input
                      type="number"
                      placeholder="0"
                      value={newPoint.estimatedCost}
                      onChange={(e) => setNewPoint(prev => ({ ...prev, estimatedCost: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      預估時間 (分鐘)
                    </label>
                    <input
                      type="number"
                      placeholder="30"
                      step="5"
                      value={newPoint.estimatedTime}
                      onChange={(e) => setNewPoint(prev => ({ ...prev, estimatedTime: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      備註
                    </label>
                    <textarea
                      placeholder="添加地點相關的備註..."
                      value={newPoint.notes}
                      onChange={(e) => setNewPoint(prev => ({ ...prev, notes: e.target.value }))}
                      rows={1}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={handleAddPoint}
                      className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                    >
                      添加地點
                    </button>
                    <button
                      onClick={() => {
                        setShowAddForm(false);
                        setSelectedLocation(null);
                        setNewPoint({ estimatedCost: '', estimatedTime: '', notes: '' });
                      }}
                      className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors"
                    >
                      取消
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 行程地點列表 */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">行程地點</h2>
                <div className="flex items-center space-x-2">
                  {tripPoints.length > 0 && (
                    <>
                      <button
                        onClick={() => setShowOrderEdit(!showOrderEdit)}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                        title={showOrderEdit ? '關閉順序編輯' : '開啟順序編輯'}
                      >
                        {showOrderEdit ? '關閉編輯' : '修改順序'}
                      </button>
                      <button
                        onClick={handleClearAll}
                        className="text-red-600 hover:text-red-700 text-sm font-medium"
                      >
                        清除全部
                      </button>
                    </>
                  )}
                </div>
              </div>
              
              {tripPoints.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>還沒有添加任何地點</p>
                  <p className="text-sm">搜尋地點或點擊地圖來開始規劃行程</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {tripPoints.map((point, index) => {
                    return (
                      <div
                        key={`${point.id}-${index}`}
                        className={`border border-gray-200 rounded-lg p-4 bg-gray-50`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center mb-2">
                              <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full mr-2">
                                {index + 1}
                              </span>
                              <h3 className="font-medium text-gray-900">{point.location.name}</h3>
                              <span className="ml-2 text-red-500" title="地圖標記">📍</span>
                            </div>
                            {point.location.address && (
                              <p className="text-sm text-gray-600 mb-2">{point.location.address}</p>
                            )}
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              {point.estimatedCost && (
                                <span>💰 ${point.estimatedCost} NTD</span>
                              )}
                              {point.estimatedTime && (
                                <span>⏰ {point.estimatedTime} 分鐘</span>
                              )}
                            </div>
                            {point.notes && (
                              <p className="text-sm text-gray-600 mt-2 italic">"{point.notes}"</p>
                            )}
                          </div>
                          <div className="flex flex-col items-center space-y-1 ml-2">
                            {/* 直接修改順序輸入框 - 根據showOrderEdit狀態顯示/隱藏 */}
                            {showOrderEdit && (
                              <div className="flex items-center space-x-1 mb-2">
                                <span className="text-xs text-gray-500">去第</span>
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
                                  className="w-12 px-2 py-1 text-xs border border-gray-300 rounded text-center focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  title={`輸入 1-${tripPoints.length} 來調整順序`}
                                />
                                <span className="text-xs text-gray-500">位</span>
                              </div>
                            )}
                            
                            {/* 移除按鈕 - 放在最上面 */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemovePoint(point.id);
                              }}
                              onMouseDown={(e) => e.stopPropagation()}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 rounded w-8 h-8 flex items-center justify-center"
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
                                  ? 'text-gray-300 cursor-not-allowed' 
                                  : 'text-blue-600 hover:text-blue-700 hover:bg-blue-50'
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
                                  ? 'text-gray-300 cursor-not-allowed' 
                                  : 'text-green-600 hover:text-green-700 hover:bg-green-50'
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
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">地圖視圖</h2>
              <GoogleMap
                onLocationSelect={handleLocationSelect}
                showLocationSearch={false}
                className="h-96 rounded-lg border border-gray-200"
                externalMarkers={externalMarkers}
                onMarkerClick={(location) => {
                  console.log('點擊地圖標記:', location);
                  // 可以添加點擊標記後的邏輯，比如顯示地點詳情
                }}
                ref={mapRef}
              />
            </div>
          </div>
        </div>

        {/* 底部操作按鈕 */}
        {tripPoints.length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">行程摘要</h3>
                <p className="text-gray-600">
                  已規劃 {tripPoints.length} 個地點
                  {tripPoints.some(p => p.estimatedCost) && (
                    <span className="ml-2">
                      • 總預估費用：$
                      {tripPoints
                        .filter(p => p.estimatedCost)
                        .reduce((sum, p) => sum + (p.estimatedCost || 0), 0)
                        .toFixed(0)} NTD
                    </span>
                  )}
                </p>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    // 這裡可以添加保存行程的邏輯
                    alert('行程保存功能開發中...');
                  }}
                  className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  保存行程
                </button>
                <button
                  onClick={handleClearAll}
                  className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
                >
                  清除全部
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MapPlanning;
