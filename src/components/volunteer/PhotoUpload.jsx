'use client';

import { useRef } from 'react';
import { toast } from 'sonner';

const PhotoUpload = ({
                         photoPreview,
                         onPhotoChange,
                         onPhotoRemove,
                         error,
                     }) => {
    const fileInputRef = useRef(null);

    // 이미지 리사이징 & 압축 함수
    const resizeImage = (file, maxWidth = 550, quality = 0.85) => {
        return new Promise((resolve, reject) => {
            const img = new window.Image();
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            img.onload = () => {
                const originalWidth = img.width;
                const originalHeight = img.height;

                // 이미 작은 이미지면 리사이즈 없이 그대로 사용
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
                            reject(new Error('이미지 리사이징에 실패했습니다.'));
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

            img.onerror = () => reject(new Error('이미지 로드에 실패했습니다.'));
            img.src = URL.createObjectURL(file);
        });
    };

    // 업로드 시 압축 후 base64 전달
    const handlePhotoUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        // 이미지 파일 검증
        if (!file.type.startsWith('image/')) {
            toast.error('이미지 파일만 업로드 가능합니다.');
            return;
        }

        // 원본 10MB 제한 (너무 큰 건 처음부터 막기)
        if (file.size > 10 * 1024 * 1024) {
            toast.error('파일 크기는 10MB 이하로 업로드해주세요.');
            return;
        }

        try {
            // 1) 리사이즈 & 압축
            const resizedDataUrl = await resizeImage(file, 1024, 0.85);

            // 2) 대략적인 용량 계산
            const base64 = resizedDataUrl.split(',')[1] || '';
            const estimatedSizeKB = Math.round((base64.length * 3) / 4 / 1024);

            console.log(
                `이미지 리사이징: 원본 ${Math.round(file.size / 1024)}KB → 약 ${estimatedSizeKB}KB`
            );

            // 3) 부모에게 전달
            onPhotoChange(resizedDataUrl);

        } catch (error) {
            console.error('이미지 처리 오류:', error);
            toast.error('이미지 처리 중 오류가 발생했습니다.');
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
                사진<span className="text-[#E17364] text-16-m">*</span>
            </label>
            <p className="mb-[15px] text-[#676767] text-12-r">
                최대 500kb의 사진을 업로드 할 수 있습니다.
            </p>

            <div className="relative w-[150px] h-auto aspect-[67/55] cursor-pointer">
                {photoPreview ? (
                    <>
                        <figure className="w-full h-full rounded-[15px] overflow-hidden">
                            <img
                                src={photoPreview}
                                alt="img"
                                className="w-full h-full object-cover bg-white"
                            />
                        </figure>
                        <button
                            type="button"
                            onClick={handleRemovePhoto}
                            className="absolute right-[-4px] bottom-[-4px] w-[24px] h-[24px] flex items-center justify-center bg-[#F7CDBD] rounded-full"
                        >
                            <svg
                                className="w-[18px] h-[18px] text-brand-point"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </button>
                    </>
                ) : (
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full h-full flex items-center justify-center bg-text-300 rounded-[15px]"
                    >
                        <svg
                            className="w-[24px] h-[24px] text-text-800"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                            />
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

            {error && <p className="text-xs text-brand-point mt-1">{error}</p>}
        </div>
    );
};

export default PhotoUpload;