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
      className={`fixed inset-0 z-50 flex items-center justify-center bg-brand-main transition-opacity duration-500 ${
        isFading ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <div className="text-center">
        {/* 로고 이미지 */}
        <div className="mb-4">
          <div className="w-[201px] h-auto flex items-center justify-center">
            <img
              src="/img/splash.png"
              alt="Move Togaether Logo"
            />
          </div>
        </div>
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
