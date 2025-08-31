# Supabase 인증 설정 가이드

## 📅 생성일
2025년 8월 31일

## 🚨 중요: 환경 변수 설정

### **1. .env.local 파일 생성**
프로젝트 루트에 `.env.local` 파일을 생성하고 다음 내용을 추가하세요:

```bash
# Supabase 프로젝트 설정
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# 서버 사이드 전용 (API 라우트에서 사용)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

### **2. Supabase 프로젝트에서 키 확인**
1. [Supabase Dashboard](https://app.supabase.com) 접속
2. 프로젝트 선택
3. **Settings** → **API** 메뉴
4. 다음 키들을 복사:
   - **Project URL**: `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public**: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role secret**: `SUPABASE_SERVICE_ROLE_KEY`

## 🔐 인증 구조 개선 사항

### **1. 보안 강화**
- ✅ **localStorage 대신 sessionStorage 사용**: 브라우저 탭 닫을 때 자동 삭제
- ✅ **자동 토큰 새로고침**: 만료된 토큰 자동 갱신
- ✅ **서버 사이드 토큰 검증**: API 라우트에서 안전한 인증

### **2. 인증 미들웨어**
```javascript
// 사용 예시
import { withAuth } from '@/lib/auth-middleware'

export const GET = withAuth(async (request) => {
  // request.user, request.profile, request.supabase 사용 가능
  const { profile } = request
  return NextResponse.json({ profile })
})
```

### **3. 권한별 미들웨어**
```javascript
// 게시물 작성자만 수정/삭제 가능
export const PUT = withPostOwnership(async (request) => {
  // 이미 권한 검증 완료
  return NextResponse.json({ message: 'Updated' })
})
```

## 🚀 클라이언트에서 사용법

### **1. 인증 상태 확인**
```javascript
import { checkAuthStatus } from '@/lib/api'

const isAuthenticated = await checkAuthStatus()
```

### **2. API 호출**
```javascript
import { postsAPI } from '@/lib/api'

// 인증이 필요한 요청 (자동으로 토큰 포함)
const newPost = await postsAPI.create(postData)

// 인증이 불필요한 요청
const posts = await postsAPI.getList()
```

### **3. 에러 처리**
```javascript
try {
  const result = await postsAPI.create(postData)
} catch (error) {
  const errorInfo = handleAPIError(error)

  if (errorInfo.type === 'auth') {
    // 로그인 페이지로 리다이렉트
    router.push('/login')
  }
}
```

## 🔄 인증 플로우

### **1. 로그인 시**
```
사용자 로그인 → Supabase 세션 생성 → sessionStorage에 토큰 저장 → API 호출 시 자동 토큰 포함
```

### **2. API 호출 시**
```
클라이언트 → 토큰과 함께 API 요청 → 서버에서 토큰 검증 → Supabase에서 사용자 확인 → 권한 검증 → 응답
```

### **3. 토큰 만료 시**
```
토큰 만료 → Supabase 자동 갱신 → 새 토큰으로 재시도 → 실패 시 자동 로그아웃
```

## 🛡️ 보안 고려사항

### **1. 토큰 관리**
- **클라이언트**: `sessionStorage` 사용 (탭 닫을 때 자동 삭제)
- **서버**: `service_role` 키로 안전한 검증
- **자동 갱신**: 만료 전 자동 토큰 갱신

### **2. 권한 제어**
- **RLS**: 데이터베이스 레벨 보안
- **API 미들웨어**: 서버 레벨 권한 검증
- **클라이언트**: UI 레벨 접근 제어

### **3. 에러 처리**
- **401 오류**: 자동 로그아웃 및 로그인 페이지 리다이렉트
- **403 오류**: 권한 부족 메시지 표시
- **네트워크 오류**: 재시도 로직 구현

## 📱 모바일 최적화

### **1. 세션 지속성**
- 모바일 앱처럼 세션 유지
- 백그라운드에서도 인증 상태 유지
- 네트워크 재연결 시 자동 복구

### **2. 오프라인 지원**
- 로컬 캐시로 기본 기능 제공
- 온라인 복구 시 자동 동기화
- 사용자 경험 최적화

## 🧪 테스트 방법

### **1. 인증 테스트**
```bash
# 1. 로그인
# 2. API 호출 테스트
# 3. 토큰 만료 시나리오 테스트
# 4. 권한 부족 시나리오 테스트
```

### **2. 보안 테스트**
```bash
# 1. 잘못된 토큰으로 API 호출
# 2. 만료된 토큰으로 API 호출
# 3. 권한 없는 리소스 접근 시도
```

## 📝 다음 단계

### **1. 프론트엔드 구현**
- 로그인/회원가입 페이지
- 인증 상태 관리 (Context/Redux)
- 보호된 라우트 구현

### **2. 추가 보안**
- Rate limiting 구현
- CORS 설정
- CSRF 보호

### **3. 모니터링**
- 인증 실패 로그
- API 사용량 모니터링
- 보안 이벤트 알림

---

*이 가이드는 Supabase 인증 시스템의 안전하고 효율적인 사용을 위한 것입니다.*
