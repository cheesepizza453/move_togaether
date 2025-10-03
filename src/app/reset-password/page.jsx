'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

const ResetPasswordPage = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [isValidSession, setIsValidSession] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  const router = useRouter();
  const searchParams = useSearchParams();

  // 세션 확인
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error('세션 확인 오류:', error);
          toast.error('유효하지 않은 링크입니다.');
          router.push('/forgot-password');
          return;
        }

        if (!session) {
          toast.error('유효하지 않은 링크입니다.');
          router.push('/forgot-password');
          return;
        }

        setIsValidSession(true);
      } catch (error) {
        console.error('세션 확인 중 오류:', error);
        toast.error('오류가 발생했습니다.');
        router.push('/forgot-password');
      } finally {
        setCheckingSession(false);
      }
    };

    checkSession();
  }, [router]);

  // 비밀번호 유효성 검사
  const validatePassword = (password) => {
    if (!password) {
      return { isValid: false, message: '비밀번호를 입력해주세요.' };
    }
    if (password.length < 6) {
      return { isValid: false, message: '비밀번호는 6자 이상이어야 합니다.' };
    }
    return { isValid: true, message: '' };
  };

  // 비밀번호 확인 검사
  const validateConfirmPassword = (password, confirmPassword) => {
    if (!confirmPassword) {
      return { isValid: false, message: '비밀번호 확인을 입력해주세요.' };
    }
    if (password !== confirmPassword) {
      return { isValid: false, message: '비밀번호가 일치하지 않습니다.' };
    }
    return { isValid: true, message: '' };
  };

  // 비밀번호 재설정
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    // 비밀번호 유효성 검사
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      setErrors({ password: passwordValidation.message });
      return;
    }

    // 비밀번호 확인 검사
    const confirmPasswordValidation = validateConfirmPassword(password, confirmPassword);
    if (!confirmPasswordValidation.isValid) {
      setErrors({ confirmPassword: confirmPasswordValidation.message });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) {
        console.error('비밀번호 재설정 오류:', error);
        toast.error('비밀번호 재설정에 실패했습니다. 다시 시도해주세요.');
        return;
      }

      toast.success('비밀번호가 성공적으로 재설정되었습니다.');
      router.push('/login');
    } catch (error) {
      console.error('비밀번호 재설정 중 오류:', error);
      toast.error('오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-yellow-500 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">링크 확인 중...</h2>
          <p className="text-gray-500">잠시만 기다려주세요.</p>
        </div>
      </div>
    );
  }

  if (!isValidSession) {
    return null; // 리다이렉트 처리됨
  }

  return (
    <div className="min-h-screen bg-white">
      {/* 헤더 */}
      <div className="relative px-[30px] flex items-center h-[78px]">
        <div className="flex items-center">
          <Link href="/login" className="mr-[12px]">
            <svg xmlns="http://www.w3.org/2000/svg" width="9" height="16" viewBox="0 0 9 16" fill="none">
              <path d="M8 15L1 8" stroke="black" strokeWidth="2" strokeMiterlimit="10"
                    strokeLinecap="round"/>
              <path d="M8 0.999999L1 8" stroke="black" strokeWidth="2" strokeMiterlimit="10"
                    strokeLinecap="round"/>
            </svg>
          </Link>
          <h1 className="text-22-m text-black">비밀번호 재설정</h1>
        </div>
      </div>

      {/* 메인 컨텐츠 */}
      <div className="px-6 py-8">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-24-m text-black mb-4">새 비밀번호 설정</h2>
            <p className="text-16-r text-gray-600">
              새로운 비밀번호를 입력해주세요.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-16-m mb-[12px]">
                새 비밀번호<span className="text-brand-point">*</span>
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="새 비밀번호를 입력해주세요"
                className={`w-full px-[15px] py-[18px] text-16-r rounded-[15px] border text-text-800 ${
                  errors.password
                    ? 'border-brand-point bg-brand-point-bg text-brand-point focus:border-brand-point focus:ring-brand-point'
                    : 'border-text-600 bg-text-050 focus:bg-brand-sub focus:text-brand-yellow-dark focus:border-brand-main focus:ring-brand-main'
                } focus:outline-none focus:ring-1 transition-colors`}
                disabled={loading}
              />
              {errors.password && (
                <p className="text-9-r text-brand-point mt-[4px]">{errors.password}</p>
              )}
            </div>

            <div>
              <label className="block text-16-m mb-[12px]">
                비밀번호 확인<span className="text-brand-point">*</span>
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="비밀번호를 다시 입력해주세요"
                className={`w-full px-[15px] py-[18px] text-16-r rounded-[15px] border text-text-800 ${
                  errors.confirmPassword
                    ? 'border-brand-point bg-brand-point-bg text-brand-point focus:border-brand-point focus:ring-brand-point'
                    : 'border-text-600 bg-text-050 focus:bg-brand-sub focus:text-brand-yellow-dark focus:border-brand-main focus:ring-brand-main'
                } focus:outline-none focus:ring-1 transition-colors`}
                disabled={loading}
              />
              {errors.confirmPassword && (
                <p className="text-9-r text-brand-point mt-[4px]">{errors.confirmPassword}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors ${
                loading
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-brand-main text-white hover:bg-brand-yellow-dark'
              }`}
            >
              {loading ? '비밀번호 재설정 중...' : '비밀번호 재설정'}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-14-r text-gray-600">
              비밀번호가 기억나셨나요?{' '}
              <Link href="/login" className="text-brand-main font-medium hover:underline">
                로그인하기
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
