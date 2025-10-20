'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { SECURITY_QUESTIONS, getSecurityQuestionText } from '@/constants/securityQuestions';

const FindIdPage = () => {
  const router = useRouter();
  const [step, setStep] = useState(1); // 1: 닉네임 입력, 2: 보안 질문/답변, 3: 이메일 확인
  const [formData, setFormData] = useState({
    nickname: '',
    securityQuestion: '',
    securityAnswer: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  // 폼 데이터 변경 핸들러
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // 에러 메시지 제거
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // 1단계: 닉네임 검증
  const validateNickname = () => {
    if (!formData.nickname.trim()) {
      setErrors({ nickname: '닉네임을 입력해주세요.' });
      return false;
    }
    if (formData.nickname.length < 2) {
      setErrors({ nickname: '닉네임은 2자 이상 입력해주세요.' });
      return false;
    }
    return true;
  };

  // 2단계: 보안 질문/답변 검증
  const validateSecurityQuestion = () => {
    const newErrors = {};

    if (!formData.securityQuestion) {
      newErrors.securityQuestion = '보안 질문을 선택해주세요.';
    }
    if (!formData.securityAnswer.trim()) {
      newErrors.securityAnswer = '보안 질문 답변을 입력해주세요.';
    } else if (formData.securityAnswer.length < 2) {
      newErrors.securityAnswer = '답변은 2자 이상 입력해주세요.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 1단계: 닉네임 확인
  const handleNicknameSubmit = async () => {
    if (!validateNickname()) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/auth/check-nickname', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ nickname: formData.nickname })
      });

      const result = await response.json();

      if (result.success) {
        if (result.exists) {
          // 닉네임이 존재하면 2단계로 이동
          setStep(2);
        } else {
          setErrors({ nickname: '존재하지 않는 닉네임입니다.' });
        }
      } else {
        setErrors({ nickname: result.error || '닉네임 확인 중 오류가 발생했습니다.' });
      }
    } catch (error) {
      console.error('닉네임 확인 오류:', error);
      setErrors({ nickname: '닉네임 확인 중 오류가 발생했습니다.' });
    } finally {
      setLoading(false);
    }
  };

  // 2단계: 보안 질문/답변 확인
  const handleSecurityQuestionSubmit = async () => {
    if (!validateSecurityQuestion()) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/auth/verify-security-question', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          nickname: formData.nickname,
          securityQuestion: formData.securityQuestion,
          securityAnswer: formData.securityAnswer
        })
      });

      const result = await response.json();

      if (result.success) {
        if (result.verified) {
          // 보안 질문/답변이 맞으면 이메일 표시
          setUserEmail(result.email);
          setStep(3);
        } else {
          setErrors({ securityAnswer: '보안 질문 답변이 일치하지 않습니다.' });
        }
      } else {
        setErrors({ securityAnswer: result.error || '보안 질문 확인 중 오류가 발생했습니다.' });
      }
    } catch (error) {
      console.error('보안 질문 확인 오류:', error);
      setErrors({ securityAnswer: '보안 질문 확인 중 오류가 발생했습니다.' });
    } finally {
      setLoading(false);
    }
  };

  // 이메일 마스킹 처리 (@ 앞쪽 부분의 50~70% 보여주기)
  const maskEmail = (email) => {
    if (!email) return '';
    const [localPart, domain] = email.split('@');

    // 이메일이 너무 짧으면 그대로 반환
    if (localPart.length <= 2) return email;

    // 3글자 이메일은 첫 글자와 마지막 글자만 보여주기
    if (localPart.length === 3) {
      return `${localPart.charAt(0)}*${localPart.charAt(2)}@${domain}`;
    }

    // 보여줄 글자 수 계산 (길이에 따라 50~70%)
    let showRatio;
    if (localPart.length <= 5) {
      showRatio = 0.6; // 60%
    } else if (localPart.length <= 10) {
      showRatio = 0.65; // 65%
    } else {
      showRatio = 0.7; // 70% (긴 이메일일수록 더 많이 보여줌)
    }

    const showCount = Math.max(2, Math.floor(localPart.length * showRatio));
    const hideCount = localPart.length - showCount;

    // 앞부분과 뒷부분을 보여주고 가운데만 마스킹
    const frontPart = localPart.substring(0, Math.floor(showCount / 2));
    const backPart = localPart.substring(localPart.length - Math.ceil(showCount / 2));
    const maskedPart = '*'.repeat(hideCount);

    const maskedLocal = frontPart + maskedPart + backPart;
    return `${maskedLocal}@${domain}`;
  };

  return (
    <div className="min-h-screen bg-white">
      {/* 헤더 */}
      <div className="relative px-[30px] flex items-center h-[78px]">
        <div className="flex items-center">
          <Link href="/login" className="mr-[12px]">
            <svg xmlns="http://www.w3.org/2000/svg" width="9" height="16" viewBox="0 0 9 16" fill="none">
              <path d="M8 15L1 8" stroke="black" strokeWidth="2" strokeMiterlimit="10" strokeLinecap="round"/>
              <path d="M8 0.999999L1 8" stroke="black" strokeWidth="2" strokeMiterlimit="10" strokeLinecap="round"/>
            </svg>
          </Link>
          <h1 className="text-22-m text-black">아이디 찾기</h1>
        </div>
      </div>

      {/* 메인 컨텐츠 */}
      <div className="px-6 py-8">
        {/* 진행 단계 표시 */}
        <div className="flex justify-center mb-8">
          <div className="flex space-x-2">
            {[1, 2, 3].map((stepNum) => (
              <div
                key={stepNum}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step >= stepNum
                    ? 'bg-brand-main text-black'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {stepNum}
              </div>
            ))}
          </div>
        </div>

        {/* 1단계: 닉네임 입력 */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-bold text-gray-800 mb-2">닉네임 입력</h2>
              <p className="text-sm text-gray-500">
                가입 시 사용한 닉네임을 입력해주세요.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                닉네임 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.nickname}
                onChange={(e) => handleInputChange('nickname', e.target.value)}
                placeholder="닉네임을 입력해주세요"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-main focus:border-transparent"
                maxLength={20}
              />
              {errors.nickname && (
                <p className="text-xs text-red-500 mt-1">{errors.nickname}</p>
              )}
            </div>

            <button
              onClick={handleNicknameSubmit}
              disabled={loading}
              className="w-full h-[54px] bg-brand-main text-gray-800 rounded-[15px] font-medium disabled:bg-gray-300 disabled:text-gray-500"
            >
              {loading ? '확인 중...' : '다음'}
            </button>
          </div>
        )}

        {/* 2단계: 보안 질문/답변 */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-bold text-gray-800 mb-2">보안 질문 확인</h2>
              <p className="text-sm text-gray-500">
                가입 시 설정한 보안 질문에 답해주세요.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                보안 질문 <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.securityQuestion}
                onChange={(e) => handleInputChange('securityQuestion', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-main focus:border-transparent"
              >
                <option value="">보안 질문을 선택해주세요</option>
                {SECURITY_QUESTIONS.map((question) => (
                  <option key={question.id} value={question.id}>
                    {question.question}
                  </option>
                ))}
              </select>
              {errors.securityQuestion && (
                <p className="text-xs text-red-500 mt-1">{errors.securityQuestion}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                보안 질문 답변 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.securityAnswer}
                onChange={(e) => handleInputChange('securityAnswer', e.target.value)}
                placeholder="보안 질문에 대한 답변을 입력해주세요"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-main focus:border-transparent"
                maxLength={50}
              />
              {errors.securityAnswer && (
                <p className="text-xs text-red-500 mt-1">{errors.securityAnswer}</p>
              )}
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setStep(1)}
                className="flex-1 h-[54px] border border-gray-300 text-gray-700 rounded-[15px] font-medium"
              >
                이전
              </button>
              <button
                onClick={handleSecurityQuestionSubmit}
                disabled={loading}
                className="flex-1 h-[54px] bg-brand-main text-gray-800 rounded-[15px] font-medium disabled:bg-gray-300 disabled:text-gray-500"
              >
                {loading ? '확인 중...' : '다음'}
              </button>
            </div>
          </div>
        )}

        {/* 3단계: 이메일 확인 */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-bold text-gray-800 mb-2">아이디 찾기 완료</h2>
              <p className="text-sm text-gray-500">
                가입하신 이메일 주소입니다.
              </p>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg text-center">
              <p className="text-sm text-gray-600 mb-2">가입 이메일</p>
              <p className="text-lg font-medium text-gray-800">
                {maskEmail(userEmail)}
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => router.push('/login')}
                className="w-full h-[54px] bg-brand-main text-gray-800 rounded-[15px] font-medium"
              >
                로그인하기
              </button>
              <button
                onClick={() => router.push('/forgot-password')}
                className="w-full h-[54px] border border-gray-300 text-gray-700 rounded-[15px] font-medium"
              >
                비밀번호 찾기
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FindIdPage;
