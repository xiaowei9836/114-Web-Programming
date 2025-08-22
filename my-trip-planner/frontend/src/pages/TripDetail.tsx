import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { MapPin, Calendar, DollarSign, Edit, ArrowLeft, Plus, CheckCircle, Circle } from 'lucide-react';

interface Trip {
  _id: string;
  title: string;
  description: string;
  destination: string;
  startDate: string;
  endDate: string;
  budget: {
    total: number;
    spent: number;
    currency: string;
  };
  itinerary: Array<{
    date: string;
    activities: Array<{
      title: string;
      description: string;
      location: string;
      time: string;
      cost: number;
    }>;
  }>;
  reminders: Array<{
    _id: string;
    title: string;
    description: string;
    dueDate: string;
    completed: boolean;
  }>;
  journal: Array<{
    _id: string;
    date: string;
    title: string;
    content: string;
    photos: string[];
    mood: 'excellent' | 'good' | 'okay' | 'bad';
  }>;
}

const TripDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'itinerary' | 'budget' | 'reminders' | 'journal'>('overview');

  useEffect(() => {
    if (id) {
      fetchTrip();
    }
  }, [id]);

  const fetchTrip = async () => {
    try {
      const response = await fetch(`http://localhost:5001/api/trips/${id}`);
      if (response.ok) {
        const data = await response.json();
        setTrip(data);
      }
    } catch (error) {
              console.error('獲取旅行詳情失敗:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN');
  };

  const calculateDuration = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getBudgetPercentage = () => {
    if (!trip || trip.budget.total === 0) return 0;
    return (trip.budget.spent / trip.budget.total) * 100;
  };

  const getMoodIcon = (mood: string) => {
    const moodConfig = {
      excellent: '😍',
      good: '😊',
      okay: '😐',
      bad: '😞'
    };
    return moodConfig[mood as keyof typeof moodConfig] || '😊';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">旅行不存在</h2>
        <button onClick={() => navigate('/trips')} className="btn-primary">
          返回旅行列表
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 头部 */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/trips')}
          className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>返回旅行列表</span>
        </button>
        <button className="btn-primary inline-flex items-center space-x-2">
          <Edit className="h-5 w-5" />
          <span>編輯旅行</span>
        </button>
      </div>

      {/* 旅行標題和基本訊息 */}
      <div className="card">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">{trip.title}</h1>
        {trip.description && (
          <p className="text-gray-600 mb-6">{trip.description}</p>
        )}
        
        <div className="grid md:grid-cols-3 gap-6">
          <div className="flex items-center space-x-3">
            <MapPin className="h-6 w-6 text-blue-600" />
            <div>
              <p className="text-sm text-gray-500">目的地</p>
              <p className="font-medium text-gray-900">{trip.destination}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Calendar className="h-6 w-6 text-green-600" />
            <div>
              <p className="text-sm text-gray-500">旅行日期</p>
              <p className="font-medium text-gray-900">
                {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
              </p>
              <p className="text-sm text-gray-500">{calculateDuration(trip.startDate, trip.endDate)} 天</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <DollarSign className="h-6 w-6 text-yellow-600" />
            <div>
              <p className="text-sm text-gray-500">預算</p>
              <p className="font-medium text-gray-900">
                {trip.budget.spent} / {trip.budget.total} {trip.budget.currency}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 標籤頁導航 */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', label: '概覽' },
            { id: 'itinerary', label: '行程' },
            { id: 'budget', label: '預算' },
            { id: 'reminders', label: '提醒' },
            { id: 'journal', label: '日記' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
        
        {/* 地圖規劃快捷入口 */}
        <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-blue-900">🗺️ 地圖規劃</h3>
              <p className="text-sm text-blue-700 mt-1">
                使用 Google Maps 規劃您的旅行路線和地點
              </p>
            </div>
            <Link
              to="/map-planning"
              className="btn-primary text-sm px-4 py-2"
            >
              開始規劃
            </Link>
          </div>
        </div>
      </div>

      {/* 標籤頁內容 */}
      <div className="min-h-96">
        {activeTab === 'overview' && (
          <div className="grid md:grid-cols-2 gap-6">
            {/* 預算概覽 */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">預算概覽</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">已花費</span>
                    <span className="font-medium">{trip.budget.spent} {trip.budget.currency}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(getBudgetPercentage(), 100)}%` }}
                    ></div>
                  </div>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">剩餘預算</span>
                  <span className="font-medium text-green-600">
                    {trip.budget.total - trip.budget.spent} {trip.budget.currency}
                  </span>
                </div>
              </div>
            </div>

            {/* 快速統計 */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">快速統計</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">行程活動</span>
                  <span className="font-medium">
                    {trip.itinerary.reduce((total, day) => total + day.activities.length, 0)} 個
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">提醒事項</span>
                  <span className="font-medium">
                    {trip.reminders.filter(r => !r.completed).length} 個待辦
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">日記條目</span>
                  <span className="font-medium">{trip.journal.length} 篇</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'itinerary' && (
          <div className="card">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">行程安排</h3>
              <button className="btn-primary inline-flex items-center space-x-2">
                <Plus className="h-4 w-4" />
                <span>添加活動</span>
              </button>
            </div>
            
            {trip.itinerary.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                還沒有行程安排，開始添加您的第一個活動吧！
              </div>
            ) : (
              <div className="space-y-6">
                {trip.itinerary.map((day, dayIndex) => (
                  <div key={dayIndex} className="border-l-4 border-primary-500 pl-4">
                    <h4 className="font-medium text-gray-900 mb-3">
                      {formatDate(day.date)}
                    </h4>
                    <div className="space-y-3">
                      {day.activities.map((activity, activityIndex) => (
                        <div key={activityIndex} className="bg-gray-50 p-4 rounded-lg">
                          <div className="flex justify-between items-start mb-2">
                            <h5 className="font-medium text-gray-900">{activity.title}</h5>
                            <span className="text-sm text-gray-500">{activity.time}</span>
                          </div>
                          {activity.description && (
                            <p className="text-gray-600 text-sm mb-2">{activity.description}</p>
                          )}
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-500">{activity.location}</span>
                            <span className="font-medium text-green-600">
                              {activity.cost} {trip.budget.currency}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'budget' && (
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">預算管理</h3>
            <div className="space-y-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">預算概覽</h4>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-blue-900">{trip.budget.total}</p>
                    <p className="text-sm text-blue-700">總預算</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-600">{trip.budget.spent}</p>
                    <p className="text-sm text-green-700">已花費</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-orange-600">
                      {trip.budget.total - trip.budget.spent}
                    </p>
                    <p className="text-sm text-orange-700">剩餘</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-4">支出記錄</h4>
                <div className="space-y-3">
                  {trip.itinerary.flatMap(day => 
                    day.activities.filter(activity => activity.cost > 0)
                  ).map((activity, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{activity.title}</p>
                        <p className="text-sm text-gray-500">{activity.location}</p>
                      </div>
                      <span className="font-medium text-red-600">
                        -{activity.cost} {trip.budget.currency}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'reminders' && (
          <div className="card">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">旅行提醒</h3>
              <button className="btn-primary inline-flex items-center space-x-2">
                <Plus className="h-4 w-4" />
                <span>添加提醒</span>
              </button>
            </div>
            
            {trip.reminders.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                還沒有提醒事項，添加一些重要的提醒吧！
              </div>
            ) : (
              <div className="space-y-4">
                {trip.reminders.map((reminder) => (
                  <div key={reminder._id} className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                    <button className="text-gray-400 hover:text-green-600 transition-colors">
                      {reminder.completed ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <Circle className="h-5 w-5" />
                      )}
                    </button>
                    <div className="flex-1">
                      <h4 className={`font-medium ${reminder.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                        {reminder.title}
                      </h4>
                      {reminder.description && (
                        <p className={`text-sm ${reminder.completed ? 'text-gray-400' : 'text-gray-600'}`}>
                          {reminder.description}
                        </p>
                      )}
                      <p className="text-sm text-gray-500">
                        截止日期: {formatDate(reminder.dueDate)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'journal' && (
          <div className="card">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">旅行日记</h3>
              <button className="btn-primary inline-flex items-center space-x-2">
                <Plus className="h-4 w-4" />
                <span>寫日記</span>
              </button>
            </div>
            
            {trip.journal.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                還沒有日記條目，開始記錄您的旅行感受吧！
              </div>
            ) : (
              <div className="space-y-6">
                {trip.journal.map((entry) => (
                  <div key={entry._id} className="border-l-4 border-purple-500 pl-4">
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="font-medium text-gray-900">{entry.title}</h4>
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl">{getMoodIcon(entry.mood)}</span>
                        <span className="text-sm text-gray-500">{formatDate(entry.date)}</span>
                      </div>
                    </div>
                    <p className="text-gray-600 mb-3">{entry.content}</p>
                    {entry.photos.length > 0 && (
                      <div className="flex space-x-2">
                        {entry.photos.map((_, index) => (
                          <div key={index} className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                            <span className="text-gray-400 text-xs">照片</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TripDetail;
