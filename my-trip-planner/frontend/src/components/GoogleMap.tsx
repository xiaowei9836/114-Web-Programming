import React, { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';

interface Location {
  lat: number;
  lng: number;
  name: string;
  address?: string;
}

interface GoogleMapProps {
  center?: Location;
  markers?: Location[];
  onLocationSelect?: (location: Location) => void;
  height?: string;
  showSearchBox?: boolean;
  showDirections?: boolean;
}

const GoogleMap: React.FC<GoogleMapProps> = ({
  center = { lat: 25.0330, lng: 121.5654, name: '台北' }, // 默认台北
  markers = [],
  onLocationSelect,
  height = '400px',
  showSearchBox = true,
  showDirections = false
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);

  const [directionsService, setDirectionsService] = useState<google.maps.DirectionsService | null>(null);
  const [directionsRenderer, setDirectionsRenderer] = useState<google.maps.DirectionsRenderer | null>(null);
  const [mapMarkers, setMapMarkers] = useState<google.maps.Marker[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState<string>('');

  // 檢查 API 密鑰
  useEffect(() => {
    const key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    if (!key || key === 'your_google_maps_api_key_here') {
              setError('Google Maps API 密鑰未配置');
      setIsLoading(false);
      return;
    }
    setApiKey(key);
  }, []);

  // 初始化 Google Maps
  useEffect(() => {
    if (!apiKey) return;

    const initMap = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const loader = new Loader({
          apiKey: apiKey,
          version: 'weekly',
          libraries: ['places', 'geometry']
        });

        const google = await loader.load();
        
        if (!mapRef.current) return;

        // 创建地图
        const newMap = new google.maps.Map(mapRef.current, {
          center: { lat: center.lat, lng: center.lng },
          zoom: 12,
          mapTypeId: google.maps.MapTypeId.ROADMAP,
          mapTypeControl: true,
          streetViewControl: true,
          fullscreenControl: true,
          zoomControl: true,
          mapId: 'YOUR_MAP_ID_HERE', // 添加這行，替換為您的 Map ID
          styles: [
            {
              featureType: 'poi',
              elementType: 'labels',
              stylers: [{ visibility: 'off' }]
            }
          ]
        });

        setMap(newMap);

        // 初始化服务
        const newDirectionsService = new google.maps.DirectionsService();
        const newDirectionsRenderer = new google.maps.DirectionsRenderer({
          suppressMarkers: true
        });
        newDirectionsRenderer.setMap(newMap);

        setDirectionsService(newDirectionsService);
        setDirectionsRenderer(newDirectionsRenderer);

        // 添加搜索框
        if (showSearchBox) {
          const input = document.createElement('input');
          input.type = 'text';
          input.placeholder = '搜尋地點...';
          input.className = 'search-input';
          input.style.cssText = `
            position: absolute;
            top: 10px;
            left: 10px;
            width: 300px;
            height: 40px;
            padding: 0 12px;
            border: 1px solid #ccc;
            border-radius: 20px;
            box-shadow: 0 2px 6px rgba(0,0,0,0.3);
            font-size: 14px;
            outline: none;
            z-index: 1000;
          `;

          // 創建 Autocomplete 而不是 SearchBox
          const autocomplete = new google.maps.places.Autocomplete(input);
          autocomplete.bindTo('bounds', newMap);

          // 監聽地點選擇
          autocomplete.addListener('place_changed', () => {
            const place = autocomplete.getPlace();
            if (place.geometry && place.geometry.location) {
              const location: Location = {
                lat: place.geometry.location.lat(),
                lng: place.geometry.location.lng(),
                name: place.name || '未知地點',
                address: place.formatted_address
              };

              // 移動地圖到選中地點
              newMap.setCenter(place.geometry.location);
              newMap.setZoom(15);

              // 添加標記
              addMarker(location);

              // 觸發地點選擇回調
              if (onLocationSelect) {
                onLocationSelect(location);
              }
            }
          });

          // 將搜索框添加到地圖
          newMap.controls[google.maps.ControlPosition.TOP_LEFT].push(input);
        }

        setIsLoading(false);
      } catch (err) {
        console.error('Google Maps 初始化失敗:', err);
        setError('地圖加載失敗，請檢查 API 密鑰');
        setIsLoading(false);
      }
    };

    initMap();
  }, [apiKey]);

  // 添加標記
  const addMarker = async (location: Location) => {
    if (!map) return;
    try {
      const marker = new google.maps.Marker({
        map: map,
        position: { lat: location.lat, lng: location.lng },
        title: location.name
      });
      
      // 創建信息窗口
      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div style="padding: 10px;">
            <h3>${location.name}</h3>
            ${location.address ? `<p>${location.address}</p>` : ''}
            <button onclick="window.selectLocation('${location.name}', ${location.lat}, ${location.lng})" 
                    style="background: #3B82F6; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;">
              選擇此地點
            </button>
          </div>
        `
      });

      // 全局函數供訊息視窗使用
      (window as any).selectLocation = (name: string, lat: number, lng: number) => {
        if (onLocationSelect) {
          onLocationSelect({ lat, lng, name });
        }
        infoWindow.close();
      };

      marker.addListener('click', () => {
        infoWindow.open(map, marker);
      });

      setMapMarkers(prev => [...prev, marker]);
      return marker;
    } catch (error) {
      console.error('創建標記失敗:', error);
      return null;
    }
  };

  // 清除所有標記
  const clearMarkers = () => {
    mapMarkers.forEach(marker => {
      marker.setMap(null);
    });
    setMapMarkers([]);
  };

  // 計算路線
  const calculateRoute = async (origin: Location, destination: Location) => {
    if (!directionsService || !directionsRenderer) return;

    try {
      const request: google.maps.DirectionsRequest = {
        origin: { lat: origin.lat, lng: origin.lng },
        destination: { lat: destination.lat, lng: destination.lng },
        travelMode: google.maps.TravelMode.DRIVING
      };

      const result = await directionsService.route(request);
      directionsRenderer.setDirections(result);
    } catch (error) {
      console.error('路線計算失敗:', error);
    }
  };

  // 清除路線
  const clearRoute = () => {
    if (directionsRenderer) {
      directionsRenderer.setDirections({ routes: [] } as unknown as google.maps.DirectionsResult);
    }
  };

  // 添加所有標記
  useEffect(() => {
    if (!map) return;

    // 清除現有標記
    clearMarkers();

    // 添加新標記
    markers.forEach(async (marker) => {
      await addMarker(marker);
    });
  }, [markers, map]);

  // 全局函數供訊息視窗使用(?)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).selectLocation = (lat: number, lng: number, name: string) => {
        const location = { lat, lng, name };
        onLocationSelect?.(location);
      };
    }
  }, [onLocationSelect]);

  if (error) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
        <div className="text-yellow-600 mb-4">
          <svg className="h-12 w-12 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <h3 className="text-lg font-semibold mb-2">Google Maps 未配置</h3>
          <p className="text-sm mb-4">
            要使用地圖功能，請先配置 Google Maps API 密鑰
          </p>
        </div>
        
        <div className="space-y-3 text-left max-w-md mx-auto">
          <div className="bg-white p-4 rounded-lg border border-yellow-200">
            <h4 className="font-medium text-gray-900 mb-2">配置步驟：</h4>
            <ol className="text-sm text-gray-600 space-y-1">
              <li>1. 訪問 <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Google Cloud Console</a></li>
              <li>2. 創建項目並啟用 Maps JavaScript API</li>
              <li>3. 生成 API 密鑰</li>
              <li>4. 在 <code className="bg-gray-100 px-1 rounded">frontend/.env</code> 文件中設置 <code className="bg-gray-100 px-1 rounded">VITE_GOOGLE_MAPS_API_KEY</code></li>
              <li>5. 重啟應用</li>
            </ol>
          </div>
          
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-xs text-gray-500">
              <strong>當前狀態：</strong> API 密鑰未配置或無效
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {isLoading && (
        <div className="absolute inset-0 bg-gray-100 rounded-lg flex items-center justify-center z-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-gray-600">載入地圖中...</p>
          </div>
        </div>
      )}
      
      <div 
        ref={mapRef} 
        className="w-full rounded-lg border border-gray-200 overflow-hidden"
        style={{ height }}
      />
      
      {showDirections && mapMarkers.length >= 2 && (
        <div className="mt-4 flex space-x-2">
          <button
            onClick={() => calculateRoute(markers[0], markers[1])}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            計算路線
          </button>
          <button
            onClick={clearRoute}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            清除路線
          </button>
        </div>
      )}
    </div>
  );
};

export default GoogleMap;
