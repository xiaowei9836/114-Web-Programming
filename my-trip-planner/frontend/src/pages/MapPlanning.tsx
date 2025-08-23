import React, { useState } from 'react';
import GoogleMap from '../components/GoogleMap';

interface TripPoint {
  id: string;
  location: {
    lat: number;
    lng: number;
    name: string;
    address?: string;
  };
  estimatedCost?: number;
  estimatedTime?: number;
  notes?: string;
}

const MapPlanning: React.FC = () => {
  const [tripPoints, setTripPoints] = useState<TripPoint[]>([]);
  const [currentPoint, setCurrentPoint] = useState<Partial<TripPoint>>({});
  const [showForm, setShowForm] = useState(false);

  const handleLocationSelect = (location: { lat: number; lng: number; name: string; address?: string }) => {
    setCurrentPoint({
      id: Date.now().toString(),
      location,
      estimatedCost: 0,
      estimatedTime: 0,
      notes: ''
    });
    setShowForm(true);
  };

  const handleAddPoint = () => {
    if (currentPoint.location && currentPoint.estimatedCost !== undefined && currentPoint.estimatedTime !== undefined) {
      const newPoint: TripPoint = {
        id: currentPoint.id || Date.now().toString(),
        location: currentPoint.location,
        estimatedCost: currentPoint.estimatedCost,
        estimatedTime: currentPoint.estimatedTime,
        notes: currentPoint.notes || ''
      };

      setTripPoints(prev => [...prev, newPoint]);
      setCurrentPoint({});
      setShowForm(false);
    }
  };

  const handleRemovePoint = (id: string) => {
    setTripPoints(prev => prev.filter(point => point.id !== id));
  };

  const handleClearAll = () => {
    setTripPoints([]);
    setCurrentPoint({});
    setShowForm(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">地圖規劃</h1>
        <p className="text-gray-600">在地圖上搜尋和添加旅行地點，規劃您的完美行程</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 地圖區域 */}
        <div className="lg:col-span-2">
          <GoogleMap
            onLocationSelect={handleLocationSelect}
            showLocationSearch={true}
            height="600px"
            className="rounded-lg shadow-lg"
          />
        </div>

        {/* 側邊欄 - 地點列表和表單 */}
        <div className="space-y-6">
          {/* 添加地點表單 */}
          {showForm && (
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">添加地點</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    地點名稱
                  </label>
                  <input
                    type="text"
                    value={currentPoint.location?.name || ''}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    地址
                  </label>
                  <input
                    type="text"
                    value={currentPoint.location?.address || ''}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    預估費用 (NT$)
                  </label>
                  <input
                    type="number"
                    value={currentPoint.estimatedCost || ''}
                    onChange={(e) => setCurrentPoint(prev => ({ ...prev, estimatedCost: Number(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    預估時間 (小時)
                  </label>
                  <input
                    type="number"
                    value={currentPoint.estimatedTime || ''}
                    onChange={(e) => setCurrentPoint(prev => ({ ...prev, estimatedTime: Number(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0"
                    step="0.5"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    備註
                  </label>
                  <textarea
                    value={currentPoint.notes || ''}
                    onChange={(e) => setCurrentPoint(prev => ({ ...prev, notes: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                    placeholder="添加地點相關的備註..."
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleAddPoint}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    添加地點
                  </button>
                  <button
                    onClick={() => setShowForm(false)}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                  >
                    取消
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 地點列表 */}
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">已添加的地點</h3>
              {tripPoints.length > 0 && (
                <button
                  onClick={handleClearAll}
                  className="text-sm text-red-600 hover:text-red-800 transition-colors"
                >
                  清除全部
                </button>
              )}
            </div>

            {tripPoints.length === 0 ? (
              <p className="text-gray-500 text-center py-8">尚未添加任何地點</p>
            ) : (
              <div className="space-y-3">
                {tripPoints.map((point, index) => (
                  <div key={point.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-600 text-white text-xs font-medium rounded-full">
                            {index + 1}
                          </span>
                          <h4 className="font-medium text-gray-900">{point.location.name}</h4>
                        </div>
                        {point.location.address && (
                          <p className="text-sm text-gray-600 mb-2">{point.location.address}</p>
                        )}
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          {point.estimatedCost !== undefined && (
                            <span>💰 NT$ {point.estimatedCost}</span>
                          )}
                          {point.estimatedTime !== undefined && (
                            <span>⏰ {point.estimatedTime}h</span>
                          )}
                        </div>
                        {point.notes && (
                          <p className="text-sm text-gray-600 mt-2 italic">"{point.notes}"</p>
                        )}
                      </div>
                      <button
                        onClick={() => handleRemovePoint(point.id)}
                        className="text-red-500 hover:text-red-700 transition-colors ml-2"
                        title="移除地點"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 統計信息 */}
          {tripPoints.length > 0 && (
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-900 mb-2">行程統計</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-blue-600">總地點數：</span>
                  <span className="font-medium">{tripPoints.length}</span>
                </div>
                <div>
                  <span className="text-blue-600">總預估費用：</span>
                  <span className="font-medium">NT$ {tripPoints.reduce((sum, point) => sum + (point.estimatedCost || 0), 0)}</span>
                </div>
                <div>
                  <span className="text-blue-600">總預估時間：</span>
                  <span className="font-medium">{tripPoints.reduce((sum, point) => sum + (point.estimatedTime || 0), 0)} 小時</span>
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
