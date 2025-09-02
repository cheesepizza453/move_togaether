'use client';

import { useState } from 'react';
import { Heart } from 'lucide-react';
import IconHeart from "../../public/img/icon/IconHeart";

const PostCard = ({ post }) => {
  const [isFavorite, setIsFavorite] = useState(post.isFavorite || false);

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

  const toggleFavorite = (e) => {
    e.stopPropagation();
    setIsFavorite(!isFavorite);
  };

  const handleCardClick = () => {
    // 게시물 상세 페이지로 이동
    window.location.href = `/posts/${id}`;
  };

  // D-day 배지 색상 결정
  const getDdayColor = (dday) => {
    if (dday <= 7) return 'bg-brand-point text-white';
    if (dday <= 30) return 'bg-[#efbc40] text-white';
    return 'bg-blue-500';
  };

  return (
    <div
      className="bg-white rounded-[15px] px-[18px] py-[16px] mb-6 cursor-pointer relative shadow-[0_0_15px_0px_rgba(0,0,0,0.1)]"
      onClick={handleCardClick}
    >
      {/* 상단 영역: D-day 배지와 찜 버튼 */}
      <div className="flex justify-end items-start mb-1">
        {/* D-day 배지 - border 위에 겹쳐서 표시 */}
        <div className="absolute -top-3 left-[-5px] z-10">
          <span className={`flex items-center justify-center px-[13px] h-[24px] rounded-[7px] text-white text-xs font-bold ${getDdayColor(dday)}`}>
            D-{dday}
          </span>
        </div>
      </div>

      <div className="flex space-x-[30px]">
        {/* 왼쪽 이미지 영역 */}
        <div className="flex-shrink-0 relative">
          {/* 강아지 이미지 */}
          <figure className="relative w-[80px] h-[80px] overflow-hidden bg-gray-200 rounded-[15px] shadow-[0_0_15px_0px_rgba(0,0,0,0.1)]">
              <img className={'absolute top-1/2 left-1/2 max-w-full max-h-full -translate-x-1/2 -translate-y-1/2 object-contain'} src={"/img/dummy_thumbnail.jpg"} alt={'Dummy'} />
          </figure>
        </div>

        {/* 오른쪽 텍스트 영역 */}
        <div className="min-w-0 h-[70px] mt-[10px] flex flex-col justify-between w-full">
          {/* 찜하기 버튼 */}
          <div className="absolute top-[10px] right-[10px]">
            <button
              onClick={toggleFavorite}
              className="p-0 rounded-full"
            >
              <figure className={'w-[16px] h-[14px]'}>
                <IconHeart fill={isFavorite ? 'brand-main' : '#D2D2D2'}/>
              </figure>
            </button>
          </div>

          {/* 제목 */}
          <h3 className="text-list-1 mb-2 leading-tight line-clamp-2 text-14-m">
            {title}
          </h3>

          {/* 강아지 정보와 날짜 */}
          <div className="flex justify-between items-end text-text-800 mb-1">
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
