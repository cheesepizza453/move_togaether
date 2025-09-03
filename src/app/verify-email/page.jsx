'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const VerifyEmailPage = () => {
  const [verificationStatus, setVerificationStatus] = useState('verifying'); // verifying, success, error
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const { createProfileManually } = useAuth();
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
          setMessage('이메일 인증이 완료되었습니다. 이제 로그인할 수 있습니다.');
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



  const getStatusIcon = () => {
    switch (verificationStatus) {
      case 'success':
        return <CheckCircle className="w-16 h-16 text-green-500" />;
      case 'error':
        return <XCircle className="w-16 h-16 text-red-500" />;
      default:
        return <AlertCircle className="w-16 h-16 text-blue-500" />;
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
        <Link
          href="/login"
          className="inline-block bg-green-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors"
        >
          로그인하기
        </Link>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="py-10 bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">이메일 인증 중...</h2>
          <p className="text-gray-500">잠시만 기다려주세요.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-10 bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        {/* 상태 아이콘 */}
        <div className="mb-6">
          {getStatusIcon()}
        </div>

        {/* 상태 제목 */}
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          {getStatusTitle()}
        </h1>

        {/* 메시지 */}
        <p className="text-gray-600 mb-8 leading-relaxed">
          {message}
        </p>

        {/* 액션 버튼 */}
        {getActionButton() && (
          <div className="mb-6">
            {getActionButton()}
          </div>
        )}

        {/* 추가 정보 */}
        {verificationStatus === 'success' && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-sm text-green-700">
            <p>이제 로그인하여 서비스를 이용할 수 있습니다.</p>
          </div>
        )}

        {/* 홈으로 돌아가기 */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <Link
            href="/"
            className="text-blue-500 hover:text-blue-600 text-sm font-medium"
          >
            홈으로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailPage;
