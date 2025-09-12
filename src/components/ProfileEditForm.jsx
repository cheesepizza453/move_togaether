'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { Plus } from 'lucide-react';

const ProfileEditForm = ({
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
  onProfileImageChange
}) => {
  const [phoneVisibility, setPhoneVisibility] = useState('public');
  const fileInputRef = useRef(null);

  const handleProfileImageClick = () => {
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

  return (
    <div className="space-y-6">
      {/* 프로필 이미지 */}
      <div className="flex justify-center">
        <div className="relative">
          <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 relative">
            {formData.profileImage ? (
              <Image
                src={formData.profileImage}
                alt="프로필 이미지"
                width={96}
                height={96}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <Image
                  src="/img/default_profile.jpg"
                  alt="기본 프로필"
                  width={96}
                  height={96}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>
          <button
            onClick={handleProfileImageClick}
            className="absolute -bottom-1 -right-1 w-8 h-8 bg-pink-400 rounded-full flex items-center justify-center text-white hover:bg-pink-500 transition-colors"
          >
            <Plus size={16} />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      </div>

      {/* 이름 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          이름 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.nickname}
          onChange={(e) => onNicknameChange(e.target.value)}
          onBlur={(e) => onNicknameBlur(e.target.value)}
          placeholder="멍뭉멍뭉보호소"
          className={`w-full px-4 py-3 rounded-xl text-sm border-2 ${
            errors.nickname
              ? 'border-red-300 bg-red-50'
              : nicknameValidation?.isValid
                ? 'border-green-300 bg-green-50'
                : 'border-yellow-200 bg-yellow-50'
          } focus:outline-none focus:ring-2 focus:ring-yellow-400`}
          maxLength={20}
        />
        <div className="flex justify-between items-center mt-1">
          <span className={`text-xs ${
            nicknameValidation?.isValid ? 'text-green-600' : 'text-red-600'
          }`}>
            {nicknameChecking ? '확인 중...' : nicknameValidation?.message || ''}
          </span>
          <span className="text-xs text-gray-500">
            {formData.nickname.length}/20
          </span>
        </div>
        {errors.nickname && (
          <p className="text-xs text-red-500 mt-1">{errors.nickname}</p>
        )}
      </div>

      {/* 소개글 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          소개글 <span className="text-red-500">*</span>
        </label>
        <textarea
          value={formData.introduction}
          onChange={(e) => setFormData(prev => ({ ...prev, introduction: e.target.value }))}
          placeholder="부천에 있는 0000 보호소입니다. 아이들이 행복을 찾을 수 있도록 도와주세요."
          className="w-full px-4 py-3 rounded-xl text-sm border-2 border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-yellow-400 resize-none"
          rows={4}
          maxLength={100}
        />
        <div className="flex justify-end mt-1">
          <span className="text-xs text-gray-500">
            {formData.introduction.length}/100
          </span>
        </div>
      </div>

      {/* 연락처 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          연락처
        </label>
        <p className="text-xs text-gray-500 mb-3">
          봉사자와 임보자가 연락할 전화번호입니다.
        </p>

        {/* 공개/비공개 선택 */}
        <div className="flex space-x-4 mb-3">
          <label className="flex items-center">
            <input
              type="radio"
              name="phoneVisibility"
              value="public"
              checked={phoneVisibility === 'public'}
              onChange={(e) => setPhoneVisibility(e.target.value)}
              className="w-4 h-4 text-yellow-600 border-gray-300 focus:ring-yellow-500"
            />
            <span className="ml-2 text-sm text-gray-700">공개</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="phoneVisibility"
              value="private"
              checked={phoneVisibility === 'private'}
              onChange={(e) => setPhoneVisibility(e.target.value)}
              className="w-4 h-4 text-yellow-600 border-gray-300 focus:ring-yellow-500"
            />
            <span className="ml-2 text-sm text-gray-700">비공개</span>
          </label>
        </div>

        <input
          type="tel"
          value={formData.phone}
          onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
          placeholder="010-0000-0000"
          className={`w-full px-4 py-3 rounded-xl text-sm border-2 ${
            phoneVisibility === 'public'
              ? 'border-yellow-200 bg-yellow-50'
              : 'border-gray-200 bg-gray-50'
          } focus:outline-none focus:ring-2 focus:ring-yellow-400`}
          disabled={phoneVisibility === 'private'}
        />
        {errors.phone && (
          <p className="text-xs text-red-500 mt-1">{errors.phone}</p>
        )}
      </div>

      {/* 연락 채널 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          연락채널
        </label>
        <p className="text-xs text-gray-500 mb-3">
          동물 정보를 볼 수 있는 채널을 선택하고 링크를 입력해 주세요. (봉사자는 입력하지 않아도 돼요)
        </p>

        {/* 채널 선택 */}
        <div className="flex space-x-4 mb-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={contactChannels.instagram}
              onChange={() => onChannelChange('instagram')}
              className="w-4 h-4 text-yellow-600 border-gray-300 rounded focus:ring-yellow-500"
            />
            <span className="ml-2 text-sm text-gray-700">인스타그램</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={contactChannels.naverCafe}
              onChange={() => onChannelChange('naverCafe')}
              className="w-4 h-4 text-yellow-600 border-gray-300 rounded focus:ring-yellow-500"
            />
            <span className="ml-2 text-sm text-gray-700">네이버 카페</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={contactChannels.kakaoOpenChat}
              onChange={() => onChannelChange('kakaoOpenChat')}
              className="w-4 h-4 text-yellow-600 border-gray-300 rounded focus:ring-yellow-500"
            />
            <span className="ml-2 text-sm text-gray-700">카카오톡 오픈채팅</span>
          </label>
        </div>

        {/* 인스타그램 */}
        {contactChannels.instagram && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              인스타그램
            </label>
            <p className="text-xs text-gray-500 mb-2">
              비공개 계정은 봉사자가 확인할 수 없어요
            </p>
            <input
              type="text"
              value={channelInputs.instagram}
              onChange={(e) => onChannelInputChange('instagram', e.target.value)}
              placeholder="인스타그램 ID를 입력해 주세요."
              className="w-full px-4 py-3 rounded-xl text-sm border-2 border-yellow-200 bg-yellow-50 focus:outline-none focus:ring-2 focus:ring-yellow-400"
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
              className="w-full px-4 py-3 rounded-xl text-sm border-2 border-yellow-200 bg-yellow-50 focus:outline-none focus:ring-2 focus:ring-yellow-400"
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
            <input
              type="url"
              value={channelInputs.kakaoOpenChat}
              onChange={(e) => onChannelInputChange('kakaoOpenChat', e.target.value)}
              placeholder="오픈채팅 링크를 입력해 주세요."
              className="w-full px-4 py-3 rounded-xl text-sm border-2 border-yellow-200 bg-yellow-50 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
            {errors.kakaoOpenChat && (
              <p className="text-xs text-red-500 mt-1">{errors.kakaoOpenChat}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileEditForm;
