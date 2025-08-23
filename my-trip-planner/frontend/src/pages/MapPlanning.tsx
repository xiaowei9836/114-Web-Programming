import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import GoogleMap, { type GoogleMapRef } from '../components/GoogleMap';

interface Location {
  lat: number;
  lng: number;
  name: string;
  address?: string;
}

interface TripPoint {
  id: string;
  location: Location;
  estimatedCost: number;
  estimatedTime: number;
  notes: string;
}

// 可拖曳的行程地點項目組件
const SortableTripPoint = ({ point, index, onDelete, onEdit }: {
  point: TripPoint;
  index: number;
  onDelete: (id: string) => void;
  onEdit: (index: number) => void;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: point.id || index });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-white border border-gray-200 rounded-lg p-3 mb-2 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600"
          >
            ⋮⋮
          </div>
          <div className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
            {index + 1}
          </div>
          <div className="flex-1">
            <h4 className="font-medium text-gray-900">{point.location.name}</h4>
            <p className="text-sm text-gray-600">{point.location.address}</p>
            <div className="flex space-x-4 mt-1 text-xs text-gray-500">
              <span>💰 {point.estimatedCost} NTD</span>
              <span>⏰ {point.estimatedTime} 分鐘</span>
            </div>
          </div>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => onEdit(index)}
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            編輯
          </button>
          <button
            onClick={() => onDelete(point.id)}
            className="text-red-600 hover:text-red-800 text-sm"
          >
            刪除
          </button>
        </div>
      </div>
    </div>
  );
};

const MapPlanning: React.FC = () => {
  const [tripPoints, setTripPoints] = useState<TripPoint[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<google.maps.places.PlaceResult[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPoint, setNewPoint] = useState<{
    estimatedCost: number;
    estimatedTime: number;
    notes: string;
  }>({
    estimatedCost: 0,
    estimatedTime: 30,
    notes: ''
  });
  const [isSearching, setIsSearching] = useState(false);
  const searchTimeoutRef = useRef<number>();
  const mapRef = useRef<GoogleMapRef>(null);

  // 拖曳排序相關
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const oldIndex = tripPoints.findIndex(point => (point.id || tripPoints.indexOf(point)) === active.id);
      const newIndex = tripPoints.findIndex(point => (point.id || tripPoints.indexOf(point)) === over.id);
      
      const newTripPoints = arrayMove(tripPoints, oldIndex, newIndex);
      setTripPoints(newTripPoints);
      
      console.log('MapPlanning: 行程地點順序已更新:', newTripPoints.map((p, i) => `${i + 1}. ${p.location.name}`));
    }
  };

  // 使用 useCallback 穩定 handleLocationSelect 函數
  const handleLocationSelect = useCallback((location: Location) => {
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
    if (selectedLocation && newPoint.estimatedCost && newPoint.estimatedTime) {
      const point: TripPoint = {
        id: `point_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        location: selectedLocation,
        estimatedCost: newPoint.estimatedCost,
        estimatedTime: newPoint.estimatedTime,
        notes: newPoint.notes || ''
      };
      
      setTripPoints(prev => [...prev, point]);
      setSelectedLocation(null);
      setNewPoint({
        estimatedCost: 0,
        estimatedTime: 30,
        notes: ''
      });
      
      // 清除地圖上的臨時標記
      if (mapRef.current) {
        mapRef.current.clearTempMarker();
      }
      
      console.log('MapPlanning: 添加新地點:', point);
    }
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

            {/* 已添加的地點列表 */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">行程地點</h2>
                {tripPoints.length > 0 && (
                  <button
                    onClick={handleClearAll}
                    className="text-red-600 hover:text-red-700 text-sm font-medium"
                  >
                    清除全部
                  </button>
                )}
              </div>
              
              {tripPoints.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-2">🗺️</div>
                  <p>尚未添加任何地點</p>
                  <p className="text-sm">搜尋地點或點擊地圖來開始規劃</p>
                </div>
              ) : (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={tripPoints.map(point => point.id || tripPoints.indexOf(point))}
                    strategy={verticalListSortingStrategy}
                  >
                    {tripPoints.map((point, index) => (
                      <SortableTripPoint
                        key={point.id || index}
                        point={point}
                        index={index}
                        onDelete={handleRemovePoint}
                        onEdit={() => {
                          // 編輯功能待實現
                          console.log('編輯地點:', point);
                        }}
                      />
                    ))}
                  </SortableContext>
                </DndContext>
              )}
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
                      onChange={(e) => setNewPoint(prev => ({ ...prev, estimatedCost: Number(e.target.value) }))}
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
                      onChange={(e) => setNewPoint(prev => ({ ...prev, estimatedTime: Number(e.target.value) }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 border-blue-500"
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
                      rows={3}
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
                        setNewPoint({ estimatedCost: 0, estimatedTime: 30, notes: '' });
                      }}
                      className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors"
                    >
                      取消
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 右側地圖區域 */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">地圖視圖</h2>
              <GoogleMap
                onLocationSelect={handleLocationSelect}
                showLocationSearch={false}
                className="h-96 rounded-lg border border-gray-200"
                externalMarkers={tripPoints.map(point => {
                  console.log('MapPlanning: 傳遞外部標記:', point.location);
                  return point.location;
                })}
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
