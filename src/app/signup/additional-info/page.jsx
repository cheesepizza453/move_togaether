'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import UserProfileForm from '@/components/UserProfileForm';
import IconLoading from "../../../../public/img/icon/IconLoading";

// useSearchParams를 사용하는 컴포넌트를 별도로 분리
const AdditionalInfoContent = () => {
  const [formData, setFormData] = useState({
    nickname: '',
    introduction: '',
    phone: '',
    securityQuestion: '',
    securityAnswer: '',
  });

  const [contactChannels, setContactChannels] = useState({
    instagram: false,
    naverCafe: false,
    kakaoOpenChat: false,
  });

  const [channelInputs, setChannelInputs] = useState({
    instagram: '',
    naverCafe: '',
    kakaoOpenChat: '',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [nicknameValidation, setNicknameValidation] = useState(null);
  const [signupData, setSignupData] = useState(null);
  const [nicknameChecking, setNicknameChecking] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const { signUp, checkNicknameDuplicate } = useAuth();

  // 첫 번째 페이지에서 전달받은 정보 확인 (세션 스토리지에서)
  useEffect(() => {
    const email = sessionStorage.getItem('signup_email');
    const password = sessionStorage.getItem('signup_password');

    if (!email || !password) {
      router.push('/signup');
      return;
    }

    setSignupData({ email, password });
  }, [router]);

  // 닉네임 유효성 검사
  const validateNickname = (nickname) => {
    const trimmed = nickname.trim();
    if (!trimmed) return null;

    const hasSpecialChar =
        /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(trimmed);
    const isValidLength = trimmed.length >= 2 && trimmed.length <= 20;

    if (hasSpecialChar) {
      return {
        isValid: false,
        message: '특수문자 사용 불가',
        type: 'special_char',
      };
    }

    if (!isValidLength) {
      return {
        isValid: false,
        message: '2-20자로 입력해주세요',
        type: 'length',
      };
    }

    // 형식만 통과했을 때
    return {
      isValid: true,
      message: '멋진 닉네임을 지어주세요🐾',
      type: 'success',
    };
  };


  // 닉네임 변경 시 유효성 검사
  const handleNicknameChange = (value) => {
    setFormData((prev) => ({ ...prev, nickname: value }));

    const trimmed = value.trim();

    if (!trimmed) {
      setNicknameValidation(null);
      setErrors((prev) => ({ ...prev, nickname: '' }));
      return;
    }

    const validation = validateNickname(trimmed);
    setNicknameValidation(validation);

    setErrors((prev) => ({
      ...prev,
      nickname: validation && !validation.isValid ? validation.message : '',
    }));
  };


  // 닉네임 blur 이벤트로 중복 체크
  const handleNicknameBlur = async (value) => {
    const trimmed = value.trim();
    if (!trimmed) return;

    // 로컬 유효성 통과 못하면 중복체크 안 함
    if (!nicknameValidation || !nicknameValidation.isValid) {
      return;
    }

    setNicknameChecking(true);
    try {
      const result = await checkNicknameDuplicate(trimmed);

      if (result.isDuplicate) {
        const message = result.message || '이미 사용 중인 닉네임입니다';
        setNicknameValidation({
          isValid: false,
          message,
          type: 'duplicate',
          available: false,
        });
        setErrors((prev) => ({ ...prev, nickname: message }));
      } else {
        const message = result.message || '사용 가능한 닉네임입니다';
        setNicknameValidation({
          isValid: true,
          message,
          type: 'success',
          available: true,
        });
        setErrors((prev) => ({ ...prev, nickname: '' }));
      }
    } catch (error) {
      console.error('닉네임 중복 체크 오류:', error);
      const message = '중복 체크 중 오류가 발생했습니다';
      setNicknameValidation({
        isValid: false,
        message,
        type: 'error',
        available: false,
      });
      setErrors((prev) => ({ ...prev, nickname: message }));
    } finally {
      setNicknameChecking(false);
    }
  };

  // 인스타그램 username 검증
  // 규칙: 영문 소문자 + 숫자 + 언더바(_)만 허용, 1~30자, 한글 X, URL X
  const isValidInstagramUsername = (value) => {
    if (!value) return false;

    // 한글 포함 여부
    const hasKorean = /[가-힣]/.test(value);
    if (hasKorean) return false;

    // 인스타그램 유저네임 패턴
    const regex = /^[a-z0-9._]{1,30}$/;
    return regex.test(value);
  };

  // 카카오 옵챗 URL 검증: http(s) + 한글 없음
  const isValidUrl = (value) => {
    if (!value) return false;
    const lower = value.toLowerCase();
    const hasValidProtocol =
        lower.startsWith('http://') || lower.startsWith('https://');
    const hasKorean = /[가-힣]/.test(value);

    return hasValidProtocol && !hasKorean;
  };

  //// 폼 유효성 검사용 헬퍼들

  // 전화번호 검증
  const validatePhone = (phone) => {
    const value = (phone || '').trim();
    if (!value) return '연락처를 입력해주세요.';
    if (value.length < 10) return '연락처를 정확히 입력해주세요.';
    return '';
  };

  // 보안 질문 검증
  const validateSecurityQuestionField = (q) => {
    if (!q) return '보안 질문을 선택해주세요.';
    return '';
  };

  // 보안 답변 검증
  const validateSecurityAnswerField = (answer) => {
    const value = (answer || '').trim();
    if (!value) return '보안 질문 답변을 입력해주세요.';
    if (value.length < 2) return '답변은 2자 이상 입력해주세요.';
    return '';
  };

  // 인스타그램 입력 검증
  const validateInstagramField = (enabled, value) => {
    if (!enabled) return '';

    const ig = (value || '').trim();

    if (!ig) {
      return '인스타그램 ID(영문 유저네임)를 입력해주세요.';
    } else if (/http(s)?:\/\//i.test(ig)) {
      return 'URL이 아닌 인스타그램 ID(영문 유저네임)을 입력해주세요.';
    } else if (!isValidInstagramUsername(ig)) {
      return '영문 소문자, 숫자, 온점(.), 언더바(_)만 사용해 1~30자로 입력해주세요.';
    }

    return '';
  };

  // 카카오 오픈채팅 검증
  const validateKakaoField = (enabled, value) => {
    if (!enabled) return '';

    const kakao = (value || '').trim();

    if (!kakao) {
      return '카카오톡 오픈채팅 링크를 입력해주세요.';
    } else if (!isValidUrl(kakao)) {
      return '한글 없이 https:// 로 시작하는 오픈채팅 링크를 입력해주세요.';
    }

    return '';
  };

  // 연락채널 선택 변경
  const handleChannelChange = (channel) => {
    setContactChannels((prev) => {
      const next = { ...prev, [channel]: !prev[channel] };

      // 끌 때 입력값/에러 같이 초기화
      if (!next[channel]) {
        setChannelInputs((prevInputs) => ({ ...prevInputs, [channel]: '' }));
        setErrors((prevErrors) => ({ ...prevErrors, [channel]: '' }));
      }

      return next;
    });
  };

  // 채널 입력값 변경 (실시간 검증 포함)
  const handleChannelInputChange = (channel, value) => {
    setChannelInputs((prev) => ({
      ...prev,
      [channel]: value,
    }));

    setErrors((prev) => {
      const newErrors = { ...prev };

      if (channel === 'instagram') {
        newErrors.instagram = validateInstagramField(
            contactChannels.instagram,
            value
        );
      }

      if (channel === 'kakaoOpenChat') {
        newErrors.kakaoOpenChat = validateKakaoField(
            contactChannels.kakaoOpenChat,
            value
        );
      }

      return newErrors;
    });
  };

  // 전화번호 변경 (실시간 검증)
  const handlePhoneChange = (value) => {
    const onlyNumbers = value.replace(/[^0-9]/g, '');
    setFormData((prev) => ({ ...prev, phone: onlyNumbers }));

    const msg = validatePhone(onlyNumbers);
    setErrors((prev) => ({ ...prev, phone: msg }));
  };

  // 보안 질문 변경 (실시간 검증)
  const handleSecurityQuestionChange = (value) => {
    setFormData((prev) => ({ ...prev, securityQuestion: value }));
    const msg = validateSecurityQuestionField(value);
    setErrors((prev) => ({ ...prev, securityQuestion: msg }));
  };

  // 보안 답변 변경 (실시간 검증)
  const handleSecurityAnswerChange = (value) => {
    setFormData((prev) => ({ ...prev, securityAnswer: value }));
    const msg = validateSecurityAnswerField(value);
    setErrors((prev) => ({ ...prev, securityAnswer: msg }));
  };

  // 최종 폼 유효성 검사 (가입 버튼 클릭 시)
  const validateForm = () => {
    const newErrors = {};

    // 닉네임
    if (!formData.nickname.trim()) {
      newErrors.nickname = '닉네임을 입력해주세요.';
    } else if (nicknameValidation && !nicknameValidation.isValid) {
      newErrors.nickname = nicknameValidation.message;
    }

    // 전화번호
    const phoneError = validatePhone(formData.phone);
    if (phoneError) newErrors.phone = phoneError;

    // 보안 질문
    const sqError = validateSecurityQuestionField(formData.securityQuestion);
    if (sqError) newErrors.securityQuestion = sqError;

    // 보안 답변
    const saError = validateSecurityAnswerField(formData.securityAnswer);
    if (saError) newErrors.securityAnswer = saError;

    // 인스타그램
    const igError = validateInstagramField(
        contactChannels.instagram,
        channelInputs.instagram
    );
    if (igError) newErrors.instagram = igError;

    // 카카오톡 오픈채팅
    const kakaoError = validateKakaoField(
        contactChannels.kakaoOpenChat,
        channelInputs.kakaoOpenChat
    );
    if (kakaoError) newErrors.kakaoOpenChat = kakaoError;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 회원가입 완료
  const handleSignup = async () => {
    if (!validateForm()) {
      return;
    }

    if (!signupData) {
      setErrors({ general: '회원가입 정보가 누락되었습니다.' });
      return;
    }

    setLoading(true);

    try {
      const result = await signUp({
        email: signupData.email,
        password: signupData.password,
        nickname: formData.nickname,
        introduction: formData.introduction,
        phone: formData.phone,
        contactChannels,
        channelInputs,
        securityQuestion: formData.securityQuestion,
        securityAnswer: formData.securityAnswer,
      });

      if (result.success) {
        // 세션 스토리지 정리 (보안을 위해)
        sessionStorage.removeItem('signup_email');
        sessionStorage.removeItem('signup_password');

        // 성공 메시지 표시
        toast.success('회원가입이 완료되었습니다! 이메일을 확인해주세요.');

        // 회원가입 성공 - 이메일 인증 안내 페이지로 이동 (닉네임 전달)
        router.push(
            `/signup/success?nickname=${encodeURIComponent(formData.nickname)}`
        );
      } else {
        toast.error(result.error || '회원가입 중 오류가 발생했습니다.');
        setErrors({
          general: result.error || '회원가입 중 오류가 발생했습니다.',
        });
      }
    } catch (error) {
      console.error('회원가입 오류:', error);
      toast.error('회원가입 중 오류가 발생했습니다.');
      setErrors({ general: '회원가입 중 오류가 발생했습니다.' });
    } finally {
      setLoading(false);
    }
  };

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
            <div className="w-2 h-2 rounded-full bg-brand-point"></div>
          </div>
        </div>

        {/* 메인 컨텐츠 */}
        <div className="px-6 py-8">
          <UserProfileForm
              formData={formData}
              setFormData={setFormData}
              contactChannels={contactChannels}
              setContactChannels={setContactChannels}
              channelInputs={channelInputs}
              setChannelInputs={setChannelInputs}
              errors={errors}
              setErrors={setErrors}
              nicknameValidation={nicknameValidation}
              nicknameChecking={nicknameChecking}
              onNicknameChange={handleNicknameChange}
              onNicknameBlur={handleNicknameBlur}
              onChannelChange={handleChannelChange}
              onChannelInputChange={handleChannelInputChange}
              onProfileImageChange={() => {}} // 회원가입에서는 프로필 이미지 변경 불가
              onPhoneChange={handlePhoneChange}
              onSecurityQuestionChange={handleSecurityQuestionChange}
              onSecurityAnswerChange={handleSecurityAnswerChange}
              mode="signup"
              showProfileImage={true}
              showIntroduction={true}
              showPhone={true}
              showSocialChannels={true}
              showSecurityQuestion={true}
              showTerms={true}
          />

          {/* 회원가입 완료 버튼 */}
          <button
              onClick={handleSignup}
              disabled={loading}
              className={`w-full mt-8 h-[54px] rounded-[15px] text-16-m transition-colors ${
                  loading
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-brand-main text-black hover:bg-yellow-500'
              }`}
          >
            {loading ? '처리 중...' : '가입하기'}
          </button>
        </div>
      </div>
  );
};

// 로딩 컴포넌트
const LoadingFallback = () => (
    <div className="min-h-screen bg-white flex justify-center">
      <div className={'w-full flex justify-center pt-[20vh]'}>
        <IconLoading/>
      </div>
    </div>
);

// 메인 컴포넌트 - Suspense로 감싸기
const AdditionalInfoPage = () => {
  return (
      <Suspense fallback={<LoadingFallback/>}>
        <AdditionalInfoContent/>
      </Suspense>
  );
};

export default AdditionalInfoPage;
