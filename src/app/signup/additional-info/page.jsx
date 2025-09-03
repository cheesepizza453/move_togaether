'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Plus, Instagram, MessageCircle, Users } from 'lucide-react';
import Image from 'next/image';
import { useAuth } from '@/hooks/useAuth';

const AdditionalInfoPage = () => {
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

  // 첫 번째 페이지에서 전달받은 정보 확인
  useEffect(() => {
    const email = searchParams.get('email');
    const password = searchParams.get('password');

    if (!email || !password) {
      router.push('/signup');
      return;
    }

    setSignupData({ email, password });
  }, [searchParams, router]);

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
    if (!value.trim() || nicknameValidation?.type !== 'success') {
      return;
    }

    setNicknameChecking(true);
    try {
      const result = await checkNicknameDuplicate(value);

      if (result.isDuplicate) {
        setNicknameValidation({
          isValid: false,
          message: result.message,
          type: 'duplicate'
        });
        setErrors(prev => ({ ...prev, nickname: result.message }));
      } else {
        setNicknameValidation({
          isValid: true,
          message: result.message,
          type: 'success'
        });
        // 에러 메시지 제거
        if (errors.nickname) {
          setErrors(prev => ({ ...prev, nickname: '' }));
        }
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
        // 회원가입 성공 - 이메일 인증 안내 페이지로 이동
        router.push('/signup/success');
      } else {
        setErrors({ general: result.error || '회원가입 중 오류가 발생했습니다.' });
      }
    } catch (error) {
      console.error('회원가입 오류:', error);
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
        <div className="space-y-4">
          {/* 프로필 사진 */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="w-20 h-20 bg-[#FFDD44] rounded-full overflow-hidden flex items-center justify-center">
                <Image
                  src="/img/default_profile.jpg"
                  alt="기본 프로필 이미지"
                  width={80}
                  height={80}
                  className="w-full h-full object-cover"
                  priority
                />
              </div>
              <button
                className="absolute -bottom-1 -right-1 w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center cursor-not-allowed"
                title="인증 후에 등록이 가능합니다"
                disabled
              >
                <Plus size={16} className="text-gray-500" />
              </button>
            </div>
            <div className="ml-3 flex items-center">
              <p className="text-xs text-gray-500">
                인증 후에 등록이 가능합니다
              </p>
            </div>
          </div>

          {/* 닉네임 입력 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              닉네임 <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={formData.nickname}
                onChange={(e) => handleNicknameChange(e.target.value)}
                onBlur={(e) => handleNicknameBlur(e.target.value)}
                placeholder="닉네임 또는 보호소명을 입력해 주세요."
                maxLength={20}
                className={`w-full px-4 py-3 pr-16 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-colors ${
                  nicknameValidation?.isValid
                    ? 'border-yellow-400 bg-yellow-50'
                    : nicknameValidation && !nicknameValidation.isValid
                    ? 'border-red-500 bg-red-50'
                    : 'border-gray-300'
                } focus:bg-[#FFDD44] focus:bg-opacity-20`}
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-400">
                {formData.nickname.length}/20
              </div>
              {nicknameChecking && (
                <div className="absolute right-12 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-500"></div>
                </div>
              )}
            </div>

            {/* 닉네임 안내 및 유효성 메시지 */}
            <div className="mt-2">
              <p className="text-xs text-gray-500 mb-1">특수문자 불가</p>
              {nicknameValidation && (
                <p className={`text-xs ${
                  nicknameValidation.isValid ? 'text-green-500' : 'text-red-500'
                }`}>
                  {nicknameValidation.message}
                </p>
              )}
            </div>

            {errors.nickname && (
              <p className="mt-1 text-sm text-red-500">{errors.nickname}</p>
            )}
          </div>

          {/* 소개 입력 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              소개
            </label>
            <div className="relative">
              <textarea
                value={formData.introduction}
                onChange={(e) => setFormData(prev => ({ ...prev, introduction: e.target.value }))}
                placeholder="소개글을 입력해 주세요."
                maxLength={20}
                rows={3}
                className="w-full px-4 py-3 pr-16 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-colors focus:bg-[#FFDD44] focus:bg-opacity-20"
              />
              <div className="absolute right-3 top-3 text-xs text-gray-400">
                {formData.introduction.length}/20
              </div>
            </div>
          </div>

          {/* 연락처 입력 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              연락처 <span className="text-red-500">*</span>
            </label>
            <p className="text-xs text-gray-500 mb-2">
              봉사자와 임보자가 연락할 전화번호입니다.
            </p>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              placeholder="010-0000-0000"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-colors focus:bg-[#FFDD44] focus:bg-opacity-20"
            />
            {errors.phone && (
              <p className="mt-1 text-sm text-red-500">{errors.phone}</p>
            )}
          </div>

          {/* 연락채널 선택 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              연락채널
            </label>
            <p className="text-xs text-gray-500 mb-4">
              동물 정보를 볼 수 있는 채널을 선택하고 링크를 입력해 주세요. (봉사자는 입력하지 않아도 돼요)
            </p>

            {/* 채널 선택 체크박스 */}
            <div className="flex space-x-6 mb-6">
              <label className="flex items-center space-x-1">
                <input
                  type="checkbox"
                  checked={contactChannels.instagram}
                  onChange={() => handleChannelChange('instagram')}
                  className="w-4 h-4 text-yellow-600 border-gray-300 rounded focus:ring-yellow-500"
                />
                <span className="text-sm text-gray-700">인스타그램</span>
              </label>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={contactChannels.naverCafe}
                  onChange={() => handleChannelChange('naverCafe')}
                  className="w-4 h-4 text-yellow-600 border-gray-300 rounded focus:ring-yellow-500"
                />
                <span className="text-sm text-gray-700">네이버 카페</span>
              </label>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={contactChannels.kakaoOpenChat}
                  onChange={() => handleChannelChange('kakaoOpenChat')}
                  className="w-4 h-4 text-yellow-600 border-gray-300 rounded focus:ring-yellow-500"
                />
                <span className="text-sm text-gray-700">카카오톡 오픈채팅</span>
              </label>
            </div>

            {/* 인스타그램 입력 */}
            {contactChannels.instagram && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  인스타그램
                </label>
                <p className="text-xs text-gray-500 mb-2">
                  비공개 계정은 봉사자가 확인할 수 없어요.
                </p>
                <input
                  type="text"
                  value={channelInputs.instagram}
                  onChange={(e) => handleChannelInputChange('instagram', e.target.value)}
                  placeholder="인스타그램 ID를 입력해 주세요."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-colors focus:bg-[#FFDD44] focus:bg-opacity-20"
                />
                {errors.instagram && (
                  <p className="mt-1 text-sm text-red-500">{errors.instagram}</p>
                )}
              </div>
            )}

            {/* 네이버 카페 입력 */}
            {contactChannels.naverCafe && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  네이버 카페
                </label>
                <input
                  type="url"
                  value={channelInputs.naverCafe}
                  onChange={(e) => handleChannelInputChange('naverCafe', e.target.value)}
                  placeholder="네이버 카페 링크를 입력해 주세요."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-colors focus:bg-[#FFDD44] focus:bg-opacity-20"
                />
                {errors.naverCafe && (
                  <p className="mt-1 text-sm text-red-500">{errors.naverCafe}</p>
                )}
              </div>
            )}

            {/* 카카오톡 오픈채팅 입력 */}
            {contactChannels.kakaoOpenChat && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  카카오톡 오픈채팅
                </label>
                <input
                  type="url"
                  value={channelInputs.kakaoOpenChat}
                  onChange={(e) => handleChannelInputChange('kakaoOpenChat', e.target.value)}
                  placeholder="오픈채팅 링크를 입력해 주세요."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-colors focus:bg-[#FFDD44] focus:bg-opacity-20"
                />
                <p className="text-xs text-gray-500 mt-1">
                  채팅방 우상단 세줄 메뉴 버튼 &gt; 공유 &gt; 링크 복사
                </p>
                {errors.kakaoOpenChat && (
                  <p className="mt-1 text-sm text-red-500">{errors.kakaoOpenChat}</p>
                )}
              </div>
            )}
          </div>

          {/* 일반 에러 메시지 */}
          {errors.general && (
            <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {errors.general}
            </div>
          )}
        </div>

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

export default AdditionalInfoPage;
