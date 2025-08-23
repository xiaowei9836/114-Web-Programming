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
  estimatedCost: number;
  estimatedTime: number;
  notes: string;
}

const MapPlanning: React.FC = () => {
  const [tripPoints, setTripPoints] = useState<TripPoint[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    estimatedCost: '',
    estimatedTime: '',
    notes: ''
  });

  const handleLocationSelect = (location: { lat: number; lng: number; name: string; address?: string }) => {
    setFormData(prev => ({ ...prev, name: location.name }));
    setShowAddForm(true);
  };

  const handleAddPoint = () => {
    if (!formData.name || !formData.estimatedCost || !formData.estimatedTime) {
      alert('請填寫所有必填欄位');
      return;
    }

    const newPoint: TripPoint = {
      id: Date.now().toString(),
      location: {
        lat: 0, // 這裡需要從地圖選擇中獲取
        lng: 0,
        name: formData.name,
        address: ''
      },
      estimatedCost: parseFloat(formData.estimatedCost),
      estimatedTime: parseFloat(formData.estimatedTime),
      notes: formData.notes
    };

    setTripPoints(prev => [...prev, newPoint]);
    setFormData({ name: '', estimatedCost: '', estimatedTime: '', notes: '' });
    setShowAddForm(false);
  };

  const handleRemovePoint = (id: string) => {
    setTripPoints(prev => prev.filter(point => point.id !== id));
  };

  const totalCost = tripPoints.reduce((sum, point) => sum + (point.estimatedCost || 0), 0);
  const totalTime = tripPoints.reduce((sum, point) => sum + (point.estimatedTime || 0), 0);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">地圖規劃</h1>
          <p className="text-gray-600">在地圖上規劃您的旅行地點和行程</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 地圖視圖 */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">地圖視圖</h2>
              <GoogleMap
                onLocationSelect={handleLocationSelect}
                showLocationSearch={true}
                className="min-h-[600px]"
              />
            </div>
          </div>

          {/* 側邊欄 - 地點列表和添加表單 */}
          <div className="space-y-6">
            {/* 添加地點表單 */}
            {showAddForm && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">添加地點</h3>
                <form onSubmit={(e) => { e.preventDefault(); handleAddPoint(); }} className="space-y-4">
                  <div>
                    <label htmlFor="location-name" className="block text-sm font-medium text-gray-700 mb-1">
                      地點名稱 *
                    </label>
                    <input
                      id="location-name"
                      name="location-name"
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="estimated-cost" className="block text-sm font-medium text-gray-700 mb-1">
                      預估費用 (NT$) *
                    </label>
                    <input
                      id="estimated-cost"
                      name="estimated-cost"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.estimatedCost}
                      onChange={(e) => setFormData(prev => ({ ...prev, estimatedCost: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="estimated-time" className="block text-sm font-medium text-gray-700 mb-1">
                      預估時間 (小時) *
                    </label>
                    <input
                      id="estimated-time"
                      name="estimated-time"
                      type="number"
                      min="0"
                      step="0.5"
                      value={formData.estimatedTime}
                      onChange={(e) => setFormData(prev => ({ ...prev, estimatedTime: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                      備註
                    </label>
                    <textarea
                      id="notes"
                      name="notes"
                      rows={3}
                      value={formData.notes}
                      onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="添加地點的相關備註..."
                    />
                  </div>

                  <div className="flex space-x-3">
                    <button
                      type="submit"
                      className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                    >
                      添加地點
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddForm(false)}
                      className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition-colors"
                    >
                      取消
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* 地點列表 */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">已規劃地點</h3>
              
              {tripPoints.length === 0 ? (
                <p className="text-gray-500 text-center py-8">尚未添加任何地點</p>
              ) : (
                <div className="space-y-4">
                  {tripPoints.map((point) => (
                    <div key={point.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-gray-900">{point.location.name}</h4>
                        <button
                          onClick={() => handleRemovePoint(point.id)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          刪除
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mb-2">
                        <div>
                          <span className="font-medium">費用:</span> NT$ {point.estimatedCost}
                        </div>
                        <div>
                          <span className="font-medium">時間:</span> {point.estimatedTime} 小時
                        </div>
                      </div>
                      
                      {point.notes && (
                        <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                          {point.notes}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* 統計信息 */}
              {tripPoints.length > 0 && (
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="text-center">
                      <div className="text-lg font-semibold text-blue-600">NT$ {totalCost}</div>
                      <div className="text-gray-500">總費用</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-green-600">{totalTime} 小時</div>
                      <div className="text-gray-500">總時間</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapPlanning;
