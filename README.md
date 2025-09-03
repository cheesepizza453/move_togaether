# 🐕 Move Togaether - 유기견 이동봉사 매칭 플랫폼

> 입양 예정인 유기견들이 새로운 가족에게 안전하게 이동할 수 있도록 봉사자와 보호소/개인 구조자를 연결하는 매칭 플랫폼

## 🚀 프로젝트 상태

**현재 단계**: Phase 1 - MVP (Minimum Viable Product) ✅ 완료
**최근 업데이트**: 2024년 8월 28일 - 메인 페이지 시안 완성

### ✅ 완료된 작업
- [x] 기본 페이지 구조 및 라우팅
- [x] 핵심 UI 컴포넌트 (Header, MainBanner, PostCard 등)
- [x] 반응형 디자인 (모바일/태블릿/데스크톱)
- [x] 기본 데이터 구조 및 목업 데이터
- [x] 사용자 인터랙션 (검색, 필터, 정렬)

### 🔄 진행 중인 작업
- [ ] 실제 이미지 에셋 준비
- [ ] API 연동 준비
- [ ] 테스트 코드 작성

### 📋 다음 단계
- [ ] 사용자 인증 시스템 (카카오톡 연동)
- [ ] 게시물 작성 시스템
- [ ] 위치 기반 기능 (카카오맵 API)

## 🎯 프로젝트 개요

### 목적
유기견 이동봉사 매칭 플랫폼으로, 입양 예정인 유기견들이 새로운 가족에게 안전하게 이동할 수 있도록 봉사자와 보호소/개인 구조자를 연결합니다.

### 핵심 기능
1. **봉사 요청 등록**: 이동 정보, 구조견 정보, 추가 정보
2. **봉사 신청**: 봉사자 정보 입력, 메시지 전달
3. **위치 기반 검색**: 현재 위치 기준 봉사 요청 검색
4. **사용자 관리**: 프로필 관리, 게시물 관리, 찜 목록

## 🛠️ 기술 스택

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript/JavaScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Icons**: Lucide React

### Backend & Database
- **Backend**: Next.js API Routes
- **Database**: Supabase
- **Authentication**: Supabase Auth + 이메일 인증 시스템
- **Password Hashing**: bcryptjs
- **Security**: Row Level Security (RLS)

### External APIs
- **Map API**: 카카오맵 API
- **Address Search**: 카카오 우편번호 서비스
- **Email Service**: 향후 SendGrid 또는 AWS SES 연동 예정

### Development & Deployment
- **Version Control**: GitHub
- **Deployment**: Vercel (GitHub 연동)
- **Testing**: Playwright

## 🔐 환경 변수 설정

프로젝트 실행을 위해 다음 환경 변수를 설정해야 합니다:

### 1. `.env.local` 파일 생성
```bash
# Supabase 설정
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# 애플리케이션 설정
NEXT_PUBLIC_APP_URL=http://localhost:3000

# 보안 설정
JWT_SECRET=your_jwt_secret_key
```

### 2. Supabase 프로젝트 설정
1. [Supabase](https://supabase.com)에서 새 프로젝트 생성
2. SQL 편집기에서 `sql/20250903_users_table_schema.sql` 실행
3. 프로젝트 설정에서 API 키 복사

## 📧 이메일 회원가입 시스템

### 회원가입 플로우
1. **기본 정보 입력** (`/signup`)
   - 이메일, 비밀번호 입력
   - 실시간 유효성 검사

2. **추가 정보 입력** (`/signup/additional-info`)
   - 닉네임, 소개, 연락처
   - 연락채널 선택 (인스타그램, 네이버카페, 카카오톡)

3. **회원가입 완료** (`/signup/success`)
   - 이메일 인증 안내
   - 인증 단계별 가이드

4. **이메일 인증** (`/verify-email`)
   - 인증 토큰 검증
   - 계정 활성화

### 보안 기능
- **비밀번호 해시화**: bcryptjs (salt rounds: 12)
- **이메일 중복 방지**: 고유 제약 조건
- **닉네임 중복 방지**: 고유 제약 조건
- **토큰 만료**: 24시간 후 자동 만료
- **소프트 삭제**: `is_deleted` 플래그 사용
- **Row Level Security**: 사용자별 데이터 접근 제어

## 📱 주요 화면

### 1. 메인 페이지 (`/`)
- 현재 위치 기반 봉사 요청 검색
- 긴급도별 표시 (D-3, D-19, D-80 등)
- 로그인/회원가입 (카카오톡 연동)

### 2. 게시물 상세 페이지 (`/posts/[id]`)
- 이동 정보 (출발지/도착지)
- 구조견 정보 (이름, 크기, 견종, 사진)
- 봉사 신청 모달

### 3. 게시물 작성 페이지 (`/posts/new`)
- 이동 봉사 정보 입력
- 구조견 정보 입력
- 이미지 업로드 (최대 5장)

### 4. 마이페이지 (`/mypage`)
- 내 정보 관리
- 작성한 게시물 관리
- 지원한 봉사 내역

## 🏗️ 프로젝트 구조

```
src/
├── app/                    # Next.js App Router
│   ├── layout.jsx         # 루트 레이아웃
│   └── page.jsx           # 메인 페이지
├── components/            # 재사용 가능한 컴포넌트
│   ├── ui/               # shadcn/ui 기본 컴포넌트
│   ├── Header.jsx        # 헤더 네비게이션
│   ├── MainBanner.jsx    # 메인 배너 슬라이더
│   ├── LocationSelector.jsx # 위치 선택 컴포넌트
│   ├── SortOptions.jsx   # 정렬 옵션
│   ├── PostCard.jsx      # 게시물 카드
│   └── Footer.jsx        # 푸터
├── lib/                  # 유틸리티 함수
└── styles/               # 전역 스타일
```

## 🚀 시작하기

### 필수 요구사항
- Node.js 18.0.0 이상
- npm 또는 yarn

### 설치 및 실행

1. **저장소 클론**
```bash
git clone https://github.com/your-username/move_togaether.git
cd move_togaether
```

2. **의존성 설치**
```bash
npm install
# 또는
yarn install
```

3. **개발 서버 실행**
```bash
npm run dev
# 또는
yarn dev
```

4. **브라우저에서 확인**
```
http://localhost:3000
```

### 환경 변수 설정

`.env.local` 파일을 생성하고 다음 변수들을 설정하세요:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Kakao Map API
NEXT_PUBLIC_KAKAO_MAP_API_KEY=your_kakao_map_api_key
```

## 🎨 디자인 시스템

### 색상 팔레트
- **Primary**: #2563eb (파란색)
- **Secondary**: #6b7280 (회색)
- **Accent**: #dc2626 (빨간색 - D-day)
- **Success**: #16a34a (초록색)
- **Warning**: #ca8a04 (노란색)

### 반응형 브레이크포인트
- **Mobile**: < 768px (기본 디자인)
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

### 타이포그래피
- **Font Family**: Geist Sans
- **Heading**: 2xl, 3xl, 4xl
- **Body**: sm, base, lg
- **Caption**: xs

## 📊 데이터베이스 스키마

### 주요 테이블
- **user_profiles**: 사용자 프로필 정보
- **posts**: 봉사 요청 게시물
- **applications**: 봉사 신청
- **shelters**: 보호소 정보
- **favorites**: 찜 목록

자세한 스키마는 `docs/prd_document.md`를 참조하세요.

## 🧪 테스트

### 테스트 실행
```bash
# 단위 테스트
npm run test

# E2E 테스트
npm run test:e2e

# 테스트 커버리지
npm run test:coverage
```

## 📚 문서

- **PRD 문서**: `docs/prd_document.md`
- **작업 로그**: `docs/20250828_메인페이지_시안_작업/`
- **컴포넌트 구조도**: `docs/20250828_메인페이지_시안_작업/컴포넌트_구조도.md`

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 `LICENSE` 파일을 참조하세요.

## 📞 연락처

- **프로젝트 링크**: [https://github.com/your-username/move_togaether](https://github.com/your-username/move_togaether)
- **이메일**: support@movetogaether.com
- **고객센터**: 1588-0000

## 🙏 감사의 말

- [Next.js](https://nextjs.org/) - React 프레임워크
- [Tailwind CSS](https://tailwindcss.com/) - CSS 프레임워크
- [shadcn/ui](https://ui.shadcn.com/) - UI 컴포넌트
- [Supabase](https://supabase.com/) - 백엔드 서비스
- [Vercel](https://vercel.com/) - 배포 플랫폼

---

⭐ 이 프로젝트가 도움이 되었다면 스타를 눌러주세요!
