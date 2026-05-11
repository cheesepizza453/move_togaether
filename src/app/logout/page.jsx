'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

const LogoutPage = () => {
  const router = useRouter();
  const { signOut } = useAuth();

  useEffect(() => {
    const performLogout = async () => {
      try {
        console.log('로그아웃 페이지에서 로그아웃 시작');
        // 로그아웃 실행
        const result = await signOut();
        console.log('로그아웃 페이지 로그아웃 결과:', result);

        // 로그아웃 성공 여부와 관계없이 메인 페이지로 이동
        // (상태 초기화는 signOut에서 이미 처리됨)
        router.push('/');
      } catch (error) {
        // 에러 발생 시에도 메인 페이지로 이동
        console.error('로그아웃 페이지에서 로그아웃 오류:', error);
        router.push('/');
      }
    };

    // 페이지 로드 시 즉시 로그아웃 실행
    performLogout();
  }, [signOut, router]);

  return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex justify-center items-center py-4">
          <div className="mt-8 flex justify-center space-x-2">
            <div className="w-2 h-2 bg-brand-main rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-brand-main rounded-full animate-bounce"
                 style={{animationDelay: '0.1s'}}></div>
            <div className="w-2 h-2 bg-brand-main rounded-full animate-bounce"
                 style={{animationDelay: '0.2s'}}></div>
          </div>
        </div>
      </div>
  );
};

export default LogoutPage;
