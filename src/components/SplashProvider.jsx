'use client';

import { useState, useEffect, createContext, useContext } from 'react';
import { usePathname } from 'next/navigation';   // ✅ 추가
import SplashScreen from './common/SplashScreen';

const SplashContext = createContext(null);

export const useSplash = () => {
  const context = useContext(SplashContext);
  if (!context) {
    throw new Error('useSplash must be used within a SplashProvider');
  }
  return context;
};

export const SplashProvider = ({ children }) => {
  const [showSplash, setShowSplash] = useState(false); // 처음엔 false
  const pathname = usePathname();

  const isKakaoFlow =
      pathname === '/signup/kakao' ||
      pathname === '/auth/callback';

  useEffect(() => {
    if (isKakaoFlow) {
      setShowSplash(false);
      return;
    }

    const hasShown = sessionStorage.getItem('mt_splash_shown');

    if (!hasShown) {
      setShowSplash(true);
      sessionStorage.setItem('mt_splash_shown', 'true');
    }
  }, [isKakaoFlow]);

  const handleSplashComplete = () => {
    setShowSplash(false);
  };

  const value = { showSplash, setShowSplash };

  return (
      <SplashContext.Provider value={value}>
        {showSplash && !isKakaoFlow && (
            <SplashScreen onComplete={handleSplashComplete} />
        )}
        {children}
      </SplashContext.Provider>
  );
};
