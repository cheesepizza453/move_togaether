-- 프로필 이미지 컬럼 추가 및 관련 기능 구현
-- 2025년 10월 1일

-- 1. user_profiles 테이블에 profile_image 컬럼 추가
ALTER TABLE user_profiles
ADD COLUMN profile_image TEXT;

-- 컬럼 설명 추가
COMMENT ON COLUMN user_profiles.profile_image IS '사용자 프로필 이미지 URL (Supabase Storage URL)';

-- 2. 관련 기능 구현 내용
-- - Supabase Storage 'user-profiles' 버킷 사용
-- - 파일 경로: {user_id}/profile_{timestamp}.jpg
-- - RLS 정책: 사용자별 폴더 접근 제어
-- - 기존 이미지 자동 삭제 기능
-- - 프로필 캐시 갱신 기능

-- 3. API 엔드포인트
-- - PUT /api/mypage/profile: 프로필 업데이트 (profile_image 포함)
-- - GET /api/mypage/profile: 프로필 조회 (profile_image 포함)

-- 4. 클라이언트 기능
-- - Base64 이미지를 Storage에 업로드
-- - 기존 프로필 이미지 자동 삭제
-- - 로컬 캐시 갱신으로 즉시 UI 반영
-- - 프로필 이미지 표시 (profile_image 필드 사용)

-- 5. Storage 버킷 설정
-- - 버킷명: user-profiles
-- - RLS 정책: 사용자별 폴더 접근 제어
-- - 파일 형식: JPEG
-- - 경로 구조: {user_id}/profile_{timestamp}.jpg

-- 6. 주요 파일 수정 사항
-- - src/app/mypage/edit/page.jsx: 프로필 이미지 업로드 및 기존 이미지 삭제
-- - src/app/mypage/page.jsx: profile_image 필드명 수정 (profile_image_url → profile_image)
-- - src/hooks/useAuth.js: updateProfile 함수 추가로 캐시 갱신
-- - src/app/api/mypage/profile/route.js: profile_image 필드 처리
