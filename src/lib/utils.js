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

/**
 * 프로필 이미지 URL을 생성하는 함수
 * @param {string} profileImage - 프로필 이미지 파일명 또는 URL
 * @param {string} defaultImage - 기본 이미지 경로 (기본값: '/img/default_profile.jpg')
 * @returns {string} 완전한 프로필 이미지 URL
 */
export const getProfileImageUrl = (profileImage, defaultImage = '/img/default_profile.jpg') => {
  if (!profileImage) {
    return defaultImage;
  }

  // 이미 완전한 URL인 경우 (http로 시작)
  if (profileImage.startsWith('http')) {
    return profileImage;
  }

  // Supabase Storage URL 생성
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/profiles/${profileImage}`;
};
