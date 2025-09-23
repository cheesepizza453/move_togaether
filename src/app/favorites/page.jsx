'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import moment from 'moment';
import Header from '@/components/common/Header';
import BottomNavigation from '@/components/common/BottomNavigation';
import FavoriteCard from '@/components/FavoriteCard';
import { Button } from '@/components/ui/button';
import { favoritesAPI, handleAPIError } from '@/lib/api-client';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function FavoritesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [allFavorites, setAllFavorites] = useState([]);
  const [activeFavorites, setActiveFavorites] = useState([]);
  const [completedFavorites, setCompletedFavorites] = useState([]);
  const [error, setError] = useState(null);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState('active');

  // 강아지 크기 변환 함수
  const convertDogSize = (size) => {
    const sizeMap = {
      'small': '소형견',
      'medium': '중형견',
      'large': '대형견'
    };
    return sizeMap[size] || size;
  };

  // 날짜 형식 변환 함수
  const formatDeadline = (deadline) => {
    if (!deadline) return '';
    return moment(deadline).format('YY/MM/DD');
  };

  // 로그인 상태 확인 (AuthContext 사용)
  const checkAuthStatus = async () => {
    try {
      if (user) {
        setIsLoggedIn(true);
        return true;
      } else {
        setIsLoggedIn(false);
        return false;
      }
    } catch (error) {
      console.error('인증 상태 확인 오류:', error);
      setIsLoggedIn(false);
      return false;
    }
  };

  // 즐겨찾기 목록 조회
  const fetchFavorites = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!user) {
        setShowLoginDialog(true);
        return;
      }

      // 즐겨찾기한 게시물의 상세 정보 조회
      const response = await favoritesAPI.getList();
      console.log('찜한 목록 API 응답:', response);
      const posts = response.posts || [];

      if (!posts || posts.length === 0) {
        setAllFavorites([]);
        setActiveFavorites([]);
        setCompletedFavorites([]);
        return;
      }

      // 데이터 포맷팅 (favorites 타입은 {favorite_id, favorited_at, post} 구조)
      const formattedPosts = posts.map(item => {
        const post = item.post;
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
          dday: post.deadline ? moment(post.deadline).diff(moment(), 'days') : 0
        };
      });

      setAllFavorites(formattedPosts);

      // 모집중: deadline이 지나지 않았고 status가 active인 항목
      const active = formattedPosts.filter(post =>
        post.status === 'active' &&
        post.dday >= 0
      );

      // 모집종료: deadline이 지났거나 status가 active가 아닌 항목
      const completed = formattedPosts.filter(post =>
        post.status !== 'active' ||
        post.dday < 0
      );

      setActiveFavorites(active);
      setCompletedFavorites(completed);

    } catch (error) {
      console.error('즐겨찾기 조회 오류:', error);
      const errorInfo = handleAPIError(error);
      setError(errorInfo.message);
    } finally {
      setLoading(false);
    }
  };

  // 즐겨찾기 상태 토글 핸들러
  const handleFavoriteToggle = (postId, isFavorited) => {
    if (!isFavorited) {
      // 즐겨찾기에서 제거된 경우 모든 목록에서도 제거
      setAllFavorites(prev => prev.filter(post => post.id !== postId));
      setActiveFavorites(prev => prev.filter(post => post.id !== postId));
      setCompletedFavorites(prev => prev.filter(post => post.id !== postId));
    }
  };

  // 탭 변경 핸들러
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  // 현재 탭에 따른 표시할 데이터
  const getCurrentFavorites = () => {
    return activeTab === 'active' ? activeFavorites : completedFavorites;
  };

  // 로그인 페이지로 이동
  const handleLogin = () => {
    router.push('/login');
  };

  // 페이지 로드 시 인증 상태 확인 및 데이터 로드
  useEffect(() => {
    const initializePage = async () => {
      const isAuthenticated = await checkAuthStatus();
      if (isAuthenticated) {
        await fetchFavorites();
      } else {
        setLoading(false);
        setShowLoginDialog(true);
      }
    };

    initializePage();
  }, []);

  return (
    <div className="min-h-screen bg-[#FFDB6F]">
      {/* 헤더 - 노란색 배경 */}
      <div className="w-full px-[30px] pt-[15px]">
        <h1 className="text-22-m text-black pt-[30px] pb-[40px]">
          도움을 기다리는 친구들{' '}
          <span className="text-[#F36C5E]">{loading ? '...' : activeFavorites.length}</span>
        </h1>
      </div>

      {/* 메인 콘텐츠 - 흰색 카드 */}
      <main className="w-full bg-[#F9F9F5] rounded-t-[30px] px-[30px] pt-6 pb-6 min-h-[calc(100vh-120px)]">

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
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="text-gray-500">즐겨찾기를 불러오는 중...</div>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="text-red-500 mb-4">{error}</div>
            <Button onClick={fetchFavorites} variant="outline">
              다시 시도
            </Button>
          </div>
        ) : getCurrentFavorites().length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="text-gray-500 text-center mb-4">
              <p className="text-lg font-medium">
                {activeTab === 'active'
                  ? '모집중인 즐겨찾기가 없습니다'
                  : '모집종료된 즐겨찾기가 없습니다'
                }
              </p>
              <p className="text-sm mt-2">
                {activeTab === 'active'
                  ? '관심 있는 봉사활동을 찜해보세요'
                  : '완료된 봉사활동이 여기에 표시됩니다'
                }
              </p>
            </div>
            {activeTab === 'active' && (
              <Button onClick={() => router.push('/')} variant="outline">
                메인으로 이동
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-0">
            {getCurrentFavorites().map((post) => (
              <FavoriteCard
                key={post.id}
                post={post}
                onFavoriteToggle={handleFavoriteToggle}
                isCompleted={activeTab === 'completed'}
              />
            ))}
          </div>
        )}
      </main>

      {/* 로그인 필요 다이얼로그 */}
      <AlertDialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>로그인이 필요합니다</AlertDialogTitle>
            <AlertDialogDescription>
              즐겨찾기 기능을 사용하려면 로그인해주세요.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction onClick={handleLogin}>
              로그인하기
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
