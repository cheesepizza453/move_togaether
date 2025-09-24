'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import IconHeart from "../../public/img/icon/IconHeart";
import { favoritesAPI, handleAPIError } from '@/lib/api-client';
import { useDialogContext } from '@/components/DialogProvider';

const PostCard = ({ post, isFavorite = false, onFavoriteToggle }) => {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { showConfirm, showSuccess, showError } = useDialogContext();

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
    dday,
    distance
  } = post;


  const toggleFavorite = async (e) => {
    e.stopPropagation();

    if (loading) return;

    // AuthContext에서 사용자 정보 확인
    if (!user) {
      showConfirm(
        '로그인이 필요한 서비스입니다.\n로그인하시겠습니까?',
        '로그인 필요',
        {
          confirmText: '로그인',
          cancelText: '취소',
          onConfirm: () => {
            window.location.href = '/login';
          }
        }
      );
      return;
    }

    if (isFavorite) {
      // 즐겨찾기 제거 확인
      showConfirm(
        '즐겨찾기에서 제거하시겠습니까?',
        '즐겨찾기 제거',
        {
          confirmText: '제거',
          cancelText: '취소',
          onConfirm: async () => {
            await performFavoriteToggle();
          }
        }
      );
    } else {
      // 즐겨찾기 추가
      await performFavoriteToggle();
    }
  };

  const performFavoriteToggle = async () => {
    try {
      setLoading(true);

      if (isFavorite) {
        // 즐겨찾기 제거
        await favoritesAPI.remove(id);
        onFavoriteToggle?.(id, false);
        showSuccess('즐겨찾기에서 제거되었습니다.');
      } else {
        // 즐겨찾기 추가
        await favoritesAPI.add(id);
        onFavoriteToggle?.(id, true);
        showSuccess('즐겨찾기에 추가되었습니다.');
      }
    } catch (error) {
      console.error('즐겨찾기 처리 오류:', error);
      showError('처리 중 오류가 발생했습니다.\n다시 시도해주세요.');
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

          {/* 거리 정보 (가까운순 정렬 시에만 표시) */}
          {distance !== undefined && (
            <div className="flex justify-between items-center text-text-800">
              <div className="text-10-r text-text-600">
                출발지: {departureAddress}
              </div>
              <div className="text-10-r text-brand-point font-medium">
                {distance}km
              </div>
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default PostCard;
