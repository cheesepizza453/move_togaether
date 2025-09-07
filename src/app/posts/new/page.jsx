'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const NewPostPage = () => {
  const router = useRouter();

  useEffect(() => {
    // 1단계 페이지로 리다이렉트
    router.replace('/posts/new/step1');
  }, [router]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-yellow-500 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-700 mb-2">이동 중...</h2>
        <p className="text-gray-500">잠시만 기다려주세요.</p>
      </div>
    </div>
  );
};

export default NewPostPage;
