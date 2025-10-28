'use client';

import { useState } from 'react';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import IconHeart from "../../public/img/icon/IconHeart";
import { favoritesAPI, handleAPIError } from '@/lib/api-client';
import { useDialogContext } from '@/components/DialogProvider';
import { convertDogSize } from '@/lib/utils';
import moment from 'moment';
import { toast } from 'sonner';

const PostCard = ({ post, isFavorite = false, onFavoriteToggle, showTimeline = false }) => {
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
    distance,
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

    // 즐겨찾기 토글 (확인 다이얼로그 없이 바로 실행)
    await performFavoriteToggle();
  };

  const performFavoriteToggle = async () => {
    try {
      setLoading(true);

      // 인증 상태 재확인
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        return;
      }

      // 부모 컴포넌트의 handleFavoriteToggle 호출 (API 호출은 부모에서 처리)
      // isFavorite이 true면 false로, false면 true로 변경
      await onFavoriteToggle?.(id, !isFavorite);
    } catch (error) {
      console.error('즐겨찾기 처리 오류:', error);
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

  if (showTimeline) {
    const getButtonInfo = (post) => {
      if (post.status !== 'active') {
        // ToDo 버튼 구분 필요
        return {
          text: '모집 완료',
          className: 'w-full text-text-800 bg-text-300 py-[8px] rounded-[20px] text-14-m cursor-not-allowed',
          disabled: true
        };
      } else {
        return {
          text: '문의하기',
          className: 'w-full bg-brand-main text-[#333] py-[8px] rounded-[20px] text-14-m',
          disabled: false
        };
      }
    };

    const createdDate = moment(post.created_at).format('YYYY/MM/DD');
    const buttonInfo = getButtonInfo(post);
    const getDdayText = (dday) => {
      if (dday < 0) return `D+${Math.abs(dday)}`;
      if (dday === 0) return 'D-Day';
      return `D-${dday}`;
    };

    return (
      <div className="relative flex items-start gap-6 mb-6 pl-6">
        {/* 타임라인 점 */}
        <div
          className="absolute left-0 top-0 w-3 h-3 bg-[#FFD700] rounded-full"
          style={{
            transform: 'translateX(-50%)',
            boxShadow: '0 0 0 4px rgba(255, 215, 0, 0.3), 0 0 0 8px rgba(255, 215, 0, 0.1)'
          }}
        ></div>

        {/* 날짜 표시 - 노란원과 같은 높이 */}
        <div className="absolute top-0 left-6 text-sm font-medium" style={{ transform: 'translateY(-50%)' }}>
          {createdDate}
        </div>

        {/* 카드 - 날짜 아래에 위치 */}
        <div className="bg-text-100 rounded-[30px] p-[26px] pb-[22px] mt-[16px] border border-gray-100 flex-1"
             onClick={handleCardClick}>
          <div className="flex items-start gap-4">
            <div className="flex-1 min-w-0">
              {/* D-day 표시 */}
              <div className="mb-2">
                <div className={`inline-block px-[9px] py-[2px] rounded-[7px] text-14-b ${getDdayColor(post.dday)}`}>
                  {getDdayText(post.dday)}
                </div>
              </div>
              <h3 className="ml-[5px] text-12-m text-gray-900 mb-[4px] line-clamp-2 leading-[1.35]">
                {post.title}
              </h3>
              <p className="ml-[5px] text-10-r text-text-800">
                {post.dog_name} / {convertDogSize(post.dog_size)}
              </p>
            </div>

            <div className="flex-shrink-0">
              <div className="ml-[5px] w-[70px] h-[70px] rounded-[20px] overflow-hidden bg-gray-100">
                {post.images && post.images.length > 0 ? (
                  <Image
                    src={post.images[0]}
                    alt={post.dog_name || '강아지 사진'}
                    width={70}
                    height={70}
                    className="w-full h-full object-cover"
                    priority={false}
                    placeholder="blur"
                    blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                    이미지 없음
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-[13px]">
            <button
              onClick={() => onPostClick(post.id)}
              className={buttonInfo.className}
              disabled={buttonInfo.disabled}
            >
              {buttonInfo.text}
            </button>
          </div>
        </div>
      </div>
    );
  }

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
              <Image
                className={'w-full h-full object-cover'}
                src={images && images.length > 0 ? images[0] : "/img/dummy_thumbnail.jpg"}
                alt={dogName || '강아지 사진'}
                width={80}
                height={80}
                priority={false}
                placeholder="blur"
                blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
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
