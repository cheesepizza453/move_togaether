'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import UserProfileForm from '@/components/UserProfileForm';


const KakaoSignupPage = () => {
  const [loading, setLoading] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [isNewUser, setIsNewUser] = useState(false);
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
  const { loading: authLoading, signUpWithKakao, signInWithKakao, checkNicknameDuplicate } = useAuth();

  // 신규 사용자 가입 과정 중에는 리다이렉트 하지 않음
  // (useAuth 훅의 사용자 상태를 무시하고 자체적으로 관리)

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        console.log('OAuth 콜백 처리 시작');

        // URL에서 세션 정보 가져오기
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.error('세션 가져오기 오류:', error);
          toast.error('인증 처리 중 오류가 발생했습니다.');
          router.push('/login');
          return;
        }

        if (data.session?.user) {
          console.log('OAuth 로그인 성공:', data.session.user);

          // 사용자 프로필 확인
          const { data: profile, error: profileError } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('auth_user_id', data.session.user.id)
            .single();

          if (profileError && profileError.code !== 'PGRST116') {
            console.error('프로필 조회 오류:', profileError);
            toast.error('사용자 정보를 가져올 수 없습니다.');
            router.push('/login');
            return;
          }

          if (!profile) {
            // 프로필이 없는 경우 (신규 사용자) - 가입 폼 표시
            console.log('신규 사용자, 가입 폼 표시');

            // 신규 사용자 플래그 설정
            setIsNewUser(true);

            // 카카오 사용자 정보 추출 (로그아웃 전에)
            const userMetadata = data.session.user.user_metadata || {};
            const kakaoInfo = {
              id: userMetadata.kakao_id,
              email: data.session.user.email,
              nickname: userMetadata.kakao_nickname || userMetadata.display_name,
              name: userMetadata.display_name,
              profile_image: userMetadata.kakao_profile_image,
              thumbnail_image: userMetadata.kakao_profile_image
            };

            setUserInfo(kakaoInfo);
            setFormData(prev => ({
              ...prev,
              nickname: kakaoInfo.nickname || kakaoInfo.name || ''
            }));
            toast.success('카카오톡 인증이 완료되었습니다.');

            // 프로필 생성 후 로그아웃 처리
            // (handleSubmit에서 프로필 생성 후 로그아웃)

          } else {
            // 기존 사용자인 경우 로그인 처리
            console.log('기존 사용자 로그인 성공');
            toast.success('카카오톡 로그인이 완료되었습니다!');
            router.push('/mypage');
            return;
          }

        } else {
          console.log('세션이 없음, 기존 방식으로 처리');

          // 기존 방식: URL 파라미터나 sessionStorage에서 정보 가져오기
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
                setIsNewUser(true); // 신규 사용자 플래그 설정
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
        }

      } catch (error) {
        console.error('OAuth 콜백 처리 오류:', error);
        toast.error('인증 처리 중 오류가 발생했습니다.');
        router.push('/login');
      }
    };

    handleOAuthCallback();
  }, [router]);

  const handleKakaoCallback = async (code) => {
    try {
      setLoading(true);
      console.log('카카오 콜백 처리 시작, 코드:', code);

      // 클라이언트에서 사용한 redirect_uri를 서버로 전달
      const redirectUri = `${window.location.origin}/signup/kakao`;
      console.log('클라이언트 redirect_uri:', redirectUri);

      // 카카오톡 인증 코드로 사용자 정보 가져오기
      console.log('카카오 콜백 API 호출 중...');
      const response = await fetch('/api/auth/kakao/callback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code,
          redirect_uri: redirectUri // 클라이언트에서 사용한 redirect_uri 전달
        }),
      });

      console.log('카카오 콜백 API 응답 상태:', response.status);
      const result = await response.json();
      console.log('카카오 콜백 API 응답 데이터:', result);

      if (result.success) {
        console.log('카카오 인증 성공, 사용자 정보:', result.userInfo);

        // 기존 사용자인 경우 로그인 처리
        if (result.isExistingUser && result.needsLogin) {
          console.log('기존 사용자 로그인 처리 시작');
          toast.success('카카오톡 로그인이 완료되었습니다!');

          // 기존 사용자 로그인 처리
          try {
            const loginResult = await signInWithKakao({ userInfo: result.userInfo });

            if (loginResult.success) {
              console.log('기존 사용자 로그인 성공');
              router.push('/mypage');
              return;
            } else {
              console.error('기존 사용자 로그인 실패:', loginResult.error);
              toast.error(loginResult.error || '로그인 처리 중 오류가 발생했습니다.');
              router.push('/login');
              return;
            }
          } catch (error) {
            console.error('기존 사용자 로그인 처리 오류:', error);
            toast.error('로그인 처리 중 오류가 발생했습니다.');
            router.push('/login');
            return;
          }
        }

        // 신규 사용자인 경우 가입 폼 표시
        if (result.needsSignup) {
          console.log('신규 사용자, 가입 폼 표시');
          setIsNewUser(true); // 신규 사용자 플래그 설정
          setUserInfo(result.userInfo);
          setFormData(prev => ({
            ...prev,
            nickname: result.userInfo.nickname || result.userInfo.name || ''
          }));
          toast.success('카카오톡 인증이 완료되었습니다.');
        }
      } else {
        console.error('카카오 인증 실패:', result);

        // 중복 가입 오류 처리
        if (result.duplicateInfo) {
          const providerName = result.duplicateInfo.providerName || '이메일';
          toast.error(`이미 ${providerName}로 가입된 이메일입니다.`);
        } else {
          toast.error(result.error || '카카오톡 인증에 실패했습니다.');
        }
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
      console.log('프로필 생성 시작:', {
        userInfo,
        formData,
        contactChannels,
        channelInputs
      });

      // 직접 프로필 생성 (API 호출 대신)
      console.log('1. 사용자 인증 정보 확인 중...');

      // 타임아웃을 추가한 사용자 정보 조회
      const getUserWithTimeout = () => {
        return Promise.race([
          supabase.auth.getUser(),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('사용자 정보 조회 타임아웃')), 5000)
          )
        ]);
      };

      let user, userError;
      try {
        const result = await getUserWithTimeout();
        user = result.data?.user;
        userError = result.error;
      } catch (timeoutError) {
        console.error('사용자 정보 조회 타임아웃:', timeoutError);

        // 대안: 세션에서 사용자 정보 가져오기
        console.log('1-1. 세션에서 사용자 정보 가져오기 시도...');
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          console.error('세션 조회 오류:', sessionError);
          toast.error('사용자 인증 정보를 가져올 수 없습니다.');
          return;
        }

        if (!session?.user) {
          console.error('세션에 사용자 정보가 없음');
          toast.error('사용자 인증 정보가 없습니다.');
          return;
        }

        user = session.user;
        console.log('1-2. 세션에서 사용자 정보 가져오기 성공:', user.id);
      }

      if (userError) {
        console.error('사용자 인증 정보 조회 오류:', userError);
        toast.error('사용자 인증 정보를 가져올 수 없습니다.');
        return;
      }

      if (!user) {
        console.error('사용자 정보가 없음');
        toast.error('사용자 인증 정보가 없습니다.');
        return;
      }

      console.log('2. 현재 사용자 확인:', {
        id: user.id,
        email: user.email,
        emailConfirmed: !!user.email_confirmed_at
      });

      // 프로필 데이터 준비
      const profileData = {
        auth_user_id: user.id,
        email: user.email,
        display_name: formData.nickname,
        bio: formData.introduction || null,
        phone: formData.phone || null,
        instagram: contactChannels.instagram ? channelInputs.instagram : null,
        naver_cafe: contactChannels.naverCafe ? channelInputs.naverCafe : null,
        kakao_openchat: contactChannels.kakaoOpenChat ? channelInputs.kakaoOpenChat : null,
        provider: 'kakao',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      console.log('3. 프로필 데이터 준비 완료:', profileData);

      // user_profiles 테이블에 프로필 정보 저장
      console.log('4. user_profiles 테이블에 INSERT 시도...');
      const { data: insertedProfile, error: profileError } = await supabase
        .from('user_profiles')
        .insert([profileData])
        .select()
        .single();

      if (profileError) {
        console.error('5. 프로필 생성 오류:', {
          code: profileError.code,
          message: profileError.message,
          details: profileError.details,
          hint: profileError.hint
        });
        toast.error('프로필 생성에 실패했습니다: ' + profileError.message);
        return;
      }

      console.log('6. 프로필 생성 성공:', insertedProfile);

      // 프로필 생성 완료 후 로그아웃
      await supabase.auth.signOut();

      // sessionStorage 정리
      sessionStorage.removeItem('kakaoUserInfo');
      // 신규 사용자 플래그 리셋
      setIsNewUser(false);
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

    } catch (error) {
      console.error('카카오톡 회원가입 오류:', error);
      toast.error('회원가입 처리 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // OAuth 콜백 처리 중일 때 로딩 화면 표시
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
          <UserProfileForm
            mode="signup"
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
            showPhone={true}
            showSocialChannels={true}
            showPassword={false}
            showTerms={false}
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
