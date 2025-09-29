'use client';

import React from 'react';
import moment from 'moment';
import { convertDogSize } from '@/lib/utils';

const PostCard = ({
  post,
  showTimeline = false,
  isFirst = false,
  isLast = false,
  onPostClick
}) => {
  const getDdayColor = (dday) => {
    if (dday <= 3) return 'bg-[#F36C5E]';
    if (dday <= 7) return 'bg-[#FF8C42]';
    return 'bg-[#FFD700]';
  };

  const getDdayText = (dday) => {
    if (dday < 0) return `D+${Math.abs(dday)}`;
    if (dday === 0) return 'D-Day';
    return `D-${dday}`;
  };

  const getButtonInfo = (post) => {
    if (post.status !== 'active') {
      return {
        text: '모집 완료',
        className: 'w-full bg-gray-400 text-white py-3 px-4 rounded-[20px] font-medium text-sm cursor-not-allowed',
        disabled: true
      };
    } else {
      return {
        text: '문의하기',
        className: 'w-full bg-[#FFE066] text-gray-900 py-3 px-4 rounded-[20px] font-medium text-sm hover:bg-[#FFD700] transition-colors',
        disabled: false
      };
    }
  };

  const createdDate = moment(post.created_at).format('YYYY/MM/DD');
  const buttonInfo = getButtonInfo(post);

  if (showTimeline) {
    return (
      <div className="relative flex items-start gap-6 mb-6 pl-6">
        {/* 타임라인 점 */}
        <div className="absolute left-0 top-0 w-3 h-3 bg-[#FFD700] rounded-full" style={{ transform: 'translateX(-50%)' }}></div>

        {/* 날짜 표시 - 노란원과 같은 높이 */}
        <div className="absolute top-0 left-6 text-[#FFD700] text-sm font-medium" style={{ transform: 'translateY(-50%)' }}>
          {createdDate}
        </div>

        {/* 카드 - 날짜 아래에 위치 */}
        <div className="bg-white rounded-[30px] px-8 mt-4 py-6 shadow-sm border border-gray-100 flex-1">
          <div className="flex items-start gap-4">
            <div className="flex-1 min-w-0">
              {/* D-day 표시 */}
              <div className="mb-2">
                <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold text-white ${getDdayColor(post.dday)}`}>
                  {getDdayText(post.dday)}
                </div>
              </div>
              <h3 className="text-sm font-medium text-gray-900 mb-2 line-clamp-2">
                {post.title}
              </h3>
              <p className="text-xs text-gray-500 mb-3">
                {post.dog_name} / {convertDogSize(post.dog_size)}
              </p>
            </div>

            <div className="flex-shrink-0">
              <div className="w-20 h-20 rounded-[20px] overflow-hidden bg-gray-100">
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
            </div>
          </div>

          <div className="mt-4">
            <button
              onClick={() => onPostClick(post.id)}
              className={buttonInfo.className}
              disabled={buttonInfo.disabled}
            >
              {buttonInfo.text}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 일반 카드 스타일 (타임라인 없음)
  return (
    <div className="bg-white rounded-[30px] px-8 py-6 mb-6 shadow-sm border border-gray-100">
      <div className="flex items-start gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-gray-900 mb-2 line-clamp-2">
            {post.title}
          </h3>
          <p className="text-xs text-gray-500 mb-3">
            {post.dog_name} / {convertDogSize(post.dog_size)}
          </p>
        </div>

        <div className="relative flex-shrink-0">
          <div className="w-20 h-20 rounded-[20px] overflow-hidden bg-gray-100">
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

          <div className={`absolute -top-3 -right-2 px-2 py-1 rounded-full text-xs font-bold text-white ${getDdayColor(post.dday)}`}>
            {getDdayText(post.dday)}
          </div>
        </div>
      </div>

      <div className="mt-4">
        <button
          onClick={() => onPostClick(post.id)}
          className={buttonInfo.className}
          disabled={buttonInfo.disabled}
        >
          {buttonInfo.text}
        </button>
      </div>
    </div>
  );
};

export default PostCard;