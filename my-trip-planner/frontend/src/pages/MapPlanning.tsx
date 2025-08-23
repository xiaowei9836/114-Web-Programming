import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { DragDropContext, Droppable, Draggable, type DropResult } from 'react-beautiful-dnd';
import GoogleMap, { type GoogleMapRef } from '../components/GoogleMap';

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
  const [tripPoints, setTripPoints] = useState<TripPoint[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<google.maps.places.PlaceResult[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<{
    lat: number;
    lng: number;
    name: string;
    address?: string;
  } | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPoint, setNewPoint] = useState({
    estimatedCost: '',
    estimatedTime: '',
    notes: ''
  });
  const [isSearching, setIsSearching] = useState(false);
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

  // 處理拖曳排序
  const handleDragEnd = (result: DropResult) => {
    console.log('MapPlanning: 拖曳結束，結果:', result);
    
    if (!result.destination) {
      console.log('MapPlanning: 沒有目標位置，拖曳取消');
      return;
    }

    const items = Array.from(tripPoints);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    console.log('MapPlanning: 重新排序完成，新順序:', items.map(item => item.location.name));
    setTripPoints(items);
  };

  // 簡單的拖曳測試（不使用 react-beautiful-dnd）
  const testSimpleDrag = () => {
    console.log('MapPlanning: 測試簡單拖曳功能');
    if (tripPoints.length >= 2) {
      const newOrder = [...tripPoints];
      const temp = newOrder[0];
      newOrder[0] = newOrder[1];
      newOrder[1] = temp;
      
      console.log('MapPlanning: 手動交換前兩個地點');
      setTripPoints(newOrder);
    } else {
      console.log('MapPlanning: 需要至少 2 個地點才能測試交換');
    }
  };

  // 測試拖曳項目的穩定性
  const testDragStability = () => {
    console.log('MapPlanning: 測試拖曳項目穩定性');
    console.log('MapPlanning: 檢查 tripPoints 數組的穩定性');
    
    // 檢查數組引用是否穩定
    const currentPoints = tripPoints;
    console.log('MapPlanning: 當前 tripPoints 引用:', currentPoints);
    console.log('MapPlanning: 數組長度:', currentPoints.length);
    
    // 檢查每個項目的穩定性
    currentPoints.forEach((point, index) => {
      console.log(`MapPlanning: 項目 ${index}:`, {
        id: point.id,
        name: point.location.name,
        idType: typeof point.id,
        idLength: point.id.length
      });
    });
  };

  // 測試拖曳功能是否正常工作
  const testDrag = () => {
    console.log('MapPlanning: 測試拖曳功能');
    console.log('MapPlanning: tripPoints 長度:', tripPoints.length);
    console.log('MapPlanning: tripPoints IDs:', tripPoints.map(p => p.id));
    console.log('MapPlanning: 拖曳相關 props 是否正確綁定');
    
    // 檢查 react-beautiful-dnd 是否正常工作
    console.log('MapPlanning: 檢查 react-beautiful-dnd 狀態');
    
    // 檢查拖曳容器狀態
    console.log('MapPlanning: 拖曳容器狀態檢查');
    console.log('MapPlanning: 每個地點的拖曳狀態:');
    tripPoints.forEach((point, index) => {
      console.log(`  ${index + 1}. ID: ${point.id}, 名稱: ${point.location.name}`);
    });
  };

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
      id: `point-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
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

  const handleClearAll = () => {
    setTripPoints([]);
    setSelectedLocation(null);
    setShowAddForm(false);
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
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">行程地點</h2>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={testDrag}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium px-2 py-1 border border-blue-300 rounded"
                    title="測試拖曳功能"
                  >
                    🔍
                  </button>
                  <button
                    onClick={testSimpleDrag}
                    className="text-green-600 hover:text-green-700 text-sm font-medium px-2 py-1 border border-green-300 rounded"
                    title="測試簡單拖曳"
                  >
                    🔄
                  </button>
                  <button
                    onClick={testDragStability}
                    className="text-purple-600 hover:text-purple-700 text-sm font-medium px-2 py-1 border border-purple-300 rounded"
                    title="測試拖曳穩定性"
                  >
                    📊
                  </button>
                  {tripPoints.length > 0 && (
                    <button
                      onClick={handleClearAll}
                      className="text-red-600 hover:text-red-700 text-sm font-medium"
                    >
                      清除全部
                    </button>
                  )}
                </div>
              </div>
              
              {tripPoints.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-2">🗺️</div>
                  <p>尚未添加任何地點</p>
                  <p className="text-sm">搜尋地點或點擊地圖來開始規劃</p>
                </div>
              ) : (
                <DragDropContext 
                  onDragEnd={handleDragEnd}
                  onDragStart={(result) => console.log('MapPlanning: 拖曳開始:', result)}
                  onDragUpdate={(result) => console.log('MapPlanning: 拖曳更新:', result)}
                >
                  <Droppable droppableId="trip-points" mode="standard">
                    {(provided, snapshot) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className={`space-y-3 ${snapshot.isDraggingOver ? 'bg-blue-50' : ''}`}
                        style={{ 
                          minHeight: '50px',
                          position: 'relative'
                        }}
                      >
                        {tripPoints.map((point, index) => (
                          <Draggable 
                            key={point.id} 
                            draggableId={point.id} 
                            index={index}
                            isDragDisabled={false}
                          >
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`border border-gray-200 rounded-lg p-4 bg-gray-50 cursor-move select-none ${
                                  snapshot.isDragging ? 'shadow-lg transform rotate-2 bg-blue-100 z-50' : ''
                                }`}
                                style={{
                                  ...provided.draggableProps.style,
                                  userSelect: 'none',
                                  touchAction: 'none'
                                }}
                                onMouseDown={(e) => console.log('MapPlanning: 滑鼠按下:', e)}
                                onTouchStart={(e) => console.log('MapPlanning: 觸摸開始:', e)}
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
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleRemovePoint(point.id);
                                    }}
                                    onMouseDown={(e) => e.stopPropagation()}
                                    className="text-red-500 hover:text-red-700 ml-2 p-1"
                                    title="移除地點"
                                  >
                                    ✕
                                  </button>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
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
