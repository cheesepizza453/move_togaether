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
      </div>
    </div>
  );
};

export default SplashScreen;
