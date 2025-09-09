-- favorites 테이블 RLS 정책을 함수 기반으로 수정
-- 생성일: 2025-09-09
-- 설명: API 서버에서도 작동하는 RLS 정책으로 수정

-- ========================================
-- 1. 기존 RLS 정책 삭제
-- ========================================

-- 기존 찜 관련 정책들 삭제
DROP POLICY IF EXISTS "찜 목록 조회 정책" ON favorites;
DROP POLICY IF EXISTS "찜 생성 정책" ON favorites;
DROP POLICY IF EXISTS "찜 삭제 정책" ON favorites;

-- ========================================
-- 2. 사용자 인증 확인 함수 생성
-- ========================================

-- 현재 사용자의 user_profiles.id를 반환하는 함수
CREATE OR REPLACE FUNCTION get_current_user_profile_id()
RETURNS INTEGER AS $$
DECLARE
    profile_id INTEGER;
BEGIN
    -- auth.uid()가 null이 아닌 경우에만 조회
    IF auth.uid() IS NOT NULL THEN
        SELECT id INTO profile_id
        FROM user_profiles
        WHERE auth_user_id = auth.uid()
        AND is_deleted = false;

        RETURN profile_id;
    END IF;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- 3. 새로운 RLS 정책 생성
-- ========================================

-- 찜 목록 조회 정책 (함수 사용)
CREATE POLICY "찜 목록 조회 정책" ON favorites
  FOR SELECT USING (
    user_id = get_current_user_profile_id()
    AND is_deleted = false
  );

-- 찜 생성 정책 (함수 사용)
CREATE POLICY "찜 생성 정책" ON favorites
  FOR INSERT WITH CHECK (
    user_id = get_current_user_profile_id()
  );

-- 찜 삭제 정책 (함수 사용)
CREATE POLICY "찜 삭제 정책" ON favorites
  FOR DELETE USING (
    user_id = get_current_user_profile_id()
  );

-- ========================================
-- 4. 완료 메시지
-- ========================================

SELECT 'favorites 테이블 RLS 정책이 함수 기반으로 수정되었습니다!' as message;
