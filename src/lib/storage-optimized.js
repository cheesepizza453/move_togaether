import { supabase } from './supabase';

/**
 * Supabase Storage 최적화 유틸리티
 */

// 이미지 변환 옵션
const IMAGE_TRANSFORMS = {
  thumbnail: { width: 200, height: 200, quality: 80 },
  medium: { width: 600, height: 400, quality: 85 },
  large: { width: 1200, height: 800, quality: 90 },
  original: { quality: 95 }
};

/**
 * 최적화된 이미지 URL 생성 (Vercel 비용 절약을 위해 Supabase Transform 사용 안함)
 */
export const getOptimizedImageUrl = (bucket, path, transform = 'medium') => {
  if (!path) return null;

  // Vercel 이미지 최적화 비용을 절약하기 위해 원본 이미지 URL 반환
  // 클라이언트 사이드에서 CSS로 크기 조정
  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(path);

  return data.publicUrl;
};

/**
 * 이미지 업로드 최적화
 */
export const uploadOptimizedImage = async (bucket, file, path, options = {}) => {
  const {
    maxWidth = 1920,
    maxHeight = 1080,
    quality = 0.9,
    format = 'webp'
  } = options;

  try {
    // 파일을 Canvas로 변환하여 리사이징
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    return new Promise((resolve, reject) => {
      img.onload = async () => {
        // 원본 비율 유지하면서 리사이징
        const ratio = Math.min(maxWidth / img.width, maxHeight / img.height);
        const newWidth = img.width * ratio;
        const newHeight = img.height * ratio;

        canvas.width = newWidth;
        canvas.height = newHeight;

        // 이미지 그리기
        ctx.drawImage(img, 0, 0, newWidth, newHeight);

        // Canvas를 Blob으로 변환
        canvas.toBlob(async (blob) => {
          try {
            const { data, error } = await supabase.storage
              .from(bucket)
              .upload(path, blob, {
                contentType: `image/${format}`,
                upsert: true
              });

            if (error) throw error;

            resolve({
              path: data.path,
              url: getOptimizedImageUrl(bucket, data.path, 'original')
            });
          } catch (error) {
            reject(error);
          }
        }, `image/${format}`, quality);
      };

      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  } catch (error) {
    console.error('Image upload optimization error:', error);
    throw error;
  }
};

/**
 * 배치 이미지 업로드
 */
export const uploadBatchImages = async (bucket, files, basePath) => {
  const uploadPromises = files.map((file, index) => {
    const fileName = `${basePath}/${Date.now()}_${index}.webp`;
    return uploadOptimizedImage(bucket, file, fileName);
  });

  try {
    const results = await Promise.allSettled(uploadPromises);
    return results.map((result, index) => ({
      index,
      success: result.status === 'fulfilled',
      data: result.status === 'fulfilled' ? result.value : null,
      error: result.status === 'rejected' ? result.reason : null
    }));
  } catch (error) {
    console.error('Batch upload error:', error);
    throw error;
  }
};

/**
 * 이미지 삭제
 */
export const deleteImage = async (bucket, path) => {
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path]);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Image deletion error:', error);
    return false;
  }
};

/**
 * 스토리지 사용량 확인
 */
export const getStorageUsage = async (bucket) => {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .list('', {
        limit: 1000,
        sortBy: { column: 'created_at', order: 'desc' }
      });

    if (error) throw error;

    // 파일 크기 계산 (정확한 계산을 위해서는 각 파일의 메타데이터를 조회해야 함)
    const totalFiles = data.length;

    return {
      totalFiles,
      estimatedSize: 'N/A' // 정확한 크기는 Supabase 대시보드에서 확인
    };
  } catch (error) {
    console.error('Storage usage check error:', error);
    return null;
  }
};

/**
 * CDN 캐시 무효화 (Vercel의 경우 자동으로 처리됨)
 */
export const invalidateCDNCache = async (urls) => {
  // Vercel에서는 자동으로 CDN 캐시가 관리되므로 별도 작업 불필요
  console.log('CDN cache invalidation requested for:', urls);
  return true;
};

/**
 * 이미지 최적화 설정
 */
export const getImageOptimizationConfig = () => {
  return {
    // Next.js Image 컴포넌트 설정
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    formats: ['image/webp', 'image/avif'],

    // Supabase Storage 설정
    buckets: {
      postImages: 'post-images',
      userProfiles: 'user-profiles'
    },

    // 변환 옵션
    transforms: IMAGE_TRANSFORMS
  };
};

/**
 * 이미지 품질 자동 조정
 */
export const getOptimalImageQuality = (fileSize, targetSize = 500000) => {
  if (fileSize <= targetSize) return 0.95;
  if (fileSize <= targetSize * 2) return 0.85;
  if (fileSize <= targetSize * 4) return 0.75;
  return 0.65;
};

/**
 * 이미지 포맷 최적화
 */
export const getOptimalImageFormat = (fileType) => {
  const supportedFormats = ['image/webp', 'image/avif', 'image/jpeg', 'image/png'];

  if (supportedFormats.includes(fileType)) {
    return fileType;
  }

  // 기본값으로 WebP 사용
  return 'image/webp';
};
