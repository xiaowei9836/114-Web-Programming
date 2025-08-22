import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Calendar, DollarSign, Save, ArrowLeft } from 'lucide-react';

interface TripForm {
  title: string;
  description: string;
  destination: string;
  startDate: string;
  endDate: string;
  budget: {
    total: number;
    currency: string;
  };
}

const CreateTrip: React.FC = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState<TripForm>({
    title: '',
    description: '',
    destination: '',
    startDate: '',
    endDate: '',
    budget: {
      total: 0,
      currency: 'USD'
    }
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name.startsWith('budget.')) {
      const budgetField = name.split('.')[1];
      setForm(prev => ({
        ...prev,
        budget: {
          ...prev.budget,
          [budgetField]: budgetField === 'total' ? Number(value) : value
        }
      }));
    } else {
      setForm(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5001/api/trips', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...form,
          budget: {
            ...form.budget,
            spent: 0
          }
        }),
      });

      if (response.ok) {
        const newTrip = await response.json();
        navigate(`/trips/${newTrip._id}`);
      } else {
        throw new Error('創建旅行失敗');
      }
    } catch (error) {
              console.error('創建旅行失敗:', error);
        alert('創建旅行失敗，請重試');
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = () => {
    return form.title && form.destination && form.startDate && form.endDate;
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>返回</span>
        </button>
      </div>

      <div className="card">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">創建新旅行</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 基本信息 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">基本訊息</h3>
            
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                旅行標題 *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={form.title}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="例如：東京櫻花之旅"
                required
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                旅行描述
              </label>
              <textarea
                id="description"
                name="description"
                value={form.description}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="描述您的旅行計劃..."
              />
            </div>

            <div>
              <label htmlFor="destination" className="block text-sm font-medium text-gray-700 mb-2">
                目的地 *
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  id="destination"
                  name="destination"
                  value={form.destination}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="例如：東京，日本"
                  required
                />
              </div>
            </div>
          </div>

          {/* 日期 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">旅行日期</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">
                  開始日期 *
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="date"
                    id="startDate"
                    name="startDate"
                    value={form.startDate}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-2">
                  結束日期 *
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="date"
                    id="endDate"
                    name="endDate"
                    value={form.endDate}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    required
                    min={form.startDate}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 预算 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">預算設置</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="budget.total" className="block text-sm font-medium text-gray-700 mb-2">
                  總預算
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="number"
                    id="budget.total"
                    name="budget.total"
                    value={form.budget.total}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="budget.currency" className="block text-sm font-medium text-gray-700 mb-2">
                  貨幣
                </label>
                <select
                  id="budget.currency"
                  name="budget.currency"
                  value={form.budget.currency}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="CNY">CNY (¥)</option>
                  <option value="JPY">JPY (¥)</option>
                  <option value="GBP">GBP (£)</option>
                </select>
              </div>
            </div>
          </div>

          {/* 提交按钮 */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="btn-secondary"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={!isFormValid() || loading}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center space-x-2"
            >
              <Save className="h-5 w-5" />
              <span>{loading ? '創建中...' : '創建旅行'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTrip;
