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
  const [oauthLoading, setOauthLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);

  const [userInfo, setUserInfo] = useState(null);
  const [isNewUser, setIsNewUser] = useState(false);
  const [existingProfileId, setExistingProfileId] = useState(null);

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

        if (!data.session?.user) {
          console.log('세션이 없음');
          toast.error('카카오톡 인증 정보가 없습니다.');
          router.push('/login');
          return;
        }

        const currentUser = data.session.user;
        console.log('현재 세션 사용자:', currentUser.id);

        const userMetadata = currentUser.user_metadata || {};

        // metadata.profile_created 플래그로 먼저 체크
        if (userMetadata.profile_created === true) {
          console.log('프로필 생성 완료 (metadata 확인), 마이페이지로 이동');
          toast.success('이미 가입된 계정입니다. 로그인되었습니다!');
          router.push('/mypage');
          return;
        }

        // 프로필 존재 여부 확인 (이중 체크)
        const { data: profile, error: profileError } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('auth_user_id', currentUser.id)
            .maybeSingle();

        if (profileError) {
          console.error('프로필 조회 오류:', profileError);
          toast.error('사용자 정보 조회 중 오류가 발생했습니다.');
          router.push('/login');
          return;
        }

        if (profile && profile.display_name && profile.display_name.trim() !== '') {
          // DB에는 프로필이 있는데 metadata 플래그가 없는 경우 → 플래그 업데이트
          console.log('프로필 존재하지만 metadata 플래그 없음, 플래그 업데이트');

          await supabase.auth.updateUser({
            data: { profile_created: true }
          });

          toast.success('이미 가입된 계정입니다. 로그인되었습니다!');
          router.push('/mypage');
          return;
        }

        // 프로필이 없거나 닉네임이 비어있음 → 가입 폼 표시
        console.log('프로필 미완성, 가입 폼 표시');
        setIsNewUser(true);

        if (profile?.id) {
          setExistingProfileId(profile.id);
        }

        const kakaoInfo = {
          id: userMetadata.kakao_id,
          email: currentUser.email,
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

  const validateNickname = (nickname) => {
    const trimmed = nickname.trim();
    if (!trimmed) return null;

    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(trimmed);
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

  // =========================
  // 4. 최종 폼 검증
  // =========================
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

  // =========================
  // 5. 프로필 생성/업데이트
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
      const { data, error: userError } = await supabase.auth.getUser();
      const user = data?.user;

      if (userError || !user) {
        console.error('사용자 인증 정보 조회 오류:', userError);
        toast.error('사용자 인증 정보를 가져올 수 없습니다.');
        setSubmitLoading(false);
        return;
      }

      console.log('프로필 업데이트/생성 시도 - 사용자 ID:', user.id);

      const profileData = {
        auth_user_id: user.id,
        email: user.email,
        display_name: formData.nickname.trim(),
        bio: formData.introduction?.trim() || null,
        phone: formData.phone?.trim() || null,
        instagram: contactChannels.instagram ? channelInputs.instagram.trim() : null,
        kakao_openchat: contactChannels.kakaoOpenChat ? channelInputs.kakaoOpenChat.trim() : null,
        provider: 'kakao',
        updated_at: new Date().toISOString()
      };

      let result;

      // 기존 프로필 ID가 있으면 UPDATE, 없으면 INSERT
      if (existingProfileId) {
        console.log('기존 프로필 업데이트:', existingProfileId);

        const { data: updatedProfile, error: updateError } = await supabase
            .from('user_profiles')
            .update(profileData)
            .eq('id', existingProfileId)
            .select()
            .single();

        if (updateError) {
          console.error('프로필 업데이트 오류:', updateError);
          toast.error('프로필 업데이트에 실패했습니다: ' + updateError.message);
          setSubmitLoading(false);
          return;
        }

        result = updatedProfile;
        console.log('프로필 업데이트 성공:', result);
      } else {
        console.log('새 프로필 생성');

        profileData.created_at = new Date().toISOString();

        const { data: insertedProfile, error: insertError } = await supabase
            .from('user_profiles')
            .insert([profileData])
            .select()
            .single();

        if (insertError) {
          console.error('프로필 생성 오류:', insertError);

          if (insertError.code === '23505') {
            toast.info('이미 가입된 계정입니다. 로그인 페이지로 이동합니다.');
            router.push('/login');
          } else {
            toast.error('프로필 생성에 실패했습니다: ' + insertError.message);
          }

          setSubmitLoading(false);
          return;
        }

        result = insertedProfile;
        console.log('프로필 생성 성공:', result);
      }

      // 세션 정리
      sessionStorage.removeItem('kakaoUserInfo');
      sessionStorage.removeItem('redirectAfterLogin');
      setIsNewUser(false);

      // metadata에 프로필 생성 완료 플래그 설정
      console.log('프로필 생성 완료, metadata 플래그 업데이트');
      await supabase.auth.updateUser({
        data: { profile_created: true }
      });

      // 로그아웃 후 성공 페이지로 이동
      await supabase.auth.signOut();
      toast.success('회원가입이 완료되었습니다!');

      setSubmitLoading(false);
      router.push('/signup/success');

    } catch (error) {
      console.error('카카오톡 회원가입 오류:', error);
      toast.error('회원가입 처리 중 오류가 발생했습니다.');
      setSubmitLoading(false);
    }
  };

  // =========================
  // 6. 렌더링
  // =========================

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
        <div className="px-4 py-3 border-b border-gray-200">
          <div className="flex items-center">
            <Link href="/login" className="mr-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15 18L9 12L15 6" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
            <h1 className="text-lg font-semibold">카카오톡 간편 가입</h1>
          </div>

          <div className="flex justify-center mt-4 space-x-2">
            <div className="w-2 h-2 rounded-full bg-gray-300"></div>
            <div className="w-2 h-2 rounded-full bg-red-500"></div>
          </div>
        </div>

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
                showTerms={true}
            />

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