'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import moment from 'moment';
import Header from '../components/common/Header';
import MainBanner from '../components/MainBanner';
import SortOptions from '../components/SortOptions';
import PostCard from '../components/PostCard';
import Footer from '../components/common/Footer';
import BottomNavigation from '../components/common/BottomNavigation';
import LocationSearchDialog from '../components/LocationSearchDialog';
import { postsAPI, favoritesAPI, handleAPIError } from '@/lib/api-client';
import { useAuth } from '@/hooks/useAuth';
import { useDialogContext } from '@/components/DialogProvider';
import { toast } from 'sonner';
import IconLoading from "../../public/img/icon/IconLoading";

export default function Home() {
  const { user } = useAuth();
  const { showConfirm, showError } = useDialogContext();

  const [sortOption, setSortOption] = useState('latest');
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [favoritePostIds, setFavoritePostIds] = useState(new Set());

  // 위치 기반 정렬 관련 상태
  const [showLocationDialog, setShowLocationDialog] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);

  // 무한 스크롤 관련 상태
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isFetching, setIsFetching] = useState(false); // 중복 호출 방지용

  // 목업 데이터 (실제로는 API에서 가져올 데이터)
  /* const mockPosts = [
    {
      id: 11,
      title: "서울에서 대구까지 입양 예정 강아지 호치의 이동을 도와 주실 보호자 구합니다.",
      dogName: "호치",
      dogSize: "소형견",
      dogBreed: "믹스",
      departureAddress: "서울",
      arrivalAddress: "대구",
      deadline: "25/01/01",
      images: ["/images/dog1.jpg"],
      status: "active",
      dday: 3
    },
    {
      id: 21,
      title: "강아지 이동 봉사 구합니다.",
      dogName: "호치",
      dogSize: "소형견",
      dogBreed: "믹스",
      departureAddress: "서울",
      arrivalAddress: "대구",
      deadline: "25/01/01",
      images: ["/images/dog2.jpg"],
      status: "active",
      dday: 19,
      isFavorite: true
    },
    {
      id: 31,
      title: "시흥에서 남양주 또롱이의 안전한 이동을 도와주실 분을 간절히 기다리고 있습니다.",
      dogName: "호치",
      dogSize: "소형견",
      dogBreed: "믹스",
      departureAddress: "시흥",
      arrivalAddress: "남양주",
      deadline: "25/01/01",
      images: ["/images/dog3.jpg"],
      status: "active",
      dday: 80
    }
  ]; */
  const mockPosts = [];

  // 찜 상태 업데이트 (게시물 목록에서 가져온 찜 상태 사용)
  const updateFavoriteStates = useCallback((postsData) => {
    const favoriteSet = new Set();
    postsData.forEach(post => {
      if (post.is_favorite) {
        favoriteSet.add(post.id);
      }
    });
    setFavoritePostIds(favoriteSet);
  }, []);

  // 강아지 크기 변환 함수
  const convertDogSize = (size) => {
    const sizeMap = {
      'small': '소형견',
      'smallMedium': '중소형견',
      'medium': '중형견',
      'large': '대형견'
    };
    return sizeMap[size] || size;
  };

  // 날짜 형식 변환 함수 (목데이터와 동일한 형식으로)
  const formatDeadline = (deadline) => {
    if (!deadline) return '';
    return moment(deadline).format('YY/MM/DD');
  };

  // Supabase에서 게시물 데이터 가져오기 (페이징 적용)
  const fetchPosts = async (sortBy = 'latest', pageNum = 1, isLoadMore = false) => {
    // 중복 호출 방지
    if (isFetching) {
      console.log('이미 데이터를 가져오는 중입니다. 중복 호출 방지');
      return;
    }

    try {
      setIsFetching(true);

      if (isLoadMore) {
        setIsLoadingMore(true);
      } else {
        setLoading(true);
        setError(null); // 에러 상태 초기화
        setPage(1);
        setHasMore(true);
        setPosts([]); // 새로 로드할 때 기존 데이터 초기화
      }

      // API 호출 (로그인 불필요)
      const { posts, pagination } = await postsAPI.getList({
        type: 'all',
        sortBy,
        page: pageNum,
        limit: 10,
        status: 'active'
      });

      console.log(`페이지 ${pageNum} API에서 가져온 데이터:`, { posts, pagination });

      // posts가 배열이 아닌 경우 처리
      if (!Array.isArray(posts)) {
        console.warn('API에서 받은 posts가 배열이 아닙니다:', posts);
        if (isLoadMore) {
          setHasMore(false);
        } else {
          setPosts([]);
        }
        return;
      }

      // 데이터 포맷팅 (Supabase 컬럼명을 PostCard가 기대하는 필드명으로 매핑)
      const formattedPosts = posts.map(post => ({
        id: post.id,
        title: post.title,
        dogName: post.name || post.dog_name, // 강아지 이름
        dogSize: convertDogSize(post.size || post.dog_size), // 강아지 크기 변환
        dogBreed: post.breed || post.dog_breed, // 강아지 견종
        is_favorite: post.is_favorite || false, // 찜 상태
        departureAddress: post.departure_address,
        arrivalAddress: post.arrival_address,
        deadline: formatDeadline(post.deadline),
        images: post.images || [],
        status: post.status,
        dday: post.deadline ? moment(post.deadline).diff(moment(), 'days') : 0
      }));

      console.log(`페이지 ${pageNum} 포맷팅된 데이터:`, formattedPosts);

      // 페이지네이션 정보 업데이트
      const hasMoreData = pagination?.hasMore ?? (formattedPosts.length === 10); // 10개 미만이면 더 이상 없음

      console.log(`페이지 ${pageNum} 페이지네이션 정보:`, {
        hasMore: hasMoreData,
        postsCount: formattedPosts.length,
        pagination,
        isLoadMore
      });

      if (!hasMoreData) {
        console.log('더 이상 로드할 데이터가 없습니다:', {
          paginationHasMore: pagination?.hasMore,
          postsLength: formattedPosts.length,
          limit: 10
        });
      }

      setHasMore(hasMoreData);

      if (isLoadMore) {
        // 추가 로드인 경우 기존 데이터에 추가
        setPosts(prevPosts => {
          const newPosts = [...prevPosts, ...formattedPosts];
          // 찜 상태 업데이트
          updateFavoriteStates(newPosts);
          return newPosts;
        });
        setPage(prevPage => prevPage + 1);
      } else {
        // 새로 로드인 경우 기존 데이터 교체
        setPosts(formattedPosts);
        setPage(2); // 다음 페이지는 2부터 시작
        // 찜 상태 업데이트
        updateFavoriteStates(formattedPosts);
      }

    } catch (err) {
      console.error('게시물 조회 중 예외 발생:', err);
      const errorInfo = handleAPIError(err);

      setError(errorInfo.message);

      // 에러 발생 시 데이터 초기화 (새로 로드인 경우만)
      if (!isLoadMore) {
        setPosts([]);
      }
      setHasMore(false); // 에러 발생 시 더 이상 로드하지 않음
    } finally {
      // 로딩 상태 해제 (마운트 상태 체크 제거)
      console.log('fetchPosts finally 블록 실행:', {
        isLoadMore,
        pageNum
      });

      console.log('로딩 상태 해제 중...');
      setLoading(false);
      setIsLoadingMore(false);
      setIsFetching(false); // 중복 호출 방지 플래그 해제
      console.log('로딩 상태 해제 완료');
    }
  };

  // 무한 스크롤을 위한 Intersection Observer 설정
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (target.isIntersecting && hasMore && !isLoadingMore && !loading && !isFetching && page > 1) {
          console.log('스크롤 하단 도달, 다음 페이지 로드', {
            hasMore,
            isLoadingMore,
            loading,
            isFetching,
            page
          });
          fetchPosts(sortOption, page, true);
        }
      },
      {
        threshold: 0.1,
        rootMargin: '100px'
      }
    );

    // 하단 로딩 인디케이터 요소를 관찰
    const loadMoreTrigger = document.getElementById('load-more-trigger');
    if (loadMoreTrigger) {
      observer.observe(loadMoreTrigger);
    }

    return () => {
      if (loadMoreTrigger) {
        observer.unobserve(loadMoreTrigger);
      }
    };
  }, [hasMore, isLoadingMore, loading, isFetching, sortOption, page]);

  // 초기 데이터 로드
  useEffect(() => {
    fetchPosts(sortOption);
  }, []); // 컴포넌트 마운트 시에만 실행

  // 찜 상태 토글 핸들러 (API 호출 + 로컬 상태 업데이트)
  const handleFavoriteToggle = useCallback(async (postId, isFavorited) => {
    try {
      // 현재 상태 확인
      const currentIsFavorite = favoritePostIds.has(postId);

      // 상태가 이미 일치하는 경우 API 호출하지 않음
      if (currentIsFavorite === isFavorited) {
        console.log('찜 상태가 이미 일치합니다. API 호출을 건너뜁니다.');
        return;
      }

      // API 호출
      if (isFavorited) {
        await favoritesAPI.add(postId);
      } else {
        await favoritesAPI.remove(postId);
      }

      // 로컬 상태 업데이트
      setFavoritePostIds(prev => {
        const newSet = new Set(prev);
        if (isFavorited) {
          newSet.add(postId);
        } else {
          newSet.delete(postId);
        }
        return newSet;
      });
    } catch (error) {
      console.error('찜 상태 변경 오류:', error);
      const errorInfo = handleAPIError(error);
      console.error('Error details:', errorInfo);

      // 409 오류인 경우 로컬 상태만 업데이트
      if (errorInfo.status === 409) {
        console.log('이미 찜한 상태입니다. 로컬 상태를 업데이트합니다.');
        setFavoritePostIds(prev => {
          const newSet = new Set(prev);
          if (isFavorited) {
            newSet.add(postId);
          } else {
            newSet.delete(postId);
          }
          return newSet;
        });
      } else if (errorInfo.status === 404) {
        // 404 오류인 경우 (이미 제거된 찜) - 로컬 상태만 업데이트
        console.log('이미 제거된 찜입니다. 로컬 상태를 업데이트합니다.');
        setFavoritePostIds(prev => {
          const newSet = new Set(prev);
          if (isFavorited) {
            newSet.add(postId);
          } else {
            newSet.delete(postId);
          }
          return newSet;
        });
      } else if (errorInfo.type === 'auth') {
        // 로그인 필요 시에는 여전히 에러 메시지 표시
        toast.error('로그인이 필요합니다.');
      } else {
        // 기타 에러 시에는 여전히 에러 메시지 표시
        toast.error('찜 상태 변경에 실패했습니다.');
      }
    }
  }, [showError, favoritePostIds]);

  // 위치 기반 정렬을 위한 함수
  const fetchPostsByDistance = async (latitude, longitude, pageNum = 1, isLoadMore = false) => {
    if (isFetching) {
      console.log('이미 데이터를 가져오는 중입니다. 중복 호출 방지');
      return;
    }

    try {
      setIsFetching(true);

      if (isLoadMore) {
        setIsLoadingMore(true);
      } else {
        setLoading(true);
        setError(null);
        setPage(1);
        setHasMore(true);
        setPosts([]);
      }

      // 인증 토큰 가져오기
      const { data: { session } } = await supabase.auth.getSession();

      const headers = {
        'Content-Type': 'application/json',
      };

      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
        headers['apikey'] = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      }

      const response = await fetch('/api/posts/sort-by-distance', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          latitude,
          longitude,
          page: pageNum,
          limit: 10
        })
      });

      if (!response.ok) {
        throw new Error('거리 기반 정렬에 실패했습니다.');
      }

      const { posts: distancePosts, pagination } = await response.json();

      // 데이터 포맷팅
      const formattedPosts = distancePosts.map(post => ({
        id: post.id,
        title: post.title,
        dogName: post.dog_name,
        dogSize: convertDogSize(post.dog_size),
        dogBreed: post.dog_breed,
        departureAddress: post.departure_address,
        arrivalAddress: post.arrival_address,
        deadline: formatDeadline(post.deadline),
        images: post.images || [],
        status: post.status,
        dday: post.deadline ? moment(post.deadline).diff(moment(), 'days') : 0,
        distance: post.distance_km,
        is_favorite: post.is_favorite || false // 찜 상태
      }));

      const hasMoreData = pagination?.hasMore ?? (formattedPosts.length === 10);
      setHasMore(hasMoreData);

      if (isLoadMore) {
        setPosts(prevPosts => {
          const newPosts = [...prevPosts, ...formattedPosts];
          // 찜 상태 업데이트
          updateFavoriteStates(newPosts);
          return newPosts;
        });
        setPage(prevPage => prevPage + 1);
      } else {
        setPosts(formattedPosts);
        setPage(2);
        // 찜 상태 업데이트
        updateFavoriteStates(formattedPosts);
      }

    } catch (err) {
      console.error('거리 기반 정렬 중 오류:', err);

      setError('거리 기반 정렬에 실패했습니다.');
      if (!isLoadMore) {
        setPosts([]);
      }
      setHasMore(false);
    } finally {
      setLoading(false);
      setIsLoadingMore(false);
      setIsFetching(false);
    }
  };

  const handleSortChange = (sortId) => {
    console.log('정렬 옵션 변경:', sortId);

    // 가까운순 선택 시 로그인 체크
    if (sortId === 'distance') {
      if (!user) {
        showConfirm({
          title: '로그인 후 이용하실 수 있습니다.',
          description: '가까운순 정렬을 사용하려면 로그인이 필요합니다.',
          onConfirm: () => {
            window.location.href = '/login';
          }
        });
        // 로그인 다이얼로그 표시 시 정렬 옵션을 이전 상태로 되돌림
        return;
      }

      // 가까운순 선택 시 정렬 옵션을 먼저 업데이트
      setSortOption(sortId);
      setPage(1);
      setHasMore(true);
      setPosts([]);
      setError(null);

      // 위치 다이얼로그 표시
      setShowLocationDialog(true);
      return;
    }

    // 다른 정렬 옵션은 기존 로직 사용
    setSortOption(sortId);
    setPage(1);
    setHasMore(true);
    setPosts([]);
    setError(null);
    fetchPosts(sortId, 1, false);
  };

  const handleLocationConfirm = (locationData) => {
    setCurrentLocation(locationData.address);
    setShowLocationDialog(false); // 위치 다이얼로그 닫기

    // 좌표 정보를 직접 사용하여 거리 기반 정렬 시작
    const { latitude, longitude } = locationData.coordinates;
    fetchPostsByDistance(latitude, longitude, 1, false);
  };


  const allPosts = [...mockPosts, ...posts];
  return (
    <div className="min-h-screen bg-[#FBFBF7]">
      <Header />
      {/* 메인 콘텐츠 */}
      <main className="w-full bg-brand-bg px-[23px] pt-[15px]">
        {/* 메인 배너 */}
        <section className="mb-[27px]">
          <MainBanner />
        </section>

        {/* 정렬 옵션 */}
        <section className="mb-6">
          <SortOptions onSortChange={handleSortChange} activeSort={sortOption} />
        </section>

        {/* 게시물 목록 */}
        <section className="pb-6">
          {loading ? (
              <div className="flex justify-center items-center py-8">
                <div className={'w-full flex justify-center pt-[60px]'}>
                  <IconLoading/>
                </div>
              </div>
          ) : error ? (
              <div className="flex justify-center items-center py-8">
                <div className="text-red-500">{error}</div>
            </div>
          ) : posts.length === 0 ? (
            <div className="flex justify-center items-center py-8">
              <div className="text-gray-500">등록된 게시물이 없습니다.</div>
            </div>
          ) : (
            <>
              <div className="space-y-[18px]">
                {allPosts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    isFavorite={favoritePostIds.has(post.id)}
                    onFavoriteToggle={handleFavoriteToggle}
                  />
                ))}
              </div>

              {/* 무한 스크롤 트리거 및 로딩 인디케이터 */}
              <div id="load-more-trigger" className="py-4">
                {isLoadingMore ? (
                  <div className="flex justify-center items-center py-4">
                    <div className="text-gray-500">더 많은 게시물을 불러오는 중...</div>
                  </div>
                ) : (
                  <div className="h-4"></div> // 트리거용 빈 공간
                )}
              </div>
            </>
          )}
        </section>
      </main>

      {/* 위치 검색 다이얼로그 */}
      <LocationSearchDialog
        isOpen={showLocationDialog}
        onClose={() => setShowLocationDialog(false)}
        onLocationConfirm={handleLocationConfirm}
      />
    </div>
  );
}
