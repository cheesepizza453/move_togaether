'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import moment from 'moment';
import IconLoading from "../../../public/img/icon/IconLoading";


const ShelterMapPage = () => {
  const mapRef = useRef(null);
  const clustererRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]); // 마커들을 저장할 ref
  const { user, profile, loading } = useAuth();
  const [mapLoaded, setMapLoaded] = useState(false);
  const [error, setError] = useState(null);
  const [postsData, setPostsData] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [dataFetched, setDataFetched] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [selectedMarker, setSelectedMarker] = useState(null); // 선택된 마커 상태
  const [userLocation, setUserLocation] = useState(null); // 사용자 현재 위치

  // 강아지 크기 변환 함수
  const convertDogSize = (size) => {
    if (!size) return '중형견'; // 기본값 설정
    const sizeMap = {
      'small': '소형견',
      'smallMedium': '중소형견',
      'medium': '중형견',
      'large': '대형견'
    };
    return sizeMap[size] || '중형견'; // 기본값으로 '중형견' 반환
  };
  console.log('User:', user);
  console.log('Profile:', profile);

  // 마커 이미지 설정 함수
  const getMarkerImage = useCallback((deadline, isSelected = false) => {
    if (!deadline) {
      // deadline이 없으면 기본 마커 사용
      const size = isSelected ? 50 : 40;
      return new window.kakao.maps.MarkerImage('/img/marker1.png', new window.kakao.maps.Size(size, size), { offset: new window.kakao.maps.Point(size/2, size) });
    }

    const today = moment();
    const deadlineDate = moment(deadline);
    const diffDays = deadlineDate.diff(today, 'days');

    let imageSrc, imageSize, imageOption;
    const size = isSelected ? 50 : 40; // 선택된 마커는 10px 더 크게

    if (diffDays <= 7) {
      // 7일 이내 - marker3 (빨간색)
      imageSrc = '/img/marker3.png';
      imageSize = new window.kakao.maps.Size(size, size);
      imageOption = { offset: new window.kakao.maps.Point(size/2, size) };
    } else if (diffDays <= 14) {
      // 14일 이내 - marker2 (주황색)
      imageSrc = '/img/marker2.png';
      imageSize = new window.kakao.maps.Size(size, size);
      imageOption = { offset: new window.kakao.maps.Point(size/2, size) };
    } else {
      // 14일 초과 - marker1 (노란색)
      imageSrc = '/img/marker1.png';
      imageSize = new window.kakao.maps.Size(size, size);
      imageOption = { offset: new window.kakao.maps.Point(size/2, size) };
    }

    return new window.kakao.maps.MarkerImage(imageSrc, imageSize, imageOption);
  }, []);

  // 데이터 가져오기
  const fetchPostsData = async () => {
    try {
      setLoadingData(true);
      console.log('API 호출 시작: /api/shelters/active');

      const response = await fetch('/api/shelters/active');
      console.log('API 응답 상태:', response.status);

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
      console.log('API 응답 데이터:', result);

      if (result.success) {
        console.log('게시물 데이터 로드 완료:', result.data);
        setPostsData(result.data);
        setDataFetched(true);
      } else {
        console.error('데이터 로드 실패:', result.error);
        setError(result.error);
        setDataFetched(true);
      }
    } catch (error) {
      console.error('API 호출 오류:', error);
      setError(`데이터를 불러오는데 실패했습니다: ${error.message}`);
      setDataFetched(true);
    } finally {
      setLoadingData(false);
    }
  };

  // 사용자 현재 위치 가져오기
  const getUserLocation = useCallback(() => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        console.log('Geolocation이 지원되지 않습니다.');
        resolve(null);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          console.log('사용자 위치:', location);
          setUserLocation(location);
          resolve(location);
        },
        (error) => {
          console.log('위치 정보를 가져올 수 없습니다:', error.message);
          resolve(null);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5분
        }
      );
    });
  }, []);

  // 마커만 업데이트하는 함수
  const updateMarkers = useCallback(() => {
    if (!clustererRef.current || !postsData || postsData.length === 0) {
      console.log('마커 업데이트 불가: 클러스터러 또는 데이터 없음');
      return;
    }

    console.log('마커 업데이트 시작, 데이터 개수:', postsData.length);

    // 기존 마커들 정리
    if (markersRef.current.length > 0) {
      console.log('기존 마커들 정리');
      markersRef.current.forEach(marker => {
        marker.setMap(null);
      });
      markersRef.current = [];
    }

    // 클러스터러에서 모든 마커 제거
    clustererRef.current.clear();

    // 새 마커 생성
    const markers = postsData.map(post => {
      console.log('마커 생성 중:', post.title, '위치:', post.departure);

      const markerImage = getMarkerImage(post.deadline, false);

      const marker = new window.kakao.maps.Marker({
        position: new window.kakao.maps.LatLng(post.departure.lat, post.departure.lng),
        image: markerImage
      });

      // 마커 클릭 이벤트
      window.kakao.maps.event.addListener(marker, 'click', () => {
        if (selectedMarker) {
          const originalImage = getMarkerImage(selectedMarker.post?.deadline, false);
          selectedMarker.marker.setImage(originalImage);
        }

        setSelectedMarker({ marker, post });

        const selectedImage = getMarkerImage(post.deadline, true);
        marker.setImage(selectedImage);

        setSelectedPost(post);

        const existingInfoWindow = document.querySelector('.kakao-maps-info-window');
        if (existingInfoWindow) {
          existingInfoWindow.remove();
        }
      });

      return marker;
    });

    // 마커들을 ref에 저장
    markersRef.current = markers;

    // 클러스터러에 마커들 추가
    clustererRef.current.addMarkers(markers);
    console.log('마커 업데이트 완료, 마커 개수:', markers.length);
  }, [postsData, getMarkerImage, selectedMarker]);

  // 사용자 위치를 직접 받아서 지도를 초기화하는 함수
  const initializeMapWithUserLocation = useCallback((location) => {
    console.log('initializeMapWithUserLocation 호출됨, 위치:', location);
    console.log('mapRef.current:', !!mapRef.current);
    console.log('window.kakao:', !!window.kakao);
    console.log('window.kakao.maps:', !!window.kakao?.maps);
    console.log('window.kakao.maps.LatLng:', !!window.kakao?.maps?.LatLng);

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

      // 지도 중심점 결정 (사용자 위치 또는 기본 서울)
      console.log('userLocation:', location);
      const centerLat = location ? location.lat : 37.5665;
      const centerLng = location ? location.lng : 126.9780;
      //const mapLevel = location ? 3 : 6; // 사용자 위치가 있으면 더 확대
      const mapLevel = 6;

      console.log('지도 중심점:', { lat: centerLat, lng: centerLng, level: mapLevel });

      // 지도 생성
      const map = new window.kakao.maps.Map(mapRef.current, {
        center: new window.kakao.maps.LatLng(centerLat, centerLng),
        level: mapLevel
      });

      console.log('지도 생성 완료:', map);
      mapInstanceRef.current = map;

      // 마커 클러스터러 생성
      const clusterer = new window.kakao.maps.MarkerClusterer({
        map: map, // 마커들을 클러스터로 관리하고 표시할 지도 객체
        averageCenter: true, // 클러스터에 포함된 마커들의 평균 위치를 클러스터 마커 위치로 설정
        minLevel: 1, // 클러스터 할 최소 지도 레벨 (1로 더 낮춤)
        disableClickZoom: false, // 클러스터 마커 클릭 시 확대/축소 비활성화
        gridSize: 60 // 클러스터링을 위한 격자 크기 (더 크게)
      });

      clustererRef.current = clusterer;

      // 지도 클릭 시 카드 닫기 이벤트 추가
      window.kakao.maps.event.addListener(map, 'click', () => {
        if (selectedMarker) {
          const originalImage = getMarkerImage(selectedMarker.post?.deadline, false);
          selectedMarker.marker.setImage(originalImage);
          setSelectedMarker(null);
        }
        setSelectedPost(null);
      });

      // 지도 초기화 완료 후 마커 업데이트
      console.log('지도 초기화 완료, 마커 업데이트 시작');
      updateMarkers();

      setMapLoaded(true);
    } catch (err) {
      console.error('지도 초기화 오류:', err);
      setError('지도를 초기화하는데 실패했습니다.');
    }
  }, [updateMarkers]);

  const initializeMap = useCallback(() => {
    console.log('initializeMap 호출됨');
    console.log('mapRef.current:', !!mapRef.current);
    console.log('window.kakao:', !!window.kakao);
    console.log('window.kakao.maps:', !!window.kakao?.maps);
    console.log('window.kakao.maps.LatLng:', !!window.kakao?.maps?.LatLng);
    console.log('mapInstanceRef.current:', !!mapInstanceRef.current);

    // 이미 지도가 초기화되어 있으면 마커만 업데이트
    if (mapInstanceRef.current && clustererRef.current) {
      console.log('지도가 이미 초기화됨, 마커만 업데이트');
      updateMarkers();
      return;
    }

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

      // 지도 중심점 결정 (사용자 위치 또는 기본 서울)
      console.log('userLocation:', userLocation);
      const centerLat = userLocation ? userLocation.lat : 37.5665;
      const centerLng = userLocation ? userLocation.lng : 126.9780;
      const mapLevel = userLocation ? 3 : 6; // 사용자 위치가 있으면 더 확대

      console.log('지도 중심점:', { lat: centerLat, lng: centerLng, level: mapLevel });

      // 지도 생성
      const map = new window.kakao.maps.Map(mapRef.current, {
        center: new window.kakao.maps.LatLng(centerLat, centerLng),
        level: mapLevel
      });

      console.log('지도 생성 완료:', map);
      mapInstanceRef.current = map;

      // 마커 클러스터러 생성
      const clusterer = new window.kakao.maps.MarkerClusterer({
        map: map, // 마커들을 클러스터로 관리하고 표시할 지도 객체
        averageCenter: true, // 클러스터에 포함된 마커들의 평균 위치를 클러스터 마커 위치로 설정
        minLevel: 1, // 클러스터 할 최소 지도 레벨 (1로 더 낮춤)
        disableClickZoom: false, // 클러스터 마커 클릭 시 확대/축소 비활성화
        gridSize: 60 // 클러스터링을 위한 격자 크기 (더 크게)
      });

      clustererRef.current = clusterer;

      // 지도 초기화 완료 후 마커 업데이트
      console.log('지도 초기화 완료, 마커 업데이트 시작');
      updateMarkers();

      setMapLoaded(true);
    } catch (err) {
      console.error('지도 초기화 오류:', err);
      setError('지도를 초기화하는데 실패했습니다.');
    }
  }, [postsData, getMarkerImage, selectedMarker, updateMarkers, userLocation]);

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
    const initializeMapWithLocation = async () => {
      if (dataFetched && !loadingData && window.kakao && window.kakao.maps && window.kakao.maps.LatLng && !mapInstanceRef.current) {
        console.log('데이터와 지도 API가 준비됨, 지도 초기화 시작');
        console.log('postsData 개수:', postsData.length);
        console.log('dataFetched:', dataFetched);

        // 사용자 위치 가져오기
        let currentUserLocation = userLocation;
        if (!currentUserLocation) {
          console.log('사용자 위치 가져오기 시작');
          currentUserLocation = await getUserLocation();
          console.log('getUserLocation 결과:', currentUserLocation);
        }

        // 위치 정보를 직접 전달하여 지도 초기화
        initializeMapWithUserLocation(currentUserLocation);
      }
    };

    initializeMapWithLocation();
  }, [dataFetched, loadingData, postsData, initializeMapWithUserLocation, updateMarkers, userLocation, getUserLocation]); // dataFetched 의존성 추가

  // 컴포넌트 언마운트 시 마커들 정리
  useEffect(() => {
    return () => {
      if (markersRef.current.length > 0) {
        console.log('컴포넌트 언마운트 - 마커들 정리');
        markersRef.current.forEach(marker => {
          marker.setMap(null);
        });
        markersRef.current = [];
      }
      if (clustererRef.current) {
        clustererRef.current.clear();
      }
    };
  }, []);

  const loadKakaoMapScript = (retryCount = 0) => {
    // 스크립트가 로드되어 있지 않다면 로드
    if (!document.querySelector('script[src*="dapi.kakao.com"]')) {
      console.log(`카카오맵 스크립트 로드 시작 (재시도: ${retryCount})`);

      // 기존 스크립트 제거 (재시도 시)
      const existingScript = document.querySelector('script[src*="dapi.kakao.com"]');
      if (existingScript) {
        existingScript.remove();
      }

      const script = document.createElement('script');
      script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAPS_API_KEY}&libraries=clusterer&autoload=false`;
      script.async = false;
      // crossOrigin 속성 제거 - 카카오맵은 CORS 정책이 다름

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
          if (retryCount < 3) {
            console.log('재시도 중...');
            setTimeout(() => loadKakaoMapScript(retryCount + 1), 2000);
          } else {
            setError('카카오맵 API를 불러오는데 실패했습니다.');
          }
        }
      };

      script.onerror = (error) => {
        console.error('카카오맵 스크립트 로드 실패:', error);
        if (retryCount < 3) {
          console.log('재시도 중...');
          setTimeout(() => loadKakaoMapScript(retryCount + 1), 2000);
        } else {
          setError('카카오맵을 불러오는데 실패했습니다. 네트워크 연결을 확인해주세요.');
        }
      };

      document.head.appendChild(script);
    }
  };


  if (loading || loadingData || !dataFetched) {
    return (
        <>
          <div className="flex items-center justify-between h-[78px] px-[30px] bg-white">
            <p className="text-22-m text-black">내 주변</p>
          </div>
          <div className="flex pt-[60px] justify-center h-screen bg-gray-50">
            <div className="w-[120px]">
              <IconLoading/>
            </div>
          </div>
        </>
    );
  }

  if (error) {
    return (
        <div className="flex items-center justify-center h-screen bg-gray-50">
          <div className="text-center max-w-md mx-auto p-6">
            <div className="text-brand-point text-6xl mb-4">⚠️</div>
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
      <div className="w-full relative">
        {/* 지도 컨테이너 */}
        <div
            ref={mapRef}
            className="w-full"
            style={{height: 'calc(100vh - 80px)'}} // BottomNavigation 높이만큼 더 많이 제외
        />

        {/* 상단 헤더 */}
        <div
            className="absolute top-0 left-0 right-0 z-10 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center justify-between h-[78px] px-[30px] bg-white">
              <p className="text-22-m text-black">내 주변</p>
            </div>
          </div>
        </div>

        {/* 선택된 게시물 카드 */}
        {selectedPost && (
            <a
                className="absolute bottom-[140px] left-[25px] right-[25px] z-20"
                href={`/posts/${selectedPost.id}`}
            >
              <div className="bg-white rounded-[30px] px-[25px] py-[20px] cursor-pointer relative shadow-[0_0_15px_0px_rgba(0,0,0,0.1)]">
                {/* D-day 배지 */}
                <div className="flex justify-end items-start">
                  <div className="absolute top-[8px] left-[16px] z-10">
                    {(() => {
                      const today = moment();
                      const deadlineDate = moment(selectedPost?.deadline);
                      const diffDays = deadlineDate.diff(today, 'days');
                      const getDdayColor = (dday) => {
                        if (dday <= 7) return 'bg-brand-point text-white';
                        if (dday <= 14) return 'bg-brand-main text-white';
                        return 'bg-[#FFE889] text-brand-yellow-dark';
                      };
                      return (
                          <span className={`flex items-center justify-center px-[9px] h-[22px] rounded-[7px] text-14-b font-bold ${getDdayColor(diffDays)}`}>
                          D-{diffDays > 0 ? diffDays : '마감'}
                        </span>
                      );
                    })()}
                  </div>
                </div>

                <div className="flex space-x-[20px]">
                  {/* 왼쪽 이미지 영역 */}
                  <div className="flex-shrink-0 relative">
                    <figure className="relative w-[80px] h-[80px] overflow-hidden bg-gray-200 rounded-[15px] shadow-[0_0_15px_0px_rgba(0,0,0,0.1)]">
                      <img
                          className="w-full h-full object-cover"
                          src={selectedPost.images && selectedPost?.images.length > 0 ? selectedPost?.images[0] : "/img/dummy_thumbnail.jpg"}
                          alt={selectedPost?.dog?.name || '강아지 사진'}
                      />
                    </figure>
                  </div>

                  {/* 오른쪽 텍스트 영역 */}
                  <div className="min-w-0 h-[70px] mt-[10px] flex flex-col justify-between w-full">
                    {/* 제목 */}
                    <h3 className="text-list-1 mb-2 leading-tight line-clamp-2 text-14-m">
                      {selectedPost?.title || '제목 없음'}
                    </h3>

                    {/* 강아지 정보와 날짜 */}
                    <div className="flex justify-between items-end text-text-800 mb-[6px]">
                      <div className="text-name-breed text-12-r">
                        {selectedPost?.dog?.name || '이름 없음'} / {convertDogSize(selectedPost?.dog?.size || 'medium')}
                      </div>
                      <div className="text-post-date text-text-600 text-9-r font-light">
                        {selectedPost?.deadline || '날짜 없음'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </a>
        )}

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