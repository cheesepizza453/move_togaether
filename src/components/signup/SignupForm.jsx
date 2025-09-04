'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import Image from 'next/image';

const SignupForm = ({
  formData,
  setFormData,
  contactChannels,
  setContactChannels,
  channelInputs,
  setChannelInputs,
  errors,
  setErrors,
  nicknameValidation,
  setNicknameValidation,
  nicknameChecking,
  setNicknameChecking,
  onNicknameChange,
  onNicknameBlur,
  onChannelChange,
  onChannelInputChange,
  showProfileImage = true,
  showIntroduction = true
}) => {
  return (
    <div className="space-y-4">
      {/* 프로필 사진 */}
      {showProfileImage && (
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
      )}

      {/* 닉네임 입력 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          닉네임 <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <input
            type="text"
            value={formData.nickname}
            onChange={(e) => onNicknameChange(e.target.value)}
            onBlur={(e) => onNicknameBlur(e.target.value)}
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
          {nicknameValidation ? (
            <p className={`text-xs ${
              nicknameValidation.isValid ? 'text-green-500' : 'text-red-500'
            }`}>
              {nicknameValidation.message}
            </p>
          ) : errors.nickname ? (
            <p className="text-xs text-red-500">{errors.nickname}</p>
          ) : null}
        </div>
      </div>

      {/* 소개 입력 */}
      {showIntroduction && (
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
      )}

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
              onChange={() => onChannelChange('instagram')}
              className="w-4 h-4 text-yellow-600 border-gray-300 rounded focus:ring-yellow-500"
            />
            <span className="text-sm text-gray-700">인스타그램</span>
          </label>

          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={contactChannels.naverCafe}
              onChange={() => onChannelChange('naverCafe')}
              className="w-4 h-4 text-yellow-600 border-gray-300 rounded focus:ring-yellow-500"
            />
            <span className="text-sm text-gray-700">네이버 카페</span>
          </label>

          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={contactChannels.kakaoOpenChat}
              onChange={() => onChannelChange('kakaoOpenChat')}
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
              onChange={(e) => onChannelInputChange('instagram', e.target.value)}
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
              onChange={(e) => onChannelInputChange('naverCafe', e.target.value)}
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
              onChange={(e) => onChannelInputChange('kakaoOpenChat', e.target.value)}
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
  );
};

export default SignupForm;
