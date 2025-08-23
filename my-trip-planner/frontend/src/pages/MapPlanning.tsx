import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Trash2, ArrowLeft, Save } from 'lucide-react';
import GoogleMap from '../components/GoogleMap';

interface Location {
  lat: number;
  lng: number;
  name: string;
  address?: string;
}

interface TripPoint {
  id: string;
  location: Location;
  type: 'attraction' | 'restaurant' | 'hotel' | 'transport' | 'other';
  notes?: string;
  estimatedCost?: number;
  estimatedTime?: number;
}

const MapPlanning: React.FC = () => {
  const navigate = useNavigate();
  const [tripPoints, setTripPoints] = useState<TripPoint[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPoint, setNewPoint] = useState<Partial<TripPoint>>({
    type: 'attraction'
  });

  const handleLocationSelect = (location: Location) => {
    setSelectedLocation(location);
    setShowAddForm(true);
  };

  const addTripPoint = () => {
    if (!selectedLocation || !newPoint.type) return;

    const tripPoint: TripPoint = {
      id: Date.now().toString(),
      location: selectedLocation,
      type: newPoint.type,
      notes: newPoint.notes || '',
      estimatedCost: newPoint.estimatedCost || 0,
      estimatedTime: newPoint.estimatedTime || 60
    };

    setTripPoints(prev => [...prev, tripPoint]);
    setSelectedLocation(null);
    setShowAddForm(false);
    setNewPoint({ type: 'attraction' });
  };

  const removeTripPoint = (id: string) => {
    setTripPoints(prev => prev.filter(point => point.id !== id));
  };

  const getTypeIcon = (type: string) => {
    const icons = {
      attraction: '🏛️',
      restaurant: '🍽️',
      hotel: '🏨',
      transport: '🚇',
      other: '📍'
    };
    return icons[type as keyof typeof icons] || '📍';
  };

  const getTypeLabel = (type: string) => {
    const labels = {
      attraction: '景點',
      restaurant: '餐廳',
      hotel: '酒店',
      transport: '交通',
      other: '其他'
    };
    return labels[type as keyof typeof labels] || '其他';
  };

  const calculateTotalCost = () => {
    return tripPoints.reduce((total, point) => total + (point.estimatedCost || 0), 0);
  };

  const calculateTotalTime = () => {
    return tripPoints.reduce((total, point) => total + (point.estimatedTime || 0), 0);
  };

  return (
    <div className="space-y-6">
      {/* 頭部 */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>返回</span>
        </button>
        <h1 className="text-3xl font-bold text-gray-900">地圖規劃</h1>
        <button
          onClick={() => navigate('/trips')}
          className="btn-primary inline-flex items-center space-x-2"
        >
          <Save className="h-5 w-5" />
                        <span>保存規劃</span>
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* 地圖區域 */}
        <div className="lg:col-span-2">
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">地圖視圖</h2>
            <GoogleMap
              onLocationSelect={handleLocationSelect}
              showLocationSearch={true}
              className="h-96 rounded-lg border border-gray-200"
            />
          </div>
        </div>

        {/* 側邊欄 */}
        <div className="space-y-6">
          {/* 添加新地點 */}
          {showAddForm && selectedLocation && (
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">添加新地點</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    地點名稱
                  </label>
                  <input
                    type="text"
                    id="location-name"
                    name="location-name"
                    value={selectedLocation?.name || ''}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    地點類型
                  </label>
                  <select
                    id="location-type"
                    name="location-type"
                    value={newPoint.type}
                    onChange={(e) => setNewPoint(prev => ({ ...prev, type: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="attraction">景點</option>
                    <option value="restaurant">餐廳</option>
                    <option value="hotel">酒店</option>
                    <option value="transport">交通</option>
                    <option value="other">其他</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    備註
                  </label>
                  <textarea
                    id="location-notes"
                    name="location-notes"
                    value={newPoint.notes || ''}
                    onChange={(e) => setNewPoint(prev => ({ ...prev, notes: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="添加备注..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      預估費用
                    </label>
                    <input
                      type="number"
                      id="estimated-cost"
                      name="estimated-cost"
                      value={newPoint.estimatedCost || ''}
                      onChange={(e) => setNewPoint(prev => ({ ...prev, estimatedCost: Number(e.target.value) }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      預估時間(分鐘)
                    </label>
                    <input
                      type="number"
                      id="estimated-time"
                      name="estimated-time"
                      value={newPoint.estimatedTime || ''}
                      onChange={(e) => setNewPoint(prev => ({ ...prev, estimatedTime: Number(e.target.value) }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="60"
                    />
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={addTripPoint}
                    className="flex-1 btn-primary"
                  >
                    添加地點
                  </button>
                  <button
                    onClick={() => {
                      setShowAddForm(false);
                      setSelectedLocation(null);
                    }}
                    className="flex-1 btn-secondary"
                  >
                    取消
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 地點列表 */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">規劃地點</h3>
            
            {tripPoints.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <MapPin className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>還沒有添加任何地點</p>
                <p className="text-sm">在地圖上搜尋並添加地點</p>
              </div>
            ) : (
              <div className="space-y-3">
                {tripPoints.map((point) => (
                  <div key={point.id} className="border border-gray-200 rounded-lg p-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <span className="text-2xl">{getTypeIcon(point.type)}</span>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{point.location.name}</h4>
                          <p className="text-sm text-gray-500">{getTypeLabel(point.type)}</p>
                          {point.notes && (
                            <p className="text-sm text-gray-600 mt-1">{point.notes}</p>
                          )}
                          <div className="flex space-x-4 mt-2 text-xs text-gray-500">
                            {point.estimatedCost && point.estimatedCost > 0 && (
                              <span>💰 {point.estimatedCost}</span>
                            )}
                            {point.estimatedTime && point.estimatedTime > 0 && (
                              <span>⏱️ {point.estimatedTime}分鐘</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => removeTripPoint(point.id)}
                        className="text-red-500 hover:text-red-700 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 統計訊息 */}
          {tripPoints.length > 0 && (
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">規劃統計</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">地點數量</span>
                  <span className="font-medium">{tripPoints.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">預估總費用</span>
                  <span className="font-medium text-green-600">💰 {calculateTotalCost()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">預估總時間</span>
                  <span className="font-medium text-blue-600">⏱️ {calculateTotalTime()}分鐘</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MapPlanning;
