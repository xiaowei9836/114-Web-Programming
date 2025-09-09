import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import GoogleMap, { type GoogleMapRef } from '../components/GoogleMap';
import { MessageCircle } from 'lucide-react';
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
  const [savedTrips, setSavedTrips] = useState<TripData[]>([]); // 新增狀態來保存所有行程
  const [tripName, setTripName] = useState(''); // 行程名稱
  const [editingTripName, setEditingTripName] = useState<string | null>(null); // 正在編輯的行程ID
  const [editingTripId, setEditingTripId] = useState<string | null>(null); // 正在編輯的行程ID（載入到左側）
  const [isEditingMode, setIsEditingMode] = useState(false); // 是否為編輯模式
  const [originalTripData, setOriginalTripData] = useState<TripData | null>(null); // 原始行程數據
  const [hasChanges, setHasChanges] = useState(false); // 是否有變更
  const [isSaved, setIsSaved] = useState(false); // 是否已保存
  const { openChat, isMinimized } = useAIChat();
  const searchTimeoutRef = useRef<NodeJS.Timeout>();
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


  // 清除所有地點
  const handleClearAll = () => {
    setTripPoints([]);
    setSelectedLocation(null);
    setTripName(''); // 清除行程名稱
    setIsSaved(false); // 重置保存狀態
    // 如果是編輯模式，退出編輯模式
    if (isEditingMode) {
      handleCancelEdit();
    }
  };


  // 使用 useEffect 來管理地點狀態
  useEffect(() => {
    console.log('MapPlanning: tripPoints 變化，更新地點狀態');
    console.log('MapPlanning: 當前 tripPoints:', tripPoints.map(p => ({ id: p.id, name: p.location.name })));
  }, [tripPoints]);

  // 監聽變更
  useEffect(() => {
    if (isEditingMode && originalTripData) {
      const hasChangesNow = checkForChanges();
      setHasChanges(hasChangesNow);
    }
  }, [tripPoints, tripName, isEditingMode, originalTripData]);

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
    setIsSaved(false); // 重置保存狀態
    
    console.log('MapPlanning: 添加新地點，ID:', newTripPoint.id);
  };

  const handleRemovePoint = (id: string) => {
    setTripPoints(prev => prev.filter(point => point.id !== id));
    setIsSaved(false); // 重置保存狀態
  };

  // 保存行程功能 - 保存到雲端數據庫
  const handleSaveTrip = async () => {
    if (tripPoints.length === 0) {
      alert('請先添加至少一個地點才能保存行程');
      return;
    }

    const tripData = {
      title: tripName.trim() || `地圖行程 - ${new Date().toLocaleDateString('zh-TW')}`,
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
      let response;
      if (isEditingMode && editingTripId) {
        // 更新現有行程
        response = await fetch(`${API_BASE_URL}/api/trips/${editingTripId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(tripData),
        });
        console.log('MapPlanning: 正在更新現有行程');
      } else {
        // 創建新行程
        response = await fetch(`${API_BASE_URL}/api/trips`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(tripData),
        });
        console.log('MapPlanning: 正在創建新行程');
      }

        if (response.ok) {
          console.log('MapPlanning: 行程已保存到雲端數據庫');
          
          // 設置已保存狀態
          setIsSaved(true);
          
          // 重新載入已保存的行程列表
        fetchSavedTrips();
        
        // 如果是編輯模式，退出編輯模式
        if (isEditingMode) {
          setTripPoints([]);
          setTripName('');
          setEditingTripId(null);
          setIsEditingMode(false);
          setOriginalTripData(null);
          setHasChanges(false);
          setSelectedLocation(null);
          setShowAddForm(false);
        }
      } else {
        throw new Error(`保存失敗: ${response.statusText}`);
      }
    } catch (error) {
      console.error('MapPlanning: 保存行程失敗:', error);
      alert('保存行程失敗，請稍後再試');
    }
  };





  // 從雲端獲取已保存的行程
  const fetchSavedTrips = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/trips`);
      if (response.ok) {
        const trips = await response.json();
        // 只顯示有mapTripData的行程（地圖行程），按創建時間升序排列（最早的在前）
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
          }))
          .sort((a: TripData, b: TripData) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
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

  // 修改行程名稱
  const handleUpdateTripName = async (tripId: string, newName: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/trips/${tripId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: newName.trim() || `地圖行程 - ${new Date().toLocaleDateString('zh-TW')}` }),
      });

      if (response.ok) {
        console.log('MapPlanning: 行程名稱已更新');
        // 重新載入已保存的行程列表
        fetchSavedTrips();
        setEditingTripName(null);
      } else {
        throw new Error(`更新失敗: ${response.statusText}`);
      }
    } catch (error) {
      console.error('MapPlanning: 更新行程名稱失敗:', error);
      alert('更新行程名稱失敗，請稍後再試');
    }
  };

  // 載入行程到左側編輯
  const handleLoadTripForEdit = (trip: TripData) => {
    // 將行程數據載入到左側
    const loadedPoints: TripPoint[] = trip.points.map(point => ({
      id: generateStableId(),
      location: {
        lat: point.coordinates.lat,
        lng: point.coordinates.lng,
        name: point.name,
        address: point.address
      },
      estimatedCost: point.estimatedCost,
      estimatedTime: point.estimatedTime,
      notes: point.notes
    }));

    setTripPoints(loadedPoints);
    setTripName(trip.title);
    setEditingTripId(trip.id);
    setIsEditingMode(true);
    setOriginalTripData(trip); // 保存原始數據
    setHasChanges(false); // 重置變更狀態
    setIsSaved(false); // 重置保存狀態
    setSelectedLocation(null);
    setShowAddForm(false);
    
    console.log('MapPlanning: 已載入行程到左側編輯:', trip.title);
  };

  // 檢測是否有變更
  const checkForChanges = () => {
    if (!originalTripData || !isEditingMode) return false;
    
    // 檢查行程名稱是否有變更
    const nameChanged = tripName !== originalTripData.title;
    
    // 檢查地點數量是否有變更
    const pointsCountChanged = tripPoints.length !== originalTripData.points.length;
    
    // 檢查地點內容是否有變更
    const pointsContentChanged = tripPoints.some((point, index) => {
      const originalPoint = originalTripData.points[index];
      if (!originalPoint) return true;
      
      return (
        point.location.name !== originalPoint.name ||
        point.location.address !== originalPoint.address ||
        point.estimatedCost !== originalPoint.estimatedCost ||
        point.estimatedTime !== originalPoint.estimatedTime ||
        point.notes !== originalPoint.notes
      );
    });
    
    return nameChanged || pointsCountChanged || pointsContentChanged;
  };

  // 取消編輯模式
  const handleCancelEdit = async () => {
    if (hasChanges) {
      // 直接保存變更
      await handleSaveTrip();
      return;
    }
    
    // 無變更時，直接清除編輯狀態
    setTripPoints([]);
    setTripName('');
    setEditingTripId(null);
    setIsEditingMode(false);
    setOriginalTripData(null);
    setHasChanges(false);
    setSelectedLocation(null);
    setShowAddForm(false);
    console.log('MapPlanning: 已取消編輯模式');
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
    <div className={`min-h-screen bg-black text-gray-800 ${fontClass}`}>
      <div className="container mx-auto px-2 py-0">
        <div className="mb-2">
          <div className="relative mb-4">
            <div className="text-center">
              <h1 className={`text-3xl font-bold text-[#e9eef2] mb-2 ${fontClass}`}>地圖行程規劃</h1>
              <p className="text-[#a9b6c3]">在地圖上規劃您的旅行地點，創建完美的行程安排</p>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 rounded-lg shadow-lg p-0">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
            {/* 左側控制面板 */}
            <div className="lg:col-span-1 space-y-0">
            {/* 搜尋欄位 */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg shadow-md p-6">
              <h2 className={`text-xl font-semibold text-gray-800 mb-4 ${fontClass}`}>搜尋地點</h2>
              <div className="space-y-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="輸入地點名稱或地址..."
                    value={searchQuery}
                    onChange={(e) => handleSearchInput(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-blue-200 text-gray-800 placeholder-gray-500 rounded-lg focus:ring-2 focus:ring-[#c7a559] focus:border-[#c7a559]"
                  />
                  {isSearching && (
                    <div className="absolute right-0 top-0">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                    </div>
                  )}
                </div>
                
                {/* 搜尋結果 */}
                {searchResults.length > 0 && (
                  <div className="border border-blue-200 rounded-lg bg-white shadow-lg">
                    {searchResults.map((place, index) => (
                      <button
                        key={index}
                        onClick={() => handleSelectSearchResult(place)}
                        className="w-full text-left px-4 py-3 hover:bg-blue-100 border-b border-blue-200 last:border-b-0 transition-colors"
                      >
                        <div className="font-medium text-gray-800">{place.name}</div>
                        {place.formatted_address && (
                          <div className="text-sm text-gray-600">{place.formatted_address}</div>
                        )}
                      </button>
                    ))}
                  </div>
                )}
                
                <p className="text-sm text-gray-600">
                  搜尋地點或直接點擊地圖添加標記
                </p>
              </div>
            </div>

            {/* 添加地點表單 */}
            {showAddForm && selectedLocation && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg shadow-md p-2">
                <h3 className={`text-lg font-semibold text-gray-800 mb-4 ${fontClass}`}>
                  添加地點：{selectedLocation.name}
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-800 mb-1">
                      預估費用 (NTD)
                    </label>
                    <input
                      type="number"
                      placeholder="0"
                      value={newPoint.estimatedCost}
                      onChange={(e) => setNewPoint(prev => ({ ...prev, estimatedCost: e.target.value }))}
                      className="w-full px-3 py-2 bg-white border border-blue-200 text-gray-800 placeholder-gray-500 rounded-md focus:ring-2 focus:ring-[#c7a559] focus:border-[#c7a559]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-800 mb-1">
                      預估時間 (分鐘)
                    </label>
                    <input
                      type="number"
                      placeholder="30"
                      step="5"
                      value={newPoint.estimatedTime}
                      onChange={(e) => setNewPoint(prev => ({ ...prev, estimatedTime: e.target.value }))}
                      className="w-full px-3 py-2 bg-white border border-blue-200 text-gray-800 placeholder-gray-500 rounded-md focus:ring-2 focus:ring-[#c7a559] focus:border-[#c7a559]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-800 mb-1">
                      備註
                    </label>
                    <textarea
                      placeholder="添加地點相關的備註..."
                      value={newPoint.notes}
                      onChange={(e) => setNewPoint(prev => ({ ...prev, notes: e.target.value }))}
                      rows={1}
                      className="w-full px-3 py-2 bg-white border border-blue-200 text-gray-800 placeholder-gray-500 rounded-md focus:ring-2 focus:ring-[#c7a559] focus:border-[#c7a559]"
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
                      className="flex-1 bg-gray-600 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-500 transition-colors"
                    >
                      取消
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 行程地點列表 */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <h2 className={`text-xl font-semibold text-gray-800 ${fontClass}`}>行程地點</h2>
                <div className="flex items-center space-x-2">
                  {tripPoints.length > 0 && !isSaved && (
                    <button
                      onClick={handleSaveTrip}
                      disabled={tripPoints.length === 0}
                      className={`text-sm font-medium transition-colors ${
                        tripPoints.length === 0
                          ? 'text-gray-400 cursor-not-allowed'
                          : 'text-blue-400 hover:text-blue-300'
                      }`}
                    >
                      {isEditingMode ? '更新行程' : '保存行程'}
                    </button>
                  )}
                  {tripPoints.length > 0 && (
                    <>
                      <button
                        onClick={() => setShowOrderEdit(!showOrderEdit)}
                        className="text-[#3fb6b2] hover:text-[#369a96] text-sm font-medium"
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
              
              {/* 編輯模式按鈕 */}
              {isEditingMode && (
                <div className="flex items-center gap-0 mt-3">
                  <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
                    編輯模式
                  </span>
                  <button
                    onClick={handleCancelEdit}
                    className="text-orange-400 hover:text-orange-300 text-sm font-medium"
                    title="取消編輯"
                  >
                     關閉編輯
                  </button>
                </div>
              )}
              
              {/* 行程名稱輸入欄位 */}
              <div className="mt-4 mb-4">
                <label className="block text-sm font-medium text-gray-800 mb-2">
                  {/* 行程名稱： */}
                </label>
                <input
                  type="text"
                  value={tripName}
                  onChange={(e) => setTripName(e.target.value)}
                  placeholder="請輸入行程名稱（可選）"
                  className="w-full px-3 py-2 bg-white border border-blue-200 rounded-lg text-gray-800 placeholder-gray-500 focus:ring-2 focus:ring-[#3fb6b2] focus:border-[#3fb6b2] transition-colors"
                />
                <p className="text-xs text-gray-400 mt-1">
                  {/* 如未填寫，將使用預設名稱：地圖行程 - 日期 */}
                </p>
              </div>
              
              {tripPoints.length === 0 ? (
                <div className="text-center py-8 text-gray-600">
                  <p>還沒有添加任何地點</p>
                  <p className="text-sm">搜尋地點或點擊地圖來開始規劃行程</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {tripPoints.map((point, index) => {
                    return (
                      <div
                        key={`${point.id}-${index}`}
                        className={`border border-blue-200 rounded-lg p-4 bg-blue-50`}
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
                                   className="w-12 px-2 py-1 text-xs font-medium bg-[#3fb6b2] text-white rounded-full text-center focus:ring-2 focus:ring-[#3fb6b2] focus:border-[#3fb6b2] border border-[#3fb6b2]"
                                   title={`輸入 1-${tripPoints.length} 來調整順序`}
                                 />
                               ) : (
                                 <span className="bg-[#3fb6b2] text-white text-xs font-medium px-2 py-1 rounded-full mr-2">
                                   {index + 1}
                                 </span>
                               )}
                               <h3 className={`font-medium text-gray-800 ${fontClass}`}>{point.location.name}</h3>
                               <span className="ml-2 text-red-500" title="地圖標記">📍</span>
                             </div>
                             
                             {/* 詳細訊息區域 - 與"⬆️"按鈕上緣對齊 */}
                             <div className="mt-6">
                               {point.location.address && (
                                 <p className="text-sm text-gray-600 mb-2">{point.location.address}</p>
                               )}
                               <div className="flex items-center space-x-4 text-sm text-gray-600">
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
            <div className="bg-blue-50 border border-blue-200 rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">地圖視圖</h2>
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


            {/* 保存的行程顯示區域 */}
            {savedTrips.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">已保存的行程</h3>
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
                     <div key={trip.id} className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-blue-600">
                              行程 {index + 1}：
                            </span>
                            {editingTripName === trip.id ? (
                              <input
                                type="text"
                                defaultValue={trip.title}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    handleUpdateTripName(trip.id, e.currentTarget.value);
                                  } else if (e.key === 'Escape') {
                                    setEditingTripName(null);
                                  }
                                }}
                                onBlur={(e) => {
                                  if (e.target.value.trim() !== trip.title) {
                                    handleUpdateTripName(trip.id, e.target.value);
                                  } else {
                                    setEditingTripName(null);
                                  }
                                }}
                                className="px-2 py-1 text-sm text-gray-800 bg-white border border-blue-200 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                autoFocus
                              />
                            ) : (
                              <span 
                                className="font-medium text-gray-800 cursor-pointer hover:text-blue-600 transition-colors"
                                onClick={() => setEditingTripName(trip.id)}
                                title="點擊修改行程名稱"
                              >
                                {trip.title}
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-gray-500">
                            保存於：{new Date(trip.createdAt).toLocaleString('zh-TW')}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {editingTripName !== trip.id && (
                            <button
                              onClick={() => setEditingTripName(trip.id)}
                              className="text-blue-500 hover:text-blue-700 text-sm"
                              title="修改行程名稱"
                            >
                              重新命名
                            </button>
                          )}
                          <button
                            onClick={() => handleLoadTripForEdit(trip)}
                            className="text-green-500 hover:text-green-700 text-sm"
                            title="載入到左側編輯"
                          >
                            編輯行程
                          </button>
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
                      </div>
                      <div className="text-sm text-gray-700 mb-3">
                        <div className="flex items-center flex-wrap gap-1">
                          <span className="text-blue-600 font-medium">📍 行程路線：</span>
                          {trip.points.map((point, pointIndex) => (
                            <span key={pointIndex} className="flex items-center">
                              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                                {pointIndex + 1}. {point.name}
                              </span>
                              {pointIndex < trip.points.length - 1 && (
                                <span className="mx-2 text-blue-500 font-bold">→</span>
                              )}
                            </span>
                          ))}
                        </div>
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
