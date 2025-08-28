# Playwright Tests

이 디렉토리는 Playwright를 사용한 E2E 테스트를 포함합니다.

## 🚀 테스트 실행

### 기본 테스트 실행
```bash
npm run test
```

### UI 모드로 테스트 실행 (권장)
```bash
npm run test:ui
```

### 헤드리스 모드로 테스트 실행
```bash
npm run test:headed
```

### 디버그 모드로 테스트 실행
```bash
npm run test:debug
```

### 테스트 리포트 보기
```bash
npm run test:report
```

## 📁 파일 구조

```
tests/
├── README.md                 # 이 파일
├── global-setup.js          # 전역 설정 (테스트 실행 전)
├── global-teardown.js       # 전역 정리 (테스트 실행 후)
├── home.spec.js             # 메인 페이지 테스트
├── components.spec.js       # UI 컴포넌트 테스트
└── utils/
    └── test-helpers.js      # 테스트 헬퍼 함수
```

## 🧪 테스트 종류

### 1. Home Page Tests (`home.spec.js`)
- 페이지 로딩 테스트
- UI 요소 표시 테스트
- 반응형 디자인 테스트
- 메타 태그 테스트

### 2. Component Tests (`components.spec.js`)
- Button 컴포넌트 테스트
- Card 컴포넌트 테스트
- Layout 컴포넌트 테스트
- 접근성 테스트

## ⚙️ 설정

### Playwright Config (`playwright.config.js`)
- **포트**: 3008 (개발 서버)
- **브라우저**: Chrome, Firefox, Safari
- **모바일**: Pixel 5, iPhone 12
- **자동 서버 시작**: `npm run dev` 자동 실행

### 환경 변수
```bash
# 기본 URL 설정
PLAYWRIGHT_BASE_URL=http://localhost:3008

# CI 환경 감지
CI=true
```

## 🔧 테스트 작성 가이드

### 기본 테스트 구조
```javascript
const { test, expect } = require('@playwright/test');

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should do something', async ({ page }) => {
    // 테스트 로직
    await expect(page.locator('h1')).toBeVisible();
  });
});
```

### 모바일 테스트
```javascript
test('should work on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  // 모바일 전용 테스트
});
```

### 스크린샷 및 비디오
- **실패 시 자동**: 스크린샷과 비디오 자동 저장
- **위치**: `test-results/` 디렉토리

## 🐛 문제 해결

### 일반적인 문제들

#### 1. 개발 서버 연결 실패
```bash
# 개발 서버가 실행 중인지 확인
npm run dev

# 다른 터미널에서 테스트 실행
npm run test
```

#### 2. 브라우저 설치 실패
```bash
npx playwright install
```

#### 3. 테스트 타임아웃
- `playwright.config.js`에서 `timeout` 값 증가
- 네트워크 상태 확인

### 디버깅 팁

#### 1. UI 모드 사용
```bash
npm run test:ui
```
- 실시간으로 테스트 진행 상황 확인
- 스텝별 실행 및 디버깅

#### 2. 헤드리스 모드
```bash
npm run test:headed
```
- 브라우저 창을 보면서 테스트 실행

#### 3. 로그 확인
```bash
npm run test -- --reporter=list
```

## 📊 CI/CD 통합

### GitHub Actions 예시
```yaml
- name: Install Playwright
  run: npx playwright install --with-deps

- name: Run Playwright tests
  run: npm run test
```

### 테스트 결과 아티팩트
- `test-results/`: 스크린샷, 비디오, 트레이스
- `playwright-report/`: HTML 리포트

## 🔗 유용한 링크

- [Playwright 공식 문서](https://playwright.dev/)
- [Playwright Test API](https://playwright.dev/docs/api/class-test)
- [Playwright Assertions](https://playwright.dev/docs/test-assertions)
- [Playwright Locators](https://playwright.dev/docs/locators)
