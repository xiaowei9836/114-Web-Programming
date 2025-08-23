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
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [mapMarkers, setMapMarkers] = useState<google.maps.Marker[]>([]);
  const [directionsRenderer, setDirectionsRenderer] = useState<google.maps.DirectionsRenderer | null>(null);

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

    // 添加地點搜尋功能
    if (showLocationSearch) {
      const input = document.createElement('input');
      input.type = 'text';
      input.placeholder = '搜尋地點...';
      input.className = 'location-search-input';
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
        background: white;
      `;

      // 創建 Autocomplete
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

      // 將搜尋框添加到地圖
      newMap.controls[google.maps.ControlPosition.TOP_LEFT].push(input);
    }

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

  }, [initialCenter, initialZoom, showLocationSearch, onLocationSelect]);

  const addMarker = (location: Location) => {
    if (!map) return;

    const marker = new google.maps.Marker({
      map: map,
      position: { lat: location.lat, lng: location.lng },
      title: location.name,
      animation: google.maps.Animation.DROP
    });

    // 添加信息窗口
    const infoWindow = new google.maps.InfoWindow({
      content: `
        <div style="padding: 10px;">
          <h3 style="margin: 0 0 5px 0; font-size: 16px;">${location.name}</h3>
          ${location.address ? `<p style="margin: 0; color: #666; font-size: 14px;">${location.address}</p>` : ''}
          <p style="margin: 5px 0 0 0; color: #999; font-size: 12px;">${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}</p>
        </div>
      `
    });

    marker.addListener('click', () => {
      infoWindow.open(map, marker);
    });

    setMapMarkers(prev => [...prev, marker]);
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

  return (
    <div className={`relative ${className}`}>
      <div ref={mapRef} className="w-full h-full min-h-[400px]" />
      
      {/* 控制按鈕 */}
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
  );
};

export default GoogleMap;
