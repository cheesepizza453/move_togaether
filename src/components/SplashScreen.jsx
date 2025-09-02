'use client';

import { useState, useEffect } from 'react';

const SplashScreen = ({ onComplete }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    // 2.5초 후 페이드아웃 시작
    const fadeTimer = setTimeout(() => {
      setIsFading(true);
    }, 2500);

    // 3초 후 완전히 숨김
    const hideTimer = setTimeout(() => {
      setIsVisible(false);
      onComplete?.();
    }, 3000);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(hideTimer);
    };
  }, [onComplete]);

  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-yellow-400 transition-opacity duration-500 ${
        isFading ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <div className="text-center">
        {/* 로고 이미지 */}
        <div className="mb-4">
          <div className="w-32 h-32 mx-auto flex items-center justify-center">
            <img
              src="/splash.png"
              alt="Move Togaether Logo"
            />
          </div>
        </div>

        {/* 서비스명 */}
        <h1 className="text-3xl font-bold text-white mb-2 font-spoqa">
          무브투게더
        </h1>

        {/* 서비스 설명 */}
        <p className="text-white/90 text-lg font-spoqa">
          유기견 이동봉사
        </p>

        {/* 로딩 애니메이션 */}
        <div className="mt-8 flex justify-center space-x-2">
          <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;
