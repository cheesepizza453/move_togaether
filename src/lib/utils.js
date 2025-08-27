import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Tailwind CSS 클래스 병합 유틸리티
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// 모바일 디바이스 감지
export function isMobile() {
  if (typeof window === "undefined") return false;
  return window.innerWidth < 768;
}

// 태블릿 디바이스 감지
export function isTablet() {
  if (typeof window === "undefined") return false;
  return window.innerWidth >= 768 && window.innerWidth < 1024;
}

// 데스크톱 디바이스 감지
export function isDesktop() {
  if (typeof window === "undefined") return false;
  return window.innerWidth >= 1024;
}

// 로컬 스토리지 유틸리티
export const storage = {
  get: (key) => {
    if (typeof window === "undefined") return null;
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error("Error reading from localStorage:", error);
      return null;
    }
  },

  set: (key, value) => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error("Error writing to localStorage:", error);
    }
  },

  remove: (key) => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.removeItem(key);
    } catch (error) {
      console.error("Error removing from localStorage:", error);
    }
  },
};

// 디바운스 유틸리티
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// 스로틀 유틸리티
export function throttle(func, limit) {
  let inThrottle;
  return (...args) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// 날짜 포맷팅
export function formatDate(date, options = {}) {
  const defaultOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
    ...options,
  };

  return new Intl.DateTimeFormat("ko-KR", defaultOptions).format(date);
}

// 숫자 포맷팅
export function formatNumber(number, locale = "ko-KR") {
  return new Intl.NumberFormat(locale).format(number);
}

// URL 파라미터 파싱
export function parseQueryParams(queryString) {
  const params = new URLSearchParams(queryString);
  const result = {};
  for (const [key, value] of params) {
    result[key] = value;
  }
  return result;
}
