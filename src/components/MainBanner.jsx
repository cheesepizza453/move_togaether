'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const MainBanner = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const banners = [
    {
      id: 1,
      label: "보호자 모집",
      title: "오늘은 특별한 날이에요, 새 가족을 만나러 가요!",
      subtitle: "같이 드라이브해주실래요? 🚗🐾",
      image: "/images/banner1.jpg"
    },
    {
      id: 2,
      label: "봉사자 모집",
      title: "두 번째 배너 제목",
      subtitle: "두 번째 배너 부제목",
      image: "/images/banner2.jpg"
    },
    {
      id: 3,
      label: "봉사자 모집",
      title: "세 번째 배너 제목",
      subtitle: "세 번째 배너 부제목",
      image: "/images/banner3.jpg"
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

  return (
    <div className="relative w-full h-48 bg-yellow-400 rounded-lg overflow-hidden">
      {/* 배너 슬라이드 */}
      <div className="relative w-full h-full">
        {banners.map((banner, index) => (
          <div
            key={banner.id}
            className={`absolute inset-0 transition-opacity duration-500 ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {/* 배너 내용 */}
            <div className="relative h-full flex items-center px-4">
              {/* 왼쪽 텍스트 영역 */}
              <div className="flex-1 text-left">
                {/* 라벨 */}
                <div className="mb-3">
                  <span className="inline-block px-3 py-1 bg-yellow-300 text-yellow-800 text-xs font-medium rounded-full">
                    {banner.label}
                  </span>
                </div>

                {/* 제목 */}
                <h1 className="text-banner-1 text-white font-bold mb-2 leading-tight">
                  {banner.title}
                </h1>

                {/* 부제목 */}
                <p className="text-banner-2 text-white opacity-90">
                  {banner.subtitle}
                </p>
              </div>

              {/* 오른쪽 강아지 일러스트 */}
              <div className="flex-shrink-0 w-24 h-24 bg-pink-300 rounded-full flex items-center justify-center mr-4">
                <div className="text-4xl">🐕</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 네비게이션 버튼 */}
      <button
        onClick={prevSlide}
        className="absolute left-2 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-white/20 hover:bg-white/30 text-white rounded-full flex items-center justify-center transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      <button
        onClick={nextSlide}
        className="absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-white/20 hover:bg-white/30 text-white rounded-full flex items-center justify-center transition-colors"
      >
        <ChevronRight className="w-4 h-4" />
      </button>

      {/* 슬라이드 인디케이터 */}
      <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex items-center space-x-2">
        <span className="text-white text-xs font-medium">
          {currentSlide + 1}/{banners.length}
        </span>
      </div>
    </div>
  );
};

export default MainBanner;
