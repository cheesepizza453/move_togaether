'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const MainBanner = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const banners = [
    {
      id: 1,
      title: "전국에서 진행 중인 봉사",
      subtitle: "유기견들이 새로운 가족을 찾고 있습니다",
      image: "/images/banner1.jpg",
      description: "전국의 보호소와 개인 구조자들이 등록한 이동봉사 요청을 확인하세요"
    },
    {
      id: 2,
      title: "안전한 이동을 위한 봉사",
      subtitle: "당신의 도움이 필요합니다",
      image: "/images/banner2.jpg",
      description: "유기견들이 새로운 가족에게 안전하게 이동할 수 있도록 도와주세요"
    },
    {
      id: 3,
      title: "따뜻한 마음으로",
      subtitle: "작은 도움이 큰 변화를 만듭니다",
      image: "/images/banner3.jpg",
      description: "봉사자들의 따뜻한 마음이 유기견들에게 희망을 줍니다"
    },
    {
      id: 4,
      title: "함께 만들어가는",
      subtitle: "더 나은 세상",
      image: "/images/banner4.jpg",
      description: "Move Togaether와 함께 유기견들의 행복한 미래를 만들어가세요"
    },
    {
      id: 5,
      title: "지금 시작하세요",
      subtitle: "봉사 신청하기",
      image: "/images/banner5.jpg",
      description: "지금 바로 봉사 신청을 통해 유기견들을 도와주세요"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [banners.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % banners.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  return (
    <div className="relative w-full h-48 sm:h-56 md:h-64 lg:h-80 bg-gradient-to-r from-blue-50 to-indigo-100 rounded-lg overflow-hidden">
      {/* 배너 슬라이드 */}
      <div className="relative w-full h-full">
        {banners.map((banner, index) => (
          <div
            key={banner.id}
            className={`absolute inset-0 transition-opacity duration-500 ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent z-10" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/40 z-10" />

            {/* 배경 이미지 (실제 이미지가 없으므로 그라데이션으로 대체) */}
            <div className="w-full h-full bg-gradient-to-br from-blue-400 via-indigo-500 to-purple-600" />

            {/* 배너 내용 */}
            <div className="absolute inset-0 z-20 flex flex-col justify-center items-start px-4 sm:px-6 lg:px-8 text-white">
              <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold mb-2 leading-tight">
                {banner.title}
              </h1>
              <p className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl mb-2 sm:mb-3 text-blue-100 leading-tight">
                {banner.subtitle}
              </p>
              <p className="text-xs sm:text-sm md:text-base text-gray-200 max-w-xs sm:max-w-sm md:max-w-md leading-relaxed">
                {banner.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* 네비게이션 버튼 */}
      <button
        onClick={prevSlide}
        className="absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 z-30 p-1.5 sm:p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
      >
        <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white" />
      </button>

      <button
        onClick={nextSlide}
        className="absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 z-30 p-1.5 sm:p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
      >
        <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white" />
      </button>

      {/* 페이지 인디케이터 */}
      <div className="absolute bottom-2 sm:bottom-4 right-2 sm:right-4 flex space-x-1.5 sm:space-x-2">
        {banners.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-1 h-1 rounded-full transition-all duration-200 ${
              index === currentSlide
                ? 'bg-white scale-125'
                : 'bg-white bg-opacity-50 hover:bg-opacity-75'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default MainBanner;
