'use client';

import { useState, useRef } from 'react';
import ProfileImage from '@/components/common/ProfileImage';
import { Plus } from 'lucide-react';
import { IconRadioActive, IconCheckBoxActive} from "../../public/img/icon/IconCheck";
import { SECURITY_QUESTIONS } from '@/constants/securityQuestions';
import { toast } from 'sonner';

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
  const fileInputRef = useRef(null);

  // 공통으로 쓸 수 있는 압축 함수
  const resizeImage = (file, maxWidth = 1024, quality = 0.85) => {
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
            quality
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
      setErrors(prev => ({ ...prev, profileImage: '파일 크기는 5MB 이하여야 합니다.' }));
      return;
    }

    if (!file.type.startsWith('image/')) {
      setErrors(prev => ({ ...prev, profileImage: '이미지 파일만 업로드 가능합니다.' }));
      return;
    }

    try {
      const resizedDataUrl = await resizeImage(file, 512, 0.85); // 프로필은 512px 정도면 충분
      // 대략적인 용량 계산
      const base64 = resizedDataUrl.split(',')[1] || '';
      const estimatedSizeKB = Math.round((base64.length * 3) / 4 / 1024);
      console.log(`프로필 이미지 리사이즈: ${Math.round(file.size/1024)}KB → 약 ${estimatedSizeKB}KB`);

      setErrors(prev => ({ ...prev, profileImage: undefined }));
      onProfileImageChange(resizedDataUrl); // 부모로 전달

      if (estimatedSizeKB > 500) {
        toast?.warning?.(`이미지가 약 ${estimatedSizeKB}KB입니다. 500KB를 조금 넘을 수 있어요.`);
      }
    } catch (err) {
      console.error(err);
      setErrors(prev => ({ ...prev, profileImage: '이미지 처리 중 오류가 발생했습니다.' }));
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
            <ProfileImage
              profileImage={formData.profileImage}
              size={80}
              alt="프로필 이미지"
              className="bg-[#FFDD44]"
            />
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
      {/* 전화번호 공개 설정 (편집 모드에서만) */}
      {/*          {mode === 'edit' && (
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
          )}*/}
      {showPhone && (
          <div>
            <label className="block text-16-m mb-[12px]">
              전화번호<span className="text-brand-point">*</span>
            </label>
            <p className="text-14-r text-text-800 mb-4">봉사 문의를 남겼을 때에만 이동 요청자에게 공개돼요.</p>
            <input
                type="tel"
                value={formData.phone}
                maxLength={11}
                onChange={(e) => {
                  const onlyNumbers = e.target.value.replace(/[^0-9]/g, '');
                  setFormData(prev => ({ ...prev, phone: onlyNumbers }));
                }}
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
{/*              <div className="flex items-center justify-between">
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
              </div>*/}

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
                <p className="mb-[8px] text-14-r text-text-800">
                  ID(유저네임)을 입력해주세요. ex) movetogaether
                </p>
                <input
                    type="url"
                    value={channelInputs.instagram}
                    onChange={(e) => onChannelInputChange('instagram', e.target.value)}
                    placeholder="인스타그램 링크를 입력해 주세요."
                    className="w-full px-[15px] py-[18px] text-16-r rounded-[15px] border border-text-600 text-text-800  bg-text-050  focus:border-brand-main focus:ring-1  focus:ring-brand-main focus:bg-brand-sub focus:text-brand-yellow-dark"
                />
                {errors.instagram && (
                    <p className="text-10-r text-brand-point mt-[4px]">{errors.instagram}</p>
                )}
              </div>
          )}

          {/* 네이버 카페 */}
{/*          {contactChannels.naverCafe && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  네이버 카페
                </label>
                <p className="mb-[8px] text-14-r text-text-800">
                  'https://www'를 포함해주세요. ex) https://www.move-togaether.com
                </p>
                <input
                    type="url"
                    value={channelInputs.naverCafe}
                    onChange={(e) => onChannelInputChange('naverCafe', e.target.value)}
                    placeholder="네이버 카페 링크를 입력해 주세요."
                    className="w-full px-[15px] py-[18px] text-16-r rounded-[15px] border border-text-600 text-text-800  bg-text-050  focus:border-brand-main focus:ring-1  focus:ring-brand-main focus:bg-brand-sub focus:text-brand-yellow-dark"
                />
                {errors.naverCafe && (
                    <p className="text-10-r text-brand-point mt-[4px]">{errors.naverCafe}</p>
                )}
              </div>
          )}*/}

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
                    <p className="text-10-r text-brand-point mt-[4px]">{errors.kakaoOpenChat}</p>
                )}
              </div>
          )}
        </div>
      )}

      {/* 보안 질문/답변 (회원가입 모드 또는 수정 모드에서 이메일 가입 사용자) */}
      {showSecurityQuestion && (
          <div className="space-y-4">
            {/* edit 모드일 때만 보기/숨기기 버튼 노출 */}
            {mode === 'edit' && (
                <div className="flex justify-between items-center mb-2">
                  <button
                      type="button"
                      onClick={() => setIsSecurityVisible(prev => !prev)}
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
                    <select
                        value={formData.securityQuestion || ''}
                        onChange={(e) =>
                            setFormData(prev => ({ ...prev, securityQuestion: e.target.value }))
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
                        <p className="text-xs text-red-500 mt-1">{errors.securityQuestion}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-16-m mb-[12px]">
                      보안 질문 답변<span className="text-brand-point">*</span>
                    </label>
                    <input
                        type="text"
                        value={formData.securityAnswer || ''}
                        onChange={(e) =>
                            setFormData(prev => ({ ...prev, securityAnswer: e.target.value }))
                        }
                        placeholder="보안 질문에 대한 답변을 입력해주세요"
                        maxLength={50}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-main focus:border-transparent"
                    />
                    <div className="flex justify-end mt-[4px]">
            <span className="text-12-l text-text-800">
              {(formData.securityAnswer || '').length}/50
            </span>
                    </div>

                    {errors.securityAnswer && (
                        <p className="text-xs text-red-500 mt-1">{errors.securityAnswer}</p>
                    )}
                  </div>
                </>
            )}
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
