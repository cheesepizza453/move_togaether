# Move Togaether 데이터베이스 초기화 가이드

## 📅 생성일
2025년 8월 28일

## 🚀 실행 방법

### 1. Supabase Dashboard에서 실행
1. Supabase 프로젝트 대시보드 접속
2. **SQL Editor** 메뉴 선택
3. `20250828-01_initialize.sql` 파일의 내용을 복사하여 붙여넣기
4. **Run** 버튼 클릭

### 2. Supabase CLI 사용
```bash
# 프로젝트 연결
supabase link --project-ref YOUR_PROJECT_REF

# SQL 파일 실행
supabase db reset
```

## 📋 생성되는 테이블

### **Core Tables**
- `user_profiles` - 사용자 프로필 정보
- `posts` - 봉사 요청 게시물
- `applications` - 봉사 신청
- `shelters` - 보호소 정보
- `favorites` - 찜 목록

### **Features**
- ✅ SERIAL ID (자동 증가 정수)
- ✅ 소프트 삭제 (`is_deleted`, `deleted_at`)
- ✅ 자동 타임스탬프 (`created_at`, `updated_at`)
- ✅ 핵심 인덱스만 생성 (성능 최적화)
- ✅ RLS 정책 (보안)
- ✅ 외래키 제약 조건
- ✅ 샘플 데이터 (테스트용)

## ⚠️ 주의사항

### **1. Supabase Auth 설정 필요**
- `auth.users` 테이블이 먼저 생성되어 있어야 함
- Supabase 프로젝트에서 Auth 기능 활성화 필요

### **2. 샘플 데이터의 UUID**
- 현재 더미 UUID 사용 (테스트용)
- 실제 사용 시 Supabase Auth 사용자 UUID로 교체 필요

### **3. RLS 정책**
- 모든 테이블에 RLS 활성화
- 인증된 사용자만 데이터 접근 가능
- 사용자별 데이터 접근 제어

## 🔧 다음 단계

### **1. Supabase Auth 설정**
- 카카오톡 OAuth Provider 설정
- 이메일 인증 설정

### **2. Next.js 개발**
- Supabase 클라이언트 연동
- API Routes 구현
- 인증 컴포넌트 개발

## 📊 실행 결과 확인

초기화 완료 후 다음 쿼리로 결과 확인:
```sql
SELECT * FROM active_posts_view;
SELECT COUNT(*) FROM user_profiles;
SELECT COUNT(*) FROM posts;
```

## 🆘 문제 해결

### **RLS 정책 오류**
- Supabase Auth 설정 확인
- `auth.uid()` 함수 작동 여부 확인

### **외래키 제약 오류**
- 테이블 생성 순서 확인
- 참조하는 테이블 존재 여부 확인

### **권한 오류**
- Supabase 프로젝트 설정에서 RLS 활성화 확인
- 사용자 인증 상태 확인
