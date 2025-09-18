'use client';

import { useRef } from 'react';
import { toast } from 'sonner';

const PhotoUpload = ({
  photoPreview,
  onPhotoChange,
  onPhotoRemove,
  error
}) => {
  const fileInputRef = useRef(null);

  const handlePhotoUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // 파일 크기 검증 (500KB 제한)
      if (file.size > 500 * 1024) {
        toast.error('파일 크기는 500KB 이하로 업로드해주세요.');
        return;
      }

      // 이미지 파일 검증
      if (!file.type.startsWith('image/')) {
        toast.error('이미지 파일만 업로드 가능합니다.');
        return;
      }

      // FileReader로 이미지 미리보기 생성
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64String = e.target.result;
        onPhotoChange(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    onPhotoRemove();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
      <div>
        <label className="block text-16-m mb-[6px]">
          사진<span className={'text-[#E17364] text-16-m'}>*</span>
        </label>
        <p className={'mb-[15px] text-[#676767] text-12-r'}>최대 500kb의 사진을 업로드 할 수 있습니다.</p>
        <div className={'relative w-[150px] h-auto aspect-[67/55] cursor-pointer'}>
        {photoPreview ? (
            <>
              <figure className={'w-full h-full rounded-[15px] overflow-hidden'}>
              <img
                  src={photoPreview}
                  alt="img"
                  className={'w-full h-full object-cover bg-white'}
              />
              </figure>
              <button
                  type="button"
                  onClick={handleRemovePhoto}
                  className="absolute right-[-4px] bottom-[-4px] w-[24px] h-[24px] flex items-center justify-center bg-[#F7CDBD] rounded-full"
              >
                <svg className="w-[18px] h-[18px] text-brand-point" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </>
        ) : (
            <div
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-full flex items-center justify-center bg-text-300 rounded-[15px]"
            >
              <svg className="w-[24px] h-[24px] text-text-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
              </svg>
            </div>
        )}
        </div>

        <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handlePhotoUpload}
            className="hidden"
        />

        {error && (
            <p className="text-xs text-red-500 mt-1">{error}</p>
        )}
      </div>
  );
};

export default PhotoUpload;
