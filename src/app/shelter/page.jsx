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
  const [selectedPost, setSelectedPost] = useState(null);
  const [selectedMarker, setSelectedMarker] = useState(null); // 선택된 마커 상태

  // 강아지 크기 변환 함수
  const convertDogSize = (size) => {
    if (!size) return '중형견'; // 기본값 설정
    const sizeMap = {
      'small': '소형견',
      'medium-small': '중소형견',
      'medium': '중형견',
      'large': '대형견'
    };
    return sizeMap[size] || '중형견'; // 기본값으로 '중형견' 반환
  };
  console.log('User:', user);
  console.log('Profile:', profile);

  // 마커 이미지 설정 함수
  const getMarkerImage = (deadline, isSelected = false) => {
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
  };

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


  // 데이터와 지도가 모두 준비되면 지도 초기화 (한 번만)
  useEffect(() => {
    if (!loadingData && postsData.length > 0 && window.kakao && window.kakao.maps && window.kakao.maps.LatLng && !mapInstanceRef.current) {
      console.log('데이터와 지도 API가 준비됨, 지도 초기화 시작');
      console.log('postsData 개수:', postsData.length);
      initializeMap();
    }
  }, [loadingData]); // postsData 의존성 제거

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
    // console.log('API 키:', process.env.NEXT_PUBLIC_KAKAO_MAPS_API_KEY);

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
        level: 6 // 지도의 확대 레벨 (6으로 조정)
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

      // 실제 데이터가 있을 때만 마커 생성
      if (postsData && postsData.length > 0) {
        console.log('마커 생성 시작, 데이터 개수:', postsData.length);
        console.log('첫 번째 데이터:', postsData[0]);

        // 기존 마커들 정리
        if (markersRef.current.length > 0) {
          console.log('기존 마커들 정리');
          markersRef.current.forEach(marker => {
            marker.setMap(null);
          });
          markersRef.current = [];
        }

        // 마커 생성
        const markers = postsData.map(post => {
          console.log('마커 생성 중:', post.title, '위치:', post.departure);

          // 마커 이미지 설정 (기본 크기)
          const markerImage = getMarkerImage(post.deadline, false);

          const marker = new window.kakao.maps.Marker({
            position: new window.kakao.maps.LatLng(post.departure.lat, post.departure.lng),
            image: markerImage // 커스텀 마커 이미지 적용
          });

          // 마커 클릭 이벤트
          window.kakao.maps.event.addListener(marker, 'click', () => {
            // 이전에 선택된 마커가 있다면 원래 크기로 복원
            if (selectedMarker) {
              const originalImage = getMarkerImage(selectedMarker.post?.deadline, false);
              selectedMarker.marker.setImage(originalImage);
            }

            // 현재 마커를 선택된 마커로 설정
            setSelectedMarker({ marker, post });

            // 마커 크기를 10px 더 크게 변경
            const selectedImage = getMarkerImage(post.deadline, true);
            marker.setImage(selectedImage);

            // 선택된 게시물 설정
            setSelectedPost(post);

            // 기존 인포윈도우 닫기
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
        clusterer.addMarkers(markers);
        console.log('마커 생성 완료, 마커 개수:', markers.length);

        // 마커를 직접 지도에 추가 (클러스터러 문제 해결용)
        markers.forEach(marker => {
          marker.setMap(map);
        });

        // 마커가 제대로 추가되었는지 확인
        setTimeout(() => {
          console.log('클러스터러 마커 개수:', clusterer.getMarkers().length);
          console.log('지도 레벨:', map.getLevel());
        }, 1000);

        // 지도 레벨을 조정하여 마커가 보이도록 함
        map.setLevel(6);

        // 마커가 안정적으로 표시되도록 추가 확인
        setTimeout(() => {
          console.log('마커 최종 확인 - 클러스터러:', clusterer.getMarkers().length);
        }, 2000);
      } else {
        console.log('표시할 데이터가 없습니다.');
        console.log('postsData:', postsData);
      }

      setMapLoaded(true);
    } catch (err) {
      console.error('지도 초기화 오류:', err);
      setError('지도를 초기화하는데 실패했습니다.');
    }
  };

  if (loading || loadingData) {
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
    <div className="w-full relative">
      {/* 지도 컨테이너 */}
        <div
          ref={mapRef}
          className="w-full"
          style={{ height: 'calc(100vh - 80px)' }} // BottomNavigation 높이만큼 더 많이 제외
        />

      {/* 상단 헤더 */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <h1 className="text-lg font-semibold text-gray-900">내 주변</h1>
          </div>
        </div>
      </div>

      {/* 선택된 게시물 카드 */}
      {selectedPost && (
        <div className="absolute bottom-[20px] left-[25px] right-[25px] z-20">
          <div className="bg-white rounded-[30px] px-[25px] py-[20px] cursor-pointer relative shadow-[0_0_15px_0px_rgba(0,0,0,0.1)]">
            {/* 닫기 버튼 */}
            <button
              onClick={() => {
                // 선택된 마커가 있다면 원래 크기로 복원
                if (selectedMarker) {
                  const originalImage = getMarkerImage(selectedMarker.post?.deadline, false);
                  selectedMarker.marker.setImage(originalImage);
                  setSelectedMarker(null);
                }
                setSelectedPost(null);
              }}
              className="absolute top-[10px] right-[15px] w-6 h-6 flex items-center justify-center text-gray-400"
            >
              ✕
            </button>

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
        </div>
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
