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
}

const GoogleMap: React.FC<GoogleMapProps> = ({
  onLocationSelect,
  showLocationSearch = true,
  initialCenter = { lat: 25.0330, lng: 121.5654 }, // 台北市中心
  initialZoom = 12,
  className = ''
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

    const newAutocomplete = new google.maps.places.Autocomplete(searchInputRef.current, {
      types: ['establishment', 'geocode'],
      componentRestrictions: { country: 'tw' }
    });

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
        map.setZoom(16);

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

    const marker = new google.maps.Marker({
      map: map,
      position: { lat: location.lat, lng: location.lng },
      title: location.name,
      animation: google.maps.Animation.DROP,
      icon: {
        url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="#3B82F6"/>
          </svg>
        `),
        scaledSize: new google.maps.Size(24, 24),
        anchor: new google.maps.Point(12, 24)
      }
    });

    // 添加信息窗口
    const infoWindow = new google.maps.InfoWindow({
      content: `
        <div style="padding: 10px; min-width: 200px;">
          <h3 style="margin: 0 0 5px 0; font-size: 16px; color: #1F2937;">${location.name}</h3>
          ${location.address ? `<p style="margin: 0; color: #6B7280; font-size: 14px;">${location.address}</p>` : ''}
          <p style="margin: 5px 0 0 0; color: #9CA3AF; font-size: 12px;">${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}</p>
          <button onclick="window.selectLocation('${location.name}', ${location.lat}, ${location.lng})" 
                  style="background: #3B82F6; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; margin-top: 8px; width: 100%;">
            選擇此地點
          </button>
        </div>
      `
    });

    marker.addListener('click', () => {
      infoWindow.open(map, marker);
    });

    setMapMarkers(prev => [...prev, marker]);

    // 全局函數供信息窗口使用
    (window as any).selectLocation = (name: string, lat: number, lng: number) => {
      const location = { lat, lng, name };
      if (onLocationSelect) {
        onLocationSelect(location);
      }
      infoWindow.close();
    };

    return marker;
  };

  const clearMarkers = () => {
    mapMarkers.forEach(marker => {
      marker.setMap(null);
    });
    setMapMarkers([]);
    setSelectedLocation(null);
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
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* 搜尋欄位 - 分離且不重疊 */}
      {showLocationSearch && (
        <div className="absolute top-4 left-4 z-20 bg-white rounded-lg shadow-lg p-4 min-w-[320px]">
          <form onSubmit={handleSearchSubmit} className="space-y-3">
            <div>
              <label htmlFor="location-search" className="block text-sm font-medium text-gray-700 mb-1">
                搜尋地點
              </label>
              <input
                ref={searchInputRef}
                id="location-search"
                type="text"
                placeholder="輸入地點名稱或地址..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
            
            {selectedLocation && (
              <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                <h4 className="text-sm font-medium text-blue-900 mb-1">已選擇地點</h4>
                <p className="text-sm text-blue-800">{selectedLocation.name}</p>
                {selectedLocation.address && (
                  <p className="text-xs text-blue-600 mt-1">{selectedLocation.address}</p>
                )}
              </div>
            )}

            <div className="flex space-x-2">
              <button
                type="button"
                onClick={clearMarkers}
                className="flex-1 px-3 py-2 bg-gray-600 text-white text-sm rounded-md hover:bg-gray-700 transition-colors"
              >
                清除標記
              </button>
              <button
                type="button"
                onClick={clearRoute}
                className="flex-1 px-3 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 transition-colors"
              >
                清除路線
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 地圖容器 */}
      <div ref={mapRef} className="w-full h-full min-h-[500px] rounded-lg border border-gray-200" />
      
      {/* 地圖控制按鈕 */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
        <button
          onClick={() => map?.setZoom((map.getZoom() || 12) + 1)}
          className="bg-white p-2 rounded-lg shadow-md hover:bg-gray-50 transition-colors"
          title="放大"
        >
          ➕
        </button>
        <button
          onClick={() => map?.setZoom((map.getZoom() || 12) - 1)}
          className="bg-white p-2 rounded-lg shadow-md hover:bg-gray-50 transition-colors"
          title="縮小"
        >
          ➖
        </button>
        <button
          onClick={() => map?.setCenter(initialCenter)}
          className="bg-white p-2 rounded-lg shadow-md hover:bg-gray-50 transition-colors"
          title="回到中心"
        >
          🏠
        </button>
      </div>
    </div>
  );
};

export default GoogleMap;
