'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ProfileEditForm from '@/components/ProfileEditForm';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog";
import { cn } from "@/lib/utils";

// 커스텀 AlertDialogContent (오버레이 없이)
const CustomAlertDialogContent = React.forwardRef(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Portal>
    <AlertDialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-[50%] top-[50%] z-[9999] grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-90 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
        className
      )}
      {...props}
    />
  </AlertDialogPrimitive.Portal>
));
CustomAlertDialogContent.displayName = AlertDialogPrimitive.Content.displayName;

const EditProfilePage = () => {
  const { user, profile, loading, checkNicknameDuplicate, updateProfile } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({
    nickname: '',
    introduction: '',
    phone: '',
    profileImage: ''
  });
  const [originalData, setOriginalData] = useState({});
  const [hasChanges, setHasChanges] = useState(false);
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
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  // 로그인 상태 확인
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // 프로필 데이터 로드
  useEffect(() => {
    if (profile) {
      const initialData = {
        nickname: profile.display_name || '',
        introduction: profile.bio || '',
        phone: profile.phone || '',
        profileImage: profile.profile_image || ''
      };

      setFormData(initialData);
      setOriginalData(initialData);

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

  // 변경사항 감지
  useEffect(() => {
    const hasFormChanges = JSON.stringify(formData) !== JSON.stringify(originalData);
    setHasChanges(hasFormChanges);
  }, [formData, originalData]);

  // 프로필 이미지 변경 핸들러
  const handleProfileImageChange = (imageData) => {
    setFormData(prev => ({ ...prev, profileImage: imageData }));
    setErrors(prev => ({ ...prev, profileImage: '' }));
  };

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

  // 취소 핸들러
  const handleCancel = () => {
    router.push('/mypage');
  };

  // 기존 프로필 이미지 삭제
  const deleteOldProfileImage = async (imageUrl) => {
    if (!imageUrl || !imageUrl.includes('user-profiles')) {
      // user-profiles 버킷의 이미지가 아니면 삭제하지 않음
      return;
    }

    try {
      // URL에서 파일 경로 추출
      const urlParts = imageUrl.split('/user-profiles/');
      if (urlParts.length < 2) {
        console.log('유효하지 않은 프로필 이미지 URL:', imageUrl);
        return;
      }

      const filePath = urlParts[1];
      console.log('기존 프로필 이미지 삭제 시도:', filePath);

      // 세션에서 토큰 가져오기
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        console.log('인증 토큰이 없어서 기존 이미지 삭제를 건너뜁니다.');
        return;
      }

      // 기존 이미지 삭제
      const { error: deleteError } = await supabase.storage
        .from('user-profiles')
        .remove([filePath]);

      if (deleteError) {
        console.error('기존 프로필 이미지 삭제 오류:', deleteError);
        // 삭제 실패해도 계속 진행 (새 이미지는 업로드됨)
      } else {
        console.log('기존 프로필 이미지 삭제 성공:', filePath);
      }
    } catch (error) {
      console.error('기존 프로필 이미지 삭제 중 오류:', error);
      // 삭제 실패해도 계속 진행
    }
  };

  // 프로필 이미지 업로드
  const uploadProfileImage = async (imageData) => {
    if (!imageData || imageData.startsWith('http')) {
      // 이미 URL이거나 빈 값이면 그대로 반환
      return imageData;
    }

    try {
      // Base64 데이터를 Blob으로 변환
      const base64Data = imageData.split(',')[1];
      const buffer = Buffer.from(base64Data, 'base64');

      // 파일명 생성 (사용자 ID 폴더 + 타임스탬프)
      const timestamp = Date.now();
      const fileName = `${user.id}/profile_${timestamp}.jpg`;

      // 세션에서 토큰 가져오기
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('인증 토큰을 찾을 수 없습니다.');
      }

      // Supabase Storage에 업로드
      const { data, error } = await supabase.storage
        .from('user-profiles')
        .upload(fileName, buffer, {
          contentType: 'image/jpeg',
          upsert: false
        });

      if (error) {
        console.error('프로필 이미지 업로드 오류:', error);
        throw error;
      }

      // 공개 URL 생성
      const { data: urlData } = supabase.storage
        .from('user-profiles')
        .getPublicUrl(fileName);

      console.log('프로필 이미지 업로드 성공:', urlData.publicUrl);
      return urlData.publicUrl;

    } catch (error) {
      console.error('프로필 이미지 업로드 실패:', error);
      // 업로드 실패 시 원본 데이터 반환 (기본 이미지 등)
      return imageData;
    }
  };

  // 프로필 저장
  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);

      if (!user) {
        toast.error('로그인이 필요합니다.');
        return;
      }

      // 세션에서 토큰 가져오기
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        toast.error('인증 토큰을 찾을 수 없습니다.');
        return;
      }

      // 프로필 이미지 업로드 (Base64인 경우)
      let profileImageUrl = formData.profileImage;
      if (formData.profileImage && formData.profileImage.startsWith('data:')) {
        console.log('프로필 이미지 업로드 시작...');

        // 기존 프로필 이미지가 있다면 삭제
        if (profile?.profile_image) {
          console.log('기존 프로필 이미지 삭제 시작:', profile.profile_image);
          await deleteOldProfileImage(profile.profile_image);
        }

        profileImageUrl = await uploadProfileImage(formData.profileImage);
      }

      const response = await fetch('/api/mypage/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          display_name: formData.nickname,
          bio: formData.introduction,
          phone: formData.phone,
          profile_image: profileImageUrl,
          instagram: contactChannels.instagram ? channelInputs.instagram : null,
          naver_cafe: contactChannels.naverCafe ? channelInputs.naverCafe : null,
          kakao_openchat: contactChannels.kakaoOpenChat ? channelInputs.kakaoOpenChat : null
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('프로필 업데이트 오류:', errorData);
        toast.error(errorData.error || '프로필 업데이트 중 오류가 발생했습니다.');
        return;
      }

      const result = await response.json();
      console.log('프로필 업데이트 성공:', result);

      // 로컬 캐시 갱신
      if (result.profile) {
        await updateProfile(result.profile);
        console.log('프로필 캐시 갱신 완료');
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
      <div className="flex items-center px-4 py-3 bg-white border-b border-gray-200">
        <button
          onClick={() => router.back()}
          className="text-gray-600 text-lg"
        >
          <span className="flex items-center">
            <ChevronLeft size={20} className="text-gray-600" />
            <span className="ml-1">내 정보 수정</span>
          </span>
        </button>
      </div>

      {/* Form */}
      <div className="px-6 pt-8">
        <ProfileEditForm
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
          onProfileImageChange={handleProfileImageChange}
        />

        {/* 하단 버튼들 */}
        <div className="bottom-0 left-0 right-0 bg-white p-4 mt-4">
          <div className="text-right mb-8">
            <button
              onClick={() => setShowLogoutDialog(true)}
              className="text-sm text-[#DBA913] underline font-bold"
            >
              로그아웃
            </button>
          </div>
          <div className="flex space-x-3 mb-3">
            <Button
              onClick={handleSave}
              disabled={!hasChanges || saving}
              className="flex-1 bg-yellow-400 text-gray-800 hover:bg-yellow-500 disabled:bg-gray-300 disabled:text-gray-500"
            >
              {saving ? '수정 중...' : '수정하기'}
            </Button>
            <Button
              onClick={handleCancel}
              variant="outline"
              className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              취소
            </Button>
          </div>
        </div>
      </div>

      {/* 로그아웃 확인 다이얼로그 */}
      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        {/* 커스텀 오버레이 */}
        {showLogoutDialog && (
          <div
            className="fixed inset-0 z-[9998] bg-black/60"
            onClick={() => setShowLogoutDialog(false)}
          />
        )}
        <CustomAlertDialogContent className="z-[9999] bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle>로그아웃</AlertDialogTitle>
            <AlertDialogDescription>
              정말 로그아웃하시겠습니까?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-row gap-3">
            <AlertDialogCancel className="mt-0 flex-1">취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => router.push('/logout')}
              className="flex-1"
            >
              로그아웃
            </AlertDialogAction>
          </AlertDialogFooter>
        </CustomAlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default EditProfilePage;
