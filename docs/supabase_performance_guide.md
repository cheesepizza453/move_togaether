# Supabase 성능 최적화 가이드

## 📋 개요

Move Togaether 프로젝트의 Supabase 데이터베이스와 스토리지 성능을 최적화하기 위한 가이드입니다.

## 🚀 적용된 최적화

### 1. 클라이언트 최적화

#### **연결 풀링 및 설정**
```javascript
// src/lib/supabase.js
const supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    refreshTokenThreshold: 30 // 30초 전에 토큰 새로고침
  },
  realtime: {
    params: {
      eventsPerSecond: 10 // 실시간 이벤트 제한
    }
  }
});
```

#### **쿼리 캐싱**
- 메모리 기반 쿼리 캐싱 (5분 TTL)
- 자주 사용되는 데이터 캐시
- 캐시 무효화 메커니즘

### 2. 데이터베이스 최적화

#### **인덱스 최적화**
```sql
-- 게시물 조회 최적화
CREATE INDEX idx_posts_status_created_at ON posts (status, created_at DESC);
CREATE INDEX idx_posts_deadline_status ON posts (deadline, status);

-- 사용자 프로필 최적화
CREATE INDEX idx_user_profiles_auth_user_id ON user_profiles (auth_user_id);
CREATE INDEX idx_user_profiles_display_name ON user_profiles (display_name);
```

#### **성능 최적화된 뷰**
```sql
-- active_posts_optimized 뷰
-- 자주 조회되는 컬럼만 선택
-- JOIN 최적화
-- D-Day 계산 포함
```

### 3. API 최적화

#### **응답 캐싱**
```javascript
// 2분 캐시 적용
headers: {
  'Cache-Control': 'public, max-age=120, s-maxage=120',
  'X-Cache': 'HIT/MISS'
}
```

#### **성능 모니터링**
```javascript
// 쿼리 실행 시간 측정
const withPerformanceMonitoring = (queryFn, queryName) => {
  // 성능 측정 로직
};
```

### 4. 스토리지 최적화

#### **이미지 최적화**
```javascript
// 자동 리사이징 및 포맷 변환
const uploadOptimizedImage = async (bucket, file, path, options) => {
  // WebP 포맷으로 변환
  // 적절한 크기로 리사이징
  // 품질 최적화
};
```

#### **비용 절약 이미지 최적화**
- Vercel 이미지 최적화 비활성화 (비용 절약)
- Supabase 스토리지 직접 사용
- CSS 기반 반응형 이미지 처리
- 클라이언트 사이드 크기 조정

## 📊 성능 지표

### **예상 개선사항**

1. **데이터베이스 쿼리 속도**: 40-60% 향상
2. **API 응답 시간**: 30-50% 향상
3. **이미지 로딩 속도**: 50-70% 향상
4. **메모리 사용량**: 20-30% 감소
5. **캐시 히트율**: 70-80%

### **모니터링 방법**

1. **Supabase 대시보드**
   - Database → Logs
   - Database → Performance
   - Storage → Usage

2. **Vercel Analytics**
   - Core Web Vitals
   - API 응답 시간
   - 에러율

3. **브라우저 개발자 도구**
   - Network 탭
   - Performance 탭
   - Lighthouse 점수

## 🔧 추가 최적화 권장사항

### 1. 데이터베이스 레벨

#### **쿼리 최적화**
```sql
-- EXPLAIN ANALYZE로 쿼리 분석
EXPLAIN ANALYZE SELECT * FROM posts WHERE status = 'active';

-- 복합 인덱스 활용
CREATE INDEX idx_posts_complex ON posts (status, dog_size, created_at DESC);
```

#### **연결 풀 설정**
```sql
-- Supabase 대시보드에서 설정
-- Connection Pooling 활성화
-- Max Connections: 100
-- Pool Mode: Transaction
```

### 2. 애플리케이션 레벨

#### **배치 쿼리**
```javascript
// 여러 쿼리를 한 번에 실행
const executeBatchQueries = async (queries) => {
  const results = await Promise.allSettled(queries);
  return results;
};
```

#### **페이지네이션 최적화**
```javascript
// 커서 기반 페이지네이션
const getPostsWithCursor = async (cursor, limit) => {
  // cursor를 사용한 효율적인 페이지네이션
};
```

### 3. 캐싱 전략

#### **Redis 도입 (선택사항)**
```javascript
// 프로덕션 환경에서 Redis 사용
const redis = new Redis(process.env.REDIS_URL);

const getCachedData = async (key) => {
  return await redis.get(key);
};
```

#### **CDN 캐싱**
```javascript
// 정적 자원 캐싱
headers: {
  'Cache-Control': 'public, max-age=31536000, immutable'
}
```

## 🚨 주의사항

### 1. 메모리 사용량
- 캐시 크기 제한 설정
- 정기적인 캐시 정리
- 메모리 누수 방지

### 2. 데이터 일관성
- 캐시 무효화 정책
- 실시간 데이터 동기화
- 트랜잭션 처리

### 3. 보안
- 캐시된 데이터 암호화
- 민감한 정보 캐싱 금지
- 접근 권한 관리

## 📈 성능 테스트

### **부하 테스트**
```bash
# Artillery를 사용한 API 부하 테스트
npm install -g artillery
artillery quick --count 100 --num 10 http://localhost:3008/api/posts
```

### **데이터베이스 성능 테스트**
```sql
-- 쿼리 실행 계획 분석
EXPLAIN (ANALYZE, BUFFERS)
SELECT * FROM active_posts_optimized
WHERE dog_size = 'small'
ORDER BY created_at DESC
LIMIT 20;
```

## 🔄 지속적 최적화

1. **주기적 모니터링**: 주 1회 성능 지표 확인
2. **쿼리 분석**: 월 1회 느린 쿼리 식별 및 최적화
3. **인덱스 튜닝**: 분기별 인덱스 사용률 분석
4. **캐시 전략 개선**: 사용 패턴에 따른 캐시 정책 조정

이 가이드를 따라 Supabase의 성능을 최적화하면 사용자 경험이 크게 향상될 것입니다.
