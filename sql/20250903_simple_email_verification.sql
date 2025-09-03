-- 2025년 9월 3일 - Supabase Auth 기본 이메일 인증을 위한 최소 스키마
-- 기존 user_profiles 테이블은 그대로 유지, 추가 컬럼 없음

-- ========================================
-- 1. 이메일 인증 상태 조회 뷰 생성
-- ========================================

-- Supabase Auth와 user_profiles를 조인한 뷰 생성
CREATE OR REPLACE VIEW user_profiles_with_auth AS
SELECT
    up.*,
    au.email_confirmed_at,
    CASE
        WHEN au.email_confirmed_at IS NOT NULL THEN true
        ELSE false
    END as is_email_verified
FROM user_profiles up
JOIN auth.users au ON up.auth_user_id = au.id
WHERE up.is_deleted = false;

COMMENT ON VIEW user_profiles_with_auth IS '사용자 프로필과 인증 상태를 함께 보여주는 뷰';

-- ========================================
-- 2. 완료 메시지
-- ========================================

SELECT '간단한 이메일 인증 스키마 설정이 완료되었습니다!' as message;
SELECT 'user_profiles_with_auth 뷰가 생성되었습니다.' as details;
