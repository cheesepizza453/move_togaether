'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import SignupForm from '@/components/signup/SignupForm';


const KakaoSignupPage = () => {
  const [loading, setLoading] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
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
  const [nicknameValidation, setNicknameValidation] = useState(null);
  const [nicknameChecking, setNicknameChecking] = useState(false);
  const router = useRouter();
  const { user, loading: authLoading, signUpWithKakao, signInWithKakao, checkNicknameDuplicate } = useAuth();

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

  useEffect(() => {
    // URL에서 카카오톡 인증 코드 확인
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const error = urlParams.get('error');

    if (error) {
      toast.error('카카오톡 인증에 실패했습니다.');
      router.push('/login');
      return;
    }

    if (code) {
      handleKakaoCallback(code);
    } else {
      // sessionStorage에서 카카오톡 사용자 정보 가져오기 (기존 방식)
      const kakaoUserInfo = sessionStorage.getItem('kakaoUserInfo');

      if (kakaoUserInfo) {
        try {
          const userInfo = JSON.parse(kakaoUserInfo);
          setUserInfo(userInfo);
          setFormData(prev => ({
            ...prev,
            nickname: userInfo.nickname || userInfo.name || ''
          }));
          toast.success('카카오톡 인증이 완료되었습니다.');
        } catch (error) {
          console.error('사용자 정보 파싱 오류:', error);
          toast.error('사용자 정보를 불러올 수 없습니다.');
          router.push('/login');
        }
      } else {
        toast.error('카카오톡 인증 정보가 없습니다.');
        router.push('/login');
      }
    }
  }, [router]);

  const handleKakaoCallback = async (code) => {
    try {
      setLoading(true);

      // 카카오톡 인증 코드로 사용자 정보 가져오기
      const response = await fetch('/api/auth/kakao/callback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      });

      const result = await response.json();

      if (result.success) {
        setUserInfo(result.userInfo);
        setFormData(prev => ({
          ...prev,
          nickname: result.userInfo.nickname || result.userInfo.name || ''
        }));
        toast.success('카카오톡 인증이 완료되었습니다.');
      } else {
        toast.error(result.error || '카카오톡 인증에 실패했습니다.');
        router.push('/login');
      }
    } catch (error) {
      console.error('카카오톡 콜백 처리 오류:', error);
      toast.error('카카오톡 인증 처리 중 오류가 발생했습니다.');
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };



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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      const result = await signUpWithKakao({
        userInfo,
        nickname: formData.nickname,
        introduction: formData.introduction,
        phone: formData.phone,
        contactChannels,
        channelInputs
      });

      if (result.success) {
        // sessionStorage 정리
        sessionStorage.removeItem('kakaoUserInfo');
        toast.success('회원가입이 완료되었습니다!');

        // 가입 성공 후 리다이렉트 경로 확인
        const redirectPath = sessionStorage.getItem('redirectAfterLogin');
        if (redirectPath) {
          console.log('저장된 리다이렉트 경로로 이동:', redirectPath);
          sessionStorage.removeItem('redirectAfterLogin');
          router.push(redirectPath);
        } else {
          console.log('기본 경로로 이동: 마이페이지');
          router.push('/mypage');
        }
      } else {
        // 기존 사용자인 경우 로그인 처리
        if (result.needsLogin && result.isExistingUser) {
          toast.info('이미 가입된 계정입니다. 로그인을 진행합니다.');

          // 카카오톡 로그인 시도
          const loginResult = await signInWithKakao({ userInfo });

          if (loginResult.success) {
            sessionStorage.removeItem('kakaoUserInfo');
            toast.success('카카오톡 로그인이 완료되었습니다!');

            // 로그인 성공 후 리다이렉트 경로 확인
            const redirectPath = sessionStorage.getItem('redirectAfterLogin');
            if (redirectPath) {
              console.log('저장된 리다이렉트 경로로 이동:', redirectPath);
              sessionStorage.removeItem('redirectAfterLogin');
              router.push(redirectPath);
            } else {
              console.log('기본 경로로 이동: 마이페이지');
              router.push('/mypage');
            }
            return;
          } else {
            toast.error(loginResult.error || '로그인에 실패했습니다.');
            return;
          }
        }

        // 개선된 에러 메시지 표시 (가입 방식 구분 안내)
        const errorMessage = result.error || '회원가입에 실패했습니다.';
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error('카카오톡 회원가입 오류:', error);
      toast.error('회원가입 처리 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 인증 상태 로딩 중일 때 로딩 화면 표시
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-yellow-500 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">메인 페이지로 이동 중...</h2>
          <p className="text-gray-500">이미 로그인되어 있습니다.</p>
        </div>
      </div>
    );
  }

  if (loading && !userInfo) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-yellow-500 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">카카오톡 인증 중...</h2>
          <p className="text-gray-500">잠시만 기다려주세요.</p>
        </div>
      </div>
    );
  }

  if (!userInfo) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-700 mb-2">인증 정보를 불러올 수 없습니다</h2>
          <p className="text-gray-500 mb-4">다시 시도해주세요.</p>
          <button
            onClick={() => router.push('/login')}
            className="bg-yellow-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-yellow-600 transition-colors"
          >
            로그인 페이지로 돌아가기
          </button>
        </div>
      </div>
    );
  }

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
          <h1 className="text-lg font-semibold">카카오톡 간편 가입</h1>
        </div>

        {/* 진행 단계 표시 */}
        <div className="flex justify-center mt-4 space-x-2">
          <div className="w-2 h-2 rounded-full bg-gray-300"></div>
          <div className="w-2 h-2 rounded-full bg-red-500"></div>
        </div>
      </div>

      {/* 카카오톡 사용자 정보 */}
      <div className="px-6 py-4 bg-yellow-50 border-b border-yellow-200">
        <div className="flex items-center space-x-3">
          <img
            src={userInfo.profile_image || '/img/default_profile.jpg'}
            alt="프로필"
            className="w-12 h-12 rounded-full"
          />
          <div>
            <p className="font-semibold text-gray-800">{userInfo.nickname || userInfo.name}</p>
            <p className="text-sm text-gray-600">{userInfo.email}</p>
          </div>
        </div>
      </div>

      {/* 메인 컨텐츠 */}
      <div className="px-6 py-8">
        <form onSubmit={handleSubmit}>
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
            showProfileImage={false}
            showIntroduction={true}
          />

          {/* 회원가입 완료 버튼 */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full mt-8 py-3 rounded-lg font-semibold transition-colors ${
              loading
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-[#FFDD44] text-black hover:bg-yellow-500'
            }`}
          >
            {loading ? '가입 중...' : '가입하기'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default KakaoSignupPage;
