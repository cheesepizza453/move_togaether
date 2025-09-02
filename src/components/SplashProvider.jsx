'use client';

import { useState, useEffect, createContext, useContext } from 'react';
import SplashScreen from './SplashScreen';

// Splash 상태를 전역으로 관리하는 Context
const SplashContext = createContext();

export const useSplash = () => {
  const context = useContext(SplashContext);
  if (!context) {
    throw new Error('useSplash must be used within a SplashProvider');
  }
  return context;
};

const SplashProvider = ({ children }) => {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // 페이지 로드 시 splash 표시
    setShowSplash(true);
  }, []);

  const handleSplashComplete = () => {
    setShowSplash(false);
  };

  const value = {
    showSplash,
    setShowSplash
  };

  return (
    <SplashContext.Provider value={value}>
      {showSplash && <SplashScreen onComplete={handleSplashComplete} />}
      {children}
    </SplashContext.Provider>
  );
};

export default SplashProvider;
