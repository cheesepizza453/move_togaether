'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import UserProfileForm from '@/components/UserProfileForm';


const SignupPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [emailValidation, setEmailValidation] = useState(null);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);

  const emailTimeoutRef = useRef(null);
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  // 로그인 상태 확인 및 리다이렉트
  useEffect(() => {
    const checkAuthAndRedirect = async () => {
      // useAuth 훅의 로딩이 완료되었고 사용자가 있는 경우
      if (!authLoading && user) {
        console.log('로그인된 사용자 감지, 메인 페이지로 리다이렉트:', user.id);
        router.replace('/');
        return;
      }

      // useAuth 훅이 로딩 중이 아닌데도 사용자 정보가 없는 경우
      // Supabase 세션을 직접 확인하여 추가 검증
      if (!authLoading && !user) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            console.log('세션에서 사용자 발견, 메인 페이지로 리다이렉트:', session.user.id);
            router.replace('/');
          }
        } catch (error) {
          console.error('세션 확인 오류:', error);
        }
      }
    };

    checkAuthAndRedirect();
  }, [user, authLoading, router]);

  // 비밀번호 유효성 검사
  const validatePassword = (password) => {
    const hasEnglish = /[a-zA-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasValidLength = password.length >= 8 && password.length <= 12;

    return {
      hasEnglish,
      hasNumber,
      hasValidLength,
      isValid: hasEnglish && hasNumber && hasValidLength
    };
  };

  // 비밀번호 확인 검사
  const validateConfirmPassword = () => {
    return password === confirmPassword;
  };

    // 이메일 중복 체크 함수
  const checkEmailDuplicate = async (email) => {
    if (!email || email.length < 5) {
      const result = {
        isValid: false,
        message: '이메일을 입력해주세요',
        type: 'empty'
      };
      setEmailValidation(result);
      return result;
    }

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      const result = {
        isValid: false,
        message: '올바른 이메일 형식을 입력해주세요',
        type: 'invalid'
      };
      setEmailValidation(result);
      return result;
    }

    setIsCheckingEmail(true);

    try {
      const response = await fetch('/api/auth/check-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error('API 호출 실패');
      }

      const data = await response.json();

      const result = {
        isValid: !data.isDuplicate,
        message: data.message,
        type: data.isDuplicate ? 'duplicate' : 'available',
        duplicateInfo: data.duplicateInfo
      };

      setEmailValidation(result);

      // Toast 메시지 표시 (가입 방식 구분 안내)
      if (data.isDuplicate) {
        const providerName = data.duplicateInfo?.providerName || '이메일';
        if (providerName === '카카오톡') {
          toast.error(`이미 카카오톡으로 가입된 이메일입니다.`);
        } else {
          toast.error(`이미 이메일로 가입된 이메일입니다.`);
        }
      } else {
        toast.success(data.message);
      }

      return result;
    } catch (error) {
      console.error('이메일 중복 확인 오류:', error);
      const result = {
        isValid: false,
        message: '이메일 확인 중 오류가 발생했습니다',
        type: 'error'
      };
      setEmailValidation(result);
      toast.error('이메일 확인 중 오류가 발생했습니다');
      return result;
    } finally {
      setIsCheckingEmail(false);
    }
  };

  // 이메일 변경 시 중복 체크
  const handleEmailChange = (value) => {
    setEmail(value);

    // 이메일 에러 메시지 제거
    if (errors.email) {
      setErrors(prev => ({ ...prev, email: '' }));
    }

    // 이메일 유효성 검사 초기화
    setEmailValidation(null);

    // 기존 타이머 클리어
    if (emailTimeoutRef.current) {
      clearTimeout(emailTimeoutRef.current);
    }

    // 이메일 중복 체크 실행
    if (value) {
      // 디바운스 적용 (500ms 후 중복 체크)
      emailTimeoutRef.current = setTimeout(() => {
        checkEmailDuplicate(value);
      }, 500);
    }
  };

  // 컴포넌트 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      if (emailTimeoutRef.current) {
        clearTimeout(emailTimeoutRef.current);
      }
    };
  }, []);

  // 입력값 변경 시 유효성 검사
  const handlePasswordChange = (value) => {
    setPassword(value);
    const validation = validatePassword(value);
    setErrors(prev => ({
      ...prev,
      password: validation
    }));
  };

  const handleConfirmPasswordChange = (value) => {
    setConfirmPassword(value);
    setErrors(prev => ({
      ...prev,
      confirmPassword: validateConfirmPassword()
    }));
  };

  // 다음 단계로 진행
  const handleNext = async () => {
    const passwordValidation = validatePassword(password);
    const confirmPasswordValidation = validateConfirmPassword();

    if (!email) {
      setErrors(prev => ({ ...prev, email: '이메일을 입력해주세요.' }));
      return;
    }

    // 이메일 중복 체크가 완료되지 않은 경우
    if (!emailValidation) {
      setErrors(prev => ({ ...prev, email: '이메일 중복 확인을 완료해주세요.' }));
      return;
    }

    // 이메일이 중복인 경우
    if (!emailValidation.isValid) {
      setErrors(prev => ({ ...prev, email: emailValidation.message }));
      return;
    }

    if (!passwordValidation.isValid) {
      setErrors(prev => ({ ...prev, password: passwordValidation }));
      return;
    }

    if (!confirmPasswordValidation) {
      setErrors(prev => ({ ...prev, confirmPassword: false }));
      return;
    }

    // 브라우저 세션 스토리지에 임시 저장 (보안을 위해 세션 스토리지 사용)
    sessionStorage.setItem('signup_email', email);
    sessionStorage.setItem('signup_password', password);

    // 다음 단계로 이동 (추가 정보 입력 페이지)
    router.push('/signup/additional-info');
  };

  const passwordValidation = validatePassword(password);
  const confirmPasswordValidation = validateConfirmPassword();

  // 인증 상태 로딩 중일 때 로딩 화면 표시
  if (authLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-yellow-500 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">로그인 상태 확인 중...</h2>
          <p className="text-gray-500">잠시만 기다려주세요.</p>
        </div>
      </div>
    );
  }

  // 이미 로그인된 사용자는 리다이렉트 처리 (useEffect에서 처리되지만 추가 안전장치)
  if (user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-yellow-500 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">메인 페이지로 이동 중...</h2>
          <p className="text-gray-500">이미 로그인되어 있습니다.</p>
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
          <h1 className="text-22-m text-black">회원가입</h1>
        </div>

        {/* 진행 단계 표시 */}
        <div className="absolute bottom-[10px] left-[50px] flex justify-start mt-4 space-x-[4px]">
          <div className="w-2 h-2 rounded-full bg-brand-point"></div>
          <div className="w-2 h-2 rounded-full bg-gray-300"></div>
        </div>
      </div>

      {/* 메인 컨텐츠 */}
      <div className="px-6 py-8">
        <div className="space-y-[24px]">
          {/* 이메일 입력 */}
          <div>
            <label className="block texgt-16-m text-black mb-[10px]">
              이메일
            </label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => handleEmailChange(e.target.value)}
                placeholder="이메일을 입력해주세요."
                className={`w-full h-[54px] px-[18px] border rounded-[15px] focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-colors ${
                  errors.email
                    ? 'border-brand-point bg-brand-point-bg'
                    : emailValidation?.isValid
                    ? 'border-[#2BA03E] bg-green-50'
                    : emailValidation?.isValid === false
                    ? 'border-brand-point bg-brand-point-bg'
                    : 'border-gray-300'
                } focus:bg-[#FFD044] focus:bg-opacity-20`}
              />

              {/* 이메일 상태 아이콘 */}
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                {isCheckingEmail ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-yellow-500"></div>
                ) : emailValidation?.isValid ? (
                  <svg className="w-5 h-5 text-[#2BA03E]" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : emailValidation?.isValid === false ? (
                  <svg className="w-5 h-5 text-brand-point" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                ) : null}
              </div>
            </div>

            {/* 이메일 상태 메시지 */}
            {errors.email && (
              <p className="mt-[6px] text-9-r text-brand-point">{errors.email}</p>
            )}

            {emailValidation && !errors.email && (
              <p className={`mt-[6px] text-9-r flex items-center ${
                emailValidation.isValid ? 'text-[#2BA03E]' : 'text-brand-point'
              }`}>
                {emailValidation.message}
              </p>
            )}
          </div>

          {/* 비밀번호 입력 */}
          <div>
            <label className="block texgt-16-m text-black mb-[10px]">
              비밀번호
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => handlePasswordChange(e.target.value)}
                placeholder="8~12자, 영문+숫자"
                                className={`w-full h-[54px] px-[18px] border rounded-[15px] focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-colors ${
                  password && passwordValidation.isValid
                    ? 'border-yellow-400 bg-yellow-50'
                    : password && !passwordValidation.isValid
                    ? 'border-brand-point bg-brand-point-bg'
                    : 'border-gray-300'
                } focus:bg-[#FFD044] focus:bg-opacity-20`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={`absolute right-3 top-1/2 transform -translate-y-1/2 transition-colors ${
                  password && passwordValidation.isValid
                    ? 'text-yellow-500'
                    : password && !passwordValidation.isValid
                    ? 'text-brand-point'
                    : 'text-gray-400'
                } hover:opacity-80`}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {/* 비밀번호 요구사항 - 실시간 상태 표시 */}
            {password && (
              <div className="mt-2">
                <div className="flex items-center space-x-4">
                  <div className={`text-9-r flex items-center ${
                    passwordValidation.hasEnglish ? 'text-[#2BA03E]' : 'text-brand-point'
                  }`}>
                    영문 포함
                  </div>
                  <div className={`text-9-r flex items-center ${
                    passwordValidation.hasNumber ? 'text-[#2BA03E]' : 'text-brand-point'
                  }`}>
                    숫자 포함
                  </div>
                  <div className={`text-9-r flex items-center ${
                    passwordValidation.hasValidLength ? 'text-[#2BA03E]' : 'text-brand-point'
                  }`}>
                    8~12자
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 비밀번호 확인 */}
          <div>
            <label className="block texgt-16-m text-black mb-[10px]">
              비밀번호 확인
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => handleConfirmPasswordChange(e.target.value)}
                placeholder="8~12자, 영문+숫자"
                className={`w-full h-[54px] px-[18px] border rounded-[15px] focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-colors ${
                  confirmPassword && confirmPasswordValidation
                    ? 'border-[#2BA03E] bg-green-50'
                    : confirmPassword && !confirmPasswordValidation
                    ? 'border-brand-point bg-brand-point-bg'
                    : 'border-gray-300'
                } focus:bg-[#FFD044] focus:bg-opacity-20`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className={`absolute right-3 top-1/2 transform -translate-y-1/2 transition-colors ${
                  confirmPassword && confirmPasswordValidation
                    ? 'text-[#2BA03E]'
                    : confirmPassword && !confirmPasswordValidation
                    ? 'text-brand-point'
                    : 'text-gray-400'
                } hover:opacity-80`}
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {/* 비밀번호 확인 메시지 - 실시간 상태 표시 */}
            {confirmPassword && (
              <div className="mt-[6px]">
                {confirmPasswordValidation ? (
                  <p className="text-9-r text-[#2BA03E] flex items-center">
                    비밀번호가 일치합니다.
                  </p>
                ) : (
                  <p className="text-9-r text-brand-point flex items-center">
                    동일한 비밀번호를 입력해주세요.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* 다음 버튼 */}
        <button
          onClick={handleNext}
          disabled={!email || !emailValidation?.isValid || !passwordValidation.isValid || !confirmPasswordValidation}
          className={`w-full mt-8 h-[58px] rounded-[15px] text-16-m transition-colors ${
            email && emailValidation?.isValid && passwordValidation.isValid && confirmPasswordValidation
              ? 'bg-brand-main text-black'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          다음
        </button>
      </div>
    </div>
  );
};

export default SignupPage;
