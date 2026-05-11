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
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [postType, setPostType] = useState('volunteer'); // 이동봉사 | 실종신고
  const [sortBy, setSortBy] = useState('latest'); // latest | deadline

  // 무한 스크롤 관련 상태
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const isFetchingRef = useRef(false);

  // 작성자 정보만 가져오기 (게시물은 별도로 관리)
  useEffect(() => {
    if (authorId) {
      fetchAuthorData();
    }
  }, [authorId]);

  // 작성자 정보 로드 후 게시물 초기 로드
  useEffect(() => {
    if (author && !loading) {
      fetchPosts(1, false, postType, sortBy);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [author]);

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

  // 게시물 가져오기
  const fetchPosts = useCallback(async (pageNum = 1, isLoadMore = false, type = postType, sort = sortBy) => {
    if (isFetchingRef.current) return;

    try {
      isFetchingRef.current = true;
      setIsFetching(true);

      if (isLoadMore) {
        setIsLoadingMore(true);
      } else {
        setPosts([]);
        setPage(1);
        setHasMore(true);
      }

      const response = await fetch(
        `/api/authors/${authorId}?status=active&postType=${type}&sortBy=${sort}&page=${pageNum}&limit=10&_t=${Date.now()}`
      );

      if (!response.ok) throw new Error('게시물을 불러올 수 없습니다.');

      const data = await response.json();
      const fetchedPosts = data.posts;

      if (!Array.isArray(fetchedPosts)) {
        if (!isLoadMore) setPosts([]);
        setHasMore(false);
        return;
      }

      const formattedPosts = fetchedPosts.map(post => ({
        id: post.id,
        title: post.title,
        postType: post.post_type || 'volunteer',
        dogName: post.dog_name || '',
        dogSize: convertDogSize(post.dog_size || ''),
        dogBreed: post.dog_breed || '',
        departureAddress: post.departure_address || '',
        arrivalAddress: post.arrival_address || '',
        deadline: post.deadline ? moment(post.deadline).format('YY/MM/DD') : '',
        images: post.images || [],
        status: post.status,
        dday: post.dday || (post.deadline ? moment(post.deadline).diff(moment(), 'days') : 0),
        is_favorite: post.is_favorite || false,
        created_at: post.created_at
      }));

      const hasMoreData = formattedPosts.length === 10;
      setHasMore(hasMoreData);

      if (isLoadMore) {
        setPosts(prev => [...prev, ...formattedPosts]);
        setPage(prev => prev + 1);
      } else {
        setPosts(formattedPosts);
        setPage(2);
      }
    } catch (err) {
      console.error('게시물 조회 중 오류:', err);
      if (!isLoadMore) setPosts([]);
      setHasMore(false);
    } finally {
      setIsFetching(false);
      setIsLoadingMore(false);
      isFetchingRef.current = false;
    }
  }, [authorId, convertDogSize, postType, sortBy]);

  const handleCall = (phone) => {
    window.location.href = `tel:${phone}`;
  };

  const handleSMS = (phone) => {
    window.location.href = `sms:${phone}`;
  };

  const handlePostClick = (postId) => {
    router.push(`/posts/${postId}`);
  };

  // 탭(포스트 타입) 변경 핸들러
  const handleTypeChange = (type) => {
    setPostType(type);
    fetchPosts(1, false, type, sortBy);
  };

  // 정렬 변경 핸들러
  const handleSortChange = () => {
    const next = sortBy === 'latest' ? 'deadline' : 'latest';
    setSortBy(next);
    fetchPosts(1, false, postType, next);
  };

  // 무한 스크롤 Intersection Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (target.isIntersecting && hasMore && !isLoadingMore && !isFetching && page > 1) {
          fetchPosts(page, true);
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    );

    const trigger = document.getElementById('load-more-trigger');
    if (trigger) observer.observe(trigger);
    return () => { if (trigger) observer.unobserve(trigger); };
  }, [hasMore, isLoadingMore, isFetching, page, fetchPosts]);

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
        {/* 탭 + 정렬 */}
        <div className="flex items-center justify-between ml-[7px] mb-[30px]">
          {/* 타입 탭 */}
          <div className="flex space-x-[18px]">
            {[{ id: 'volunteer', label: '이동봉사' }, { id: 'missing', label: '실종신고' }].map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTypeChange(tab.id)}
                className={`text-16-m transition-colors relative pb-[4px] ${
                  postType === tab.id ? 'text-black' : 'text-text-800'
                }`}
              >
                {tab.label}
                {postType === tab.id && (
                  <span className="absolute block bottom-[-3px] left-0 w-full h-[3px] bg-brand-point rounded-full" />
                )}
              </button>
            ))}
          </div>

          {/* 정렬 버튼 */}
          <button
            onClick={handleSortChange}
            className="flex items-center gap-[4px] text-14-r text-text-800 mr-[7px]"
          >
            {sortBy === 'latest' ? '최신순' : '마감순'}
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8 9l4-4 4 4"/>
              <path d="M16 15l-4 4-4-4"/>
            </svg>
          </button>
        </div>

        {/* 콘텐츠 */}
        {isFetching && posts.length === 0 ? (
          <div className="w-full flex justify-center pt-[60px]">
            <IconLoading/>
          </div>
        ) : (
          <>
            <PostTimeline
              posts={posts}
              onPostClick={handlePostClick}
              emptyMessage={{
                title: postType === 'volunteer' ? '이동봉사 게시물이 없습니다' : '실종신고 게시물이 없습니다',
                description: '작성자가 새로운 게시물을 올리면 여기에 표시됩니다'
              }}
            />
            <div id="load-more-trigger" className="py-4">
              {isLoadingMore ? (
                <div className="mt-8 flex justify-center space-x-2">
                  <div className="w-2 h-2 bg-brand-main rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-brand-main rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-2 h-2 bg-brand-main rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>
              ) : (
                <div className="h-4"></div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
