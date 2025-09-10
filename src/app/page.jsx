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

export default function Home() {
  const [sortOption, setSortOption] = useState('latest');
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [favoritePostIds, setFavoritePostIds] = useState(new Set());
  const [favoritesLoading, setFavoritesLoading] = useState(false);

  // 무한 스크롤 관련 상태
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

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

  // 찜 목록 가져오기
  const fetchFavorites = async () => {
    try {
      setFavoritesLoading(true);

      const session = await supabase.auth.getSession();
      if (!session.data.session) return;

      const response = await fetch('/api/favorites', {
        headers: {
          'Authorization': `Bearer ${session.data.session.access_token}`,
          'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        }
      });

      if (response.ok) {
        const { favoritePostIds } = await response.json();
        setFavoritePostIds(new Set(favoritePostIds));
      }
    } catch (error) {
      console.error('찜 목록 조회 오류:', error);
    } finally {
      setFavoritesLoading(false);
    }
  };

  // 강아지 크기 변환 함수
  const convertDogSize = (size) => {
    const sizeMap = {
      'small': '소형견',
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
  const fetchPosts = useCallback(async (sortBy = 'latest', pageNum = 1, isLoadMore = false) => {
    try {
      if (isLoadMore) {
        setIsLoadingMore(true);
      } else {
        setLoading(true);
        setPage(1);
        setHasMore(true);
      }

      // API 호출 (로그인 불필요)
      const response = await fetch(`/api/posts?sortBy=${sortBy}&page=${pageNum}&limit=10`);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('API 오류:', errorData);
        setError('게시물을 불러오는 중 오류가 발생했습니다.');
        return;
      }

      const { posts, pagination } = await response.json();
      console.log(`페이지 ${pageNum} API에서 가져온 데이터:`, { posts, pagination });

      // 데이터 포맷팅 (Supabase 컬럼명을 PostCard가 기대하는 필드명으로 매핑)
      const formattedPosts = posts.map(post => ({
        id: post.id,
        title: post.title,
        dogName: post.name || post.dog_name, // 강아지 이름
        dogSize: convertDogSize(post.size || post.dog_size), // 강아지 크기 변환
        dogBreed: post.breed || post.dog_breed, // 강아지 견종
        departureAddress: post.departure_address,
        arrivalAddress: post.arrival_address,
        deadline: formatDeadline(post.deadline),
        images: post.images || [],
        status: post.status,
        dday: post.deadline ? moment(post.deadline).diff(moment(), 'days') : 0
      }));

      console.log(`페이지 ${pageNum} 포맷팅된 데이터:`, formattedPosts);

      // 페이지네이션 정보 업데이트
      setHasMore(pagination.hasMore);

      if (isLoadMore) {
        // 추가 로드인 경우 기존 데이터에 추가
        setPosts(prevPosts => [...prevPosts, ...formattedPosts]);
        setPage(prevPage => prevPage + 1);
      } else {
        // 새로 로드인 경우 기존 데이터 교체
        setPosts(formattedPosts);
        setPage(2); // 다음 페이지는 2부터 시작
      }

    } catch (err) {
      console.error('게시물 조회 중 예외 발생:', err);
      setError('게시물을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
      setIsLoadingMore(false);
    }
  }, []);

  // 무한 스크롤을 위한 Intersection Observer 설정
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (target.isIntersecting && hasMore && !isLoadingMore && !loading) {
          console.log('스크롤 하단 도달, 다음 페이지 로드');
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
  }, [hasMore, isLoadingMore, loading, sortOption, page, fetchPosts]);

  // 초기 데이터 로드
  useEffect(() => {
    fetchPosts(sortOption);
    fetchFavorites();
  }, [sortOption, fetchPosts]);

  // 찜 상태 토글 핸들러
  const handleFavoriteToggle = (postId, isFavorited) => {
    setFavoritePostIds(prev => {
      const newSet = new Set(prev);
      if (isFavorited) {
        newSet.add(postId);
      } else {
        newSet.delete(postId);
      }
      return newSet;
    });
  };

  const handleSortChange = (sortId) => {
    setSortOption(sortId);
    setPage(1);
    setHasMore(true);
    console.log('정렬 옵션 변경:', sortId);

    // sortOption이 변경되면 useEffect가 실행되어 서버에서 정렬된 데이터를 다시 가져옴
    // 클라이언트 정렬은 제거하고 서버에서 order by로 처리
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
          <SortOptions onSortChange={handleSortChange} />
        </section>

        {/* 게시물 목록 */}
        <section className="pb-6">
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="text-gray-500">게시물을 불러오는 중...</div>
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

    </div>
  );
}
