-- favorites 테이블 RLS 정책 올바르게 수정
-- 생성일: 2025-09-09
-- 설명: API 서버에서도 작동하는 올바른 RLS 정책으로 수정

-- ========================================
-- 1. RLS 다시 활성화
-- ========================================

-- favorites 테이블의 RLS 활성화
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- ========================================
-- 2. 기존 정책 삭제
-- ========================================

-- 기존 찜 관련 정책들 삭제
DROP POLICY IF EXISTS "찜 목록 조회 정책" ON favorites;
DROP POLICY IF EXISTS "찜 생성 정책" ON favorites;
DROP POLICY IF EXISTS "찜 삭제 정책" ON favorites;
DROP POLICY IF EXISTS "임시 찜 정책" ON favorites;

-- ========================================
-- 3. 올바른 RLS 정책 생성
-- ========================================

-- 찜 목록 조회 정책 (인증된 사용자만 자신의 찜 조회)
CREATE POLICY "찜 목록 조회 정책" ON favorites
  FOR SELECT USING (
    auth.uid() IS NOT NULL
    AND user_id IN (
      SELECT id FROM user_profiles
      WHERE auth_user_id = auth.uid()
      AND is_deleted = false
    )
    AND is_deleted = false
  );

-- 찜 생성 정책 (인증된 사용자만 찜 생성)
CREATE POLICY "찜 생성 정책" ON favorites
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL
    AND user_id IN (
      SELECT id FROM user_profiles
      WHERE auth_user_id = auth.uid()
      AND is_deleted = false
    )
  );

-- 찜 삭제 정책 (인증된 사용자만 자신의 찜 삭제)
CREATE POLICY "찜 삭제 정책" ON favorites
  FOR DELETE USING (
    auth.uid() IS NOT NULL
    AND user_id IN (
      SELECT id FROM user_profiles
      WHERE auth_user_id = auth.uid()
      AND is_deleted = false
    )
  );

-- 찜 수정 정책 (인증된 사용자만 자신의 찜 수정)
CREATE POLICY "찜 수정 정책" ON favorites
  FOR UPDATE USING (
    auth.uid() IS NOT NULL
    AND user_id IN (
      SELECT id FROM user_profiles
      WHERE auth_user_id = auth.uid()
      AND is_deleted = false
    )
  );

-- ========================================
-- 4. 완료 메시지
-- ========================================

SELECT 'favorites 테이블 RLS 정책이 올바르게 수정되었습니다!' as message;
