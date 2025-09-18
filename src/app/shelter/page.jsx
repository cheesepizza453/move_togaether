'use client';

import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';


const ShelterMapPage = () => {
  const mapRef = useRef(null);
  const clustererRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const { user, loading } = useAuth();
  const [mapLoaded, setMapLoaded] = useState(false);
  const [error, setError] = useState(null);
  const [postsData, setPostsData] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  // 데이터 가져오기
  const fetchPostsData = async () => {
    try {
      setLoadingData(true);
      const response = await fetch('/api/shelters/active');

      // 응답 상태 확인
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Content-Type 확인
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('JSON이 아닌 응답:', text);
        throw new Error('서버에서 JSON이 아닌 응답을 반환했습니다.');
      }

      const result = await response.json();

      if (result.success) {
        console.log('게시물 데이터 로드 완료:', result.data);
        setPostsData(result.data);
      } else {
        console.error('데이터 로드 실패:', result.error);
        setError(result.error);
      }
    } catch (error) {
      console.error('API 호출 오류:', error);
      setError(`데이터를 불러오는데 실패했습니다: ${error.message}`);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    // 데이터 먼저 가져오기
    fetchPostsData();

    // 카카오맵 스크립트가 이미 로드되어 있는지 확인
    if (window.kakao && window.kakao.maps && window.kakao.maps.LatLng) {
      console.log('카카오맵 API가 이미 로드됨');
      return;
    }

    // jQuery가 로드되어 있는지 확인
    if (!window.jQuery) {
      console.log('jQuery 로드 시작');
      const jqueryScript = document.createElement('script');
      jqueryScript.src = 'https://code.jquery.com/jquery-3.6.0.min.js';
      jqueryScript.async = true;
      jqueryScript.onload = () => {
        console.log('jQuery 로드 완료');
        loadKakaoMapScript();
      };
      jqueryScript.onerror = () => {
        console.error('jQuery 로드 실패');
        setError('jQuery를 불러오는데 실패했습니다.');
      };
      document.head.appendChild(jqueryScript);
    } else {
      console.log('jQuery가 이미 로드됨');
      loadKakaoMapScript();
    }

    // 컴포넌트 언마운트 시 정리
    return () => {
      if (clustererRef.current) {
        clustererRef.current.clear();
      }
    };
  }, []);

  // 데이터와 지도가 모두 준비되면 지도 초기화
  useEffect(() => {
    if (!loadingData && postsData.length > 0 && window.kakao && window.kakao.maps && window.kakao.maps.LatLng) {
      console.log('데이터와 지도 API가 준비됨, 지도 초기화 시작');
      initializeMap();
    }
  }, [loadingData, postsData]);

  const loadKakaoMapScript = () => {
    // 스크립트가 로드되어 있지 않다면 로드
    if (!document.querySelector('script[src*="dapi.kakao.com"]')) {
      console.log('카카오맵 스크립트 로드 시작');
      const script = document.createElement('script');
      script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAPS_API_KEY}&libraries=clusterer&autoload=false`;
      script.async = false; // 동기 로딩으로 변경
      script.onload = () => {
        console.log('카카오맵 스크립트 로드 완료');
        console.log('window.kakao after script load:', window.kakao);

        // 카카오맵 API의 onload 콜백 사용
        if (window.kakao && window.kakao.maps) {
          window.kakao.maps.load(() => {
            console.log('카카오맵 API onload 콜백 실행');
            console.log('kakao.maps.LatLng after onload:', window.kakao.maps.LatLng);

            // DOM이 완전히 렌더링된 후 지도 초기화
            setTimeout(() => {
              initializeMap();
            }, 500);
          });
        } else {
          console.error('카카오맵 API가 로드되지 않음');
          setError('카카오맵 API를 불러오는데 실패했습니다.');
        }
      };
      script.onerror = () => {
        console.error('카카오맵 스크립트 로드 실패');
        setError('카카오맵을 불러오는데 실패했습니다.');
      };
      document.head.appendChild(script);
    }
  };


  const initializeMap = () => {
    console.log('initializeMap 호출됨');
    console.log('mapRef.current:', !!mapRef.current);
    console.log('window.kakao:', !!window.kakao);
    console.log('window.kakao.maps:', !!window.kakao?.maps);
    console.log('window.kakao.maps.LatLng:', !!window.kakao?.maps?.LatLng);
    console.log('API 키:', process.env.NEXT_PUBLIC_KAKAO_MAPS_API_KEY);

    if (!mapRef.current) {
      console.log('mapRef.current가 없음');
      return;
    }

    if (!window.kakao) {
      console.log('window.kakao가 없음');
      return;
    }

    if (!window.kakao.maps) {
      console.log('window.kakao.maps가 없음');
      return;
    }

    if (!window.kakao.maps.LatLng) {
      console.log('window.kakao.maps.LatLng가 없음');
      return;
    }

    try {
      console.log('지도 초기화 시작...');

      // 지도 생성
      const map = new window.kakao.maps.Map(mapRef.current, {
        center: new window.kakao.maps.LatLng(37.5665, 126.9780), // 서울 중심
        level: 8 // 지도의 확대 레벨
      });

      console.log('지도 생성 완료:', map);
      mapInstanceRef.current = map;

      // 마커 클러스터러 생성
      const clusterer = new window.kakao.maps.MarkerClusterer({
        map: map, // 마커들을 클러스터로 관리하고 표시할 지도 객체
        averageCenter: true, // 클러스터에 포함된 마커들의 평균 위치를 클러스터 마커 위치로 설정
        minLevel: 10 // 클러스터 할 최소 지도 레벨
      });

      clustererRef.current = clusterer;

      // 실제 데이터가 있을 때만 마커 생성
      if (postsData && postsData.length > 0) {
        console.log('마커 생성 시작, 데이터 개수:', postsData.length);

        // 마커 생성
        const markers = postsData.map(post => {
          const marker = new window.kakao.maps.Marker({
            position: new window.kakao.maps.LatLng(post.departure.lat, post.departure.lng)
          });

          // 마커 클릭 이벤트
          window.kakao.maps.event.addListener(marker, 'click', () => {
            // 기존 인포윈도우 닫기
            const existingInfoWindow = document.querySelector('.kakao-maps-info-window');
            if (existingInfoWindow) {
              existingInfoWindow.remove();
            }

            // 인포윈도우 생성
            const infowindow = new window.kakao.maps.InfoWindow({
              content: `
                <div style="padding: 12px; min-width: 250px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                  <div style="font-size: 16px; font-weight: 600; color: #1f2937; margin-bottom: 4px;">${post.title}</div>
                  <div style="font-size: 14px; color: #6b7280; margin-bottom: 8px;">${post.departure.address}</div>
                  <div style="font-size: 12px; color: #9ca3af; margin-bottom: 4px;">강아지: ${post.dog.name} (${post.dog.size})</div>
                  <div style="font-size: 12px; color: #9ca3af;">마감일: ${post.deadline}</div>
                </div>
              `
            });
            infowindow.open(map, marker);
          });

          return marker;
        });

        // 클러스터러에 마커들 추가
        clusterer.addMarkers(markers);
        console.log('마커 생성 완료, 마커 개수:', markers.length);
      } else {
        console.log('표시할 데이터가 없습니다.');
      }

      setMapLoaded(true);
    } catch (err) {
      console.error('지도 초기화 오류:', err);
      setError('지도를 초기화하는데 실패했습니다.');
    }
  };

  if (loading || loadingData) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
          <p className="text-gray-600">
            {loading ? '사용자 정보를 불러오는 중...' : '데이터를 불러오는 중...'}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">지도 로드 실패</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen relative overflow-hidden">
      {/* 지도 컨테이너 */}
      <div
        ref={mapRef}
        className="w-full h-full"
        style={{ minHeight: '100vh' }}
      />

      {/* 상단 헤더 */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <h1 className="text-lg font-semibold text-gray-900">봉사활동 위치</h1>
            {mapLoaded && (
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                {postsData?.length || 0}개 활동
              </span>
            )}
          </div>
          <div className="text-sm text-gray-600">
            {user ? `${user.nickname}님` : '게스트'}
          </div>
        </div>
      </div>

      {/* 하단 정보 패널 */}
      <div className="absolute bottom-0 left-0 right-0 z-10 bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-lg">
        <div className="p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-6">
              <div className="flex items-center text-sm text-gray-600">
                <span className="inline-block w-3 h-3 bg-yellow-500 rounded-full mr-2"></span>
                클러스터: 여러 봉사활동이 모인 지역
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <span className="inline-block w-3 h-3 bg-red-500 rounded-full mr-2"></span>
                개별 마커: 봉사활동 출발지
              </div>
            </div>
            <div className="text-xs text-gray-500">
              마커를 클릭하면 봉사활동 상세 정보를 확인할 수 있습니다
            </div>
          </div>
        </div>
      </div>

      {/* 로딩 오버레이 */}
      {!mapLoaded && !error && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500 mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">지도를 초기화하는 중...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShelterMapPage;
