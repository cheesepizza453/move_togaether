'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import moment from 'moment';
import Image from "next/image";
import Header from "@/components/common/Header";
import Loading from "@/components/ui/loading";


const ShelterMapPage = () => {
  const mapRef = useRef(null);
  const clustererRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const { user, profile, loading } = useAuth();
  const [mapLoaded, setMapLoaded] = useState(false);
  const [error, setError] = useState(null);
  const [postsData, setPostsData] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [dataFetched, setDataFetched] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [selectedPostsAtLocation, setSelectedPostsAtLocation] = useState([]);
  const [userLocation, setUserLocation] = useState(null);

  // 지도 위치 저장 함수
  const saveMapState = useCallback(() => {
    if (mapInstanceRef.current && window.kakao?.maps) {
      const center = mapInstanceRef.current.getCenter();
      const level = mapInstanceRef.current.getLevel();

      sessionStorage.setItem('mapCenterLat', center.getLat().toString());
      sessionStorage.setItem('mapCenterLng', center.getLng().toString());
      sessionStorage.setItem('mapLevel', level.toString());
      console.log('지도 상태 저장:', { lat: center.getLat(), lng: center.getLng(), level });
    }
  }, []);

  // 강아지 크기 변환 함수
  const convertDogSize = (size) => {
    if (!size) return '중형견';
    const sizeMap = {
      'small': '소형견',
      'smallMedium': '중소형견',
      'medium': '중형견',
      'large': '대형견'
    };
    return sizeMap[size] || '중형견';
  };

  // 마커 이미지 설정 함수
  const getMarkerImage = useCallback((deadline, isSelected = false) => {
    if (!deadline) {
      const size = isSelected ? 60 : 50;
      return new window.kakao.maps.MarkerImage('/img/marker1.png', new window.kakao.maps.Size(size, size), { offset: new window.kakao.maps.Point(size/2, size) });
    }

    const today = moment();
    const deadlineDate = moment(deadline);
    const diffDays = deadlineDate.diff(today, 'days');

    let imageSrc;
    const size = isSelected ? 60 : 50;

    if (diffDays <= 7) {
      imageSrc = '/img/marker3.png';
    } else if (diffDays <= 14) {
      imageSrc = '/img/marker2.png';
    } else {
      imageSrc = '/img/marker1.png';
    }

    return new window.kakao.maps.MarkerImage(
        imageSrc,
        new window.kakao.maps.Size(size, size),
        { offset: new window.kakao.maps.Point(size/2, size) }
    );
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
            maximumAge: 300000
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

    // 좌표 기준으로 포스트들 그룹핑
    const groupedByPosition = postsData.reduce((acc, post) => {
      if (!post?.departure?.lat || !post?.departure?.lng) return acc;

      const key = `${post.departure.lat.toFixed(6)}_${post.departure.lng.toFixed(6)}`;
      if (!acc[key]) acc[key] = [];
      acc[key].push(post);
      return acc;
    }, {});

    // 그룹(같은 위치)에 하나의 마커만 생성
    const markers = Object.values(groupedByPosition).map((postsAtPos) => {
      const firstPost = postsAtPos[0];
      const markerImage = getMarkerImage(firstPost.deadline, false);

      const marker = new window.kakao.maps.Marker({
        position: new window.kakao.maps.LatLng(
            firstPost.departure.lat,
            firstPost.departure.lng
        ),
        image: markerImage,
      });

      // 마커 클릭 이벤트
      window.kakao.maps.event.addListener(marker, 'click', () => {
        // 마커 클릭 시 현재 지도 위치 저장
        saveMapState();

        // 이전에 선택된 마커가 있으면 원래 크기로 복원
        setSelectedMarker((prevSelected) => {
          if (prevSelected && prevSelected.marker) {
            const baseDeadline = Array.isArray(prevSelected.posts)
                ? prevSelected.posts[0]?.deadline
                : prevSelected.post?.deadline;

            const originalImage = getMarkerImage(baseDeadline, false);
            prevSelected.marker.setImage(originalImage);
          }

          // 현재 마커는 크게
          const baseDeadlineNow = postsAtPos[0]?.deadline;
          const selectedImage = getMarkerImage(baseDeadlineNow, true);
          marker.setImage(selectedImage);

          return { marker, posts: postsAtPos };
        });

        // 클릭 위치에 포스트가 여러 개라면 리스트로, 하나라면 기존처럼 단일 카드
        if (postsAtPos.length === 1) {
          setSelectedPostsAtLocation([]);
          setSelectedPost(postsAtPos[0]);
        } else {
          setSelectedPost(null);
          setSelectedPostsAtLocation(postsAtPos);
        }

        const existingInfoWindow = document.querySelector('.kakao-maps-info-window');
        if (existingInfoWindow) {
          existingInfoWindow.remove();
        }
      });

      return marker;
    });

    markersRef.current = markers;
    clustererRef.current.addMarkers(markers);
  }, [postsData, getMarkerImage, saveMapState]);

  // 지도 초기화 함수
  const initializeMapWithUserLocation = useCallback((location) => {
    if (!mapRef.current || !window.kakao?.maps?.LatLng) {
      return;
    }

    let centerLat, centerLng, mapLevel;

    // Session Storage에서 저장된 위치 확인 (복원 시도)
    const savedLat = sessionStorage.getItem('mapCenterLat');
    const savedLng = sessionStorage.getItem('mapCenterLng');
    const savedLevel = sessionStorage.getItem('mapLevel');

    if (savedLat && savedLng && savedLevel) {
      // 저장된 위치가 있다면 해당 값으로 설정
      centerLat = parseFloat(savedLat);
      centerLng = parseFloat(savedLng);
      mapLevel = parseInt(savedLevel, 10);
      console.log('지도 상태 복원:', { lat: centerLat, lng: centerLng, level: mapLevel });
    } else {
      // 저장된 위치가 없다면 사용자 현재 위치 또는 기본 위치 사용
      centerLat = location ? location.lat : 37.5665;
      centerLng = location ? location.lng : 126.9780;
      mapLevel = 6;
    }

    try {
      const map = new window.kakao.maps.Map(mapRef.current, {
        center: new window.kakao.maps.LatLng(centerLat, centerLng),
        level: mapLevel
      });

      mapInstanceRef.current = map;

      // 지도 이동/줌 이벤트에 저장 함수 연결
      window.kakao.maps.event.addListener(map, 'center_changed', saveMapState);
      window.kakao.maps.event.addListener(map, 'zoom_changed', saveMapState);

      const clusterer = new window.kakao.maps.MarkerClusterer({
        map: map,
        averageCenter: true,
        minLevel: 1,
        disableClickZoom: false,
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

      // 지도 클릭 시 선택 해제
      window.kakao.maps.event.addListener(map, 'click', () => {
        setSelectedMarker((prevSelected) => {
          if (prevSelected && prevSelected.marker) {
            const baseDeadline = Array.isArray(prevSelected.posts)
                ? prevSelected.posts[0]?.deadline
                : prevSelected.post?.deadline;

            const originalImage = getMarkerImage(baseDeadline, false);
            prevSelected.marker.setImage(originalImage);
          }
          return null;
        });

        setSelectedPost(null);
        setSelectedPostsAtLocation([]);
      });

      updateMarkers();
      setMapLoaded(true);
    } catch (err) {
      console.error('지도 초기화 오류:', err);
      setError('지도를 초기화하는데 실패했습니다.');
    }
  }, [updateMarkers, getMarkerImage, saveMapState]);

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
        map: map,
        averageCenter: true,
        minLevel: 1,
        disableClickZoom: false,
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
          <Header title={'내 주변'}/>
          <Loading/>
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
        <Header title={'내 주변'}/>
        <div
            ref={mapRef}
            className="w-full"
            style={{height: 'calc(100vh - 80px)'}}
        />

        {selectedPostsAtLocation.length > 0 ? (
            <div className="fixed bottom-[100px] w-full max-w-[500px] left-1/2 -translate-x-1/2 z-20">
              <div className="bg-white rounded-[30px] mx-[12px] p-[20px] shadow-[0_0_15px_0px_rgba(0,0,0,0.1)]">
                <p className="text-16-b mb-[15px] ml-[5px]">
                  이 위치에 <span className="text-brand-point">{selectedPostsAtLocation.length}</span>개의 무브가 있어요
                </p>
                <div className="max-h-[260px] overflow-y-auto space-y-[10px]">
                  {selectedPostsAtLocation.map((post) => (
                      <button
                          key={post.id}
                          className="w-full flex items-center space-x-[20px] py-[10px] px-[15px] rounded-[15px] bg-brand-bg"
                          onClick={() => {
                            saveMapState();
                            window.location.href = `/posts/${post.id}`;
                          }}
                      >
                        <div className="relative">
                          <div className="absolute top-[-10px] left-[-8px] z-10">
                            {(() => {
                              const today = moment();
                              const deadlineDate = moment(post?.deadline);
                              const diffDays = deadlineDate.diff(today, 'days');
                              const getDdayColor = (dday) => {
                                if (dday <= 7) return 'bg-brand-point text-white';
                                if (dday <= 14) return 'bg-brand-main text-white';
                                return 'bg-[#FFE889] text-brand-yellow-dark';
                              };
                              return (
                                  <span
                                      className={`flex items-center justify-center px-[7px] h-[20px] rounded-[7px] text-12-b font-bold ${getDdayColor(diffDays)}`}
                                  >
                            {diffDays > 0 ? 'D-' + diffDays : '오늘마감!'}
                          </span>
                              );
                            })()}
                          </div>
                          <figure className="relative w-[60px] h-[60px] overflow-hidden bg-gray-200 rounded-[15px] shadow-[0_0_15px_0px_rgba(0,0,0,0.1)] flex-shrink-0">
                            <Image
                                width={60}
                                height={60}
                                className="w-full h-full object-cover"
                                src={post.images && post.images.length > 0 ? post.images[0] : '/img/dummy_thumbnail.jpg'}
                                alt={post?.dog?.name || '강아지 사진'}
                            />
                          </figure>
                        </div>
                        <div className="min-w-0 h-[70px] mt-[10px] flex flex-col justify-between w-full">
                          <h3 className="text-list-1 mb-2 leading-tight line-clamp-2 text-14-m text-left">
                            {post.title || '제목 없음'}
                          </h3>
                          <div className="flex justify-between items-end text-text-800 mb-[6px]">
                            <div className="text-name-breed text-12-r">
                              {post?.dog?.name || '이름 없음'} / {convertDogSize(post?.dog?.size || 'medium')}
                            </div>
                            <div className="text-post-date text-text-600 text-9-r font-light">
                              {post?.createdAt ? moment(post.createdAt).format('YY/MM/DD') : '날짜 없음'}
                            </div>
                          </div>
                        </div>
                      </button>
                  ))}
                </div>
              </div>
            </div>
        ) : (
            selectedPost && (
                <div className="fixed bottom-[100px] w-full max-w-[500px] left-1/2 -translate-x-1/2 z-20">
                  <a
                      className="block w-full h-full"
                      href={`/posts/${selectedPost.id}`}
                      onClick={saveMapState}
                  >
                    <div className="bg-white rounded-[30px] mx-[12px] px-[25px] py-[20px] cursor-pointer relative shadow-[0_0_15px_0px_rgba(0,0,0,0.1)]">
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
                          {diffDays > 0 ? 'D-' + diffDays : '오늘마감!'}
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
                                src={selectedPost.images && selectedPost?.images.length > 0 ? selectedPost?.images[0] : '/img/dummy_thumbnail.jpg'}
                                alt={selectedPost?.dog?.name || '강아지 사진'}
                            />
                          </figure>
                        </div>

                        <div className="min-w-0 h-[70px] mt-[10px] flex flex-col justify-between w-full">
                          <h3 className="text-list-1 mb-2 leading-tight line-clamp-2 text-14-m text-left">
                            {selectedPost?.title || '제목 없음'}
                          </h3>
                          <div className="flex justify-between items-end text-text-800 mb-[6px]">
                            <div className="text-name-breed text-12-r">
                              {selectedPost?.dog?.name || '이름 없음'} / {convertDogSize(selectedPost?.dog?.size || 'medium')}
                            </div>
                            <div className="text-post-date text-text-600 text-9-r font-light">
                              {selectedPost?.createdAt ? moment(selectedPost.createdAt).format('YY/MM/DD') : '날짜 없음'}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </a>
                </div>
            )
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