// 앱 설정
export const APP_CONFIG = {
  name: "Move Together",
  description: "함께 움직이는 새로운 경험을 시작해보세요",
  version: "1.0.0",
  author: "Move Together Team",
};

// API 설정
export const API_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api",
  timeout: 10000,
};

// UI 설정
export const UI_CONFIG = {
  maxWidth: "1200px",
  mobileBreakpoint: "768px",
  tabletBreakpoint: "1024px",
};

// 라우트 설정
export const ROUTES = {
  home: "/",
  about: "/about",
  contact: "/contact",
};

// 로컬 스토리지 키
export const STORAGE_KEYS = {
  theme: "move-together-theme",
  user: "move-together-user",
  settings: "move-together-settings",
};
