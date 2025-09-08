import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Calendar, DollarSign, Save, Bot, MessageCircle } from 'lucide-react';
import { useAIChat } from '../contexts/AIChatContext';

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
  
  // 直接使用霞鶩文楷字體
  const fontClass = 'font-["LXGW-WenKai"]';
  
  const [form, setForm] = useState<TripForm>({
    title: '',
    description: '',
    destination: '',
    startDate: '',
    endDate: '',
    budget: {
      total: 0,
      currency: 'NTD'
    }
  });
  const [loading, setLoading] = useState(false);
  const { openChat, isMinimized } = useAIChat();

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
    <div className={`min-h-screen bg-black text-[#e9eef2] ${fontClass}`}>
      <div className="container mx-auto px-2 py-0">
        <div className="mb-2">
          <div className="relative mb-4">
            <div className="text-center">
              <h1 className={`text-3xl font-bold text-[#e9eef2] mb-2 ${fontClass}`}>創建旅行</h1>
              <p className="text-[#a9b6c3]">填寫旅行資訊，開始規劃您的旅程</p>
            </div>
          </div>
        </div>

        <div className="max-w-2xl mx-auto">
          <div className="bg-gray-700 rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className={`text-xl font-semibold text-[#e9eef2] ${fontClass}`}>旅行資訊</h2>
              <button
                onClick={openChat}
                className="px-4 py-2 rounded-full bg-[#3fb6b2] hover:bg-[#369a96] transition-colors text-white inline-flex items-center space-x-2"
              >
                <Bot className="h-5 w-5" />
                <span>AI諮詢</span>
              </button>
            </div>
        
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 基本信息 */}
              <div className="space-y-4">
                <h3 className={`text-lg font-semibold text-[#e9eef2] ${fontClass}`}>基本訊息</h3>
            
            <div>
                <div>
                  <label htmlFor="title" className={`block text-sm font-medium text-[#e9eef2] mb-2 ${fontClass}`}>
                    旅行標題 *
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={form.title}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-gray-600 border border-gray-500 text-[#e9eef2] placeholder-gray-400 rounded-lg focus:ring-2 focus:ring-[#c7a559] focus:border-[#c7a559]"
                    placeholder="例如：東京櫻花之旅"
                    required
                  />
                </div>
            </div>

                <div>
                  <label htmlFor="description" className={`block text-sm font-medium text-[#e9eef2] mb-2 ${fontClass}`}>
                    旅行描述
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={form.description}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 bg-gray-600 border border-gray-500 text-[#e9eef2] placeholder-gray-400 rounded-lg focus:ring-2 focus:ring-[#c7a559] focus:border-[#c7a559]"
                    placeholder="描述您的旅行計劃..."
                  />
                </div>

                <div>
                  <label htmlFor="destination" className={`block text-sm font-medium text-[#e9eef2] mb-2 ${fontClass}`}>
                    目的地 *
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#a9b6c3]" />
                    <input
                      type="text"
                      id="destination"
                      name="destination"
                      value={form.destination}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-3 py-2 bg-gray-600 border border-gray-500 text-[#e9eef2] placeholder-gray-400 rounded-lg focus:ring-2 focus:ring-[#c7a559] focus:border-[#c7a559]"
                      placeholder="例如：東京，日本"
                      required
                    />
                  </div>
                </div>
          </div>

              {/* 日期 */}
              <div className="space-y-4">
                <h3 className={`text-lg font-semibold text-[#e9eef2] ${fontClass}`}>旅行日期</h3>
            
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="startDate" className={`block text-sm font-medium text-[#e9eef2] mb-2 ${fontClass}`}>
                      開始日期 *
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#a9b6c3]" />
                      <input
                        type="date"
                        id="startDate"
                        name="startDate"
                        value={form.startDate}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-3 py-2 bg-gray-600 border border-gray-500 text-[#e9eef2] rounded-lg focus:ring-2 focus:ring-[#c7a559] focus:border-[#c7a559]"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="endDate" className={`block text-sm font-medium text-[#e9eef2] mb-2 ${fontClass}`}>
                      結束日期 *
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#a9b6c3]" />
                      <input
                        type="date"
                        id="endDate"
                        name="endDate"
                        value={form.endDate}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-3 py-2 bg-gray-600 border border-gray-500 text-[#e9eef2] rounded-lg focus:ring-2 focus:ring-[#c7a559] focus:border-[#c7a559]"
                        required
                        min={form.startDate}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* 預算 */}
              <div className="space-y-4">
                <h3 className={`text-lg font-semibold text-[#e9eef2] ${fontClass}`}>預算設置</h3>
            
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="budget.total" className={`block text-sm font-medium text-[#e9eef2] mb-2 ${fontClass}`}>
                      總預算
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#a9b6c3]" />
                      <input
                        type="number"
                        id="budget.total"
                        name="budget.total"
                        value={form.budget.total}
                        onChange={handleInputChange}
                        min="0"
                        step="0.01"
                        className="w-full pl-10 pr-3 py-2 bg-gray-600 border border-gray-500 text-[#e9eef2] placeholder-gray-400 rounded-lg focus:ring-2 focus:ring-[#c7a559] focus:border-[#c7a559]"
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="budget.currency" className={`block text-sm font-medium text-[#e9eef2] mb-2 ${fontClass}`}>
                      貨幣
                    </label>
                    <select
                      id="budget.currency"
                      name="budget.currency"
                      value={form.budget.currency}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-gray-600 border border-gray-500 text-[#e9eef2] rounded-lg focus:ring-2 focus:ring-[#c7a559] focus:border-[#c7a559]"
                    >
                      <option value="NTD">NTD (NT$)</option>
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="JPY">JPY (¥)</option>
                      <option value="GBP">GBP (£)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* 提交按鈕 */}
              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-600">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="px-4 py-2 rounded-lg border border-gray-500 text-[#e9eef2] hover:bg-gray-600 transition-colors"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={!isFormValid() || loading}
                  className="px-6 py-2 rounded-lg bg-gradient-to-r from-[#c7a559] to-[#efc56a] text-[#162022] font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center space-x-2"
                >
                  <Save className="h-5 w-5" />
                  <span>{loading ? '創建中...' : '創建旅行'}</span>
                </button>
              </div>
            </form>
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
    </div>
  );
};

export default CreateTrip;
