'use client';

import React, { useState, useRef } from 'react';
import ProfileImage from '@/components/common/ProfileImage';
import { Plus } from 'lucide-react';
import { IconRadioActive, IconCheckBoxActive } from '../../public/img/icon/IconCheck';
import { SECURITY_QUESTIONS } from '@/constants/securityQuestions';
import { toast } from 'sonner';
import TermsText from "@/components/terms/TermsText";
import PrivacyText from "@/components/privacy/PrivacyText";

const UserProfileForm = (props) => {
  const {
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
    onPhoneChange,
    onSecurityQuestionChange,
    onSecurityAnswerChange,
    mode = 'edit',
    showProfileImage = true,
    showIntroduction = true,
    showPhone = true,
    showSocialChannels = true,
    showPassword = false,
    showPasswordConfirm = false,
    showTerms = false,
    showSecurityQuestion = false,
    isNicknameReadOnly = false,
  } = props;

  const [phoneVisibility, setPhoneVisibility] = useState('public');
  const [isSecurityVisible, setIsSecurityVisible] = useState(mode !== 'edit');
  const [showTermsDetail, setShowTermsDetail] = useState(false);
  const [showPrivacyDetail, setShowPrivacyDetail] = useState(false);
  const fileInputRef = useRef(null);

  // 공통으로 쓸 수 있는 압축 함수
  const resizeImage = (file, maxWidth = 550, quality = 0.85) => {
    return new Promise((resolve, reject) => {
      const img = new window.Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      img.onload = () => {
        const originalWidth = img.width;
        const originalHeight = img.height;

        // 이미 작으면 그대로 사용
        if (originalWidth <= maxWidth) {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target.result);
          reader.readAsDataURL(file);
          return;
        }

        const ratio = maxWidth / originalWidth;
        const newWidth = maxWidth;
        const newHeight = Math.round(originalHeight * ratio);

        canvas.width = newWidth;
        canvas.height = newHeight;

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, newWidth, newHeight);

        canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('이미지 압축에 실패했습니다.'));
                return;
              }
              const reader = new FileReader();
              reader.onload = (e) => resolve(e.target.result);
              reader.readAsDataURL(blob);
            },
            file.type || 'image/jpeg',
            quality,
        );
      };

      img.onerror = () => reject(new Error('이미지를 불러올 수 없습니다.'));
      img.src = URL.createObjectURL(file);
    });
  };

  const handleProfileImageClick = () => {
    if (mode === 'signup') return;
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // 5MB 제한
    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, profileImage: '파일 크기는 5MB 이하여야 합니다.' }));
      return;
    }

    if (!file.type.startsWith('image/')) {
      setErrors((prev) => ({ ...prev, profileImage: '이미지 파일만 업로드 가능합니다.' }));
      return;
    }

    try {
      const resizedDataUrl = await resizeImage(file, 150, 0.8); // 프로필은 512px 정도면 충분
      // 대략적인 용량 계산
      const base64 = resizedDataUrl.split(',')[1] || '';
      const estimatedSizeKB = Math.round((base64.length * 3) / 4 / 1024);
      console.log(`프로필 이미지 리사이즈: ${Math.round(file.size / 1024)}KB → 약 ${estimatedSizeKB}KB`);

      setErrors((prev) => ({ ...prev, profileImage: undefined }));
      onProfileImageChange(resizedDataUrl); // 부모로 전달

      if (estimatedSizeKB > 500) {
        toast?.warning?.(`이미지가 약 ${estimatedSizeKB}KB입니다. 500KB를 조금 넘을 수 있어요.`);
      }
    } catch (err) {
      console.error(err);
      setErrors((prev) => ({ ...prev, profileImage: '이미지 처리 중 오류가 발생했습니다.' }));
    }
  };

  console.log(errors);
  console.log('>>>>', nicknameValidation);

  return (
      <div className="space-y-4">
        {/* 프로필 사진 */}
        {showProfileImage && mode === 'edit' && (
            <div className="flex justify-center">
              <div className="relative">
                <ProfileImage
                    profileImage={formData.profileImage}
                    size={80}
                    alt="프로필 이미지"
                    className="bg-[#FFDD44]"
                />
                  <button
                      onClick={handleProfileImageClick}
                      className="absolute -bottom-1 -right-1 w-6 h-6 bg-brand-main rounded-full flex items-center justify-center hover:bg-brand-yellow-dark transition-colors"
                  >
                    <Plus size={16} className="text-gray-800" />
                  </button>
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

        {/* 닉네임 */}
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
          <span
              className={`text-9-r ${
                  isNicknameReadOnly
                      ? 'text-gray-500'
                      : errors.nickname
                          ? 'text-brand-point' // 에러는 빨간색
                          : nicknameChecking
                              ? 'text-text-800' // 확인 중은 회색
                              : nicknameValidation?.available
                                  ? 'text-[#2BA03E]' // 중복 체크까지 통과 → 초록
                                  : nicknameValidation?.isValid
                                      ? 'text-text-800' // 로컬 규칙만 통과 → 회색
                                      : nicknameValidation
                                          ? 'text-brand-point' // 로컬 규칙 실패(길이/특문 등) → 빨간색
                                          : 'text-text-800' // 기본
              }`}
          >
            {isNicknameReadOnly
                ? '닉네임은 수정할 수 없습니다.'
                : errors.nickname
                    ? errors.nickname
                    : nicknameChecking
                        ? '확인 중!'
                        : nicknameValidation?.message || ''}
          </span>
            <span className="text-12-l text-text-800">
            {formData.nickname.length}/20
          </span>
          </div>
        </div>

        {/* 소개글 */}
        {showIntroduction && (
            <div>
              <label className="block text-16-m mb-[12px]">소개글</label>
              <textarea
                  value={formData.introduction}
                  onChange={(e) =>
                      setFormData((prev) => ({ ...prev, introduction: e.target.value }))
                  }
                  placeholder="간단한 소개를 적어주세요."
                  className="w-full px-[15px] py-[18px] text-16-r rounded-[15px] border border-text-600 text-text-800 bg-text-050 focus:border-brand-main focus:ring-1 focus:ring-brand-main focus:bg-brand-sub focus:text-brand-yellow-dark focus:outline-none transition-colors resize-none"
                  rows={4}
                  maxLength={200}
              />
              <div className="flex justify-end">
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
              <p className="text-14-r text-text-800 mb-4">
                봉사 문의를 남겼을 때에만 이동 요청자에게 공개돼요.
              </p>
              <input
                  type="tel"
                  value={formData.phone}
                  maxLength={11}
                  onChange={(e) => {
                    const value = e.target.value;
                    // 부모에서 핸들러 내려줬으면 그걸 사용
                    if (onPhoneChange) {
                      onPhoneChange(value);
                    } else {
                      // 아니면 기존 로직 그대로 fallback
                      const onlyNumbers = value.replace(/[^0-9]/g, '');
                      setFormData((prev) => ({ ...prev, phone: onlyNumbers }));
                    }
                  }}
                  placeholder="전화번호를 입력해주세요."
                  className={`w-full px-[15px] py-[18px] text-16-r rounded-[15px] border text-text-800 ${
                      errors.phone
                          ? 'border-brand-point bg-brand-point-bg text-brand-point focus:border-brand-point focus:ring-brand-point'
                          : 'border-text-600 bg-text-050 focus:bg-brand-sub focus:text-brand-yellow-dark focus:border-brand-main focus:ring-brand-main'
                  } focus:outline-none focus:ring-1 transition-colors`}
              />
              <div className={'min-h-[12px]'}>
                {errors.phone && (
                    <p className=" text-9-r text-brand-point mt-[4px]">{errors.phone}</p>
                )}
              </div>
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
                  onChange={(e) =>
                      setFormData((prev) => ({ ...prev, password: e.target.value }))
                  }
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
                  onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        passwordConfirm: e.target.value,
                      }))
                  }
                  placeholder="비밀번호를 다시 입력해주세요."
                  className={`w-full px-[15px] py-[18px] text-16-r rounded-[15px] border text-text-800 ${
                      errors.passwordConfirm
                          ? 'border-brand-point bg-brand-point-bg text-brand-point focus:border-brand-point focus:ring-brand-point'
                          : 'border-text-600 bg-text-050 focus:bg-brand-sub focus:text-brand-yellow-dark focus:border-brand-main focus:ring-brand-main'
                  } focus:outline-none focus:ring-1 transition-colors`}
              />
              {errors.passwordConfirm && (
                  <p className="text-9-r text-brand-point mt-[4px]">
                    {errors.passwordConfirm}
                  </p>
              )}
            </div>
        )}

        {/* 연락 채널 */}
        {showSocialChannels && (
            <div className="space-y-4">
              <div>
                <p className="text-16-m mb-[12px]">연락 채널</p>
                <p className="text-14-r text-text-800 mb-4">
                  연락받고 싶은 채널을 선택해주세요.
                </p>

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
                            <IconCheckBoxActive className="w-5 h-5"/>
                        ) : (
                            <div className="w-[24px] h-[24px] border-2 border-text-300"/>
                        )}
                        <span className="text-14-r text-text-800">인스타그램</span>
                      </div>
                    </label>
                  </div>

                  {/* 카카오톡 오픈채팅 */}
                  <div className="flex items-center justify-between">
                    <label className="flex items-center cursor-pointer">
                      <input
                          type="checkbox"
                          checked={contactChannels.kakaoOpenChat}
                          onChange={(e) =>
                              onChannelChange('kakaoOpenChat', e.target.checked)
                          }
                          className="sr-only"
                      />
                      <div className="flex items-center gap-3">
                        {contactChannels.kakaoOpenChat ? (
                            <IconCheckBoxActive className="w-5 h-5"/>
                        ) : (
                            <div className="w-[24px] h-[24px] border-2 border-text-300"/>
                        )}
                        <span className="text-14-r text-text-800">카카오톡 오픈채팅</span>
                      </div>
                    </label>
                  </div>
                </div>
                <div className={'min-h-[12px]'}>
                </div>
              </div>

              {/* 인스타그램 입력 */}
              {contactChannels.instagram && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                    인스타그램
                    </label>
                    <p className="mb-[8px] text-14-r text-text-800">
                      ID(유저네임)을 입력해주세요. ex) movetogaether
                    </p>
                    <input
                        type="text"
                        value={channelInputs.instagram}
                        onChange={(e) =>
                            onChannelInputChange('instagram', e.target.value)
                        }
                        placeholder="인스타그램 ID(영문 유저네임)를 입력해 주세요."
                        className="w-full px-[15px] py-[18px] text-16-r rounded-[15px] border border-text-600 text-text-800 bg-text-050 focus:border-brand-main focus:ring-1 focus:ring-brand-main focus:bg-brand-sub focus:text-brand-yellow-dark"
                    />
                    {errors.instagram && (
                        <p className="text-10-r text-brand-point mt-[4px]">
                          {errors.instagram}
                        </p>
                    )}
                  </div>
              )}

              {/* 카카오톡 오픈채팅 입력 */}
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
                        onChange={(e) =>
                            onChannelInputChange('kakaoOpenChat', e.target.value)
                        }
                        placeholder="오픈채팅 링크를 입력해 주세요."
                        className="w-full px-[15px] py-[18px] text-16-r rounded-[15px] border border-text-600 text-text-800 bg-text-050 focus:border-brand-main focus:ring-1 focus:ring-brand-main focus:bg-brand-sub focus:text-brand-yellow-dark"
                    />
                    {errors.kakaoOpenChat && (
                        <p className="text-10-r text-brand-point mt-[4px]">
                          {errors.kakaoOpenChat}
                        </p>
                    )}
                  </div>
              )}
            </div>
        )}

        {/* 보안 질문/답변 */}
        {showSecurityQuestion && (
            <div className="space-y-4">
              {/* edit 모드일 때만 보기/숨기기 버튼 노출 */}
              {mode === 'edit' && (
                  <div className="flex justify-between items-center mb-2">
                    <button
                        type="button"
                        onClick={() => setIsSecurityVisible((prev) => !prev)}
                        className="text-12-r text-text-800 underline"
                    >
                      {isSecurityVisible ? '보안 질문 숨기기' : '보안 질문 보기'}
                    </button>
                  </div>
              )}

              {/* 실제 입력 폼은 isSecurityVisible 이 true일 때만 노출 */}
              {isSecurityVisible && (
                  <>
                    <div>
                      <label className="block text-16-m mb-[12px]">
                        보안 질문<span className="text-brand-point">*</span>
                      </label>
                      <p className="text-14-r text-text-800 mb-4">
                        보안 질문은 아이디 찾기 시 사용됩니다.
                      </p>
                      <select
                          value={formData.securityQuestion || ''}
                          onChange={(e) =>
                              onSecurityQuestionChange
                                  ? onSecurityQuestionChange(e.target.value)
                                  : setFormData((prev) => ({
                                    ...prev,
                                    securityQuestion: e.target.value,
                                  }))
                          }
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
                          <p className="text-10-r text-brand-point mt-[4px]">
                            {errors.securityQuestion}
                          </p>
                      )}
                      <div className={'min-h-[12px]'}>
                      </div>
                    </div>

                    <div>
                      <label className="block text-16-m mb-[12px]">
                        보안 질문 답변<span className="text-brand-point">*</span>
                      </label>
                      <input
                          type="text"
                          value={formData.securityAnswer || ''}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (onSecurityAnswerChange) {
                              onSecurityAnswerChange(value);
                            } else {
                              setFormData((prev) => ({
                                ...prev,
                                securityAnswer: value,
                              }));
                            }
                          }}
                          placeholder="보안 질문에 대한 답변을 입력해주세요"
                          maxLength={50}
                          className={`w-full px-[15px] py-[18px] text-16-r rounded-[15px] border text-text-800 ${
                              errors.securityAnswer
                                  ? 'border-brand-point bg-brand-point-bg text-brand-point focus:border-brand-point focus:ring-brand-point'
                                  : 'border-text-600 bg-text-050 focus:bg-brand-sub focus:text-brand-yellow-dark focus:border-brand-main focus:ring-brand-main'
                          } focus:outline-none focus:ring-1 transition-colors`}
                      />

                      <div className="flex justify-between items-center mt-[4px]">
                  <span className="text-10-r text-brand-point">
                    {errors.securityAnswer || ''}
                  </span>
                        <span className="text-12-l text-text-800">
                    {(formData.securityAnswer || '').length}/50
                  </span>
                      </div>
                    </div>
                  </>
              )}
            </div>
        )}

        {/* 약관 동의 (회원가입 모드에서만) */}
        {showTerms && mode === 'signup' && (
          <div className="space-y-3">
            {/* 이용약관 */}
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <label className="flex items-center cursor-pointer">
                    <input
                        type="checkbox"
                        id="terms"
                        checked={formData.agreeTerms || false}
                        onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              agreeTerms: e.target.checked,
                            }))
                        }
                        className="sr-only"
                    />
                    <div className="flex items-center gap-3">
                      {formData.agreeTerms ? (
                          <IconCheckBoxActive className="w-5 h-5"/>
                      ) : (
                          <div className="w-[24px] h-[24px] border-2 border-text-300"/>
                      )}
                      <span className="text-14-r text-text-800">이용약관에 동의합니다<span className="text-brand-point">*</span></span>
                    </div>
                  </label>
                </div>
                <button
                    type="button"
                    onClick={() => setShowTermsDetail((prev) => !prev)}
                    className="text-10-r text-brand-yellow-dark underline"
                >
                  보기
                </button>
              </div>

              {showTermsDetail && (
              <div className="mt-2 p-[10px] bg-gray-100 rounded-md text-xs leading-relaxed text-gray-700">
                <div className="flex items-center py-[28px] px-[30px]">
                  <div>
                    <p className="text-22-m text-black">이용약관</p>
                  </div>
                </div>
                <TermsText/>
              </div>
              )}
          </div>

          {/* 개인정보처리방침 */}
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <label className="flex items-center cursor-pointer">
                  <input
                      type="checkbox"
                      id="terms"
                      checked={formData.agreePrivacy || false}
                      onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            agreePrivacy: e.target.checked,
                          }))
                      }
                      className="sr-only"
                  />
                  <div className="flex items-center gap-3">
                    {formData.agreePrivacy ? (
                        <IconCheckBoxActive className="w-5 h-5"/>
                    ) : (
                        <div className="w-[24px] h-[24px] border-2 border-text-300"/>
                    )}
                    <span className="text-14-r text-text-800">개인정보처리방침에 동의합니다<span
                        className="text-brand-point">*</span></span>
                  </div>
                </label>
              </div>

              <button
                  type="button"
                  onClick={() => setShowPrivacyDetail((prev) => !prev)}
                  className="text-10-r text-brand-yellow-dark underline"
              >
                보기
              </button>
            </div>

            {showPrivacyDetail && (
                <div className="mt-2 p-[10px] bg-gray-100 rounded-md text-xs leading-relaxed text-gray-700">
                  <div className="flex items-center py-[28px] px-[30px]">
                    <div>
                      <p className="text-22-m text-black">이용약관</p>
                    </div>
                  </div>
                  <PrivacyText/>
                </div>
            )}
          </div>
          </div>
        )}
      </div>
  );
};

export default UserProfileForm;
