'use client';

import { useState } from 'react';
import Link from 'next/link';
import moment from 'moment';

const MyPageCard = ({
  post,
  activeSubTab,
  onFavoriteToggle
}) => {
  // 유틸리티 함수들
  const convertDogSize = (size) => {
    const sizeMap = {
      'small': '소형견',
      'medium-small': '중소형견',
      'medium': '중형견',
      'large': '대형견'
    };
    return sizeMap[size] || size;
  };

  const formatDate = (date) => {
    return moment(date).format('YY/MM/DD');
  };

  const getDday = (deadline) => {
    const today = moment();
    const deadlineDate = moment(deadline);
    const diffDays = deadlineDate.diff(today, 'days');
    return diffDays; // 숫자로 반환
  };

  const getDdayText = (deadline) => {
    const diffDays = getDday(deadline);
    if (diffDays < 0) return `D+${Math.abs(diffDays)}`;
    if (diffDays === 0) return 'D-Day';
    return `D-${diffDays}`;
  };

  // D-day 배지 색상 결정 (PostCard와 동일)
  const getDdayColor = (dday) => {
    if (dday <= 7) return 'bg-brand-point text-white';
    if (dday <= 14) return 'bg-brand-main text-white';
    return 'bg-[#FFE889] text-brand-yellow-dark';
  };

  const getStatusBadge = (status, deadline) => {
    if (status !== 'active') {
      return {
        text: '입양 완료',
        className: 'bg-green-100 text-green-600'
      };
    }

    const dday = getDday(deadline);
    const ddayText = getDdayText(deadline);

    if (dday < 0) {
      return {
        text: '마감',
        className: 'bg-red-100 text-red-600'
      };
    } else if (dday <= 3) {
      return {
        text: ddayText,
        className: 'bg-red-100 text-red-600'
      };
    } else if (dday <= 7) {
      return {
        text: ddayText,
        className: 'bg-orange-100 text-orange-600'
      };
    } else {
      return {
        text: ddayText,
        className: 'bg-yellow-100 text-yellow-600'
      };
    }
  };

  const dday = getDday(post.deadline);
  const statusBadge = getStatusBadge(post.status, post.deadline);

  return (
    <div
      className="bg-white rounded-[15px] px-[18px] py-[16px] cursor-pointer relative shadow-[0_0_15px_0px_rgba(0,0,0,0.1)]"
    >
      {/* 진행중 탭에서만 D-day를 사진 위쪽에 표시 */}
      {activeSubTab === '진행중' && (
      <div className="flex justify-end items-start">
        {/* D-day 배지 - border 위에 겹쳐서 표시 */}
        <div className="absolute -top-3 left-[-5px] z-10">
          <span className={`flex items-center justify-center px-[13px] h-[24px] rounded-[7px] text-12-b font-bold ${getDdayColor(dday)}`}>
            D-{dday}
          </span>
        </div>
      </div>
      )}
      <div className="flex items-center mb-3">
        <div className="w-12 h-12 bg-gray-100 rounded-lg mr-3 flex-shrink-0 overflow-hidden relative">

          {post.images && post.images.length > 0 ? (
            <img
              src={post.images[0]}
              alt={post.dog_name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
              이미지 없음
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-gray-800 mb-1 line-clamp-2">
            {post.title}
          </h3>
          <p className="text-xs text-gray-500 mb-2">{post.dog_name} / {convertDogSize(post.dog_size)}</p>
          <p className="text-xs text-gray-400">{formatDate(post.created_at)}</p>
        </div>
        {/* 진행중이 아닌 경우에만 오른쪽에 상태 배지 표시 */}
        {activeSubTab !== '진행중' && (
          <div className="ml-2">
            <span className={`inline-block text-xs px-2 py-1 rounded-full font-medium ${statusBadge.className}`}>
              {statusBadge.text}
            </span>
          </div>
        )}
      </div>

      {/* 서브탭별 하단 버튼 */}
      {activeSubTab === '진행중' && (
        <div className="mt-3">
          <button className="w-full bg-yellow-400 text-gray-800 py-2 px-4 rounded-xl text-sm font-medium hover:bg-yellow-500 transition-colors">
            지원자 {post.applicant_count || 0}
          </button>
        </div>
      )}
      {activeSubTab === '종료' && (
        <div className="mt-3">
          <button
            onClick={() => {
              // 종료된 게시물 재업로드 기능
              console.log('재업로드:', post.id);
            }}
            className="w-full bg-red-500 text-white py-2 px-4 rounded-xl text-sm font-medium hover:bg-red-600 transition-colors"
          >
            재업로드
          </button>
        </div>
      )}
      {activeSubTab === '완료' && (
        // 완료된 게시물은 하단 버튼 없음
        <div className="mt-3">
          <div className="flex space-x-2">
            <Link
              href={`/posts/${post.id}`}
              className="flex-1 bg-gray-100 text-gray-600 py-2 px-4 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors text-center"
            >
              상세보기
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyPageCard;
