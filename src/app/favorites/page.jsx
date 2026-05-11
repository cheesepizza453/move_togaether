'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import moment from 'moment';
import FavoriteCard from '@/components/FavoriteCard';
import { Button } from '@/components/ui/button';
import { favoritesAPI, handleAPIError, myPageAPI } from '@/lib/api-client'; // ✅ myPageAPI 추가
import { useAuth } from '@/hooks/useAuth';
import { convertDogSize, formatDeadline } from '@/lib/utils';
import { useLoginDialog } from '@/components/LoginDialog';
import Loading from "@/components/ui/loading";
import Image from "next/image";

export default function FavoritesPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [allFavorites, setAllFavorites] = useState([]);
  const [activeFavorites, setActiveFavorites] = useState([]);
  const [completedFavorites, setCompletedFavorites] = useState([]);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('active');

  // 내가 지원한 게시글의 post.id만 모아놓는 Set
  const [appliedPostIds, setAppliedPostIds] = useState(new Set());
  const [myPostIds, setMyPostIds] = useState(new Set());

  // 즐겨찾기 목록 조회
  const fetchFavorites = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // 1) 찜한 목록 가져오기
      const response = await favoritesAPI.getList();
      const posts = response.posts || [];

      if (!posts || posts.length === 0) {
        setAllFavorites([]);
        setActiveFavorites([]);
        setCompletedFavorites([]);
      } else {
        const formattedPosts = posts.map((item) => {
          const post = item.post;
          const dday = post.deadline
              ? moment(post.deadline).startOf('day').diff(moment().startOf('day'), 'days')
              : 0;

          return {
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
            dday,
            created_at: post.created_at,
          };
        });

        setAllFavorites(formattedPosts);

        const active = formattedPosts.filter(
            (post) => post.status === 'active' && post.dday >= 0
        );

        const completed = formattedPosts.filter(
            (post) => post.status !== 'active' || post.dday < 0
        );

        setActiveFavorites(active);
        setCompletedFavorites(completed);
      }

      // 2) 내가 지원한 게시글 목록
      const appliedRes = await myPageAPI.getAppliedPosts();
      const appliedPosts = appliedRes.posts || [];

      const appliedIds = appliedPosts
          .map((app) => app.post?.id)
          .filter((id) => id !== undefined && id !== null);

      setAppliedPostIds(new Set(appliedIds));

      // 3) 내가 작성한 게시글 목록
      const myPostsRes = await myPageAPI.getMyPosts(); // type=my&status=all
      const myPosts = myPostsRes.posts || [];

      const myIds = myPosts
          .map((p) => p.id)
          .filter((id) => id !== undefined && id !== null);

      setMyPostIds(new Set(myIds));

    } catch (error) {
      console.error('즐겨찾기 조회 오류:', error);
      const errorInfo = handleAPIError(error);
      setError(errorInfo.message || '즐겨찾기 목록을 불러오는데 실패했습니다.');
      setAllFavorites([]);
      setActiveFavorites([]);
      setCompletedFavorites([]);
      setAppliedPostIds(new Set());
      setMyPostIds(new Set());
    } finally {
      setLoading(false);
    }
  }, []);


  // 즐겨찾기 상태 토글 핸들러
  const handleFavoriteToggle = useCallback((postId, isFavorited) => {
    if (!isFavorited) {
      // 즐겨찾기에서 제거된 경우 모든 목록에서도 제거
      setAllFavorites((prev) => prev.filter((post) => post.id !== postId));
      setActiveFavorites((prev) => prev.filter((post) => post.id !== postId));
      setCompletedFavorites((prev) => prev.filter((post) => post.id !== postId));
    }
  }, []);

  // 탭 변경 핸들러
  const handleTabChange = useCallback((tab) => {
    setActiveTab(tab);
  }, []);

  // 현재 탭에 따른 표시할 데이터
  const getCurrentFavorites = useCallback(() => {
    return activeTab === 'active' ? activeFavorites : completedFavorites;
  }, [activeTab, activeFavorites, completedFavorites]);

  // 페이지 로드 시 인증 상태 확인 및 데이터 로드
  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      setLoading(false);
      router.replace('/');
      return;
    }

    fetchFavorites();
  }, [authLoading, user, router, fetchFavorites]);

  // 로딩 중일 때
  if (authLoading || (loading && !error)) {
    return <Loading />;
  }

  console.log('현재 탭 데이터:', getCurrentFavorites());
  console.log('지원한 postIds:', appliedPostIds);

  return (
      <div className="min-h-screen bg-[#FFDB6F]">
        {/* 헤더 */}
        <div className="w-full px-[30px] pt-[15px]">
          <h1 className="text-22-m text-black pt-[30px] pb-[40px]">
            내 무브 리스트 <span className="text-[#F36C5E]">{activeFavorites.length}</span>
          </h1>
        </div>

        {/* 메인 콘텐츠 */}
        <main className="w-full bg-[#F9F9F5] rounded-t-[30px] px-[30px] pt-6 pb-6 min-h-[89vh]">
          {/* 탭 메뉴 */}
          <div className="flex border-gray-200 mb-4">
            <button
                onClick={() => handleTabChange('active')}
                className={`py-3 text-center text-base relative mr-[10px] ${
                    activeTab === 'active'
                        ? 'font-black text-brand-icon'
                        : 'font-medium text-[#8b8b8b]'
                }`}
                aria-selected={activeTab === 'active'}
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
                aria-selected={activeTab === 'completed'}
            >
              모집종료
            </button>
          </div>

          {/* 콘텐츠 */}
          {error ? (
              <div className="flex flex-col items-center justify-center py-8">
                <div className="text-red-500 mb-4 text-center">{error}</div>
                <Button onClick={fetchFavorites} variant="outline">
                  다시 시도
                </Button>
              </div>
          ) : getCurrentFavorites().length === 0 ? (
              <div className="flex flex-col items-center justify-center pt-[60px]">
                {activeTab === 'active' && (
                    <figure className="flex justify-center mb-[10px]">
                      <Image src={'/img/empty_icon.png'} alt={''} width={120} height={120} />
                    </figure>
                )}

                <div className="text-black text-center mb-4">
                  <p className="text-18-b font-medium">
                    {activeTab === 'active'
                        ? '관심 있는 봉사를 내 무브 리스트에 담아보세요.'
                        : '모집이 종료된 무브 리스트가 없어요.'}
                  </p>
                </div>
                {activeTab === 'active' && (
                    <Button onClick={() => router.push('/')} variant="outline">
                      메인으로 이동
                    </Button>
                )}
              </div>
          ) : (
              <div className="space-y-[20px]">
                {getCurrentFavorites().map((post) => (
                    <FavoriteCard
                        key={post.id}
                        post={post}
                        onFavoriteToggle={handleFavoriteToggle}
                        isCompleted={activeTab === 'completed'}
                        isApplied={appliedPostIds.has(post.id)}
                        isMyPost={myPostIds.has(post.id)}
                    />
                ))}
              </div>
          )}
        </main>
      </div>
  );
}
