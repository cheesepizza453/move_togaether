'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { Plus } from 'lucide-react';
import { IconRadioActive, IconCheckBoxActive} from "../../public/img/icon/IconCheck";
import { SECURITY_QUESTIONS } from '@/constants/securityQuestions';

const UserProfileForm = ({
  formData,
  setFormData,
  contactChannels,
  setContactChannels,
  channelInputs,
  setChannelInputs,
  errors,
  setErrors,
  nicknameValidation,
  nicknameChecking,
  onNicknameChange,
  onNicknameBlur,
  onChannelChange,
  onChannelInputChange,
  onProfileImageChange,
  // 모드 설정 (signup | edit)
  mode = 'edit',
  // 표시할 섹션들
  showProfileImage = true,
  showIntroduction = true,
  showPhone = true,
  showSocialChannels = true,
  // 회원가입 모드에서만 사용되는 props
  showPassword = false,
  showPasswordConfirm = false,
  showTerms = false,
  // 보안 질문/답변 (회원가입 시에만 표시)
  showSecurityQuestion = false,
  // 닉네임 읽기 전용 (수정 모드에서)
  isNicknameReadOnly = false
}) => {
  const [phoneVisibility, setPhoneVisibility] = useState('public');
  const fileInputRef = useRef(null);
  console.log(isNicknameReadOnly, 'isNicknameReadOnly', nicknameValidation, 'nicknameValidation');
  console.log(errors, 'errors');
  console.log(nicknameChecking);

  const handleProfileImageClick = () => {
    if (mode === 'signup') {
      // 회원가입 모드에서는 비활성화
      return;
    }
    fileInputRef.current?.click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      // 파일 크기 체크 (5MB 제한)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, profileImage: '파일 크기는 5MB 이하여야 합니다.' }));
        return;
      }

      // 이미지 파일 타입 체크
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({ ...prev, profileImage: '이미지 파일만 업로드 가능합니다.' }));
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        onProfileImageChange(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  console.log(errors);
  console.log(nicknameValidation);
  return (
    <div className="space-y-4">
      {/* 프로필 사진 */}
      {showProfileImage && (
        <div className="flex justify-center">
          <div className="relative">
            <div className="w-20 h-20 bg-[#FFDD44] rounded-full overflow-hidden flex items-center justify-center">
              <Image
                src={formData.profileImage || "/img/default_profile.jpg"}
                alt="프로필 이미지"
                width={80}
                height={80}
                className="w-full h-full object-cover"
                priority
              />
            </div>
            {mode === 'edit' ? (
              <button
                onClick={handleProfileImageClick}
                className="absolute -bottom-1 -right-1 w-6 h-6 bg-brand-main rounded-full flex items-center justify-center hover:bg-brand-yellow-dark transition-colors"
              >
                <Plus size={16} className="text-gray-800" />
              </button>
            ) : (
              <button
                className="absolute -bottom-1 -right-1 w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center cursor-not-allowed"
                title="인증 후에 등록이 가능합니다"
                disabled
              >
                <Plus size={16} className="text-gray-500" />
              </button>
            )}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        </div>
      )}

      {/* 이름 */}
      <div>
        <label className="block text-16-m mb-[12px]">
          닉네임<span className="text-brand-point">*</span>
        </label>
        <input
          type="text"
          value={formData.nickname}
          onChange={(e) => onNicknameChange(e.target.value)}
          onBlur={(e) => onNicknameBlur(e.target.value)}
          placeholder="닉네임 또는 보호소명을 입력해주세요."
          className={`w-full px-[15px] py-[18px] text-16-r rounded-[15px] border text-text-800 ${
            isNicknameReadOnly
              ? 'border-gray-300 bg-gray-100 text-gray-500 cursor-not-allowed'
              : errors.nickname
                ? 'border-brand-point bg-brand-point-bg text-brand-point focus:border-brand-point focus:ring-brand-point'
                : nicknameValidation?.available
                  ? 'border-[#2BA03E] bg-[#BFE1C5] text-[#2BA03E] focus:border-[#2BA03E] focus:ring-[#2BA03E]'
                  : 'border-text-600 bg-text-050 focus:bg-brand-sub focus:text-brand-yellow-dark focus:border-brand-main focus:ring-brand-main'
          } focus:outline-none focus:ring-1 transition-colors`}
          maxLength={20}
          readOnly={isNicknameReadOnly}
        />
        <div className="flex justify-between items-center mt-[4px]">
          <span className={`text-9-r ${
            isNicknameReadOnly
              ? 'text-gray-500'
              : errors.nickname
                ? 'text-brand-point'
                : nicknameValidation?.available
                  ? 'text-[#2BA03E]'
                  : 'text-brand-point'
          }`}>
            {isNicknameReadOnly
              ? '닉네임은 수정할 수 없습니다.'
              : errors.nickname
                ? errors.nickname
                : nicknameChecking
                  ? '확인 중!'
                  : nicknameValidation?.message || ''
            }
          </span>
          <span className="text-12-l text-text-800">
            {formData.nickname.length}/20
          </span>
        </div>
      </div>

      {/* 소개글 */}
      {showIntroduction && (
        <div>
          <label className="block text-16-m mb-[12px]">
            소개글<span className="text-brand-point">*</span>
          </label>
          <textarea
            value={formData.introduction}
            onChange={(e) => setFormData(prev => ({...prev, introduction: e.target.value }))}
            placeholder="간단한 소개글을 작성해주세요."
            className="w-full px-[15px] py-[18px] text-16-r rounded-[15px] border border-text-600 text-text-800 bg-text-050 focus:border-brand-main focus:ring-1 focus:ring-brand-main focus:bg-brand-sub focus:text-brand-yellow-dark focus:outline-none transition-colors resize-none"
            rows={4}
            maxLength={200}
          />
          <div className="flex justify-end mt-[4px]">
            <span className="text-12-l text-text-800">
              {formData.introduction.length}/200
            </span>
          </div>
        </div>
      )}

      {/* 전화번호 */}
      {showPhone && (
        <div>
          <label className="block text-16-m mb-[12px]">
            전화번호<span className="text-brand-point">*</span>
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData(prev => ({...prev, phone: e.target.value }))}
            placeholder="전화번호를 입력해주세요."
            className={`w-full px-[15px] py-[18px] text-16-r rounded-[15px] border text-text-800 ${
              errors.phone
                ? 'border-brand-point bg-brand-point-bg text-brand-point focus:border-brand-point focus:ring-brand-point'
                : 'border-text-600 bg-text-050 focus:bg-brand-sub focus:text-brand-yellow-dark focus:border-brand-main focus:ring-brand-main'
            } focus:outline-none focus:ring-1 transition-colors`}
          />
          {errors.phone && (
            <p className="text-9-r text-brand-point mt-[4px]">{errors.phone}</p>
          )}

          {/* 전화번호 공개 설정 (편집 모드에서만) */}
          {mode === 'edit' && (
            <div className="mt-3">
              <p className="text-14-r text-text-800 mb-2">전화번호 공개 설정</p>
              <div className="flex gap-4">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="phoneVisibility"
                    value="public"
                    checked={phoneVisibility === 'public'}
                    onChange={(e) => setPhoneVisibility(e.target.value)}
                    className="sr-only"
                  />
                  <div className="flex items-center gap-2">
                    {phoneVisibility === 'public' ? (
                      <IconRadioActive className="w-5 h-5" />
                    ) : (
                      <div className="w-[24px] h-[24px] border-2 border-text-300 rounded-full"></div>
                    )}
                    <span className="text-14-r text-text-800">공개</span>
                  </div>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="phoneVisibility"
                    value="private"
                    checked={phoneVisibility === 'private'}
                    onChange={(e) => setPhoneVisibility(e.target.value)}
                    className="sr-only"
                  />
                  <div className="flex items-center gap-2">
                    {phoneVisibility === 'private' ? (
                      <IconRadioActive className="w-5 h-5" />
                    ) : (
                      <div className="w-[24px] h-[24px] border-2 border-text-300 rounded-full"></div>
                    )}
                    <span className="text-14-r text-text-800">비공개</span>
                  </div>
                </label>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 비밀번호 (회원가입 모드에서만) */}
      {showPassword && mode === 'signup' && (
        <div>
          <label className="block text-16-m mb-[12px]">
            비밀번호<span className="text-brand-point">*</span>
          </label>
          <input
            type="password"
            value={formData.password || ''}
            onChange={(e) => setFormData(prev => ({...prev, password: e.target.value }))}
            placeholder="비밀번호를 입력해주세요."
            className={`w-full px-[15px] py-[18px] text-16-r rounded-[15px] border text-text-800 ${
              errors.password
                ? 'border-brand-point bg-brand-point-bg text-brand-point focus:border-brand-point focus:ring-brand-point'
                : 'border-text-600 bg-text-050 focus:bg-brand-sub focus:text-brand-yellow-dark focus:border-brand-main focus:ring-brand-main'
            } focus:outline-none focus:ring-1 transition-colors`}
          />
          {errors.password && (
            <p className="text-9-r text-brand-point mt-[4px]">{errors.password}</p>
          )}
        </div>
      )}

      {/* 비밀번호 확인 (회원가입 모드에서만) */}
      {showPasswordConfirm && mode === 'signup' && (
        <div>
          <label className="block text-16-m mb-[12px]">
            비밀번호 확인<span className="text-brand-point">*</span>
          </label>
          <input
            type="password"
            value={formData.passwordConfirm || ''}
            onChange={(e) => setFormData(prev => ({...prev, passwordConfirm: e.target.value }))}
            placeholder="비밀번호를 다시 입력해주세요."
            className={`w-full px-[15px] py-[18px] text-16-r rounded-[15px] border text-text-800 ${
              errors.passwordConfirm
                ? 'border-brand-point bg-brand-point-bg text-brand-point focus:border-brand-point focus:ring-brand-point'
                : 'border-text-600 bg-text-050 focus:bg-brand-sub focus:text-brand-yellow-dark focus:border-brand-main focus:ring-brand-main'
            } focus:outline-none focus:ring-1 transition-colors`}
          />
          {errors.passwordConfirm && (
            <p className="text-9-r text-brand-point mt-[4px]">{errors.passwordConfirm}</p>
          )}
        </div>
      )}

      {/* 연락 채널 */}
      {showSocialChannels && (
        <div className="space-y-4">
          <div>
            <p className="text-16-m mb-[12px]">연락 채널</p>
            <p className="text-14-r text-text-800 mb-4">연락받고 싶은 채널을 선택해주세요.</p>

            <div className="space-y-3">
              {/* 인스타그램 */}
              <div className="flex items-center justify-between">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={contactChannels.instagram}
                    onChange={(e) => onChannelChange('instagram', e.target.checked)}
                    className="sr-only"
                  />
                  <div className="flex items-center gap-3">
                    {contactChannels.instagram ? (
                      <IconCheckBoxActive className="w-5 h-5" />
                    ) : (
                      <div className="w-[24px] h-[24px] border-2 border-text-300"></div>
                    )}
                    <span className="text-14-r text-text-800">인스타그램</span>
                  </div>
                </label>
              </div>

              {/* 네이버 카페 */}
              <div className="flex items-center justify-between">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={contactChannels.naverCafe}
                    onChange={(e) => onChannelChange('naverCafe', e.target.checked)}
                    className="sr-only"
                  />
                  <div className="flex items-center gap-3">
                    {contactChannels.naverCafe ? (
                      <IconCheckBoxActive className="w-5 h-5" />
                    ) : (
                      <div className="w-[24px] h-[24px] border-2 border-text-300"></div>
                    )}
                    <span className="text-14-r text-text-800">네이버 카페</span>
                  </div>
                </label>
              </div>

              {/* 카카오톡 오픈채팅 */}
              <div className="flex items-center justify-between">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={contactChannels.kakaoOpenChat}
                    onChange={(e) => onChannelChange('kakaoOpenChat', e.target.checked)}
                    className="sr-only"
                  />
                  <div className="flex items-center gap-3">
                    {contactChannels.kakaoOpenChat ? (
                      <IconCheckBoxActive className="w-5 h-5" />
                    ) : (
                      <div className="w-[24px] h-[24px] border-2 border-text-300"></div>
                    )}
                    <span className="text-14-r text-text-800">카카오톡 오픈채팅</span>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* 인스타그램 */}
          {contactChannels.instagram && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                인스타그램
              </label>
              <input
                type="url"
                value={channelInputs.instagram}
                onChange={(e) => onChannelInputChange('instagram', e.target.value)}
                placeholder="인스타그램 링크를 입력해 주세요."
                className="w-full px-[15px] py-[18px] text-16-r rounded-[15px] border border-text-600 text-text-800  bg-text-050  focus:border-brand-main focus:ring-1  focus:ring-brand-main focus:bg-brand-sub focus:text-brand-yellow-dark"
              />
              {errors.instagram && (
                <p className="text-xs text-red-500 mt-1">{errors.instagram}</p>
              )}
            </div>
          )}

          {/* 네이버 카페 */}
          {contactChannels.naverCafe && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                네이버 카페
              </label>
              <input
                type="url"
                value={channelInputs.naverCafe}
                onChange={(e) => onChannelInputChange('naverCafe', e.target.value)}
                placeholder="네이버 카페 링크를 입력해 주세요."
                className="w-full px-[15px] py-[18px] text-16-r rounded-[15px] border border-text-600 text-text-800  bg-text-050  focus:border-brand-main focus:ring-1  focus:ring-brand-main focus:bg-brand-sub focus:text-brand-yellow-dark"
              />
              {errors.naverCafe && (
                <p className="text-xs text-red-500 mt-1">{errors.naverCafe}</p>
              )}
            </div>
          )}

          {/* 카카오톡 오픈채팅 */}
          {contactChannels.kakaoOpenChat && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  카카오톡 오픈채팅
                </label>
                <p className="mb-[8px] text-14-r text-text-800">
                  채팅방 우상단 세줄 메뉴 버튼 - 공유 - 링크 복사
                </p>
                <input
                    type="url"
                    value={channelInputs.kakaoOpenChat}
                    onChange={(e) => onChannelInputChange('kakaoOpenChat', e.target.value)}
                    placeholder="오픈채팅 링크를 입력해 주세요."
                    className="w-full px-[15px] py-[18px] text-16-r rounded-[15px] border border-text-600 text-text-800  bg-text-050  focus:border-brand-main focus:ring-1  focus:ring-brand-main focus:bg-brand-sub focus:text-brand-yellow-dark"
                />
                {errors.kakaoOpenChat && (
                    <p className="text-brand-point ">{errors.kakaoOpenChat}</p>
                )}
              </div>
          )}
        </div>
      )}

      {/* 보안 질문/답변 (회원가입 모드 또는 수정 모드에서 이메일 가입 사용자) */}
      {showSecurityQuestion && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              보안 질문 <span className="text-brand-point">*</span>
            </label>
            <p className="text-xs text-gray-500 mb-3">
              {mode === 'signup'
                ? '아이디 찾기 시 사용할 보안 질문을 선택해주세요.'
                : '아이디 찾기 시 사용할 보안 질문을 수정할 수 있습니다.'
              }
            </p>
            <select
              value={formData.securityQuestion || ''}
              onChange={(e) => setFormData(prev => ({...prev, securityQuestion: e.target.value }))}
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
              보안 질문 답변 <span className="text-brand-point">*</span>
            </label>
            <input
              type="text"
              value={formData.securityAnswer || ''}
              onChange={(e) => setFormData(prev => ({...prev, securityAnswer: e.target.value }))}
              placeholder="보안 질문에 대한 답변을 입력해주세요"
              maxLength={50}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-main focus:border-transparent"
            />
            <div className="flex justify-between items-center mt-1">
              <p className="text-xs text-gray-500">아이디 찾기 시 사용됩니다</p>
              <p className="text-xs text-gray-400">
                {(formData.securityAnswer || '').length}/50
              </p>
            </div>
            {errors.securityAnswer && (
              <p className="text-xs text-red-500 mt-1">{errors.securityAnswer}</p>
            )}
          </div>
        </div>
      )}

      {/* 약관 동의 (회원가입 모드에서만) */}
      {showTerms && mode === 'signup' && (
        <div className="space-y-3">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="terms"
              checked={formData.agreeTerms || false}
              onChange={(e) => setFormData(prev => ({...prev, agreeTerms: e.target.checked }))}
              className="w-4 h-4 text-brand-main border-gray-300 rounded focus:ring-brand-main"
            />
            <label htmlFor="terms" className="ml-2 text-sm text-gray-700">
              <span className="text-brand-point">*</span> 이용약관에 동의합니다
            </label>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="privacy"
              checked={formData.agreePrivacy || false}
              onChange={(e) => setFormData(prev => ({...prev, agreePrivacy: e.target.checked }))}
              className="w-4 h-4 text-brand-main border-gray-300 rounded focus:ring-brand-main"
            />
            <label htmlFor="privacy" className="ml-2 text-sm text-gray-700">
              <span className="text-brand-point">*</span> 개인정보처리방침에 동의합니다
            </label>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfileForm;
