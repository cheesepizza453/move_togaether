'use client';

import React from 'react';
import PostCard from './PostCard';

const PostTimeline = ({ posts, onPostClick, emptyMessage }) => {
  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="text-gray-500 text-center mb-4">
          <p className="text-lg font-medium">{emptyMessage.title}</p>
          <p className="text-sm mt-2">{emptyMessage.description}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {posts.map((post, index) => (
        <div key={post.id} className="relative mb-10">
          {/* 각 카드마다 개별 타임라인 바 - 노란원에서 카드 하단까지 */}
          <div
            className="absolute left-0 bg-[#FFD700]"
            style={{
              transform: 'translateX(-50%)',
              top: '24px',
              height: 'calc(100% - 24px)',
              width: '0.5px',
            }}
          ></div>

          <PostCard
            post={post}
            showTimeline={true}
            isFirst={index === 0}
            isLast={index === posts.length - 1}
            onPostClick={onPostClick}
          />
        </div>
      ))}
    </div>
  );
};

export default PostTimeline;
