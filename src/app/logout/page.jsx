'use client';

import { useEffect } from 'react';
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
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
      <div className="text-center">
        <div className="mb-4">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-yellow-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
          </div>
        </div>

        <h1 className="text-xl font-semibold text-gray-800 mb-2">
          로그아웃 중...
        </h1>

        <p className="text-gray-600 mb-6">
          잠시만 기다려주세요.
        </p>

        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500"></div>
        </div>
      </div>
    </div>
  );
};

export default LogoutPage;
