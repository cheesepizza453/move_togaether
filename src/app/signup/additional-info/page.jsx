'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import SignupForm from '@/components/signup/SignupForm';

// useSearchParams를 사용하는 컴포넌트를 별도로 분리
const AdditionalInfoContent = () => {
  const [formData, setFormData] = useState({
    nickname: '',
    introduction: '',
    phone: ''
  });

  const [contactChannels, setContactChannels] = useState({
    instagram: false,
    naverCafe: false,
    kakaoOpenChat: false
  });

  const [channelInputs, setChannelInputs] = useState({
    instagram: '',
    naverCafe: '',
    kakaoOpenChat: ''
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
    if (!nickname.trim()) return null;

    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(nickname);
    const isValidLength = nickname.length >= 2 && nickname.length <= 20;

    if (hasSpecialChar) {
      return {
        isValid: false,
        message: '특수문자 사용 불가',
        type: 'special_char'
      };
    }

    if (!isValidLength) {
      return {
        isValid: false,
        message: '2-20자로 입력해주세요',
        type: 'length'
      };
    }

    return {
      isValid: true,
      message: '사용 가능한 닉네임입니다',
      type: 'success'
    };
  };

  // 닉네임 변경 시 유효성 검사
  const handleNicknameChange = (value) => {
    setFormData(prev => ({ ...prev, nickname: value }));

    if (value.trim()) {
      const validation = validateNickname(value);
      setNicknameValidation(validation);
    } else {
      setNicknameValidation(null);
    }

    // 에러 메시지 제거
    if (errors.nickname) {
      setErrors(prev => ({ ...prev, nickname: '' }));
    }
  };

  // 닉네임 blur 이벤트로 중복 체크
  const handleNicknameBlur = async (value) => {
    console.log('닉네임 blur 이벤트 발생:', value);
    console.log('현재 nicknameValidation:', nicknameValidation);

    if (!value.trim() || nicknameValidation?.type !== 'success') {
      console.log('닉네임 중복 체크 건너뜀 - 조건 불만족');
      return;
    }

    console.log('닉네임 중복 체크 시작');
    setNicknameChecking(true);
    try {
      const result = await checkNicknameDuplicate(value);
      console.log('닉네임 중복 체크 결과:', result);

      if (result.isDuplicate) {
        setNicknameValidation({
          isValid: false,
          message: result.message,
          type: 'duplicate'
        });
      } else {
        setNicknameValidation({
          isValid: true,
          message: result.message,
          type: 'success'
        });
      }
    } catch (error) {
      console.error('닉네임 중복 체크 오류:', error);
    } finally {
      setNicknameChecking(false);
    }
  };

  // 연락채널 선택 변경
  const handleChannelChange = (channel) => {
    setContactChannels(prev => ({
      ...prev,
      [channel]: !prev[channel]
    }));

    // 채널 해제 시 입력값 초기화
    if (contactChannels[channel]) {
      setChannelInputs(prev => ({
        ...prev,
        [channel]: ''
      }));
    }
  };

  // 채널 입력값 변경
  const handleChannelInputChange = (channel, value) => {
    setChannelInputs(prev => ({
      ...prev,
      [channel]: value
    }));
  };


  // 폼 유효성 검사
  const validateForm = () => {
    const newErrors = {};

    if (!formData.nickname.trim()) {
      newErrors.nickname = '닉네임을 입력해주세요.';
    } else if (nicknameValidation && !nicknameValidation.isValid) {
      newErrors.nickname = nicknameValidation.message;
    }

    if (!formData.phone.trim()) {
      newErrors.phone = '연락처를 입력해주세요.';
    }

    // 선택된 채널에 대한 입력값 검증
    if (contactChannels.instagram && !channelInputs.instagram.trim()) {
      newErrors.instagram = '인스타그램 ID를 입력해주세요.';
    }
    if (contactChannels.naverCafe && !channelInputs.naverCafe.trim()) {
      newErrors.naverCafe = '네이버 카페 링크를 입력해주세요.';
    }
    if (contactChannels.kakaoOpenChat && !channelInputs.kakaoOpenChat.trim()) {
      newErrors.kakaoOpenChat = '카카오톡 오픈채팅 링크를 입력해주세요.';
    }

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
        channelInputs
      });

      if (result.success) {
        // 세션 스토리지 정리 (보안을 위해)
        sessionStorage.removeItem('signup_email');
        sessionStorage.removeItem('signup_password');

        // 성공 메시지 표시
        toast.success('회원가입이 완료되었습니다! 이메일을 확인해주세요.');

        // 회원가입 성공 - 이메일 인증 안내 페이지로 이동
        router.push('/signup/success');
      } else {
        // 에러 메시지를 Toast로 표시
        toast.error(result.error || '회원가입 중 오류가 발생했습니다.');
        setErrors({ general: result.error || '회원가입 중 오류가 발생했습니다.' });
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
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="flex items-center">
          <Link href="/signup" className="mr-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 18L9 12L15 6" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
          <h1 className="text-lg font-semibold">회원가입</h1>
        </div>

        {/* 진행 단계 표시 */}
        <div className="flex justify-center mt-4 space-x-2">
          <div className="w-2 h-2 rounded-full bg-gray-300"></div>
          <div className="w-2 h-2 rounded-full bg-red-500"></div>
        </div>
      </div>

      {/* 메인 컨텐츠 */}
      <div className="px-6 py-8">
        <SignupForm
          formData={formData}
          setFormData={setFormData}
          contactChannels={contactChannels}
          setContactChannels={setContactChannels}
          channelInputs={channelInputs}
          setChannelInputs={setChannelInputs}
          errors={errors}
          setErrors={setErrors}
          nicknameValidation={nicknameValidation}
          setNicknameValidation={setNicknameValidation}
          nicknameChecking={nicknameChecking}
          setNicknameChecking={setNicknameChecking}
          onNicknameChange={handleNicknameChange}
          onNicknameBlur={handleNicknameBlur}
          onChannelChange={handleChannelChange}
          onChannelInputChange={handleChannelInputChange}
          showProfileImage={true}
          showIntroduction={true}
        />

        {/* 회원가입 완료 버튼 */}
        <button
          onClick={handleSignup}
          disabled={loading}
          className={`w-full mt-8 py-3 rounded-lg font-semibold transition-colors ${
            loading
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-[#FFDD44] text-black hover:bg-yellow-500'
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
  <div className="min-h-screen bg-white flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500 mx-auto mb-4"></div>
      <p className="text-gray-600">로딩 중...</p>
    </div>
  </div>
);

// 메인 컴포넌트 - Suspense로 감싸기
const AdditionalInfoPage = () => {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <AdditionalInfoContent />
    </Suspense>
  );
};

export default AdditionalInfoPage;
