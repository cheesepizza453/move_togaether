'use client';

import { useState } from 'react';
import { Heart, MapPin, ArrowRight } from 'lucide-react';
import Image from 'next/image';

const PostCard = ({ post }) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

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
    status = 'active'
  } = post;

  // D-day 계산
  const calculateDday = (deadline) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const dday = calculateDday(deadline);
  const isExpired = dday < 0;

  // 이미지 처리
  const displayImages = images.length > 0 ? images : ['/images/default-dog.jpg'];
  const currentImage = displayImages[currentImageIndex];

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % displayImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + displayImages.length) % displayImages.length);
  };

  const goToImage = (index) => {
    setCurrentImageIndex(index);
  };

  const toggleFavorite = (e) => {
    e.stopPropagation();
    setIsFavorite(!isFavorite);
  };

  const handleCardClick = () => {
    // 게시물 상세 페이지로 이동
    window.location.href = `/posts/${id}`;
  };

  return (
    <div
      className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 cursor-pointer overflow-hidden"
      onClick={handleCardClick}
    >
      {/* 이미지 영역 */}
      <div className="relative h-40 sm:h-48 bg-gray-200">
        {/* 이미지 슬라이더 */}
        <div className="relative w-full h-full">
          <div className="w-full h-full bg-gradient-to-br from-blue-100 to-indigo-200 flex items-center justify-center">
            <span className="text-gray-500 text-xs sm:text-sm">강아지 이미지</span>
          </div>

          {/* 이미지 네비게이션 */}
          {displayImages.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); prevImage(); }}
                className="absolute left-1 sm:left-2 top-1/2 transform -translate-y-1/2 w-6 h-6 sm:w-8 sm:h-8 bg-black/30 hover:bg-black/50 text-white rounded-full flex items-center justify-center transition-colors text-xs sm:text-sm"
              >
                ←
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); nextImage(); }}
                className="absolute right-1 sm:right-2 top-1/2 transform -translate-y-1/2 w-6 h-6 sm:w-8 sm:h-8 bg-black/30 hover:bg-black/50 text-white rounded-full flex items-center justify-center transition-colors text-xs sm:text-sm"
              >
                →
              </button>
            </>
          )}
        </div>

        {/* D-day 배지 */}
        <div className="absolute top-2 sm:top-3 left-2 sm:left-3">
          <span className={`px-2 py-1 rounded-full text-xs font-bold ${
            isExpired
              ? 'bg-gray-500 text-white'
              : dday <= 7
                ? 'bg-red-500 text-white'
                : dday <= 14
                  ? 'bg-orange-500 text-white'
                    : 'bg-blue-500 text-white'
          }`}>
            {isExpired ? '만료' : `D-${dday}`}
          </span>
        </div>

        {/* 찜하기 버튼 */}
        <button
          onClick={toggleFavorite}
          className="absolute top-2 sm:top-3 right-2 sm:right-3 p-1.5 sm:p-2 rounded-full bg-white/80 hover:bg-white transition-colors"
        >
          <Heart
            className={`w-4 h-4 sm:w-5 sm:h-5 ${
              isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400'
            }`}
          />
        </button>

        {/* 이미지 인디케이터 */}
        {displayImages.length > 1 && (
          <div className="absolute bottom-2 sm:bottom-3 left-1/2 transform -translate-x-1/2 flex space-x-1">
            {displayImages.map((_, index) => (
              <button
                key={index}
                onClick={(e) => { e.stopPropagation(); goToImage(index); }}
                className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full transition-colors ${
                  index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* 내용 영역 */}
      <div className="p-3 sm:p-4">
        {/* 제목 */}
        <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2 text-sm sm:text-base leading-tight">
          {title}
        </h3>

        {/* 강아지 정보 */}
        <div className="flex items-center space-x-1 sm:space-x-2 mb-2 sm:mb-3">
          <span className="text-xs sm:text-sm text-gray-600">{dogName}</span>
          <span className="text-gray-400 text-xs">•</span>
          <span className="text-xs sm:text-sm text-gray-600">{dogSize}</span>
          <span className="text-gray-400 text-xs">•</span>
          <span className="text-xs sm:text-sm text-gray-600">{dogBreed}</span>
        </div>

        {/* 위치 정보 */}
        <div className="flex items-center space-x-1 sm:space-x-2 mb-3 sm:mb-4">
          <MapPin className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
          <span className="text-xs sm:text-sm text-gray-600">
            {departureAddress} <ArrowRight className="w-2.5 h-2.5 sm:w-3 sm:h-3 inline mx-1" /> {arrivalAddress}
          </span>
        </div>

        {/* 문의하기 버튼 */}
        <button className="w-full bg-blue-600 text-white py-2 sm:py-2.5 px-3 sm:px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm sm:text-base">
          문의하기
        </button>
      </div>
    </div>
  );
};

export default PostCard;
