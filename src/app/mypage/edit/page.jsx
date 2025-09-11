'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { ChevronLeft, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SignupForm from '@/components/signup/SignupForm';
import { toast } from 'sonner';

const EditProfilePage = () => {
  const { user, profile, loading, checkNicknameDuplicate } = useAuth();
  const router = useRouter();
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
  const [saving, setSaving] = useState(false);
  const [nicknameValidation, setNicknameValidation] = useState(null);
  const [nicknameChecking, setNicknameChecking] = useState(false);

  // 로그인 상태 확인
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // 프로필 데이터 로드
  useEffect(() => {
    if (profile) {
      setFormData({
        nickname: profile.display_name || '',
        introduction: profile.bio || '',
        phone: profile.phone || ''
      });
      setContactChannels({
        instagram: !!profile.instagram,
        naverCafe: !!profile.naver_cafe,
        kakaoOpenChat: !!profile.kakao_openchat
      });
      setChannelInputs({
        instagram: profile.instagram || '',
        naverCafe: profile.naver_cafe || '',
        kakaoOpenChat: profile.kakao_openchat || ''
      });
    }
  }, [profile]);

  // 닉네임 변경 핸들러
  const handleNicknameChange = (value) => {
    setFormData(prev => ({ ...prev, nickname: value }));
    setNicknameValidation(null);
    setErrors(prev => ({ ...prev, nickname: '' }));
  };

  // 닉네임 블러 핸들러 (중복 체크)
  const handleNicknameBlur = async (value) => {
    if (!value.trim()) return;

    // 현재 닉네임과 같으면 중복 체크하지 않음
    if (value === profile?.display_name) {
      setNicknameValidation({ isValid: true, message: '사용 가능한 닉네임입니다.' });
      return;
    }

    setNicknameChecking(true);
    try {
      const result = await checkNicknameDuplicate(value);
      setNicknameValidation(result);
    } catch (error) {
      console.error('닉네임 중복 체크 오류:', error);
      setNicknameValidation({ isValid: false, message: '닉네임 확인 중 오류가 발생했습니다.' });
    } finally {
      setNicknameChecking(false);
    }
  };

  // 연락채널 변경 핸들러
  const handleChannelChange = (channel) => {
    setContactChannels(prev => ({
      ...prev,
      [channel]: !prev[channel]
    }));

    // 체크 해제 시 입력값 초기화
    if (contactChannels[channel]) {
      setChannelInputs(prev => ({
        ...prev,
        [channel]: ''
      }));
      setErrors(prev => ({
        ...prev,
        [channel]: ''
      }));
    }
  };

  // 연락채널 입력값 변경 핸들러
  const handleChannelInputChange = (channel, value) => {
    setChannelInputs(prev => ({
      ...prev,
      [channel]: value
    }));
    setErrors(prev => ({
      ...prev,
      [channel]: ''
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

  // 프로필 저장
  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);

      const session = await supabase.auth.getSession();
      if (!session.data.session) {
        toast.error('로그인이 필요합니다.');
        return;
      }

      const { error } = await supabase
        .from('user_profiles')
        .update({
          display_name: formData.nickname,
          bio: formData.introduction,
          phone: formData.phone,
          instagram: contactChannels.instagram ? channelInputs.instagram : null,
          naver_cafe: contactChannels.naverCafe ? channelInputs.naverCafe : null,
          kakao_openchat: contactChannels.kakaoOpenChat ? channelInputs.kakaoOpenChat : null,
          updated_at: new Date().toISOString()
        })
        .eq('auth_user_id', user.id);

      if (error) {
        console.error('프로필 업데이트 오류:', error);
        toast.error('프로필 업데이트 중 오류가 발생했습니다.');
        return;
      }

      toast.success('프로필이 성공적으로 업데이트되었습니다.');
      router.push('/mypage');

    } catch (error) {
      console.error('프로필 저장 오류:', error);
      toast.error('프로필 저장 중 오류가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500 mx-auto mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
        <button
          onClick={() => router.back()}
          className="text-gray-600 text-lg"
        >
          <span className="flex items-center">
            <ChevronLeft size={20} className="text-gray-600 display-inline-block" />
            <span className="ml-1">내 정보 수정</span>
          </span>
        </button>
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-yellow-400 text-gray-800 hover:bg-yellow-500"
        >
          {saving ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-800 mr-2"></div>
              저장 중...
            </div>
          ) : (
            <div className="flex items-center">
              <Save size={16} className="mr-1" />
              저장
            </div>
          )}
        </Button>
      </div>

      {/* Form */}
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
          showProfileImage={false}
          showIntroduction={true}
        />

        {/* 이메일 정보 (읽기 전용) */}
        <div className="mt-6 bg-gray-50 rounded-xl p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">계정 정보</h3>
          <div>
            <label className="block text-xs text-gray-500 mb-1">이메일</label>
            <input
              value={user.email || ''}
              disabled
              className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-lg text-sm text-gray-600"
            />
            <p className="text-xs text-gray-500 mt-1">
              이메일은 로그인 방식에 따라 자동으로 설정됩니다.
            </p>
          </div>
        </div>
      </div>

      {/* 하단 여백 */}
      <div className="h-20"></div>
    </div>
  );
};

export default EditProfilePage;
