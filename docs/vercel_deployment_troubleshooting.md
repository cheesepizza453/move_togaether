# Vercel 배포 문제 해결 가이드

## 🚨 **현재 문제 상황**

Vercel에서 "An unexpected error happened when running this build" 오류가 발생했습니다.

## 🔍 **가능한 원인들**

### 1. **Turbopack과 Webpack 충돌**
- **문제**: Next.js 15에서 Turbopack과 Webpack이 동시에 설정됨
- **해결**: Turbopack 비활성화 및 Webpack 설정 주석 처리

### 2. **환경변수 누락**
- **문제**: Vercel에서 필요한 환경변수가 설정되지 않음
- **해결**: Vercel 대시보드에서 환경변수 설정

### 3. **메모리 부족**
- **문제**: 빌드 과정에서 메모리 부족
- **해결**: 빌드 설정 최적화

## 🔧 **해결 방법**

### **1단계: 환경변수 설정 확인**

Vercel 대시보드에서 다음 환경변수들이 설정되어 있는지 확인:

```env
# Supabase 설정
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# 앱 설정
NEXT_PUBLIC_APP_URL=https://move-togaether.com

# 카카오톡 OAuth 설정
NEXT_PUBLIC_KAKAO_JS_KEY=your_kakao_javascript_key

# 카카오맵 API
NEXT_PUBLIC_KAKAO_MAP_API_KEY=your_kakao_map_api_key
```

### **2단계: Vercel 설정 확인**

1. **Vercel 대시보드 접속**: https://vercel.com/dashboard
2. **프로젝트 선택**: move_togaether
3. **Settings → Environment Variables** 확인
4. **Build & Development Settings** 확인:
   - Framework Preset: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`

### **3단계: 빌드 로그 확인**

1. **Deployments 탭**에서 실패한 배포 클릭
2. **Build Logs** 확인
3. **Functions Logs** 확인

### **4단계: 재배포 시도**

```bash
# 로컬에서 빌드 테스트
npm run build

# 변경사항 커밋 및 푸시
git add .
git commit -m "Turbopack 비활성화 및 Webpack 충돌 해결"
git push origin main
```

## 📋 **체크리스트**

- [ ] 환경변수 모두 설정됨
- [ ] Next.js 설정 오류 없음
- [ ] Turbopack 비활성화됨
- [ ] Webpack 설정 주석 처리됨
- [ ] 로컬 빌드 성공
- [ ] GitHub 푸시 완료

## 🚀 **예상 결과**

수정 후 재배포하면:
- ✅ 빌드 성공
- ✅ 배포 완료
- ✅ 사이트 정상 접속

## 📞 **추가 지원**

문제가 지속되면:
1. **Vercel Support**: https://vercel.com/help
2. **GitHub Issues**: 프로젝트 저장소에 이슈 생성
3. **로컬 빌드 로그**: `npm run build` 결과 공유
