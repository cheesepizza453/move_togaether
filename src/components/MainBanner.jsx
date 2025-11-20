'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const MainBanner = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const banners = [
    {
      id: 1,
      image: "/img/main_banner_1.jpg",
      alt: "오늘은 특별한 날이에요. 새 가족을 만나러 가요!"
    },
    {
      id: 2,
      image: "/img/main_banner_2.jpg",
      alt: "무브투개더 인스타그램 팔로우",
      link:"https://www.instagram.com/movetogaether/"
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
    <div className="relative w-full aspect-[356/188] rounded-[15px] overflow-hidden">
      {/* 배너 슬라이드 */}
      <div className="relative w-full h-full">
        {banners.map((banner, index) => (
          <figure
              key={banner.id}
              className={`absolute inset-0 flex items-center justify-center transition-opacity duration-500 ${
                  index === currentSlide ? 'opacity-100 z-10' : 'opacity-0'
              }`}
          >
            {banner.link ? (
                <a
                    href={banner.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full h-full"
                >
                  <img
                      src={banner.image}
                      alt={banner.alt}
                      className="w-full h-full object-contain"
                  />
                </a>
            ) : (
                <img
                    src={banner.image}
                    alt={banner.alt}
                    className="w-full h-full object-contain"
                />
            )}
          </figure>
        ))}
      </div>

      {/* 우측 하단 네비게이션 컨트롤 */}
      <div className="absolute bottom-[10px] right-[16px] flex items-center space-x-[2px]">

        {/* 페이지 표시 */}
        {banners.length > 1 &&
        <div className="mr-[4px]">
          <span className="text-yellow-600 text-[10px] font-bold shadow-sm">
            {currentSlide + 1}/{banners.length}
          </span>
        </div>
        }

        {/* 좌우 이동 버튼 */}
        {banners.length > 1 &&
        <>
          <button
            onClick={prevSlide}
            className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-200 shadow-sm backdrop-blur-sm ${
              currentSlide === 0
                ? 'bg-[#cfcfcf] text-[#8E8E8E] cursor-not-allowed'
                : 'bg-white/90 hover:bg-white text-yellow-500 hover:shadow-md'
            }`}
            disabled={currentSlide === 0}
            aria-label="이전 배너"
          >
            <ChevronLeft className="w-3 h-6" />
          </button>

          <button
            className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-200 shadow-sm backdrop-blur-sm ${
              currentSlide === banners.length - 1
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-white/90 hover:bg-white text-yellow-500 hover:shadow-md'
            }`}
            onClick={nextSlide}
            disabled={currentSlide === banners.length - 1}
            aria-label="다음 배너"
          >
            <ChevronRight className="w-3 h-6" />
          </button>
        </>
      }
      </div>
    </div>
  );
};

export default MainBanner;
