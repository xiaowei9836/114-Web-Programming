import React, { useEffect, useRef, useState, useCallback, useMemo, forwardRef, useImperativeHandle } from 'react';

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
  // 添加外部標記支持
  externalMarkers?: Location[];
  onMarkerClick?: (location: Location) => void;
}

// 定義 ref 的類型
export interface GoogleMapRef {
  clearTempMarker: () => void;
}

const GoogleMap = forwardRef<GoogleMapRef, GoogleMapProps>(({
  onLocationSelect,
  showLocationSearch = true,
  initialCenter = { lat: 25.0330, lng: 121.5654 }, // 台北市中心
  initialZoom = 12,
  className = '',
  externalMarkers = [],
  onMarkerClick
}, ref) => {
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
  const externalMarkersRef = useRef<google.maps.Marker[]>([]);
  const tempMarkerRef = useRef<google.maps.Marker | null>(null);

  // 添加外部標記的函數
  const addExternalMarker = useCallback((location: Location) => {
    if (!mapInstanceRef.current) return;

    const marker = new google.maps.Marker({
      map: mapInstanceRef.current,
      position: { lat: location.lat, lng: location.lng },
      title: location.name,
      animation: google.maps.Animation.DROP,
      // 使用自定義圖標，紅色大頭針
      icon: {
        url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C8.13 2 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="#FF4444"/>
          </svg>
        `),
        scaledSize: new google.maps.Size(24, 24),
        anchor: new google.maps.Point(12, 24)
      }
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
      // 觸發標記點擊回調
      if (onMarkerClick) {
        onMarkerClick(location);
      }
    });

    externalMarkersRef.current.push(marker);
  }, [onMarkerClick]);

  // 清除外部標記的函數
  const clearExternalMarkers = useCallback(() => {
    externalMarkersRef.current.forEach(marker => {
      marker.setMap(null);
    });
    externalMarkersRef.current = [];
  }, []);

  // 添加臨時標記的函數（點擊地圖時顯示）
  const addTempMarker = useCallback((location: Location) => {
    if (!mapInstanceRef.current) return;

    // 清除之前的臨時標記
    if (tempMarkerRef.current) {
      tempMarkerRef.current.setMap(null);
    }

    const marker = new google.maps.Marker({
      map: mapInstanceRef.current,
      position: { lat: location.lat, lng: location.lng },
      title: location.name,
      animation: google.maps.Animation.DROP,
      // 使用藍色臨時標記，區分於已添加的紅色標記
      icon: {
        url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C8.13 2 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="#3B82F6"/>
          </svg>
        `),
        scaledSize: new google.maps.Size(24, 24),
        anchor: new google.maps.Point(12, 24)
      }
    });

    // 添加信息窗口
    const infoWindow = new google.maps.InfoWindow({
      content: `
        <div style="padding: 10px;">
          <h3 style="margin: 0 0 5px 0; font-size: 16px;">${location.name}</h3>
          <p style="margin: 5px 0 0 0; color: #999; font-size: 12px;">${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}</p>
          <p style="margin: 5px 0 0 0; color: #666; font-size: 12px;">點擊"添加地點"來保存此地點</p>
        </div>
      `
    });

    marker.addListener('click', () => {
      infoWindow.open(mapInstanceRef.current, marker);
    });

    tempMarkerRef.current = marker;
    
    // 觸發地點選擇回調，讓父組件知道用戶選擇了這個位置
    if (stableOnLocationSelect) {
      stableOnLocationSelect(location);
    }
  }, [stableOnLocationSelect]);

  // 清除臨時標記的函數
  const clearTempMarker = useCallback(() => {
    if (tempMarkerRef.current) {
      tempMarkerRef.current.setMap(null);
      tempMarkerRef.current = null;
    }
  }, []);

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

      // 地圖點擊事件
      newMap.addListener('click', (event: google.maps.MapMouseEvent) => {
        if (event.latLng) {
          const location: Location = {
            lat: event.latLng.lat(),
            lng: event.latLng.lng(),
            name: '點擊的地點'
          };
          console.log('GoogleMap: 地圖點擊，位置:', location);
          addTempMarker(location); // 點擊地圖時添加臨時標記
        }
      });

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

  // 處理外部標記變化的 useEffect
  useEffect(() => {
    if (!mapInstanceRef.current || !isMapReady) return;

    // 清除現有的外部標記
    clearExternalMarkers();

    // 添加新的外部標記
    externalMarkers.forEach((location, index) => {
      addExternalMarker(location);
    });

    console.log('GoogleMap: 外部標記已更新，共', externalMarkers.length, '個標記');
  }, [externalMarkers, isMapReady, addExternalMarker, clearExternalMarkers]);

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

  // 使用 useImperativeHandle 暴露給父組件的方法
  useImperativeHandle(ref, () => ({
    clearTempMarker: clearTempMarker,
  }));

  return (
    <div className={`relative ${className}`}>
      <div ref={mapRef} className="w-full h-full min-h-[400px]" />
    </div>
  );
});

export default GoogleMap;
