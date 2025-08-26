# Move Together

함께 움직이는 새로운 경험을 시작해보세요! 🚀

## 🚀 기술 스택

- **Framework**: Next.js 14 (App Router)
- **Language**: JavaScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Deployment**: Vercel
- **Database**: Supabase (향후 연동 예정)

## ✨ 주요 특징

- 📱 **모바일 우선 디자인**: 모든 디바이스에서 완벽한 경험
- 🎨 **현대적 UI**: shadcn/ui로 아름다운 인터페이스
- 🚀 **빠른 성능**: Next.js의 최적화된 성능
- 🔧 **확장 가능**: Vercel과 Supabase로 쉽게 확장
- 🌙 **다크 모드 지원**: 사용자 선호도에 따른 테마 변경

## 🛠️ 설치 및 실행

### 1. 의존성 설치

```bash
npm install
```

### 2. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

### 3. 프로덕션 빌드

```bash
npm run build
npm start
```

## 📁 프로젝트 구조

```
src/
├── app/                 # Next.js App Router
│   ├── globals.css     # 전역 스타일
│   ├── layout.tsx      # 루트 레이아웃
│   └── page.tsx        # 메인 페이지
├── components/          # 재사용 가능한 컴포넌트
│   └── ui/             # shadcn/ui 컴포넌트
└── lib/                 # 유틸리티 및 설정
    ├── constants.js     # 상수 정의
    └── utils.js         # 유틸리티 함수
```

## 🎯 사용된 shadcn/ui 컴포넌트

- `Button` - 버튼 컴포넌트
- `Card` - 카드 레이아웃
- `Input` - 입력 필드
- `Label` - 라벨
- `Form` - 폼 컴포넌트
- `Sheet` - 사이드 패널
- `Dialog` - 모달 다이얼로그
- `DropdownMenu` - 드롭다운 메뉴
- `Select` - 선택 컴포넌트
- `Textarea` - 텍스트 영역

## 🔧 환경 변수 설정

프로젝트 루트에 `.env.local` 파일을 생성하고 다음 변수들을 설정하세요:

```bash
# API 설정
NEXT_PUBLIC_API_URL=http://localhost:3000/api

# Supabase 설정 (향후 사용)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# 기타 설정
NEXT_PUBLIC_APP_ENV=development
NEXT_PUBLIC_APP_VERSION=1.0.0
```

## 📱 모바일 최적화

- 반응형 디자인으로 모든 화면 크기 지원
- 터치 친화적인 UI 컴포넌트
- PWA 지원을 위한 manifest.json 포함
- 모바일 전용 메타 태그 설정

## 🚀 배포

### Vercel 배포

1. [Vercel](https://vercel.com)에 계정 생성
2. GitHub 저장소 연결
3. 자동 배포 설정

### Supabase 연동 (향후)

1. [Supabase](https://supabase.com)에서 프로젝트 생성
2. 환경 변수에 Supabase 설정 추가
3. 데이터베이스 스키마 설정

## 🤝 기여하기

1. 이 저장소를 포크하세요
2. 새로운 기능 브랜치를 생성하세요 (`git checkout -b feature/amazing-feature`)
3. 변경사항을 커밋하세요 (`git commit -m 'Add some amazing feature'`)
4. 브랜치에 푸시하세요 (`git push origin feature/amazing-feature`)
5. Pull Request를 생성하세요

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.

## 📞 문의

프로젝트에 대한 문의사항이 있으시면 이슈를 생성해 주세요.

---

**Move Together** - 함께 움직이는 새로운 경험을 시작해보세요! 🎉
