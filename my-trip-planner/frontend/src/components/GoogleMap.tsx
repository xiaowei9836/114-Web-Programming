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
    console.log('GoogleMap: addExternalMarker 被調用，位置:', location);
    if (!mapInstanceRef.current) {
      console.error('GoogleMap: mapInstanceRef.current 為空，無法添加外部標記');
      return;
    }

    // 檢查標記是否已經存在
    const existingMarker = externalMarkersRef.current.find(marker => {
      const pos = marker.getPosition();
      if (!pos) return false;
      return Math.abs(pos.lat() - location.lat) < 0.0001 && 
             Math.abs(pos.lng() - location.lng) < 0.0001;
    });

    if (existingMarker) {
      console.log('GoogleMap: 標記已存在，跳過創建:', location);
      return;
    }

    console.log('GoogleMap: 創建新的外部標記');
    const marker = new google.maps.Marker({
      map: mapInstanceRef.current,
      position: { lat: location.lat, lng: location.lng },
      title: location.name,
      animation: google.maps.Animation.DROP,
      // 使用標準 Google Maps 圖標，紅色大頭針
      icon: {
        url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
        scaledSize: new google.maps.Size(32, 32),
        anchor: new google.maps.Point(16, 32)
      }
    });

    // 如果圖標加載失敗，使用默認圖標
    marker.addListener('error', () => {
      console.warn('GoogleMap: 自定義圖標加載失敗，使用默認圖標');
      marker.setIcon(null); // 使用默認圖標
    });

    // 創建編號標籤
    const label = new google.maps.Marker({
      position: { lat: location.lat, lng: location.lng },
      map: mapInstanceRef.current,
      icon: {
        url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="10" cy="10" r="10" fill="#1f2937" stroke="white" stroke-width="2"/>
            <text x="10" y="14" font-family="Arial" font-size="12" font-weight="bold" fill="white" text-anchor="middle">${Math.floor(externalMarkersRef.current.length / 2) + 1}</text>
          </svg>
        `),
        scaledSize: new google.maps.Size(20, 20),
        anchor: new google.maps.Point(10, 10)
      },
      title: `#${Math.floor(externalMarkersRef.current.length / 2) + 1}`,
      zIndex: 1000 // 確保標籤在標記上方
    });

    // 將標籤附加到標記
    // marker.setLabel(label); // 不需要這行，標籤已經是獨立的標記

    // 將標籤添加到標記數組中，以便後續清除
    externalMarkersRef.current.push(marker);
    externalMarkersRef.current.push(label);

    console.log('GoogleMap: 外部標記創建成功，設置到地圖');
    console.log('GoogleMap: 標記位置:', marker.getPosition());
    console.log('GoogleMap: 標記地圖:', marker.getMap());
    console.log('GoogleMap: 標記圖標:', marker.getIcon());
    console.log('GoogleMap: 標記可見性:', marker.getVisible());
    
    // 確保標記被添加到地圖
    marker.setMap(mapInstanceRef.current);
    
    // 驗證標記是否真的在地圖上
    setTimeout(() => {
      console.log('GoogleMap: 標記驗證 - 位置:', marker.getPosition());
      console.log('GoogleMap: 標記驗證 - 地圖:', marker.getMap());
      console.log('GoogleMap: 標記驗證 - 可見性:', marker.getVisible());
      console.log('GoogleMap: 標記驗證 - 圖標:', marker.getIcon());
      console.log('GoogleMap: 標記驗證 - 動畫:', marker.getAnimation());
    }, 100);
    
    // externalMarkersRef.current.push(marker); // 移除此行，因為標籤已經添加到數組
  }, []);

  // 清除所有外部標記的函數
  const clearExternalMarkers = useCallback(() => {
    console.log('GoogleMap: clearExternalMarkers 被調用');
    if (externalMarkersRef.current.length > 0) {
      externalMarkersRef.current.forEach(marker => {
        marker.setMap(null);
      });
      externalMarkersRef.current = [];
      console.log('GoogleMap: 所有外部標記已清除');
    }
  }, []);

  // 添加臨時標記的函數（點擊地圖時顯示）
  const addTempMarker = useCallback((location: google.maps.LatLng) => {
    console.log('GoogleMap: addTempMarker 被調用，位置:', location);
    if (!mapInstanceRef.current) {
      console.error('GoogleMap: mapInstanceRef.current 為空，無法添加臨時標記');
      return;
    }

    // 清除之前的臨時標記
    if (tempMarkerRef.current) {
      console.log('GoogleMap: 清除之前的臨時標記');
      tempMarkerRef.current.setMap(null);
    }

    console.log('GoogleMap: 創建新的臨時標記');
    const marker = new google.maps.Marker({
      map: mapInstanceRef.current,
      position: { lat: location.lat(), lng: location.lng() },
      title: '點擊的地點',
      animation: google.maps.Animation.DROP,
      // 使用標準 Google Maps 圖標，藍色臨時標記
      icon: {
        url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
        scaledSize: new google.maps.Size(32, 32),
        anchor: new google.maps.Point(16, 32)
      }
    });

    console.log('GoogleMap: 臨時標記創建成功，設置到地圖');
    tempMarkerRef.current = marker;
    
    // 觸發地點選擇回調，讓父組件知道用戶選擇了這個位置
    if (stableOnLocationSelect) {
      console.log('GoogleMap: 觸發 onLocationSelect 回調');
      stableOnLocationSelect({
        lat: location.lat(),
        lng: location.lng(),
        name: '點擊的地點'
      });
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
        // 暫時移除樣式，確保標記能正常顯示
        // styles: [
        //   {
        //     featureType: 'poi',
        //     elementType: 'labels',
        //     stylers: [{ visibility: 'off' }]
        //   }
        // ]
      });

      console.log('GoogleMap: 地圖創建成功');
      mapInstanceRef.current = newMap;

      // 添加地圖事件監聽器來檢查狀態
      newMap.addListener('idle', () => {
        console.log('GoogleMap: 地圖渲染完成');
        console.log('GoogleMap: 地圖中心:', newMap.getCenter());
        console.log('GoogleMap: 地圖縮放:', newMap.getZoom());
      });

      newMap.addListener('bounds_changed', () => {
        console.log('GoogleMap: 地圖邊界變化');
      });

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

      // 添加地圖點擊事件監聽器
      newMap.addListener('click', (event: google.maps.MapMouseEvent) => {
        if (event.latLng) {
          console.log('GoogleMap: 地圖被點擊，位置:', event.latLng);
          addTempMarker(event.latLng);
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
    console.log('GoogleMap: 外部標記 useEffect 觸發');
    console.log('GoogleMap: isMapReady:', isMapReady);
    console.log('GoogleMap: mapInstanceRef.current:', !!mapInstanceRef.current);
    console.log('GoogleMap: externalMarkers:', externalMarkers);
    
    if (!mapInstanceRef.current || !isMapReady) {
      console.log('GoogleMap: 地圖未準備好，跳過外部標記處理');
      return;
    }

    // 檢查標記是否已經存在，避免重複創建
    const currentMarkerCount = externalMarkersRef.current.length;
    const newMarkerCount = externalMarkers.length;
    
    if (currentMarkerCount === newMarkerCount && newMarkerCount > 0) {
      // 檢查標記位置是否相同，如果相同則跳過
      const positionsMatch = externalMarkers.every((location, index) => {
        const existingMarker = externalMarkersRef.current[index];
        if (!existingMarker) return false;
        const existingPos = existingMarker.getPosition();
        return existingPos && 
               Math.abs(existingPos.lat() - location.lat) < 0.0001 && 
               Math.abs(existingPos.lng() - location.lng) < 0.0001;
      });
      
      if (positionsMatch) {
        console.log('GoogleMap: 標記位置未變化，跳過重新創建');
        return;
      }
    }

    console.log('GoogleMap: 開始處理外部標記');
    // 清除現有的外部標記
    clearExternalMarkers();

    // 添加新的外部標記
    if (externalMarkers.length > 0) {
      externalMarkers.forEach((location, index) => {
        console.log(`GoogleMap: 添加外部標記 ${index + 1}:`, location);
        addExternalMarker(location);
      });

      // 調整地圖視圖以顯示所有標記
      const bounds = new google.maps.LatLngBounds();
      externalMarkers.forEach(location => {
        bounds.extend(new google.maps.LatLng(location.lat, location.lng));
      });
      
      // 添加一些邊距
      mapInstanceRef.current.fitBounds(bounds);
      mapInstanceRef.current.setZoom(Math.min(mapInstanceRef.current.getZoom() || 12, 15));
      
      console.log('GoogleMap: 地圖視圖已調整以顯示所有標記');
    }

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
