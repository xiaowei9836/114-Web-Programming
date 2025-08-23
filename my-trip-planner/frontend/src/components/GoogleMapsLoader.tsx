import React, { useEffect, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';

interface GoogleMapsLoaderProps {
  children: React.ReactNode;
}

const GoogleMapsLoader: React.FC<GoogleMapsLoaderProps> = ({ children }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    
    console.log('GoogleMapsLoader: 開始載入 Google Maps API');
    console.log('API Key:', apiKey ? '已設置' : '未設置');
    
    if (!apiKey || apiKey === 'your_google_maps_api_key_here') {
      setError('Google Maps API 密鑰未配置');
      setIsLoading(false);
      return;
    }

    // 檢查是否已經載入
    if (window.google && window.google.maps) {
      console.log('GoogleMapsLoader: Google Maps API 已存在，跳過載入');
      setIsLoaded(true);
      setIsLoading(false);
      return;
    }

    const loader = new Loader({
      apiKey: apiKey,
      version: 'weekly',
      libraries: ['places', 'geometry']
    });

    console.log('GoogleMapsLoader: 開始載入...');
    
    loader.load()
      .then(() => {
        console.log('GoogleMapsLoader: Google Maps API 載入成功');
        setIsLoaded(true);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error('GoogleMapsLoader: Google Maps API 載入失敗:', err);
        setError(`Google Maps API 載入失敗: ${err.message}`);
        setIsLoading(false);
      });
  }, []);

  if (error) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
        <div className="text-yellow-600 mb-4">
          <svg className="h-12 w-12 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <h3 className="text-lg font-semibold mb-2">Google Maps 載入失敗</h3>
          <p className="text-sm mb-4">{error}</p>
        </div>
        
        <div className="space-y-3 text-left max-w-md mx-auto">
          <div className="bg-white p-4 rounded-lg border border-yellow-200">
            <h4 className="font-medium text-gray-900 mb-2">配置步驟：</h4>
            <ol className="text-sm text-gray-600 space-y-1">
              <li>1. 檢查 <code className="bg-gray-100 px-1 rounded">frontend/.env</code> 文件</li>
              <li>2. 確認 <code className="bg-gray-100 px-1 rounded">VITE_GOOGLE_MAPS_API_KEY</code> 已設置</li>
              <li>3. 重啟開發服務器</li>
              <li>4. 清除瀏覽器快取</li>
            </ol>
          </div>
          
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-xs text-gray-500">
              <strong>當前狀態：</strong> {error}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600">載入 Google Maps API 中...</p>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto mb-2"></div>
          <p className="text-gray-600">等待 Google Maps API 載入...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default GoogleMapsLoader;
