'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';

const SignupPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
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
  const handleNext = () => {
    const passwordValidation = validatePassword(password);
    const confirmPasswordValidation = validateConfirmPassword();

    if (!email) {
      setErrors(prev => ({ ...prev, email: '이메일을 입력해주세요.' }));
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
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="이메일을 입력해주세요."
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-colors ${
                errors.email ? 'border-red-500 bg-red-50' : 'border-gray-300'
              } focus:bg-[#FFDD44] focus:bg-opacity-20`}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-500">{errors.email}</p>
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
          disabled={!email || !passwordValidation.isValid || !confirmPasswordValidation}
          className={`w-full mt-8 py-3 rounded-lg font-semibold transition-colors ${
            email && passwordValidation.isValid && confirmPasswordValidation
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
