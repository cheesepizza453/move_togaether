'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import IconHeart from "../../public/img/icon/IconHeart";

const PostCard = ({ post }) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);

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

  // 즐겨찾기 상태 확인
  useEffect(() => {
    checkFavoriteStatus();
  }, [id]);

  const checkFavoriteStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const response = await fetch(`/api/favorites/check?post_id=${id}`, {
        headers: {
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        }
      });

      if (response.ok) {
        const { isFavorited } = await response.json();
        setIsFavorite(isFavorited);
      }
    } catch (error) {
      console.error('즐겨찾기 상태 확인 오류:', error);
    }
  };

  const toggleFavorite = async (e) => {
    e.stopPropagation();

    if (loading) return;

    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        alert('로그인이 필요합니다.');
        return;
      }

      console.log('PostCard - Toggle favorite:', {
        postId: id,
        postIdType: typeof id,
        isFavorite: isFavorite,
        loading: loading
      });

      const token = (await supabase.auth.getSession()).data.session?.access_token;
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      if (isFavorite) {
        // 즐겨찾기 제거
        const response = await fetch(`/api/favorites?post_id=${id}`, {
          method: 'DELETE',
          headers
        });

        if (response.ok) {
          setIsFavorite(false);
        } else {
          const error = await response.json();
          console.error('즐겨찾기 제거 에러:', error);
          throw new Error(error.error || '즐겨찾기 제거 실패');
        }
      } else {
        // 즐겨찾기 추가
        const response = await fetch('/api/favorites', {
          method: 'POST',
          headers,
          body: JSON.stringify({ post_id: id })
        });

        if (response.ok) {
          const result = await response.json();
          console.log('PostCard - 즐겨찾기 추가 성공:', result);
          setIsFavorite(true);
        } else {
          const error = await response.json();
          console.error('PostCard - 즐겨찾기 추가 에러:', {
            status: response.status,
            statusText: response.statusText,
            error: error,
            requestBody: { post_id: id }
          });
          throw new Error(error.error || '즐겨찾기 추가 실패');
        }
      }
    } catch (error) {
      console.error('즐겨찾기 처리 오류:', error);
      alert('즐겨찾기 처리 중 오류가 발생했습니다.');
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
              className="p-0 rounded-full disabled:opacity-50"
            >
              <figure className={'w-[16px] h-[14px]'}>
                <IconHeart fill={isFavorite ? '#F36C5E' : '#D2D2D2'}/>
              </figure>
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
    </div>
  );
};

export default PostCard;
