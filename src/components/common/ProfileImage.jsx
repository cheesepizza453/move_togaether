'use client';

import React from 'react';
import { getProfileImageUrl } from '@/lib/utils';
import Image from 'next/image';

/**
 * 프로필 이미지를 표시하는 재사용 가능한 컴포넌트
 *
 * @param {string} profileImage - 프로필 이미지 URL 또는 파일명
 * @param {number} size - 이미지 크기 (px)
 * @param {string} alt - 이미지 대체 텍스트
 * @param {string} defaultImage - 기본 이미지 경로 (기본값: '/img/default_profile.jpg')
 * @param {string} className - 추가 클래스명
 */
const ProfileImage = ({
  profileImage,
  size = 70,
  alt = '프로필 이미지',
  defaultImage = '/img/default_profile.jpg',
  className = ''
}) => {
  // 최종 이미지 src 결정
  const resolveImageSrc = () => {
    // 값이 없으면 기본 이미지
    if (!profileImage) return defaultImage;

    if (typeof profileImage === 'string') {
      // 1) 클라이언트에서 압축해서 넘긴 base64(data URL)
      if (profileImage.startsWith('data:image')) {
        return profileImage;
      }

      // 2) 이미 http/https로 시작하는 절대 URL
      if (profileImage.startsWith('http://') || profileImage.startsWith('https://')) {
        return profileImage;
      }
    }

    // 3) 그 외에는 예전처럼 Supabase 파일명이라고 가정
    return getProfileImageUrl(profileImage, defaultImage);
  };

  const imageUrl = resolveImageSrc();

  return (
    <figure
      className={`relative flex-shrink-0 rounded-full overflow-hidden flex items-center justify-center ${className}`}
      style={{ width: `${size}px`, height: `${size}px` }}
    >
      <Image
        width={100}
        height={100}
        src={imageUrl}
        alt={alt}
        className="absolute top-1/2 left-1/2 w-full h-full -translate-x-1/2 -translate-y-1/2 object-cover"
      />
    </figure>
  );
};

export default ProfileImage;
