import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, MapPin, Calendar, DollarSign, Edit, Trash2 } from 'lucide-react';

interface Trip {
  _id: string;
  title: string;
  destination: string;
  startDate: string;
  endDate: string;
  description: string;
  budget: {
    total: number;
    spent: number;
    currency: string;
  };
}

const TripList: React.FC = () => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrips();
  }, []);

  const fetchTrips = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/trips');
      if (response.ok) {
        const data = await response.json();
        setTrips(data);
      }
    } catch (error) {
              console.error('獲取旅行列表失敗:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteTrip = async (id: string) => {
          if (window.confirm('確定要刪除這個旅行嗎？')) {
      try {
        const response = await fetch(`http://localhost:5001/api/trips/${id}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          setTrips(trips.filter(trip => trip._id !== id));
        }
      } catch (error) {
        console.error('刪除旅行失敗:', error);
      }
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">我的旅行</h1>
        <Link
          to="/create"
          className="btn-primary inline-flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>創建新旅行</span>
        </Link>
      </div>

      {trips.length === 0 ? (
        <div className="text-center py-16">
          <MapPin className="h-24 w-24 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            還沒有旅行計劃
          </h3>
          <p className="text-gray-600 mb-6">
            開始創建您的第一個旅行計劃吧！
          </p>
          <Link to="/create" className="btn-primary">
            創建旅行
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {trips.map((trip) => (
            <div key={trip._id} className="card hover:shadow-md transition-shadow duration-200">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-semibold text-gray-900">{trip.title}</h3>
                <div className="flex space-x-2">
                  <Link
                    to={`/trips/${trip._id}`}
                    className="text-gray-400 hover:text-blue-600 transition-colors"
                  >
                    <Edit className="h-4 w-4" />
                  </Link>
                  <button
                    onClick={() => deleteTrip(trip._id)}
                    className="text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center space-x-2 text-gray-600">
                  <MapPin className="h-4 w-4" />
                  <span>{trip.destination}</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-gray-600">
                  <DollarSign className="h-4 w-4" />
                  <span>
                    {trip.budget.spent} / {trip.budget.total} {trip.budget.currency}
                  </span>
                </div>
              </div>

              {trip.description && (
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {trip.description}
                </p>
              )}

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">
                  {calculateDuration(trip.startDate, trip.endDate)} 天
                </span>
                <Link
                  to={`/trips/${trip._id}`}
                  className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                >
                  查看详情 →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TripList;
