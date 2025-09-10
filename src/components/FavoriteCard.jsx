'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import IconHeart from "../../public/img/icon/IconHeart";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const FavoriteCard = ({ post, onFavoriteToggle }) => {
  const [loading, setLoading] = useState(false);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  const { id, title, dogName, dogSize, dogBreed, departureAddress, arrivalAddress, deadline, images = [], status = 'active', dday } = post;

  const toggleFavorite = async (e) => {
    e.stopPropagation();
    if (loading) return;

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

      const response = await fetch(`/api/favorites?post_id=${id}`, { method: 'DELETE', headers });
      if (response.ok) {
        onFavoriteToggle?.(id, false);
      } else {
        const error = await response.json();
        console.error('즐겨찾기 제거 에러:', error);
        throw new Error(error.error || '즐겨찾기 제거 실패');
      }
    } catch (error) {
      console.error('즐겨찾기 처리 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCardClick = () => {
    router.push(`/posts/${id}`);
  };

  const getDdayColor = (dday) => {
    if (dday <= 3) return 'bg-[#F36C5E]'; // 빨간색
    if (dday <= 7) return 'bg-[#FF8C42]'; // 주황색
    return 'bg-[#FFD700]'; // 노란색
  };

  const getDdayText = (dday) => {
    if (dday < 0) return `D+${Math.abs(dday)}`;
    if (dday === 0) return 'D-Day';
    return `D-${dday}`;
  };

  return (
    <>
      <div
        className="bg-white rounded-[30px] px-8 py-6 mb-6 shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-shadow"
        onClick={handleCardClick}
      >
        <div className="flex items-start gap-4">
          {/* 왼쪽 텍스트 영역 */}
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium text-gray-900 mb-2 line-clamp-2">
              {title}
            </h3>
            <p className="text-xs text-gray-500 mb-3">
              {dogName} / {dogSize}
            </p>
          </div>

          {/* 오른쪽 이미지 영역 */}
          <div className="relative flex-shrink-0">
            <div className="w-20 h-20 rounded-[20px] overflow-hidden bg-gray-100">
              {images && images.length > 0 ? (
                <img
                  src={images[0]}
                  alt={dogName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                  이미지 없음
                </div>
              )}
            </div>

            {/* D-day 배지 */}
            <div className={`absolute -top-3 -right-2 px-2 py-1 rounded-full text-xs font-bold text-white ${getDdayColor(dday)}`}>
              {getDdayText(dday)}
            </div>
          </div>
        </div>

        {/* 하단 버튼 영역 */}
        <div className="mt-4">
          <button
            onClick={(e) => {
              e.stopPropagation();
              // 문의하기 기능 (추후 구현)
            }}
            className="w-full bg-[#FFE066] text-gray-900 py-3 px-4 rounded-[20px] font-medium text-sm hover:bg-[#FFD700] transition-colors"
          >
            문의하기
          </button>
        </div>

        {/* 찜 버튼 */}
        {/* <button
          onClick={toggleFavorite}
          disabled={loading}
          className="absolute top-3 right-3 p-1 rounded-full disabled:opacity-50 flex items-center justify-center"
        >
          {loading ? (
            <div className="w-4 h-4 flex items-center justify-center">
              <div className="w-3 h-3 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
            </div>
          ) : (
            <IconHeart fill="#F36C5E" />
          )}
        </button> */}
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
    </>
  );
};

export default FavoriteCard;
