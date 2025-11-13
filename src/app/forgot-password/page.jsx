'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [errors, setErrors] = useState({});
  const router = useRouter();

  // 이메일 유효성 검사
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // 이메일 유효성 검사 (간단한 형식 검사만)
  const checkEmailValidity = async (email) => {
    // 이메일 형식만 검사 (보안상 존재 여부는 확인하지 않음)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { isValid: false, message: '올바른 이메일 형식을 입력해주세요.' };
    }

    return { isValid: true, message: '유효한 이메일 형식입니다.' };
  };

  // 비밀번호 재설정 이메일 발송
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    // 이메일 유효성 검사
    if (!email) {
      setErrors({ email: '이메일을 입력해주세요.' });
      return;
    }

    if (!validateEmail(email)) {
      setErrors({ email: '올바른 이메일 형식을 입력해주세요.' });
      return;
    }

    setLoading(true);

    try {
      // 이메일 유효성 확인
      const emailValidation = await checkEmailValidity(email);
      if (!emailValidation.isValid) {
        setErrors({ email: emailValidation.message });
        setLoading(false);
        return;
      }

      // Supabase 비밀번호 재설정 이메일 발송
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        console.error('비밀번호 재설정 이메일 발송 오류:', error);
        toast.error('이메일 발송에 실패했습니다. 다시 시도해주세요.');
        return;
      }

      setEmailSent(true);
      // 성공 메시지는 항상 표시 (보안상의 이유로)
      toast.success('이메일이 발송되었습니다. 가입된 이메일인 경우 재설정 링크를 확인해주세요.');
    } catch (error) {
      console.error('비밀번호 찾기 오류:', error);
      toast.error('오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
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
            <h1 className="text-22-m text-black">비밀번호 찾기</h1>
          </div>
        </div>

        {/* 메인 컨텐츠 */}
        <div className="px-6 py-8">
          <div className="text-center">
            <div className="w-20 h-20 bg-[#B7E6CA] rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-[#63B584]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>

            <h2 className="text-24-m text-black mb-4">이메일을 확인해주세요</h2>
            <p className="text-16-r text-gray-600 mb-8 leading-[1.25]">
              <span className="font-semibold text-black">{email}</span>로<br/>
              비밀번호 재설정 요청을 처리했습니다.
            </p>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
              <p className="text-14-r text-blue-800">
                <strong>가입된 이메일인 경우:</strong> 비밀번호 재설정 링크를 발송했습니다.<br/>
                이메일을 확인하고 링크를 클릭하여 비밀번호를 재설정해주세요.<br/>
                이메일이 오지 않았다면 스팸 폴더를 확인해주세요.
              </p>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
              <p className="text-14-r text-yellow-800">
                <strong>가입되지 않은 이메일인 경우:</strong> 보안상의 이유로 이메일이 발송되지 않습니다.<br/>
                정확한 이메일 주소를 입력했는지 확인해주세요.
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => setEmailSent(false)}
                className="w-full py-3 px-4 bg-gray-100 text-gray-700 rounded-lg font-medium"
              >
                다른 이메일로 다시 시도
              </button>

              <Link
                href="/login"
                className="block w-full py-3 px-4 bg-brand-main text-black rounded-lg font-medium text-center"
              >
                로그인으로 돌아가기
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
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
          <h1 className="text-22-m text-black">비밀번호 찾기</h1>
        </div>
      </div>

      {/* 메인 컨텐츠 */}
      <div className="px-6 py-8">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-22-m text-black mb-[20px]">비밀번호를 잊으셨나요?</h2>
            <p className="text-16-r text-gray-600 leading-[1.25]">
              가입하신 이메일 주소를 입력하시면<br/>
              비밀번호 재설정 링크를 보내드립니다.
            </p>
            <div className="bg-brand-bg rounded-lg p-3 mt-4">
              <p className="text-12-r text-text-800">
                카카오톡으로 가입한 계정은 이메일로 비밀번호를 찾을 수 없습니다.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-16-m mb-[12px]">
                이메일<span className="text-brand-point">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="이메일을 입력해주세요"
                className={`w-full px-[15px] py-[18px] text-16-r rounded-[15px] border text-text-800 ${
                  errors.email
                    ? 'border-brand-point bg-brand-point-bg text-brand-point focus:border-brand-point focus:ring-brand-point'
                    : 'border-text-600 bg-text-050 focus:bg-brand-sub focus:text-brand-yellow-dark focus:border-brand-main focus:ring-brand-main'
                } focus:outline-none focus:ring-1 transition-colors`}
                disabled={loading}
              />
              {errors.email && (
                <p className="text-9-r text-brand-point mt-[4px]">{errors.email}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors ${
                loading
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-brand-main text-black'
              }`}
            >
              {loading ? '이메일 발송 중...' : '비밀번호 재설정 링크 보내기'}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-14-r text-gray-600">
              비밀번호가 기억나셨나요?{' '}
              <Link href="/login" className="text-brand-main font-medium underline">
                  로그인하기
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
