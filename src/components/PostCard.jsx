'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import IconHeart from "../../public/img/icon/IconHeart";
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const PostCard = ({ post, isFavorite = false, onFavoriteToggle }) => {
  const [loading, setLoading] = useState(false);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const { user } = useAuth();

  const {
    id,
    title,
    dogName,
    dogSize,
    dogBreed,
    departureAddress,
    arrivalAddress,
    deadline,
    images = [],
    status = 'active',
    dday
  } = post;


  const toggleFavorite = async (e) => {
    e.stopPropagation();

    if (loading) return;

    // AuthContext에서 사용자 정보 확인
    if (!user) {
      setShowLoginDialog(true);
      return;
    }

    try {
      setLoading(true);

      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;
      const headers = {
        'Authorization': `Bearer ${token}`,
        'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        'Content-Type': 'application/json'
      };

      if (isFavorite) {
        // 즐겨찾기 제거
        await favoritesAPI.remove(id);
        onFavoriteToggle?.(id, false);
      } else {
        // 즐겨찾기 추가
        await favoritesAPI.add(id);
        onFavoriteToggle?.(id, true);
      }
    } catch (error) {
      console.error('즐겨찾기 처리 오류:', error);
      // 에러는 콘솔에만 기록하고 사용자에게는 조용히 처리
    } finally {
      setLoading(false);
    }
  };

  const handleCardClick = () => {
    // 게시물 상세 페이지로 이동
    window.location.href = `/posts/${id}`;
  };

  // D-day 배지 색상 결정
  const getDdayColor = (dday) => {
    if (dday <= 7) return 'bg-brand-point text-white';
    if (dday <= 14) return 'bg-brand-main text-white';
    return 'bg-[#FFE889] text-brand-yellow-dark';
  };

  return (
    <div
      className="bg-white rounded-[15px] px-[18px] py-[16px] cursor-pointer relative shadow-[0_0_15px_0px_rgba(0,0,0,0.1)]"
      onClick={handleCardClick}
    >
      {/* 상단 영역: D-day 배지와 찜 버튼 */}
      <div className="flex justify-end items-start">
        {/* D-day 배지 - border 위에 겹쳐서 표시 */}
        <div className="absolute -top-3 left-[-5px] z-10">
          <span className={`flex items-center justify-center px-[13px] h-[24px] rounded-[7px] text-12-b font-bold ${getDdayColor(dday)}`}>
            D-{dday}
          </span>
        </div>
      </div>

      <div className="flex space-x-[30px]">
        {/* 왼쪽 이미지 영역 */}
        <div className="flex-shrink-0 relative">
          {/* 강아지 이미지 */}
          <figure className="relative w-[80px] h-[80px] overflow-hidden bg-gray-200 rounded-[15px] shadow-[0_0_15px_0px_rgba(0,0,0,0.1)]">
              <img
                className={'w-full h-full object-cover'}
                src={images && images.length > 0 ? images[0] : "/img/dummy_thumbnail.jpg"}
                alt={dogName || '강아지 사진'}
              />
          </figure>
        </div>

        {/* 오른쪽 텍스트 영역 */}
        <div className="min-w-0 h-[70px] mt-[10px] flex flex-col justify-between w-full">
          {/* 찜하기 버튼 */}
          <div className="absolute top-[10px] right-[10px]">
            <button
              onClick={toggleFavorite}
              disabled={loading}
              className="p-0 rounded-full disabled:opacity-50 flex items-center justify-center"
            >
              {loading ? (
                <div className="w-[16px] h-[14px] flex items-center justify-center">
                  <div className="w-3 h-3 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
                </div>
              ) : (
                <figure className={'w-[16px] h-[14px]'}>
                  <IconHeart fill={isFavorite ? '#F36C5E' : '#D2D2D2'}/>
                </figure>
              )}
            </button>
          </div>

          {/* 제목 */}
          <h3 className="text-list-1 mb-2 leading-tight line-clamp-2 text-14-m">
            {title}
          </h3>

          {/* 강아지 정보와 날짜 */}
          <div className="flex justify-between items-end text-text-800 mb-[6px]">
            <div className="text-name-breed text-12-r">
              {dogName} / {dogSize}
            </div>
            <div className="text-post-date text-text-600 text-9-r font-light">
              {deadline}
            </div>
          </div>
        </div>
      </div>

      {/* 로그인 필요 다이얼로그 */}
      <AlertDialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>로그인이 필요합니다</AlertDialogTitle>
            <AlertDialogDescription>
              찜 기능을 사용하려면 로그인해주세요.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction onClick={() => window.location.href = '/login'}>
              로그인하기
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PostCard;
