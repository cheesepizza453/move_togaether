'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import moment from 'moment';
import Header from '@/components/common/Header';
import BottomNavigation from '@/components/common/BottomNavigation';
import FavoriteCard from '@/components/FavoriteCard';
import { Button } from '@/components/ui/button';
import { favoritesAPI, handleAPIError } from '@/lib/api-client';
import { useAuth } from '@/hooks/useAuth';
import { convertDogSize, formatDeadline } from '@/lib/utils';
import { useLoginDialog } from '@/components/LoginDialog';
import IconLoading from "../../../public/img/icon/IconLoading";

export default function FavoritesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [allFavorites, setAllFavorites] = useState([]);
  const [activeFavorites, setActiveFavorites] = useState([]);
  const [completedFavorites, setCompletedFavorites] = useState([]);
  const [error, setError] = useState(null);
  const { showLoginDialog } = useLoginDialog();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState('active');

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
        showLoginDialog({
          title: '로그인이 필요합니다',
          message: '저장목록을 사용하려면 로그인해주세요.',
          redirectPath: '/favorites',
          onCancel: () => {
            console.log('취소 버튼 클릭 - 메인 페이지로 이동');
            router.push('/');
          }
        });
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
          dday: post.deadline ? moment(post.deadline).diff(moment(), 'days') : 0,
          created_at: post.created_at
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

  // 페이지 로드 시 인증 상태 확인 및 데이터 로드
  useEffect(() => {
    const initializePage = async () => {
      const isAuthenticated = await checkAuthStatus();
      if (isAuthenticated) {
        await fetchFavorites();
      } else {
        setLoading(false);
        showLoginDialog({
          title: '로그인이 필요합니다',
          message: '저장목록을 사용하려면 로그인해주세요.',
          redirectPath: '/favorites',
          onCancel: () => {
            console.log('취소 버튼 클릭 - 메인 페이지로 이동 (initializePage)');
            router.push('/');
          }
        });
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
          <div className="flex justify-center items-center">
            <div className={'w-full flex justify-center pt-[60px]'}>
              <IconLoading/>
            </div>
          </div>
        ) : error ? (
            <div className="flex flex-col items-center justify-center py-8">
            <div className="text-red-500 mb-4">{error}</div>
            <Button onClick={fetchFavorites} variant="outline">
              다시 시도
            </Button>
          </div>
        ) : getCurrentFavorites().length === 0 ? (
          <div className="flex flex-col items-center justify-center pt-[60px]">
            <div className="text-black text-center mb-4">
              <p className="text-18-b font-medium">
                {activeTab === 'active'
                  ? '모집중인 저장 목록이 없어요.'
                  : '모집종료된 저장 목록이 없어요.'
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
          <div className="space-y-[20px]">
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

    </div>
  );
}
