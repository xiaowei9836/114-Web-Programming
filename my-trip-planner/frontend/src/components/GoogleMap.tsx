import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';

interface Location {
  lat: number;
  lng: number;
  name: string;
  address?: string;
}

interface GoogleMapProps {
  onLocationSelect?: (location: Location) => void;
  onMapLoad?: (map: google.maps.Map) => void;
  showLocationSearch?: boolean;
  initialCenter?: { lat: number; lng: number };
  initialZoom?: number;
  className?: string;
}

const GoogleMap: React.FC<GoogleMapProps> = ({
  onLocationSelect,
  onMapLoad,
  showLocationSearch = true,
  initialCenter = { lat: 25.0330, lng: 121.5654 }, // 台北市中心
  initialZoom = 12,
  className = ''
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const directionsRendererRef = useRef<google.maps.DirectionsRenderer | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const [isMapReady, setIsMapReady] = useState(false);

  // 使用 useMemo 穩定 initialCenter 和 initialZoom
  const stableCenter = useMemo(() => initialCenter, [initialCenter.lat, initialCenter.lng]);
  const stableZoom = useMemo(() => initialZoom, [initialZoom]);

  // 使用 useCallback 穩定 onLocationSelect 函數
  const stableOnLocationSelect = useCallback((location: Location) => {
    if (onLocationSelect) {
      onLocationSelect(location);
    }
  }, [onLocationSelect]);

  // 使用 ref 來存儲 addMarker 函數，避免依賴項問題
  const addMarkerRef = useRef<(location: Location) => void>();
  const clearMarkersRef = useRef<() => void>();
  const clearRouteRef = useRef<() => void>();

  // 主要的地圖初始化 useEffect - 只在組件掛載時執行一次
  useEffect(() => {
    if (!mapRef.current || !window.google) {
      console.log('GoogleMap: 等待 Google Maps API 載入...');
      return;
    }

    console.log('GoogleMap: 開始初始化地圖');
    console.log('GoogleMap: window.google 狀態:', !!window.google);
    console.log('GoogleMap: window.google.maps 狀態:', !!window.google?.maps);

    try {
      const newMap = new google.maps.Map(mapRef.current, {
        center: stableCenter,
        zoom: stableZoom,
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

      console.log('GoogleMap: 地圖創建成功');
      mapInstanceRef.current = newMap;

      // 調用 onMapLoad 回調，讓父組件獲取地圖實例
      if (onMapLoad) {
        onMapLoad(newMap);
      }

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
      directionsRendererRef.current = newDirectionsRenderer;

      // 定義 addMarker 函數並存儲到 ref
      addMarkerRef.current = (location: Location) => {
        if (!mapInstanceRef.current) return;

        const marker = new google.maps.Marker({
          map: mapInstanceRef.current,
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
          infoWindow.open(mapInstanceRef.current, marker);
        });

        markersRef.current.push(marker);
      };

      // 定義 clearMarkers 函數並存儲到 ref
      clearMarkersRef.current = () => {
        markersRef.current.forEach(marker => {
          marker.setMap(null);
        });
        markersRef.current = [];
      };

      // 定義 clearRoute 函數並存儲到 ref
      clearRouteRef.current = () => {
        if (directionsRendererRef.current) {
          directionsRendererRef.current.setDirections({ routes: [] } as unknown as google.maps.DirectionsResult);
        }
      };

      // 移除地圖點擊事件，避免與搜尋標記功能衝突
      // newMap.addListener('click', (event: google.maps.MapMouseEvent) => {
      //   if (event.latLng) {
      //     const location: Location = {
      //       lat: event.latLng.lat(),
      //       lng: event.latLng.lng(),
      //       name: '點擊的地點'
      //     };
      //     console.log('GoogleMap: 地圖點擊，位置:', location);
      //     if (addMarkerRef.current) {
      //       addMarkerRef.current(location);
      //     }
      //   }
      // });

      setIsMapReady(true);
      console.log('GoogleMap: 地圖初始化完成');
    } catch (error) {
      console.error('GoogleMap: 地圖初始化失敗:', error);
    }

  }, []); // 空依賴數組，只在組件掛載時執行一次

  // 處理 onLocationSelect 變化的 useEffect
  useEffect(() => {
    if (isMapReady) {
      console.log('GoogleMap: onLocationSelect 回調已更新');
    }
  }, [isMapReady, stableOnLocationSelect]);

  // 處理初始中心點和縮放變化的 useEffect
  useEffect(() => {
    if (mapInstanceRef.current && isMapReady) {
      mapInstanceRef.current.setCenter(stableCenter);
      mapInstanceRef.current.setZoom(stableZoom);
    }
  }, [stableCenter, stableZoom, isMapReady]);

  // 暴露給父組件的方法
  const addMarker = useCallback((location: Location) => {
    if (addMarkerRef.current) {
      addMarkerRef.current(location);
    }
  }, []);

  const clearMarkers = useCallback(() => {
    if (clearMarkersRef.current) {
      clearMarkersRef.current();
    }
  }, []);

  const clearRoute = useCallback(() => {
    if (clearRouteRef.current) {
      clearRouteRef.current();
    }
  }, []);

  const planRoute = useCallback(async (start: Location, end: Location) => {
    if (!directionsRendererRef.current || !mapInstanceRef.current) return;

    const directionsService = new google.maps.DirectionsService();
    
    try {
      const result = await directionsService.route({
        origin: { lat: start.lat, lng: start.lng },
        destination: { lat: end.lat, lng: end.lng },
        travelMode: google.maps.TravelMode.DRIVING
      });

      directionsRendererRef.current.setDirections(result);
    } catch (error) {
      console.error('路線規劃失敗:', error);
    }
  }, []);

  return (
    <div className={`relative ${className}`}>
      <div ref={mapRef} className="w-full h-full min-h-[400px]" />
    </div>
  );
};

export default GoogleMap;
