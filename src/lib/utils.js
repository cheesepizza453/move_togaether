import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import moment from "moment"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

/**
 * 강아지 크기를 한글로 변환하는 함수
 * @param {string} size - 강아지 크기 (small, medium, large)
 * @returns {string} 한글 크기 (소형견, 중형견, 대형견)
 */
export const convertDogSize = (size) => {
  const sizeMap = {
    'small': '소형견',
    'smallMedium': '중소형견',
    'medium': '중형견',
    'large': '대형견'
  };
  return sizeMap[size] || size;
};

/**
 * 날짜를 YY/MM/DD 형식으로 포맷하는 함수
 * @param {string|Date} deadline - 날짜
 * @returns {string} 포맷된 날짜
 */
export const formatDeadline = (deadline) => {
  if (!deadline) return '';
  return moment(deadline).format('YY/MM/DD');
};
