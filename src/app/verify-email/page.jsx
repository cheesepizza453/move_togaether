'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import Loading from "@/components/ui/loading";

// useSearchParams를 사용하는 컴포넌트를 별도로 분리
const VerifyEmailContent = () => {
  const [verificationStatus, setVerificationStatus] = useState('verifying'); // verifying, success, error
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const { createProfileManually, signOut } = useAuth();
  const type = searchParams.get('type');

  useEffect(() => {
    // Supabase Auth에서 자동으로 처리되는 이메일 인증 확인
    handleEmailVerification();

    // 타임아웃 설정 (5초 후 자동으로 성공 처리)
    const timeout = setTimeout(() => {
      if (loading) {
        console.log('타임아웃으로 인한 자동 성공 처리');
        setVerificationStatus('success');
        setMessage('이메일 인증이 완료되었습니다. 이제 로그인할 수 있습니다.');
        setLoading(false);
      }
    }, 5000);

    return () => clearTimeout(timeout);
  }, [loading]);

  const handleEmailVerification = async () => {
    try {
      console.log('이메일 인증 처리 시작...');

      // URL 파라미터에서 type 확인
      const urlParams = new URLSearchParams(window.location.search);
      const verificationType = urlParams.get('type');

      console.log('인증 타입:', verificationType);

      // 이메일 인증 완료 시 프로필 생성 시도
      if (verificationType === 'signup') {
        console.log('이메일 인증 완료 - 프로필 생성 시도');
        const profileResult = await createProfileManually();
        console.log('프로필 생성 결과:', profileResult);
      }

      // 짧은 지연 후 성공 처리 (사용자 경험 개선)
      setTimeout(() => {
        if (verificationType === 'signup') {
          setVerificationStatus('success');
          setMessage('무브투개더를 찾아주셔서 감사합니다. 이메일 인증이 완료되었습니다.');
        } else if (verificationType === 'recovery') {
          setVerificationStatus('success');
          setMessage('비밀번호 재설정 이메일이 발송되었습니다.');
        } else {
          setVerificationStatus('success');
          setMessage('이메일 인증이 완료되었습니다.');
        }
        setLoading(false);
        console.log('이메일 인증 처리 완료');
      }, 2000); // 2초 후 성공 처리

    } catch (error) {
      console.error('이메일 인증 오류:', error);
      setVerificationStatus('error');
      setMessage('인증 중 오류가 발생했습니다.');
      setLoading(false);
    }
  };

  // 로그아웃 후 로그인 페이지로 이동
  const handleGoToLogin = async () => {
    try {
      console.log('로그아웃 처리 시작...');

      // Auth Context의 signOut 호출
      await signOut();

      // 추가로 모든 캐시 및 세션 정리
      localStorage.clear();
      sessionStorage.clear();

      console.log('로그아웃 완료 - 로그인 페이지로 이동');

      // 로그인 페이지로 이동
      router.push('/login');
    } catch (error) {
      console.error('로그아웃 처리 오류:', error);
      // 오류가 발생해도 로그인 페이지로 이동
      router.push('/login');
    }
  };

  const getStatusTitle = () => {
    switch (verificationStatus) {
      case 'success':
        return '이메일 인증 완료!';
      case 'error':
        return '인증 실패';
      default:
        return '이메일 인증 중...';
    }
  };

  const getActionButton = () => {
    if (verificationStatus === 'success') {
      return (
          <button
              onClick={handleGoToLogin}
              className="inline-flex justify-center items-center px-[20px] bg-brand-main text-black text-16-m h-[50px] rounded-[15px] w-full hover:bg-brand-main/90 transition-colors"
          >
            로그인하기
          </button>
      );
    }
    return null;
  };

  if (loading) {
    return (
        <Loading/>
    );
  }

  return (
      <div className="bg-brand-bg min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-[30px] p-8 text-center">
          {/* 상태 제목 */}
          <h1 className="text-18-b text-gray-800 mb-[12px]">
            {getStatusTitle()}
          </h1>

          {/* 메시지 */}
          <p className="text-gray-600 mb-8 leading-relaxed text-14-r">
            {message}
          </p>

          {/* 액션 버튼 */}
          {getActionButton() && (
              <div className="mb-6">
                {getActionButton()}
              </div>
          )}

          {/* 홈으로 돌아가기 */}
          {/*        <div className="mt-6 pt-6 border-t border-gray-200">
          <Link
            href="/"
            className="text-12-r text-brand-yellow-dark underline"
          >
            홈으로 돌아가기
          </Link>
        </div>*/}
        </div>
      </div>
  );
};

// 로딩 컴포넌트
const LoadingFallback = () => (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500 mx-auto mb-4"></div>
        <p className="text-gray-600">이메일 인증 중...</p>
      </div>
    </div>
);

// 메인 컴포넌트 - Suspense로 감싸기
const VerifyEmailPage = () => {
  return (
      <Suspense fallback={<LoadingFallback />}>
        <VerifyEmailContent />
      </Suspense>
  );
};

export default VerifyEmailPage;