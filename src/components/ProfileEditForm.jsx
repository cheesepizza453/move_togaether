'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { Plus } from 'lucide-react';
import { IconRadioActive, IconCheckBoxActive} from "../../public/img/icon/IconCheck";

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
    <div className="space-y-[25px]">
      {/* 프로필 이미지 */}
      <div className="flex justify-center">
        <div className="relative">
          <div className="w-[100px] h-[100px] rounded-full overflow-hidden bg-gray-100 relative">
            {formData.profileImage ? (
              <Image
                src={formData.profileImage}
                alt="프로필 이미지"
                width={100}
                height={100}
                className={'absolute top-1/2 left-1/2 w-full h-full -translate-x-1/2 -translate-y-1/2 object-cover'}
              />
            ) : (
              <div className="w-[100px] h-[100px] flex items-center justify-center">
                <Image
                  src="/img/default_profile.jpg"
                  alt="기본 프로필"
                  width={100}
                  height={100}
                  className={'absolute top-1/2 left-1/2 w-full h-full -translate-x-1/2 -translate-y-1/2 object-cover'}
                />
              </div>
            )}
          </div>
          <button
            onClick={handleProfileImageClick}
            className="absolute -bottom-1 -right-1 w-8 h-8 bg-[#F5C0ACCC] opacity-95  rounded-full flex items-center justify-center text-brand-point"
          >
            <Plus size={22} />
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
            errors.nickname
              ? 'border-brand-point bg-brand-point-bg text-brand-point focus:border-brand-point focus:ring-brand-point'
              : nicknameValidation?.isValid
                ? 'border-[#2BA03E] bg-[#BFE1C5] text-[#2BA03E] focus:border-[#2BA03E] focus:ring-[#2BA03E]'
                : 'border-text-600 bg-text-050 focus:bg-brand-sub focus:text-brand-yellow-dark focus:border-brand-main focus:ring-brand-main'
          } focus:outline-none focus:ring-1 transition-colors`}
          maxLength={20}
        />
        <div className="flex justify-between items-center mt-[4px]">
          <span className={`text-9-r ${
            errors.nickname
              ? 'text-brand-point'
              : nicknameValidation?.isValid
                ? 'text-[#2BA03E]'
                : 'text-brand-point'
          }`}>
            {errors.nickname
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
      <div>
        <label className="block text-16-m mb-[12px]">
          소개글<span className="text-brand-point">*</span>
        </label>
        <textarea
            value={formData.introduction}
            onChange={(e) => setFormData(prev => ({...prev, introduction: e.target.value }))}
          placeholder="소개글을 입력해주세요."
          className="w-full px-[15px] py-[18px] text-16-r rounded-[15px] border text-text-800 border-text-600 bg-text-050 focus:outline-none focus:ring-2 focus:border-brand-main focus:bg-brand-sub focus:text-brand-yellow-dark resize-none"
          rows={4}
          maxLength={100}
        />
        <div className="flex justify-end mt-[4px]">
          <span className="text-12-l text-text-800">
            {formData.introduction.length}/100
          </span>
        </div>
      </div>

      {/* 연락처 */}
      <div>
        <label className="block text-16-m mb-[4px]">
          연락처
        </label>
        <p className="mb-[14px] text-14-r text-[#676767]">
          봉사자와 임보자가 연락할 전화번호입니다.
        </p>

        {/* 공개/비공개 선택 */}
        <div className="flex space-x-[7px] mb-[8px]">
          <label className="flex items-center">
            <input
                type="radio"
                name="phoneVisibility"
                value="public"
                checked={phoneVisibility === 'public'}
                onChange={(e) => setPhoneVisibility(e.target.value)}
                className="hidden peer"
            />
            <span className={'peer-checked:hidden inline-block w-[24px] h-[24px] rounded-full bg-text-100 border border-text-300'}></span>
            <span className={'hidden peer-checked:block'}>
              <IconRadioActive/>
            </span>
            <span className="ml-[4px] text-14-r text-black">공개</span>
          </label>
          <label className="flex items-center">
            <input
                type="radio"
                name="phoneVisibility"
                value="private"
                checked={phoneVisibility === 'private'}
                onChange={(e) => setPhoneVisibility(e.target.value)}
                className="hidden peer"
            />
            <span
                className={'peer-checked:hidden inline-block w-[24px] h-[24px] rounded-full bg-text-100 border border-text-300'}></span>
            <span className={'hidden peer-checked:block'}>
              <IconRadioActive />
            </span>
            <span className="ml-[4px] text-14-r text-black">비공개</span>
          </label>
        </div>

        <input
            type="tel"
            maxLength="11"
            value={formData.phone}
            onChange={(e) => {
              const value = e.target.value.replace(/[^\d]/g, '');
              setFormData(prev => ({...prev, phone: value}));
            }}

            placeholder="01012341234"
            className={`w-[150px] px-[15px] py-[18px] text-16-r rounded-[15px] border text-text-800 ${
                phoneVisibility === 'public'
                    ? 'border-text-600 bg-text-050 focus:border-brand-main focus:bg-brand-sub'
                    : 'border-text-300 bg-text-300 text-text-800'
            } focus:outline-none focus:ring-1 focus:ring-yellow-400`}
            disabled={phoneVisibility === 'private'}
        />
        {errors.phone && (
            <p className="text-xs text-red-500 mt-1">{errors.phone}</p>
        )}
      </div>

      {/* 연락 채널 */}
      <div>
        <label className="block text-16-m mb-[4px]">
          연락채널
        </label>
        <p className="mb-[14px] text-14-r text-[#676767]">
          임보견 정보를 볼 수 있는 채널을 선택하고 링크를 입력해 주세요. (봉사자는 입력하지 않아도 돼요.)
        </p>

        {/* 채널 선택 */}
        <div className="flex space-x-4 mb-4">
          <label className="flex items-center cursor-pointer">
            <input
                type="checkbox"
                checked={contactChannels.instagram}
                onChange={() => onChannelChange('instagram')}
                className="hidden peer"/>
            <span className="peer-checked:hidden inline-block w-[24px] h-[24px] bg-text-100 border border-text-300"></span>
            <span className={'hidden peer-checked:block'}>
              <IconCheckBoxActive/>
            </span>
            <span className="ml-[4px] text-14-r text-black">인스타그램</span>
          </label>

          <label className="flex items-center cursor-pointer">
            <input
                type="checkbox"
                checked={contactChannels.naverCafe}
                onChange={() => onChannelChange('naverCafe')}
                className="hidden peer"
            />
            <span
                className="peer-checked:hidden inline-block w-[24px] h-[24px] bg-text-100 border border-text-300"></span>
            <span className={'hidden peer-checked:block'}>
              <IconCheckBoxActive/>
            </span>
            <span className="ml-[4px] text-14-r text-black">네이버 카페</span>
          </label>

          <label className="flex items-center cursor-pointer">
            <input
                type="checkbox"
                checked={contactChannels.kakaoOpenChat}
                onChange={() => onChannelChange('kakaoOpenChat')}
                className="hidden peer"
            />
            <span
                className="peer-checked:hidden inline-block w-[24px] h-[24px] bg-text-100 border border-text-300"></span>
            <span className={'hidden peer-checked:block'}>
              <IconCheckBoxActive/>
            </span>
            <span className="ml-[4px] text-14-r text-black">카카오톡 오픈채팅</span>
          </label>
        </div>

        {/* 인스타그램 */}
        {contactChannels.instagram && (
            <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
                인스타그램
              </label>
              <p className="mb-[8px] text-14-r text-text-800">
                비공개 계정은 봉사자가 확인할 수 없어요
              </p>
              <input
                  type="text"
                  value={channelInputs.instagram}
              onChange={(e) => onChannelInputChange('instagram', e.target.value)}
              placeholder="인스타그램 ID를 입력해 주세요."
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
    </div>
  );
};

export default ProfileEditForm;
