'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import moment from 'moment';
import { Button } from '@/components/ui/button';
import PostTimeline from '@/components/PostTimeline';
import ProfileImage from '@/components/common/ProfileImage';
import {IconChannelInstagram, IconChannelKakaoTalk, IconChannelNaverCafe} from "@/components/icon/IconChannel";
import IconLoading from "../../../../public/img/icon/IconLoading";

export default function AuthorDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const authorId = params.id;

  const [author, setAuthor] = useState(null);
  const [activePosts, setActivePosts] = useState([]);
  const [completedPosts, setCompletedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('active');

  // 무한 스크롤 관련 상태 - active
  const [activePage, setActivePage] = useState(1);
  const [activeHasMore, setActiveHasMore] = useState(true);
  const [activeIsLoadingMore, setActiveIsLoadingMore] = useState(false);
  const [activeIsFetching, setActiveIsFetching] = useState(false);
  const activeIsFetchingRef = useRef(false);

  // 무한 스크롤 관련 상태 - completed
  const [completedPage, setCompletedPage] = useState(1);
  const [completedHasMore, setCompletedHasMore] = useState(true);
  const [completedIsLoadingMore, setCompletedIsLoadingMore] = useState(false);
  const [completedIsFetching, setCompletedIsFetching] = useState(false);
  const completedIsFetchingRef = useRef(false);

  // 작성자 정보만 가져오기 (게시물은 별도로 관리)
  useEffect(() => {
    if (authorId) {
      fetchAuthorData();
    }
  }, [authorId]);

  // 초기 작성자 정보 로드 후 첫 번째 탭 데이터만 로드 (한 번만 실행)
  useEffect(() => {
    // 작성자 정보가 로드되고, 초기 탭 데이터가 없을 때만 한 번 로드
    if (author && !loading) {
      if (activeTab === 'active' && activePosts.length === 0 && !activeIsFetching) {
        fetchActivePosts(1, false);
      } else if (activeTab === 'completed' && completedPosts.length === 0 && !completedIsFetching) {
        fetchCompletedPosts(1, false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [author]); // author가 로드될 때만 실행 (탭 변경 시에는 실행 안 됨)

  const fetchAuthorData = async () => {
    try {
      setLoading(true);

      // 작성자 정보만 가져오기 (status 파라미터 없이 호출)
      const response = await fetch(`/api/authors/${authorId}`);

      if (!response.ok) {
        if (response.status === 404) {
          setError('존재하지 않는 작성자입니다.');
        } else {
          setError('작성자 정보를 불러올 수 없습니다.');
        }
        return;
      }

      const data = await response.json();
      setAuthor(data.author);
      // 작성자 정보 로드 후에는 useEffect에서 초기 탭 데이터를 로드함
    } catch (err) {
      console.error('작성자 정보 조회 중 오류:', err);
      setError('작성자 정보를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 강아지 크기 변환 함수
  const convertDogSize = useCallback((size) => {
    if (!size) return '';
    const sizeMap = {
      'small': '소형견',
      'smallMedium': '중소형견',
      'medium': '중형견',
      'large': '대형견'
    };
    return sizeMap[size] || size;
  }, []);

  // Active 게시물 가져오기
  const fetchActivePosts = useCallback(async (pageNum = 1, isLoadMore = false) => {
    // 중복 호출 방지
    if (activeIsFetchingRef.current) {
      console.log('이미 데이터를 가져오는 중입니다. 중복 호출 방지');
      return;
    }

    try {
      activeIsFetchingRef.current = true;
      setActiveIsFetching(true);

      if (isLoadMore) {
        setActiveIsLoadingMore(true);
      } else {
        setActivePosts([]);
        setActivePage(1);
        setActiveHasMore(true);
      }

      const response = await fetch(`/api/authors/${authorId}?status=active&page=${pageNum}&limit=10&_t=${Date.now()}`);

      if (!response.ok) {
        throw new Error('게시물을 불러올 수 없습니다.');
      }

      const data = await response.json();
      const { posts, pagination } = data;

      if (!Array.isArray(posts)) {
        console.warn('API에서 받은 posts가 배열이 아닙니다:', posts);
        if (isLoadMore) {
          setActiveHasMore(false);
        } else {
          setActivePosts([]);
        }
        return;
      }

      // 데이터 포맷팅 (Supabase 컬럼명 dog_name, dog_size를 PostCard가 기대하는 필드명으로 매핑)
      const formattedPosts = posts.map(post => ({
        id: post.id,
        title: post.title,
        dogName: post.dog_name || '', // dog_name → dogName
        dogSize: convertDogSize(post.dog_size || ''), // dog_size → dogSize (변환 적용)
        dogBreed: post.dog_breed || '', // dog_breed → dogBreed
        departureAddress: post.departure_address || '',
        arrivalAddress: post.arrival_address || '',
        deadline: post.deadline ? moment(post.deadline).format('YY/MM/DD') : '',
        images: post.images || [],
        status: post.status,
        dday: post.dday || (post.deadline ? moment(post.deadline).diff(moment(), 'days') : 0),
        is_favorite: post.is_favorite || false,
        created_at: post.created_at
      }));

      // hasMore는 가져온 게시글 수가 limit보다 적으면 false
      const hasMoreData = formattedPosts.length === 10;
      setActiveHasMore(hasMoreData);

      if (isLoadMore) {
        setActivePosts(prevPosts => [...prevPosts, ...formattedPosts]);
        setActivePage(prevPage => prevPage + 1);
      } else {
        setActivePosts(formattedPosts);
        setActivePage(2);
      }
    } catch (err) {
      console.error('Active 게시물 조회 중 오류:', err);
      setError('게시물을 불러오는 중 오류가 발생했습니다.');
      if (!isLoadMore) {
        setActivePosts([]);
      }
      setActiveHasMore(false);
    } finally {
      setActiveIsFetching(false);
      setActiveIsLoadingMore(false);
      activeIsFetchingRef.current = false;
    }
  }, [authorId, convertDogSize]);

  // Completed 게시물 가져오기
  const fetchCompletedPosts = useCallback(async (pageNum = 1, isLoadMore = false) => {
    // 중복 호출 방지
    if (completedIsFetchingRef.current) {
      console.log('이미 데이터를 가져오는 중입니다. 중복 호출 방지');
      return;
    }

    try {
      completedIsFetchingRef.current = true;
      setCompletedIsFetching(true);

      if (isLoadMore) {
        setCompletedIsLoadingMore(true);
      } else {
        setCompletedPosts([]);
        setCompletedPage(1);
        setCompletedHasMore(true);
      }

      const response = await fetch(`/api/authors/${authorId}?status=completed&page=${pageNum}&limit=10&_t=${Date.now()}`);

      if (!response.ok) {
        throw new Error('게시물을 불러올 수 없습니다.');
      }

      const data = await response.json();
      const { posts, pagination } = data;

      if (!Array.isArray(posts)) {
        console.warn('API에서 받은 posts가 배열이 아닙니다:', posts);
        if (isLoadMore) {
          setCompletedHasMore(false);
        } else {
          setCompletedPosts([]);
        }
        return;
      }

      // 데이터 포맷팅 (Supabase 컬럼명 dog_name, dog_size를 PostCard가 기대하는 필드명으로 매핑)
      const formattedPosts = posts.map(post => ({
        id: post.id,
        title: post.title,
        dogName: post.dog_name || '', // dog_name → dogName
        dogSize: convertDogSize(post.dog_size || ''), // dog_size → dogSize (변환 적용)
        dogBreed: post.dog_breed || '', // dog_breed → dogBreed
        departureAddress: post.departure_address || '',
        arrivalAddress: post.arrival_address || '',
        deadline: post.deadline ? moment(post.deadline).format('YY/MM/DD') : '',
        images: post.images || [],
        status: post.status,
        dday: post.dday || (post.deadline ? moment(post.deadline).diff(moment(), 'days') : 0),
        is_favorite: post.is_favorite || false,
        created_at: post.created_at
      }));

      // hasMore는 가져온 게시글 수가 limit보다 적으면 false
      const hasMoreData = formattedPosts.length === 10;
      setCompletedHasMore(hasMoreData);

      if (isLoadMore) {
        setCompletedPosts(prevPosts => [...prevPosts, ...formattedPosts]);
        setCompletedPage(prevPage => prevPage + 1);
      } else {
        setCompletedPosts(formattedPosts);
        setCompletedPage(2);
      }
    } catch (err) {
      console.error('Completed 게시물 조회 중 오류:', err);
      setError('게시물을 불러오는 중 오류가 발생했습니다.');
      if (!isLoadMore) {
        setCompletedPosts([]);
      }
      setCompletedHasMore(false);
    } finally {
      setCompletedIsFetching(false);
      setCompletedIsLoadingMore(false);
      completedIsFetchingRef.current = false;
    }
  }, [authorId, convertDogSize]);

  const handleCall = (phone) => {
    window.location.href = `tel:${phone}`;
  };

  const handleSMS = (phone) => {
    window.location.href = `sms:${phone}`;
  };

  const handlePostClick = (postId) => {
    router.push(`/posts/${postId}`);
  };

  // 탭 변경 핸들러 - 기존 데이터는 유지하고, 없을 때만 로드
  const handleTabChange = (tab) => {
    // 탭만 변경하고 데이터는 유지 (기존 리스트 상태 보존)
    setActiveTab(tab);

    // 해당 탭에 데이터가 없을 때만 새로 로드
    if (tab === 'active') {
      if (activePosts.length === 0 && !activeIsFetching) {
        fetchActivePosts(1, false);
      }
    } else if (tab === 'completed') {
      if (completedPosts.length === 0 && !completedIsFetching) {
        fetchCompletedPosts(1, false);
      }
    }
    // 이미 데이터가 있으면 그대로 유지 (아무것도 하지 않음)
  };

  // 무한 스크롤을 위한 Intersection Observer 설정 - active
  useEffect(() => {
    if (activeTab !== 'active') return;

    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (
          target.isIntersecting &&
          activeHasMore &&
          !activeIsLoadingMore &&
          !activeIsFetching &&
          activePage > 1
        ) {
          console.log('스크롤 하단 도달, 다음 페이지 로드 (active)', {
            activeHasMore,
            activeIsLoadingMore,
            activeIsFetching,
            activePage
          });
          fetchActivePosts(activePage, true);
        }
      },
      {
        threshold: 0.1,
        rootMargin: '100px'
      }
    );

    const loadMoreTrigger = document.getElementById('active-load-more-trigger');
    if (loadMoreTrigger) {
      observer.observe(loadMoreTrigger);
    }

    return () => {
      if (loadMoreTrigger) {
        observer.unobserve(loadMoreTrigger);
      }
    };
  }, [activeHasMore, activeIsLoadingMore, activeIsFetching, activeTab, activePage, fetchActivePosts]);

  // 무한 스크롤을 위한 Intersection Observer 설정 - completed
  useEffect(() => {
    if (activeTab !== 'completed') return;

    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (
          target.isIntersecting &&
          completedHasMore &&
          !completedIsLoadingMore &&
          !completedIsFetching &&
          completedPage > 1
        ) {
          console.log('스크롤 하단 도달, 다음 페이지 로드 (completed)', {
            completedHasMore,
            completedIsLoadingMore,
            completedIsFetching,
            completedPage
          });
          fetchCompletedPosts(completedPage, true);
        }
      },
      {
        threshold: 0.1,
        rootMargin: '100px'
      }
    );

    const loadMoreTrigger = document.getElementById('completed-load-more-trigger');
    if (loadMoreTrigger) {
      observer.observe(loadMoreTrigger);
    }

    return () => {
      if (loadMoreTrigger) {
        observer.unobserve(loadMoreTrigger);
      }
    };
  }, [completedHasMore, completedIsLoadingMore, completedIsFetching, activeTab, completedPage, fetchCompletedPosts]);

  if (loading) {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className={'w-full flex justify-center'}>
            <IconLoading/>
          </div>
        </div>
  )

  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => window.history.back()}>
            뒤로 가기
          </Button>
        </div>
      </div>
    );
  }

  if (!author) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">작성자를 찾을 수 없습니다.</p>
          <Button onClick={() => window.history.back()}>
            뒤로 가기
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFDB6F]">
      {/* 헤더 - 노란색 배경 */}
      <div className="w-full">
        <div className="h-[78px] px-[30px] flex items-center">
          <button
            onClick={() => window.history.back()}
            className={'p-[12px] pl-0 outline-none focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:outline-none'}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="9" height="16" viewBox="0 0 9 16" fill="none">
              <path d="M8 15L1 8" stroke="black" strokeWidth="2" strokeMiterlimit="10"
                    strokeLinecap="round"/>
              <path d="M8 0.999999L1 8" stroke="black" strokeWidth="2" strokeMiterlimit="10"
                    strokeLinecap="round"/>
            </svg>
          </button>
          <h1 className="text-22-m text-black ml-4">
            보호자 정보
          </h1>
        </div>

        {/* 작성자 정보 */}
        <div className="flex items-center gap-[18px] px-[30px] mb-[40px]">
          <ProfileImage
            profileImage={author?.profile_image}
            size={70}
            alt="프로필 이미지"
          />
          <div>
            <p className="text-18-b text-black mb-1">{author?.display_name || '익명'}</p>
            {/* 소개글 */}
            {author.bio && (
            <p className="text-12-r text-text-800 leading-relaxed whitespace-normal">
              {author.bio}
            </p>
            )}
          </div>
        </div>

        {/* 소셜 미디어 링크 */}
        {(author.instagram || author.naver_cafe || author.kakao_openchat) && (
            <div className="flex gap-x-[6px] px-[30px] mb-[23px]">
              {author.instagram && (
                  <button
                      onClick={() => window.open(`https://www.instagram.com/${author.instagram}`, '_blank')}
                      className="flex flex-1 items-center justify-center min-w-[90px] py-[5px] rounded-[7px] bg-brand-bg border border-brand-yellow-dark text-12-m text-[#C3950B]"
                  >
                    <span className={'ml-[-4px] mr-[3px] inline-block w-[17px] h-[17px]'}><IconChannelInstagram/></span>
                    인스타그램
                  </button>
              )}
              {author.naver_cafe && (
                  <button
                      onClick={() => window.open(author.naver_cafe, '_blank')}
                      className="flex flex-1 items-center justify-center min-w-[90px] py-[5px] rounded-[7px] bg-brand-bg border border-brand-yellow-dark text-12-m text-[#C3950B]"
                  >
                    <span className={'ml-[-4px] mr-[3px] inline-block w-[17px] h-[17px]'}><IconChannelNaverCafe/></span>
                    네이버 카페
                  </button>
              )}
              {author.kakao_openchat && (
                  <button
                      onClick={() => window.open(author.kakao_openchat, '_blank')}
                      className="flex flex-1 items-center justify-center min-w-[90px] py-[5px] rounded-[7px] bg-brand-bg border border-brand-yellow-dark text-12-m text-[#C3950B]"
                  >
                    <span className={'ml-[-4px] mr-[3px] inline-block w-[17px] h-[17px]'}><IconChannelKakaoTalk/></span>
                    카카오톡 채널
                  </button>
              )}
            </div>
        )}
      </div>

      {/* 메인 콘텐츠 - 흰색 카드 */}
      <main className="w-full bg-white rounded-t-[30px] px-[30px] pt-6 pb-6 min-h-[calc(100vh-120px)]">
        {/* 섹션 제목 */}
        <h2 className="text-18-b text-black mb-4">
          도움을 기다리는 친구들 <span className="text-[#F36C5E]">
            {activeTab === 'active' ? activePosts.length : completedPosts.length}
          </span>
        </h2>

        {/* 탭 메뉴 */}
        <div className="flex border-gray-200 mb-4">
          <button
            onClick={() => handleTabChange('active')}
            className={`py-3 text-center text-base relative mr-[10px] ${
              activeTab === 'active'
                ? 'font-black text-brand-icon'
                : 'font-medium text-[#8b8b8b]'
            }`}
          >
            모집중
          </button>
          <button
            onClick={() => handleTabChange('completed')}
            className={`py-3 text-center text-base relative ${
              activeTab === 'completed'
                ? 'font-black text-brand-icon'
                : 'font-medium text-[#8b8b8b]'
            }`}
          >
            모집종료
          </button>
        </div>

        {/* 콘텐츠 */}
        {activeTab === 'active' ? (
          <>
            {activeIsFetching && activePosts.length === 0 ? (
              <div className="flex justify-center items-center py-8">
                <div className="w-full flex justify-center pt-[60px]">
                  <IconLoading/>
                </div>
              </div>
            ) : (
              <>
                <PostTimeline
                  posts={activePosts}
                  onPostClick={handlePostClick}
                  emptyMessage={{
                    title: '현재 모집 중인 게시물이 없습니다',
                    description: '작성자가 새로운 게시물을 올리면 여기에 표시됩니다'
                  }}
                />
                {/* 무한 스크롤 트리거 및 로딩 인디케이터 */}
                <div id="active-load-more-trigger" className="py-4">
                  {activeIsLoadingMore ? (
                      <div className="flex justify-center items-center py-4">
                        <div className="mt-8 flex justify-center space-x-2">
                          <div className="w-2 h-2 bg-brand-main rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-brand-main rounded-full animate-bounce"
                               style={{animationDelay: '0.1s'}}></div>
                          <div className="w-2 h-2 bg-brand-main rounded-full animate-bounce"
                               style={{animationDelay: '0.2s'}}></div>
                        </div>
                      </div>
                  ) : (
                      <div className="h-4"></div>
                  )}
                </div>
              </>
            )}
          </>
        ) : (
            <>
              {completedIsFetching && completedPosts.length === 0 ? (
                  <div className="flex justify-center items-center py-8">
                    <div className="w-full flex justify-center pt-[60px]">
                      <IconLoading/>
                    </div>
                  </div>
              ) : (
                  <>
                    <PostTimeline
                        posts={completedPosts}
                        onPostClick={handlePostClick}
                        emptyMessage={{
                    title: '모집이 종료된 게시물이 없습니다',
                    description: '완료된 봉사활동이 여기에 표시됩니다'
                  }}
                />
                {/* 무한 스크롤 트리거 및 로딩 인디케이터 */}
                <div id="completed-load-more-trigger" className="py-4">
                  {completedIsLoadingMore ? (
                      <div className="flex justify-center items-center py-4">
                        <div className="mt-8 flex justify-center space-x-2">
                          <div className="w-2 h-2 bg-brand-main rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-brand-main rounded-full animate-bounce"
                               style={{animationDelay: '0.1s'}}></div>
                          <div className="w-2 h-2 bg-brand-main rounded-full animate-bounce"
                               style={{animationDelay: '0.2s'}}></div>
                        </div>
                      </div>
                  ) : (
                      <div className="h-4"></div>
                  )}
                </div>
                  </>
              )}
            </>
        )}
      </main>
    </div>
  );
}
