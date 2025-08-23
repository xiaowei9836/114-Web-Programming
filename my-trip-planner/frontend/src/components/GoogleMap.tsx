import React, { useEffect, useRef, useState } from 'react';

interface Location {
  lat: number;
  lng: number;
  name: string;
  address?: string;
}

interface GoogleMapProps {
  onLocationSelect?: (location: Location) => void;
  showLocationSearch?: boolean;
  initialCenter?: { lat: number; lng: number };
  initialZoom?: number;
  className?: string;
  height?: string;
}

const GoogleMap: React.FC<GoogleMapProps> = ({
  onLocationSelect,
  showLocationSearch = true,
  initialCenter = { lat: 25.0330, lng: 121.5654 }, // 台北市中心
  initialZoom = 12,
  className = '',
  height = '500px'
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [mapMarkers, setMapMarkers] = useState<google.maps.Marker[]>([]);
  const [directionsRenderer, setDirectionsRenderer] = useState<google.maps.DirectionsRenderer | null>(null);
  const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);

  useEffect(() => {
    if (!mapRef.current || !window.google) return;

    const newMap = new google.maps.Map(mapRef.current, {
      center: initialCenter,
      zoom: initialZoom,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      mapTypeControl: true,
      streetViewControl: true,
      fullscreenControl: true,
      zoomControl: true,
      styles: [
        {
          featureType: 'poi',
          elementType: 'labels',
          stylers: [{ visibility: 'off' }]
        }
      ]
    });

    setMap(newMap);

    // 創建路線渲染器
    const newDirectionsRenderer = new google.maps.DirectionsRenderer({
      suppressMarkers: true,
      polylineOptions: {
        strokeColor: '#3B82F6',
        strokeWeight: 4,
        strokeOpacity: 0.8
      }
    });
    newDirectionsRenderer.setMap(newMap);
    setDirectionsRenderer(newDirectionsRenderer);

    // 地圖點擊事件
    newMap.addListener('click', (event: google.maps.MapMouseEvent) => {
      if (event.latLng) {
        const location: Location = {
          lat: event.latLng.lat(),
          lng: event.latLng.lng(),
          name: '點擊的地點'
        };
        addMarker(location);
      }
    });

  }, [initialCenter, initialZoom]);

  // 初始化 Autocomplete
  useEffect(() => {
    if (!map || !searchInputRef.current) return;

    const newAutocomplete = new google.maps.places.Autocomplete(searchInputRef.current);
    newAutocomplete.bindTo('bounds', map);
    setAutocomplete(newAutocomplete);

    // 監聽地點選擇
    newAutocomplete.addListener('place_changed', () => {
      const place = newAutocomplete.getPlace();
      if (place.geometry && place.geometry.location) {
        const location: Location = {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
          name: place.name || '未知地點',
          address: place.formatted_address
        };

        // 移動地圖到選中地點
        map.setCenter(place.geometry.location);
        map.setZoom(15);

        // 添加標記
        addMarker(location);
        setSelectedLocation(location);

        // 觸發地點選擇回調
        if (onLocationSelect) {
          onLocationSelect(location);
        }
      }
    });
  }, [map, onLocationSelect]);

  const addMarker = (location: Location) => {
    if (!map) return;

    // 清除之前的標記
    clearMarkers();

    const marker = new google.maps.Marker({
      map: map,
      position: { lat: location.lat, lng: location.lng },
      title: location.name,
      animation: google.maps.Animation.DROP,
      icon: {
        url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
        scaledSize: new google.maps.Size(32, 32)
      }
    });

    // 添加信息窗口
    const infoWindow = new google.maps.InfoWindow({
      content: `
        <div style="padding: 10px; min-width: 200px;">
          <h3 style="margin: 0 0 5px 0; font-size: 16px; color: #333;">${location.name}</h3>
          ${location.address ? `<p style="margin: 0 0 5px 0; color: #666; font-size: 14px;">${location.address}</p>` : ''}
          <p style="margin: 5px 0 0 0; color: #999; font-size: 12px;">${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}</p>
          <button onclick="window.selectLocation('${location.name}', ${location.lat}, ${location.lng})" 
                  style="background: #3B82F6; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; margin-top: 8px; width: 100%;">
            選擇此地點
          </button>
        </div>
      `
    });

    // 全局函數供訊息視窗使用
    (window as any).selectLocation = (name: string, lat: number, lng: number) => {
      const location: Location = { lat, lng, name };
      if (onLocationSelect) {
        onLocationSelect(location);
      }
      infoWindow.close();
    };

    marker.addListener('click', () => {
      infoWindow.open(map, marker);
    });

    setMapMarkers([marker]);
  };

  const clearMarkers = () => {
    mapMarkers.forEach(marker => {
      marker.setMap(null);
    });
    setMapMarkers([]);
  };

  const clearRoute = () => {
    if (directionsRenderer) {
      directionsRenderer.setDirections({ routes: [] } as unknown as google.maps.DirectionsResult);
    }
  };

  const planRoute = async (start: Location, end: Location) => {
    if (!directionsRenderer || !map) return;

    const directionsService = new google.maps.DirectionsService();
    
    try {
      const result = await directionsService.route({
        origin: { lat: start.lat, lng: start.lng },
        destination: { lat: end.lat, lng: end.lng },
        travelMode: google.maps.TravelMode.DRIVING
      });

      directionsRenderer.setDirections(result);
    } catch (error) {
      console.error('路線規劃失敗:', error);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInputRef.current && autocomplete) {
      // 聚焦到搜尋欄位，讓 autocomplete 顯示建議
      searchInputRef.current.focus();
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* 搜尋欄位 - 不重疊地圖 */}
      {showLocationSearch && (
        <div className="mb-4 p-4 bg-white rounded-lg shadow-md border border-gray-200">
          <form onSubmit={handleSearchSubmit} className="flex gap-2">
            <input
              ref={searchInputRef}
              type="text"
              placeholder="搜尋地點、地址或地標..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              搜尋
            </button>
          </form>
          
          {/* 選中地點顯示 */}
          {selectedLocation && (
            <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-900 mb-1">已選中地點：</h4>
              <p className="text-blue-800">{selectedLocation.name}</p>
              {selectedLocation.address && (
                <p className="text-blue-700 text-sm">{selectedLocation.address}</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* 地圖容器 */}
      <div className="relative">
        <div 
          ref={mapRef} 
          className="w-full rounded-lg border border-gray-200 overflow-hidden"
          style={{ height }}
        />
        
        {/* 地圖控制按鈕 */}
        <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
          <button
            onClick={clearMarkers}
            className="bg-white p-2 rounded-lg shadow-md hover:bg-gray-50 transition-colors"
            title="清除標記"
          >
            🗑️
          </button>
          <button
            onClick={clearRoute}
            className="bg-white p-2 rounded-lg shadow-md hover:bg-gray-50 transition-colors"
            title="清除路線"
          >
            🚫
          </button>
        </div>
      </div>
    </div>
  );
};

export default GoogleMap;
