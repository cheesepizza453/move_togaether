'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import IconHeart from "../../public/img/icon/IconHeart";
import { favoritesAPI, handleAPIError } from '@/lib/api-client';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog";
import { cn } from "@/lib/utils";

// 커스텀 AlertDialogContent (오버레이 없이)
const CustomAlertDialogContent = React.forwardRef(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Portal>
    <AlertDialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-[50%] top-[50%] z-[9999] grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-90 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
        className
      )}
      {...props}
    />
  </AlertDialogPrimitive.Portal>
));
CustomAlertDialogContent.displayName = AlertDialogPrimitive.Content.displayName;

const FavoriteCard = ({ post, onFavoriteToggle, isCompleted = false }) => {
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

      await favoritesAPI.remove(id);
      onFavoriteToggle?.(id, false);
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

  // 상태에 따른 버튼 텍스트와 스타일 결정
  const getButtonInfo = () => {
    if (isCompleted) {
      if (status !== 'active') {
        return {
          text: '입양 완료',
          className: 'w-full bg-gray-400 text-white py-3 px-4 rounded-[20px] font-medium text-sm cursor-not-allowed',
          disabled: true
        };
      } else {
        return {
          text: '아직 못 갔어요 🥺',
          className: 'w-full bg-[#FFE066] text-gray-900 py-3 px-4 rounded-[20px] font-medium text-sm hover:bg-[#FFD700] transition-colors',
          disabled: false
        };
      }
    } else {
      return {
        text: '문의하기',
        className: 'w-full bg-[#FFE066] text-gray-900 py-3 px-4 rounded-[20px] font-medium text-sm hover:bg-[#FFD700] transition-colors',
        disabled: false
      };
    }
  };

  const buttonInfo = getButtonInfo();

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

            {/* D-day 배지 - 모집중일 때만 표시 */}
            {!isCompleted && (
              <div className={`absolute -top-3 -right-2 px-2 py-1 rounded-full text-xs font-bold text-white ${getDdayColor(dday)}`}>
                {getDdayText(dday)}
              </div>
            )}
          </div>
        </div>

        {/* 하단 버튼 영역 */}
        <div className="mt-4">
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (!buttonInfo.disabled) {
                // 문의하기 기능 (추후 구현)
              }
            }}
            className={buttonInfo.className}
            disabled={buttonInfo.disabled}
          >
            {buttonInfo.text}
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
        {/* 커스텀 오버레이 */}
        {showLoginDialog && (
          <div
            className="fixed inset-0 z-[9998] bg-black/60"
            onClick={() => setShowLoginDialog(false)}
          />
        )}
        <CustomAlertDialogContent className="z-[9999] bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle>로그인이 필요합니다</AlertDialogTitle>
            <AlertDialogDescription>
              찜 기능을 사용하려면 로그인해주세요.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-row gap-3">
            <AlertDialogCancel className="mt-0 flex-1">취소</AlertDialogCancel>
            <AlertDialogAction onClick={() => window.location.href = '/login'} className="flex-1">
              로그인하기
            </AlertDialogAction>
          </AlertDialogFooter>
        </CustomAlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default FavoriteCard;
