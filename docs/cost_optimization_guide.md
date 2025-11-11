# 비용 절약 최적화 가이드

## 📋 개요

Move Togaether 프로젝트의 운영 비용을 최소화하면서 성능을 유지하기 위한 최적화 가이드입니다.

## 💰 **비용 절약 전략**

### 1. Vercel 이미지 최적화 비활성화

#### **절약 효과**
- **월 비용**: $0 (기본 플랜에서 무료)
- **이미지 처리**: 1,000회/월 무료 → 무제한
- **예상 절약**: 월 $20-50

#### **대안 솔루션**
```javascript
// next.config.ts
images: {
  unoptimized: true, // Vercel 이미지 최적화 비활성화
  domains: ['vnexvfnsgjfrixexlgdp.supabase.co'],
}
```

### 2. Supabase 스토리지 직접 활용

#### **장점**
- **무료 용량**: 1GB 무료
- **CDN**: Supabase 자체 CDN 활용
- **Transform**: 서버사이드 이미지 변환 (무료)

#### **구현 방법**
```javascript
// 원본 이미지 URL 직접 사용
const { data } = supabase.storage
  .from('post-images')
  .getPublicUrl(imagePath);

// CSS로 크기 조정
<img
  src={data.publicUrl}
  className="optimized-image image-medium"
  alt="게시물 이미지"
/>
```

### 3. CSS 기반 이미지 최적화

#### **반응형 이미지 처리**
```css
/* src/lib/image-optimization.css */
.image-medium {
  width: 600px;
  height: 400px;
  object-fit: cover;
  border-radius: 12px;
}

@media (max-width: 768px) {
  .image-medium {
    width: 100%;
    height: 250px;
  }
}
```

### 4. 클라이언트 사이드 압축

#### **이미지 업로드 시 최적화**
```javascript
// Canvas를 사용한 클라이언트 사이드 리사이징
const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');

// 원본 비율 유지하면서 리사이징
const ratio = Math.min(maxWidth / img.width, maxHeight / img.height);
canvas.width = img.width * ratio;
canvas.height = img.height * ratio;

// WebP 포맷으로 변환
canvas.toBlob(blob => {
  // Supabase에 업로드
}, 'image/webp', 0.9);
```

## 📊 **비용 비교**

| 서비스 | 기존 방식 | 최적화 방식 | 월 절약액 |
|--------|-----------|-------------|-----------|
| **Vercel 이미지** | $20-50 | $0 | $20-50 |
| **Supabase 스토리지** | $0 | $0 | $0 |
| **CDN** | $0 | $0 | $0 |
| **총 절약** | - | - | **$20-50** |

## 🚀 **성능 유지 방법**

### 1. 브라우저 캐싱 활용
```javascript
// API 응답에 캐시 헤더 추가
headers: {
  'Cache-Control': 'public, max-age=120, s-maxage=120',
  'X-Cache': 'HIT'
}
```

### 2. 이미지 지연 로딩
```javascript
// Intersection Observer 사용
const [isVisible, setIsVisible] = useState(false);
const imgRef = useRef();

useEffect(() => {
  const observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        observer.disconnect();
      }
    },
    { threshold: 0.1 }
  );

  if (imgRef.current) {
    observer.observe(imgRef.current);
  }

  return () => observer.disconnect();
}, []);
```

### 3. 이미지 프리로딩
```javascript
// 중요한 이미지 미리 로드
const preloadImage = (src) => {
  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'image';
  link.href = src;
  document.head.appendChild(link);
};
```

## 🔧 **구현 예시**

### **최적화된 이미지 컴포넌트**
```jsx
import { getOptimizedImageUrl } from '@/lib/storage-optimized';
import '@/lib/image-optimization.css';

const OptimizedImage = ({
  bucket,
  path,
  alt,
  size = 'medium',
  className = ''
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);

  const imageUrl = getOptimizedImageUrl(bucket, path, size);

  return (
    <div className={`image-container ${className}`}>
      {!isLoaded && !isError && (
        <div className="image-loading" />
      )}
      <img
        src={imageUrl}
        alt={alt}
        className={`optimized-image image-${size} ${isLoaded ? 'loaded' : 'loading'}`}
        onLoad={() => setIsLoaded(true)}
        onError={() => setIsError(true)}
        loading="lazy"
      />
    </div>
  );
};
```

### **사용 예시**
```jsx
// 게시물 이미지
<OptimizedImage
  bucket="post-images"
  path="posts/image123.jpg"
  alt="게시물 이미지"
  size="medium"
/>

// 프로필 이미지
<OptimizedImage
  bucket="user-profiles"
  path="profiles/user123.jpg"
  alt="프로필 이미지"
  size="thumbnail"
/>
```

## 📈 **모니터링 지표**

### **비용 모니터링**
1. **Vercel 대시보드**: Functions 실행 시간, 대역폭 사용량
2. **Supabase 대시보드**: 스토리지 사용량, API 호출 수
3. **월별 비용 리포트**: 예상 vs 실제 비용 비교

### **성능 모니터링**
1. **Core Web Vitals**: LCP, FID, CLS 점수
2. **이미지 로딩 시간**: 평균 로딩 시간 측정
3. **캐시 히트율**: API 캐시 효율성 확인

## ⚠️ **주의사항**

### 1. 이미지 품질 관리
- 업로드 시 적절한 압축률 설정
- 원본 이미지 백업 고려
- 다양한 디바이스에서 테스트

### 2. 대역폭 사용량
- 이미지 크기 제한 설정
- 사용자별 업로드 제한
- 불필요한 이미지 정리

### 3. SEO 영향
- 이미지 alt 텍스트 필수
- 구조화된 데이터 마크업
- 이미지 sitemap 생성

## 🎯 **결론**

이 최적화를 통해 **월 $20-50의 비용을 절약**하면서도 **사용자 경험을 유지**할 수 있습니다.

주요 포인트:
- ✅ Vercel 이미지 최적화 비활성화
- ✅ Supabase 스토리지 직접 활용
- ✅ CSS 기반 반응형 처리
- ✅ 클라이언트 사이드 최적화
- ✅ 브라우저 캐싱 활용
