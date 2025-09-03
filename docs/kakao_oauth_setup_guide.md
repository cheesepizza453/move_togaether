# 카카오톡 OAuth 설정 가이드

## 📋 개요

카카오톡 간편 가입 기능을 구현하기 위한 설정 가이드입니다.

## 🔧 1. 카카오 개발자 콘솔 설정

### 1-1. 카카오 개발자 계정 생성
1. [카카오 개발자 콘솔](https://developers.kakao.com/) 접속
2. 카카오 계정으로 로그인
3. "내 애플리케이션" 메뉴 클릭

### 1-2. 애플리케이션 생성
1. "애플리케이션 추가하기" 클릭
2. 앱 이름: "Move Togaether" (또는 원하는 이름)
3. 사업자명: 개인 또는 회사명
4. "저장" 클릭

### 1-3. 플랫폼 설정
1. 생성된 앱 선택
2. "플랫폼" 메뉴 클릭
3. "Web 플랫폼 등록" 클릭
4. 사이트 도메인 추가:
   - 개발: `http://localhost:3008`
   - 운영: `https://your-domain.com`

### 1-4. 제품 설정
1. "제품 설정" → "카카오 로그인" 메뉴 클릭
2. "카카오 로그인 활성화" ON
3. "Redirect URI" 설정:
   - 개발: `http://localhost:3008/signup/kakao`
   - 운영: `https://your-domain.com/signup/kakao`
4. "동의항목" 설정:
   - **필수**: 닉네임, 이메일
   - **선택**: 프로필 사진

### 1-5. 앱 키 확인
1. "앱 설정" → "앱 키" 메뉴 클릭
2. 다음 정보 복사:
   - **JavaScript 키** (NEXT_PUBLIC_KAKAO_CLIENT_ID)
   - **REST API 키** (KAKAO_CLIENT_SECRET)

## 🔑 2. 환경변수 설정

### 2-1. .env.local 파일 생성
프로젝트 루트에 `.env.local` 파일을 생성하고 다음 내용을 추가:

```env
# Supabase 설정
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# 앱 설정
NEXT_PUBLIC_APP_URL=http://localhost:3008

# 카카오톡 OAuth 설정 (JavaScript SDK 사용)
NEXT_PUBLIC_KAKAO_JS_KEY=your_kakao_javascript_key

# 카카오맵 API
NEXT_PUBLIC_KAKAO_MAP_API_KEY=your_kakao_map_api_key
```

### 2-2. 환경변수 값 설정
- `NEXT_PUBLIC_KAKAO_JS_KEY`: 카카오 개발자 콘솔의 JavaScript 키
- `NEXT_PUBLIC_APP_URL`: 현재 개발 환경 URL

## 🚀 3. Supabase 설정

### 3-1. 카카오 OAuth Provider 활성화 (선택사항)
> **참고**: JavaScript SDK를 사용하므로 Supabase OAuth Provider 설정은 선택사항입니다.
>
> 1. Supabase 대시보드 접속
> 2. "Authentication" → "Providers" 메뉴
> 3. "Kakao" 찾아서 활성화 (필요시)
> 4. 다음 정보 입력:
>    - **Client ID**: 카카오 JavaScript 키
>    - **Client Secret**: 카카오 REST API 키
>    - **Redirect URL**: `https://your-project.supabase.co/auth/v1/callback`

### 3-2. RLS 정책 확인
`user_profiles` 테이블의 RLS 정책이 올바르게 설정되어 있는지 확인:

```sql
-- 닉네임 중복 체크를 위한 정책
CREATE POLICY "닉네임 중복 체크 정책" ON public.user_profiles
FOR SELECT TO public USING (true);
```

## 🧪 4. 테스트 방법

### 4-1. 개발 서버 실행
```bash
npm run dev
```

### 4-2. 카카오톡 간편 가입 테스트
1. `http://localhost:3008/login` 접속
2. "카카오톡 간편 가입" 버튼 클릭
3. 카카오톡 로그인 팝업 창 열림
4. 카카오톡 계정으로 로그인
5. 이메일 동의 (필수)
6. 자동으로 추가 정보 입력 페이지로 이동
7. 정보 입력 후 가입 완료

### 4-3. 확인 사항
- [ ] 카카오톡 로그인 팝업 정상 열림
- [ ] 이메일 정보 정상 수집
- [ ] 사용자 프로필 자동 생성
- [ ] `user_profiles` 테이블에 데이터 저장
- [ ] 자동 로그인 처리

## 🔍 5. 문제 해결

### 5-1. 일반적인 오류

#### "카카오톡 설정이 필요합니다"
- 환경변수 `NEXT_PUBLIC_KAKAO_JS_KEY`가 설정되지 않음
- `.env.local` 파일 확인

#### "이메일 정보가 필요합니다"
- 카카오톡 계정에서 이메일 공개 설정 필요
- 카카오 개발자 콘솔에서 이메일 동의항목 필수로 설정

#### "이미 가입된 이메일입니다"
- 해당 이메일로 이미 가입된 계정 존재
- 이메일 중복 체크 정상 작동

### 5-2. 디버깅 방법

#### 콘솔 로그 확인
브라우저 개발자 도구에서 다음 로그 확인:
- 카카오톡 인증 URL 생성
- API 호출 응답
- 에러 메시지

#### 네트워크 탭 확인
- 카카오톡 API 호출 상태
- `/api/auth/kakao/signup` 호출 상태
- 응답 데이터 확인

## 📚 6. 추가 정보

### 6-1. 카카오톡 API 문서
- [카카오 로그인 REST API](https://developers.kakao.com/docs/latest/ko/kakaologin/rest-api)
- [카카오 로그인 JavaScript SDK](https://developers.kakao.com/docs/latest/ko/kakaologin/js)

### 6-2. 보안 고려사항
- JavaScript 키는 공개되어도 안전 (NEXT_PUBLIC_ 접두사)
- HTTPS 환경에서만 운영
- sessionStorage를 통한 임시 데이터 저장

### 6-3. 운영 환경 설정
- 도메인 변경 시 카카오 개발자 콘솔에서 플랫폼 도메인 업데이트
- 환경변수 `NEXT_PUBLIC_APP_URL` 업데이트

---

**작성일**: 2025년 9월 3일
**작성자**: 개발팀
**상태**: ✅ 완료
