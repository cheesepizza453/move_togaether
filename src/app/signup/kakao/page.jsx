'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import UserProfileForm from '@/components/UserProfileForm';
import ProfileImage from '@/components/common/ProfileImage';

const KakaoSignupPage = () => {
  // ✅ OAuth 처리용 로딩
  const [oauthLoading, setOauthLoading] = useState(true);
  // ✅ 가입 버튼용 로딩
  const [submitLoading, setSubmitLoading] = useState(false);

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
  const { checkNicknameDuplicate } = useAuth();

  // =========================
  // 1. 카카오 OAuth 콜백 처리
  // =========================
  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        console.log('OAuth 콜백 처리 시작');
        setOauthLoading(true);

        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.error('세션 가져오기 오류:', error);
          toast.error('인증 처리 중 오류가 발생했습니다.');
          router.push('/login');
          return;
        }

        if (data.session?.user) {
          console.log('OAuth 로그인 성공:', data.session.user);

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
            // 신규 사용자 (프로필 없음)
            console.log('신규 사용자, 가입 폼 표시');
            setIsNewUser(true);

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
          } else {
            // 기존 사용자
            console.log('기존 사용자 로그인 성공');
            toast.success('카카오톡 로그인이 완료되었습니다!');
            router.push('/mypage');
            return;
          }
        } else {
          console.log('세션이 없음, 카카오 인증 정보 없음');
          toast.error('카카오톡 인증 정보가 없습니다.');
          router.push('/login');
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

  // =========================
  // 2. 유효성 검사 유틸
  // =========================

  // 닉네임 유효성 검사 (로컬 규칙)
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

    // 형식만 통과했을 때
    return {
      isValid: true,
      message: '멋진 닉네임을 지어주세요🐾',
      type: 'success'
    };
  };

  // 전화번호 검증
  const validatePhone = (phone) => {
    const value = (phone || '').trim();
    if (!value) return '연락처를 입력해주세요.';
    if (value.length < 10) return '연락처를 정확히 입력해주세요.';
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
    } else if (!isValidKakaoUrl(kakao)) {
      return '한글 없이 https:// 로 시작하는 오픈채팅 링크를 입력해주세요.';
    }

    return '';
  };

  // 인스타그램 username 검증: 영문 소문자 + 숫자 + _ 만, 1~30자, 한글 X, URL X
  const isValidInstagramUsername = (value) => {
    if (!value) return false;
    const hasKorean = /[가-힣]/.test(value);
    if (hasKorean) return false;
    const regex = /^[a-z0-9._]{1,30}$/;
    return regex.test(value);
  };

  // 카카오 오픈채팅 URL 검증: https:// 로 시작 + 한글 없음
  const isValidKakaoUrl = (value) => {
    if (!value) return false;
    const lower = value.toLowerCase();
    const hasValidProtocol = lower.startsWith('https://'); // 카카오만 https 강제
    const hasKorean = /[가-힣]/.test(value);
    return hasValidProtocol && !hasKorean;
  };

  // =========================
  // 3. 인풋 핸들러들
  // =========================

  // 닉네임 변경
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

  // 닉네임 blur → 중복 체크
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

  // 전화번호 변경 (실시간 검증)
  const handlePhoneChange = (value) => {
    const onlyNumbers = value.replace(/[^0-9]/g, '');
    setFormData(prev => ({ ...prev, phone: onlyNumbers }));

    const msg = validatePhone(onlyNumbers);
    setErrors(prev => ({ ...prev, phone: msg }));
  };

  // 연락채널 선택 변경
  const handleChannelChange = (channel) => {
    setContactChannels(prev => {
      const next = { ...prev, [channel]: !prev[channel] };

      // 끈 경우 input / 에러 초기화
      if (!next[channel]) {
        setChannelInputs(prevInputs => ({ ...prevInputs, [channel]: '' }));
        setErrors(prevErrors => ({ ...prevErrors, [channel]: '' }));
      }

      return next;
    });
  };

  // 연락채널 입력값 변경 (실시간 검증 포함)
  const handleChannelInputChange = (channel, value) => {
    setChannelInputs(prev => ({
      ...prev,
      [channel]: value
    }));

    setErrors(prev => {
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

  // =========================
  // 4. 최종 폼 검증
  // =========================
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

  // =========================
  // 5. 프로필 생성 & 가입 완료
  // =========================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;
    if (!userInfo) {
      toast.error('카카오 사용자 정보를 불러올 수 없습니다.');
      return;
    }

    setSubmitLoading(true);

    try {
      console.log('프로필 생성 시작:', {
        userInfo,
        formData,
        contactChannels,
        channelInputs
      });

      // 사용자 가져오기 (타임아웃 포함)
      const getUserWithTimeout = () => {
        return Promise.race([
          supabase.auth.getUser(),
          new Promise((_, reject) =>
              setTimeout(() => reject(new Error('사용자 정보 조회 타임아웃')), 5000)
          )
        ]);
      };

      let user;
      let userError;

      try {
        const result = await getUserWithTimeout();
        user = result.data?.user;
        userError = result.error;
      } catch (timeoutError) {
        console.error('사용자 정보 조회 타임아웃:', timeoutError);

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

      console.log('현재 사용자:', {
        id: user.id,
        email: user.email
      });

      const profileData = {
        auth_user_id: user.id,
        email: user.email,
        display_name: formData.nickname,
        bio: formData.introduction || null,
        phone: formData.phone || null,
        instagram: contactChannels.instagram ? channelInputs.instagram.trim() : null,
        // naver_cafe: contactChannels.naverCafe ? channelInputs.naverCafe.trim() : null,
        kakao_openchat: contactChannels.kakaoOpenChat ? channelInputs.kakaoOpenChat.trim() : null,
        provider: 'kakao',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      console.log('프로필 데이터:', profileData);

      const { data: insertedProfile, error: profileError } = await supabase
          .from('user_profiles')
          .insert([profileData])
          .select()
          .single();

      if (profileError) {
        console.error('프로필 생성 오류:', profileError);
        toast.error('프로필 생성에 실패했습니다: ' + profileError.message);
        return;
      }

      console.log('프로필 생성 성공:', insertedProfile);
      toast.success('회원가입이 완료되었습니다!');

      // 세션 정리
      sessionStorage.removeItem('kakaoUserInfo');
      sessionStorage.removeItem('redirectAfterLogin');
      setIsNewUser(false);

      setSubmitLoading(false);
      router.push('/signup/success');

      // 로그아웃은 뒤에서 비동기로
      supabase.auth.signOut().catch(err => {
        console.error('로그아웃 오류:', err);
      });
    } catch (error) {
      console.error('카카오톡 회원가입 오류:', error);
      toast.error('회원가입 처리 중 오류가 발생했습니다.');
      setSubmitLoading(false);
    }
  };

  // =========================
  // 6. 렌더링
  // =========================

  // OAuth 콜백 처리 중
  if (oauthLoading && !userInfo) {
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

  // 사용자 정보 없음
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

  // 메인 가입 폼
  return (
      <div className="min-h-screen bg-white">
        {/* 헤더 */}
        <div className="px-4 py-3 border-b border-gray-200">
          <div className="flex items-center">
            <Link href="/login" className="mr-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15 18L9 12L15 6" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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

        {/* 카카오 사용자 정보 */}
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
                nicknameChecking={nicknameChecking}
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
                showTerms={false}
            />

            {/* 가입 버튼 */}
            <button
                type="submit"
                disabled={submitLoading}
                className={`w-full mt-8 py-3 rounded-lg font-semibold transition-colors ${
                    submitLoading
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-[#FFDD44] text-black hover:bg-yellow-500'
                }`}
            >
              {submitLoading ? '가입 중...' : '가입하기'}
            </button>
          </form>
        </div>
      </div>
  );
};

export default KakaoSignupPage;
