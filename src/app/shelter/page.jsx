'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import moment from 'moment';
import IconLoading from "../../../public/img/icon/IconLoading";
import Image from "next/image";


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

  // 마커 이미지 설정 함수
  const getMarkerImage = useCallback((deadline, isSelected = false) => {
    if (!deadline) {
      // deadline이 없으면 기본 마커 사용
      const size = isSelected ? 60 : 50;
      return new window.kakao.maps.MarkerImage('/img/marker1.png', new window.kakao.maps.Size(size, size), { offset: new window.kakao.maps.Point(size/2, size) });
    }

    const today = moment();
    const deadlineDate = moment(deadline);
    const diffDays = deadlineDate.diff(today, 'days');

    let imageSrc, imageSize, imageOption;
    const size = isSelected ? 60 : 50;

    if (diffDays <= 7) {
      imageSrc = '/img/marker3.png';
      imageSize = new window.kakao.maps.Size(size, size);
      imageOption = { offset: new window.kakao.maps.Point(size/2, size) };
    } else if (diffDays <= 14) {
      imageSrc = '/img/marker2.png';
      imageSize = new window.kakao.maps.Size(size, size);
      imageOption = { offset: new window.kakao.maps.Point(size/2, size) };
    } else {
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
      const response = await fetch('/api/shelters/active');

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('JSON이 아닌 응답:', text);
        throw new Error('서버에서 JSON이 아닌 응답을 반환했습니다.');
      }

      const result = await response.json();

      if (result.success) {
        setPostsData(result.data);
        setDataFetched(true);
      } else {
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
        resolve(null);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(location);
          resolve(location);
        },
        (error) => {
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
      return;
    }

    // 기존 마커들 정리
    if (markersRef.current.length > 0) {
      markersRef.current.forEach(marker => {
        marker.setMap(null);
      });
      markersRef.current = [];
    }

    clustererRef.current.clear();

    // 새 마커 생성
    const markers = postsData.map(post => {
      const markerImage = getMarkerImage(post.deadline, false);

      const marker = new window.kakao.maps.Marker({
        position: new window.kakao.maps.LatLng(post.departure.lat, post.departure.lng),
        image: markerImage
      });

      // 마커 클릭 이벤트
      window.kakao.maps.event.addListener(marker, 'click', () => {
        // 이전에 선택된 마커가 있으면 원래 크기로 복원
        setSelectedMarker(prevSelected => {
          if (prevSelected && prevSelected.marker) {
            const originalImage = getMarkerImage(prevSelected.post?.deadline, false);
            prevSelected.marker.setImage(originalImage);
          }

          // 새로운 마커를 크게 만들기
          const selectedImage = getMarkerImage(post.deadline, true);
          marker.setImage(selectedImage);

          // 새로운 선택 상태 반환
          return { marker, post };
        });

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
  }, [postsData, getMarkerImage]); // selectedMarker 제거!

  // 지도 초기화 함수
  const initializeMapWithUserLocation = useCallback((location) => {
    if (!mapRef.current || !window.kakao?.maps?.LatLng) {
      return;
    }

    try {
      const centerLat = location ? location.lat : 37.5665;
      const centerLng = location ? location.lng : 126.9780;
      const mapLevel = 6;

      const map = new window.kakao.maps.Map(mapRef.current, {
        center: new window.kakao.maps.LatLng(centerLat, centerLng),
        level: mapLevel
      });

      mapInstanceRef.current = map;

      const clusterer = new window.kakao.maps.MarkerClusterer({
        map: map, // 마커들을 클러스터로 관리하고 표시할 지도 객체
        averageCenter: true, // 클러스터에 포함된 마커들의 평균 위치를 클러스터 마커 위치로 설정
        minLevel: 1, // 클러스터 할 최소 지도 레벨 (1로 더 낮춤)
        disableClickZoom: false, // 클러스터 마커 클릭 시 확대/축소 비활성화
        gridSize: 60,
        styles: [{
          width: '60px',
          height: '60px',
          background: 'rgba(255,208,68,0.7)',
          borderRadius: '999px',
          color: '#000',
          fontSize: '16px',
          fontWeight: '700',
          textAlign: 'center',
          lineHeight: '60px',
          border:'1px solid rgba(255,208,68,1)'
        }]
      });

      clustererRef.current = clusterer;

      // 지도 클릭 시 선택 해제 - 함수형 업데이트 사용!
      window.kakao.maps.event.addListener(map, 'click', () => {
        setSelectedMarker(prevSelected => {
          if (prevSelected && prevSelected.marker) {
            const originalImage = getMarkerImage(prevSelected.post?.deadline, false);
            prevSelected.marker.setImage(originalImage);
          }
          return null;
        });
        setSelectedPost(null);
      });

      updateMarkers();
      setMapLoaded(true);
    } catch (err) {
      console.error('지도 초기화 오류:', err);
      setError('지도를 초기화하는데 실패했습니다.');
    }
  }, [updateMarkers, getMarkerImage]);

  const initializeMap = useCallback(() => {
    if (mapInstanceRef.current && clustererRef.current) {
      updateMarkers();
      return;
    }

    if (!mapRef.current || !window.kakao?.maps?.LatLng) {
      return;
    }

    try {
      const centerLat = userLocation ? userLocation.lat : 37.5665;
      const centerLng = userLocation ? userLocation.lng : 126.9780;
      const mapLevel = userLocation ? 3 : 6;

      const map = new window.kakao.maps.Map(mapRef.current, {
        center: new window.kakao.maps.LatLng(centerLat, centerLng),
        level: mapLevel
      });

      mapInstanceRef.current = map;

      const clusterer = new window.kakao.maps.MarkerClusterer({
        map: map, // 마커들을 클러스터로 관리하고 표시할 지도 객체
        averageCenter: true, // 클러스터에 포함된 마커들의 평균 위치를 클러스터 마커 위치로 설정
        minLevel: 1, // 클러스터 할 최소 지도 레벨 (1로 더 낮춤)
        disableClickZoom: false, // 클러스터 마커 클릭 시 확대/축소 비활성화
        gridSize: 60,
        styles: [{
          width: '60px',
          height: '60px',
          background: 'rgba(255,208,68,0.7)',
          borderRadius: '999px',
          color: '#000',
          fontSize: '16px',
          fontWeight: '700',
          textAlign: 'center',
          lineHeight: '60px',
          border:'1px solid rgba(255,208,68,1)'
        }]
      });

      clustererRef.current = clusterer;

      updateMarkers();
      setMapLoaded(true);
    } catch (err) {
      console.error('지도 초기화 오류:', err);
      setError('지도를 초기화하는데 실패했습니다.');
    }
  }, [postsData, getMarkerImage, updateMarkers, userLocation]);

  useEffect(() => {
    fetchPostsData();

    if (window.kakao && window.kakao.maps && window.kakao.maps.LatLng) {
      return;
    }

    if (!window.jQuery) {
      const jqueryScript = document.createElement('script');
      jqueryScript.src = 'https://code.jquery.com/jquery-3.6.0.min.js';
      jqueryScript.async = true;
      jqueryScript.onload = () => {
        loadKakaoMapScript();
      };
      jqueryScript.onerror = () => {
        setError('jQuery를 불러오는데 실패했습니다.');
      };
      document.head.appendChild(jqueryScript);
    } else {
      loadKakaoMapScript();
    }

    return () => {
      if (clustererRef.current) {
        clustererRef.current.clear();
      }
    };
  }, []);

  useEffect(() => {
    const initializeMapWithLocation = async () => {
      if (dataFetched && !loadingData && window.kakao && window.kakao.maps && window.kakao.maps.LatLng && !mapInstanceRef.current) {
        let currentUserLocation = userLocation;
        if (!currentUserLocation) {
          currentUserLocation = await getUserLocation();
        }
        initializeMapWithUserLocation(currentUserLocation);
      }
    };

    initializeMapWithLocation();
  }, [dataFetched, loadingData, postsData, initializeMapWithUserLocation, updateMarkers, userLocation, getUserLocation]);

  useEffect(() => {
    return () => {
      if (markersRef.current.length > 0) {
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
    if (!document.querySelector('script[src*="dapi.kakao.com"]')) {
      const existingScript = document.querySelector('script[src*="dapi.kakao.com"]');
      if (existingScript) {
        existingScript.remove();
      }

      const script = document.createElement('script');
      script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAPS_API_KEY}&libraries=clusterer&autoload=false`;
      script.async = false;

      script.onload = () => {
        if (window.kakao && window.kakao.maps) {
          window.kakao.maps.load(() => {
            setTimeout(() => {
              initializeMap();
            }, 500);
          });
        } else {
          if (retryCount < 3) {
            setTimeout(() => loadKakaoMapScript(retryCount + 1), 2000);
          } else {
            setError('카카오맵 API를 불러오는데 실패했습니다.');
          }
        }
      };

      script.onerror = (error) => {
        if (retryCount < 3) {
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
            style={{height: 'calc(100vh - 80px)'}}
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
            <div className="fixed bottom-[100px] w-full max-w-[500px] left-1/2 -translate-x-1/2 z-20">
              <a
                  className="block w-full h-full"
                  href={`/posts/${selectedPost.id}`}
              >
                <div className="bg-white rounded-[30px] mx-[12px] px-[25px] py-[20px] cursor-pointer relative shadow-[0_0_15px_0px_rgba(0,0,0,0.1)]">
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
                        {diffDays > 0 ? 'D-'+diffDays : '오늘마감!'}
                      </span>
                        );
                      })()}
                    </div>
                  </div>

                  <div className="flex space-x-[20px]">
                    <div className="flex-shrink-0 relative">
                      <figure className="relative w-[80px] h-[80px] overflow-hidden bg-gray-200 rounded-[15px] shadow-[0_0_15px_0px_rgba(0,0,0,0.1)]">
                        <Image
                            width={74}
                            height={74}
                            className="w-full h-full object-cover"
                            src={selectedPost.images && selectedPost?.images.length > 0 ? selectedPost?.images[0] : "/img/dummy_thumbnail.jpg"}
                            alt={selectedPost?.dog?.name || '강아지 사진'}
                        />
                      </figure>
                    </div>

                    <div className="min-w-0 h-[70px] mt-[10px] flex flex-col justify-between w-full">
                      <h3 className="text-list-1 mb-2 leading-tight line-clamp-2 text-14-m">
                        {selectedPost?.title || '제목 없음'}
                      </h3>

                      <div className="flex justify-between items-end text-text-800 mb-[6px]">
                        <div className="text-name-breed text-12-r">
                          {selectedPost?.dog?.name || '이름 없음'} / {convertDogSize(selectedPost?.dog?.size || 'medium')}
                        </div>
                        <div className="text-post-date text-text-600 text-9-r font-light">
                          {selectedPost?.createdAt ? moment(selectedPost.createdAt).format("YY/MM/DD") : '날짜 없음'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </a>
            </div>
        )}
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