'use client';

import { useState } from 'react';
import { Heart } from 'lucide-react';

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
    if (dday <= 7) return 'bg-red-500';
    if (dday <= 30) return 'bg-yellow-500';
    return 'bg-blue-500';
  };

  return (
    <div
      className="bg-white rounded-lg border border-gray-200 p-4 cursor-pointer hover:shadow-md transition-shadow duration-200"
      onClick={handleCardClick}
    >
      <div className="flex space-x-4">
        {/* 왼쪽 이미지 영역 */}
        <div className="flex-shrink-0 relative">
          {/* D-day 배지 */}
          <div className="absolute -top-2 -left-2 z-10">
            <span className={`px-2 py-1 rounded-full text-white text-xs font-bold ${getDdayColor(dday)}`}>
              D-{dday}
            </span>
          </div>

          {/* 강아지 이미지 */}
          <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
            <div className="text-2xl">🐕</div>
          </div>
        </div>

        {/* 오른쪽 텍스트 영역 */}
        <div className="flex-1 min-w-0">
          {/* 제목 */}
          <h3 className="text-list-1 text-gray-800 mb-2 leading-tight line-clamp-2">
            {title}
          </h3>

          {/* 강아지 정보 */}
          <div className="text-name-breed text-gray-600 mb-1">
            {dogName} / {dogSize}
          </div>

          {/* 날짜 */}
          <div className="text-post-date text-gray-500">
            {deadline}
          </div>
        </div>

        {/* 찜하기 버튼 */}
        <div className="flex-shrink-0">
          <button
            onClick={toggleFavorite}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <Heart
              className={`w-5 h-5 ${
                isFavorite ? 'fill-yellow-500 text-yellow-500' : 'text-gray-400'
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PostCard;
