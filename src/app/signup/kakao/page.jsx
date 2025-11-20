'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import UserProfileForm from '@/components/UserProfileForm';
import ProfileImage from '@/components/common/ProfileImage';
import Loading from "@/components/ui/loading";

const KakaoSignupPage = () => {
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(true);
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
  const { loading: authLoading, signUpWithKakao, signInWithKakao, checkNicknameDuplicate, updateProfile } = useAuth();

  // 신규 사용자 가입 과정 중에는 리다이렉트 하지 않음
  // (useAuth 훅의 사용자 상태를 무시하고 자체적으로 관리)

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        console.log('OAuth 콜백 처리 시작');
        setOauthLoading(true);

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
      } finally {
        setOauthLoading(false);
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
      message: '멋진 닉네임을 지어주세요🐾',
      type: 'success'
    };
  };

  const validatePhone = (phone) => {
    const value = (phone || '').trim();
    if (!value) return '연락처를 입력해주세요.';
    if (value.length < 10) return '연락처를 정확히 입력해주세요.';
    return '';
  };

  const validateInstagramField = (enabled, value) => {
    if (!enabled) return '';
    const ig = (value || '').trim();
    if (!ig) return '인스타그램 ID(영문 유저네임)를 입력해주세요.';
    if (/http(s)?:\/\//i.test(ig)) return 'URL이 아닌 인스타그램 ID(영문 유저네임)을 입력해주세요.';
    if (!isValidInstagramUsername(ig)) return '영문 소문자, 숫자, 온점(.), 언더바(_)만 사용해 1~30자로 입력해주세요.';
    return '';
  };

  const validateKakaoField = (enabled, value) => {
    if (!enabled) return '';
    const kakao = (value || '').trim();
    if (!kakao) return '카카오톡 오픈채팅 링크를 입력해주세요.';
    if (!isValidKakaoUrl(kakao)) return '한글 없이 https:// 로 시작하는 오픈채팅 링크를 입력해주세요.';
    return '';
  };

  const isValidInstagramUsername = (value) => {
    if (!value) return false;
    const hasKorean = /[가-힣]/.test(value);
    if (hasKorean) return false;
    const regex = /^[a-z0-9._]{1,30}$/;
    return regex.test(value);
  };

  const isValidKakaoUrl = (value) => {
    if (!value) return false;
    const lower = value.toLowerCase();
    const hasValidProtocol = lower.startsWith('https://');
    const hasKorean = /[가-힣]/.test(value);
    return hasValidProtocol && !hasKorean;
  };

  // =========================
  // 3. 인풋 핸들러들
  // =========================

  const handleNicknameChange = (value) => {
    setFormData(prev => ({ ...prev, nickname: value }));
    const trimmed = value.trim();

    if (!trimmed) {
      setNicknameValidation(null);
      setErrors(prev => ({ ...prev, nickname: '' }));
      return;
    }

    const validation = validateNickname(trimmed);
    setNicknameValidation(validation);
    setErrors(prev => ({
      ...prev,
      nickname: validation && !validation.isValid ? validation.message : ''
    }));
  };

  const handleNicknameBlur = async (value) => {
    const trimmed = value.trim();
    if (!trimmed || !nicknameValidation || !nicknameValidation.isValid) return;

    setNicknameChecking(true);
    try {
      const result = await checkNicknameDuplicate(trimmed);

      if (result.isDuplicate) {
        const message = result.message || '이미 사용 중인 닉네임입니다';
        setNicknameValidation({
          isValid: false,
          message,
          type: 'duplicate',
          available: false
        });
        setErrors(prev => ({ ...prev, nickname: message }));
      } else {
        const message = result.message || '사용 가능한 닉네임입니다';
        setNicknameValidation({
          isValid: true,
          message,
          type: 'success',
          available: true
        });
        setErrors(prev => ({ ...prev, nickname: '' }));
      }
    } catch (error) {
      console.error('닉네임 중복 체크 오류:', error);
      const message = '중복 체크 중 오류가 발생했습니다';
      setNicknameValidation({
        isValid: false,
        message,
        type: 'error',
        available: false
      });
      setErrors(prev => ({ ...prev, nickname: message }));
    } finally {
      setNicknameChecking(false);
    }
  };

  const handlePhoneChange = (value) => {
    const onlyNumbers = value.replace(/[^0-9]/g, '');
    setFormData(prev => ({ ...prev, phone: onlyNumbers }));
    const msg = validatePhone(onlyNumbers);
    setErrors(prev => ({ ...prev, phone: msg }));
  };

  const handleChannelChange = (channel) => {
    setContactChannels(prev => {
      const next = { ...prev, [channel]: !prev[channel] };
      if (!next[channel]) {
        setChannelInputs(prevInputs => ({ ...prevInputs, [channel]: '' }));
        setErrors(prevErrors => ({ ...prevErrors, [channel]: '' }));
      }
      return next;
    });
  };

  const handleChannelInputChange = (channel, value) => {
    setChannelInputs(prev => ({ ...prev, [channel]: value }));

    setErrors(prev => {
      const newErrors = { ...prev };
      if (channel === 'instagram') {
        newErrors.instagram = validateInstagramField(contactChannels.instagram, value);
      }
      if (channel === 'kakaoOpenChat') {
        newErrors.kakaoOpenChat = validateKakaoField(contactChannels.kakaoOpenChat, value);
      }
      return newErrors;
    });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.nickname.trim()) {
      newErrors.nickname = '닉네임을 입력해주세요.';
    } else if (nicknameValidation && !nicknameValidation.isValid) {
      newErrors.nickname = nicknameValidation.message;
    }

    const phoneError = validatePhone(formData.phone);
    if (phoneError) newErrors.phone = phoneError;

    const igError = validateInstagramField(contactChannels.instagram, channelInputs.instagram);
    if (igError) newErrors.instagram = igError;

    const kakaoError = validateKakaoField(contactChannels.kakaoOpenChat, channelInputs.kakaoOpenChat);
    if (kakaoError) newErrors.kakaoOpenChat = kakaoError;

    if (!formData.agreeTerms) {
      newErrors.agreeTerms = '이용약관에 동의해주세요.';
    }
    if (!formData.agreePrivacy) {
      newErrors.agreePrivacy = '개인정보처리방침에 동의해주세요.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) return;

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
        display_name: formData.nickname.trim(),
        bio: formData.introduction?.trim() || null,
        phone: formData.phone?.trim() || null,
        instagram: contactChannels.instagram ? channelInputs.instagram.trim() : null,
        kakao_openchat: contactChannels.kakaoOpenChat ? channelInputs.kakaoOpenChat.trim() : null,
        provider: 'kakao',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      console.log('3. 프로필 데이터 준비 완료:', profileData);

      // user_profiles 테이블에 프로필 정보 저장
      // 4. user_profiles 테이블에 프로필 정보 저장
      const { data: insertedProfile, error: profileError } = await supabase
          .from('user_profiles')
          .upsert(profileData, {
            onConflict: 'auth_user_id',
          })
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

// ✅ 1) 방금 만든 프로필을 전역 상태(useAuth)에 저장
      try {
        await updateProfile(insertedProfile);
      } catch (e) {
        console.error('프로필 컨텍스트 업데이트 오류:', e);
      }

// ✅ 2) 필요 없는 임시 값 정리
      sessionStorage.removeItem('kakaoUserInfo');
      sessionStorage.removeItem('redirectAfterLogin');
      setIsNewUser(false);

// ✅ 3) 안내 띄우고 마이페이지로 이동 (로그아웃 안 함!)
      toast.success('회원가입이 완료되었습니다!');
      router.push('/mypage');


    } catch (error) {
      console.error('카카오톡 회원가입 오류:', error);
      toast.error('회원가입 처리 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // OAuth 콜백 처리 중일 때 로딩 화면 표시
  if (oauthLoading) {
    return <Loading text={'카카오톡 인증 중~'} className={'!text-black'}/>;
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
            <ProfileImage
                profileImage={userInfo.profile_image}
                size={48}
                alt="프로필"
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
                onPhoneChange={handlePhoneChange}
                showProfileImage={false}
                showIntroduction={true}
                showPhone={true}
                showSocialChannels={true}
                showPassword={false}
                showTerms={true}
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
