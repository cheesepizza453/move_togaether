'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

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
      
      // Toast 메시지 표시
      if (data.isDuplicate) {
        toast.error(data.message);
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

  return (
    <div className="min-h-screen bg-white">
      {/* 헤더 */}
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="flex items-center">
          <Link href="/login" className="mr-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 18L9 12L15 6" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
          <h1 className="text-lg font-semibold">회원가입</h1>
        </div>

        {/* 진행 단계 표시 */}
        <div className="flex justify-center mt-4 space-x-2">
          <div className="w-2 h-2 rounded-full bg-red-500"></div>
          <div className="w-2 h-2 rounded-full bg-gray-300"></div>
        </div>
      </div>

      {/* 메인 컨텐츠 */}
      <div className="px-6 py-8">
        <div className="space-y-6">
          {/* 이메일 입력 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              이메일
            </label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => handleEmailChange(e.target.value)}
                placeholder="이메일을 입력해주세요."
                className={`w-full px-4 py-3 pr-12 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-colors ${
                  errors.email
                    ? 'border-red-500 bg-red-50'
                    : emailValidation?.isValid
                    ? 'border-green-500 bg-green-50'
                    : emailValidation?.isValid === false
                    ? 'border-red-500 bg-red-50'
                    : 'border-gray-300'
                } focus:bg-[#FFDD44] focus:bg-opacity-20`}
              />

              {/* 이메일 상태 아이콘 */}
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                {isCheckingEmail ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-yellow-500"></div>
                ) : emailValidation?.isValid ? (
                  <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : emailValidation?.isValid === false ? (
                  <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                ) : null}
              </div>
            </div>

            {/* 이메일 상태 메시지 */}
            {errors.email && (
              <p className="mt-1 text-sm text-red-500">{errors.email}</p>
            )}

            {emailValidation && !errors.email && (
              <p className={`mt-1 text-sm flex items-center ${
                emailValidation.isValid ? 'text-green-500' : 'text-red-500'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full mr-2 ${
                  emailValidation.isValid ? 'bg-green-500' : 'bg-red-500'
                }`}></span>
                {emailValidation.message}
              </p>
            )}
          </div>

          {/* 비밀번호 입력 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              비밀번호
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => handlePasswordChange(e.target.value)}
                placeholder="8~12자, 영문+숫자"
                                className={`w-full px-4 py-3 pr-12 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-colors ${
                  password && passwordValidation.isValid
                    ? 'border-yellow-400 bg-yellow-50'
                    : password && !passwordValidation.isValid
                    ? 'border-red-500 bg-red-50'
                    : 'border-gray-300'
                } focus:bg-[#FFDD44] focus:bg-opacity-20`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={`absolute right-3 top-1/2 transform -translate-y-1/2 transition-colors ${
                  password && passwordValidation.isValid
                    ? 'text-yellow-500'
                    : password && !passwordValidation.isValid
                    ? 'text-red-500'
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
                  <div className={`text-xs flex items-center ${
                    passwordValidation.hasEnglish ? 'text-green-500' : 'text-red-500'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                      passwordValidation.hasEnglish ? 'bg-green-500' : 'bg-red-500'
                    }`}></span>
                    영문 포함
                  </div>
                  <div className={`text-xs flex items-center ${
                    passwordValidation.hasNumber ? 'text-green-500' : 'text-red-500'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                      passwordValidation.hasNumber ? 'bg-green-500' : 'bg-red-500'
                    }`}></span>
                    숫자 포함
                  </div>
                  <div className={`text-xs flex items-center ${
                    passwordValidation.hasValidLength ? 'text-green-500' : 'text-red-500'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                      passwordValidation.hasValidLength ? 'bg-green-500' : 'bg-red-500'
                    }`}></span>
                    8~12자
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 비밀번호 확인 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              비밀번호 확인
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => handleConfirmPasswordChange(e.target.value)}
                placeholder="8~12자, 영문+숫자"
                className={`w-full px-4 py-3 pr-12 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-colors ${
                  confirmPassword && confirmPasswordValidation
                    ? 'border-green-500 bg-green-50'
                    : confirmPassword && !confirmPasswordValidation
                    ? 'border-red-500 bg-red-50'
                    : 'border-gray-300'
                } focus:bg-[#FFDD44] focus:bg-opacity-20`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className={`absolute right-3 top-1/2 transform -translate-y-1/2 transition-colors ${
                  confirmPassword && confirmPasswordValidation
                    ? 'text-green-500'
                    : confirmPassword && !confirmPasswordValidation
                    ? 'text-red-500'
                    : 'text-gray-400'
                } hover:opacity-80`}
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {/* 비밀번호 확인 메시지 - 실시간 상태 표시 */}
            {confirmPassword && (
              <div className="mt-1">
                {confirmPasswordValidation ? (
                  <p className="text-sm text-green-500 flex items-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-2"></span>
                    비밀번호가 일치합니다.
                  </p>
                ) : (
                  <p className="text-sm text-red-500 flex items-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 mr-2"></span>
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
          className={`w-full mt-8 py-3 rounded-lg font-semibold transition-colors ${
            email && emailValidation?.isValid && passwordValidation.isValid && confirmPasswordValidation
              ? 'bg-[#FFDD44] text-black hover:bg-yellow-500'
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
