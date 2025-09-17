# API 테스트 가이드

이 문서는 개발된 API 엔드포인트들을 테스트하는 방법을 설명합니다.

## 🚀 빠른 시작

### 1. 개발 서버 실행
```bash
npm run dev
```

### 2. API 테스트 실행

#### 방법 1: 웹 UI를 통한 테스트
1. 브라우저에서 `http://localhost:3008/api-test` 접속
2. 테스트 그룹 선택
3. "테스트 실행" 버튼 클릭
4. 결과 확인

#### 방법 2: 명령줄을 통한 테스트
```bash
# 기본 API 테스트 실행
npm run test:api

# 실시간 모니터링 (nodemon 필요)
npm run test:api:watch
```

## 📋 테스트 가능한 API 엔드포인트

### 인증 관련
- `POST /api/auth/signup` - 회원가입
- `POST /api/auth/login` - 로그인
- `POST /api/auth/logout` - 로그아웃
- `POST /api/auth/check-email` - 이메일 중복 체크
- `POST /api/auth/check-nickname` - 닉네임 중복 체크
- `GET /api/auth/profile` - 프로필 조회

### 게시물 관련
- `GET /api/posts/list` - 게시물 목록 조회
- `POST /api/posts` - 게시물 생성
- `GET /api/posts/[id]` - 개별 게시물 조회
- `PUT /api/posts/[id]` - 게시물 수정
- `DELETE /api/posts/[id]` - 게시물 삭제
- `POST /api/posts/volunteer` - 봉사 신청

### 찜 관련
- `GET /api/favorites` - 찜 목록 조회
- `POST /api/favorites` - 찜 추가
- `DELETE /api/favorites` - 찜 제거

### 보호소 관련
- `GET /api/shelters` - 보호소 목록 조회
- `POST /api/shelters` - 보호소 등록
- `GET /api/shelters/[id]` - 개별 보호소 조회
- `PUT /api/shelters/[id]` - 보호소 정보 수정

### 신청 관련
- `GET /api/applications` - 신청 목록 조회
- `POST /api/applications` - 봉사 신청
- `PUT /api/applications/[id]/status` - 신청 상태 변경

### 기타
- `POST /api/validate-address` - 주소 검증

## 🧪 테스트 데이터

테스트는 다음 데이터를 사용합니다:

### 테스트 사용자
```javascript
{
  email: 'test@example.com',
  password: 'testpassword123',
  nickname: '테스트사용자',
  phone: '010-1234-5678'
}
```

### 테스트 게시물
```javascript
{
  title: '강아지 이동봉사 급구합니다',
  dog_name: '멍멍이',
  dog_size: 'medium',
  departure_address: '서울시 강남구 테헤란로 123',
  arrival_address: '부산시 해운대구 센텀중앙로 456',
  deadline: '2024-12-31T23:59:59.000Z',
  description: '강아지 이동봉사가 급히 필요합니다.',
  status: 'active'
}
```

## 🔧 테스트 설정

### 환경 변수
다음 환경 변수들이 설정되어 있어야 합니다:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
KAKAO_MAPS_API_KEY=your_kakao_maps_api_key
```

### 데이터베이스
- Supabase 데이터베이스가 설정되어 있어야 합니다
- 필요한 테이블들이 생성되어 있어야 합니다
- RLS (Row Level Security) 정책이 설정되어 있어야 합니다

## 📊 테스트 결과 해석

### 성공적인 테스트
```
✅ PASS 회원가입
✅ PASS 로그인
✅ PASS 게시물 목록 조회 (익명)
```

### 실패한 테스트
```
❌ FAIL 게시물 생성
  Error: Missing required fields
  Status: 400
```

### 성공률
```
📊 Test Results: 15/20 passed
Success Rate: 75.0%
```

## 🐛 문제 해결

### 일반적인 문제들

1. **API 서버 연결 실패**
   - 개발 서버가 실행 중인지 확인: `npm run dev`
   - 포트 3008이 사용 가능한지 확인

2. **인증 실패**
   - Supabase 설정이 올바른지 확인
   - 환경 변수가 설정되어 있는지 확인

3. **데이터베이스 오류**
   - Supabase 연결 상태 확인
   - 테이블 구조가 올바른지 확인
   - RLS 정책이 적절히 설정되어 있는지 확인

4. **CORS 오류**
   - Next.js 설정에서 CORS가 허용되어 있는지 확인

### 디버깅 팁

1. **콘솔 로그 확인**
   - 브라우저 개발자 도구의 콘솔 탭 확인
   - 서버 콘솔에서 에러 메시지 확인

2. **네트워크 탭 확인**
   - 요청/응답 헤더와 바디 확인
   - 상태 코드 확인

3. **Supabase 대시보드 확인**
   - 데이터베이스 로그 확인
   - 인증 사용자 목록 확인

## 📝 커스텀 테스트 작성

새로운 테스트를 추가하려면:

1. `src/lib/api-tests.js`에 테스트 함수 추가
2. `src/lib/test-utils.js`에 필요한 유틸리티 함수 추가
3. `src/app/api-test/page.jsx`에 테스트 그룹 추가

예시:
```javascript
// 새로운 테스트 그룹 추가
export const customTests = [
  async () => {
    const result = await apiCall('/api/custom-endpoint');
    return logTestResult('커스텀 테스트', result);
  }
];
```

## 🎯 다음 단계

1. **자동화된 테스트**: CI/CD 파이프라인에 테스트 통합
2. **성능 테스트**: 부하 테스트 및 응답 시간 측정
3. **보안 테스트**: 인증/인가 취약점 검사
4. **통합 테스트**: 전체 워크플로우 테스트

---

더 자세한 정보가 필요하거나 문제가 발생하면 개발팀에 문의하세요.
