-- favorites 테이블 RLS 정책 수정
-- 생성일: 2025-09-09
-- 설명: API 서버에서 favorites 테이블에 INSERT할 수 있도록 RLS 정책 수정

-- ========================================
-- 1. 기존 RLS 정책 삭제
-- ========================================

-- 기존 찜 관련 정책들 삭제
DROP POLICY IF EXISTS "찜 목록 조회 정책" ON favorites;
DROP POLICY IF EXISTS "찜 생성 정책" ON favorites;
DROP POLICY IF EXISTS "찜 삭제 정책" ON favorites;

-- ========================================
-- 2. 새로운 RLS 정책 생성
-- ========================================

-- 찜 목록 조회 정책 (기존과 동일)
CREATE POLICY "찜 목록 조회 정책" ON favorites
  FOR SELECT USING (
    auth.uid() IN (SELECT auth_user_id FROM user_profiles WHERE id = user_id)
    AND is_deleted = false
  );

-- 찜 생성 정책 (API 서버에서도 작동하도록 수정)
CREATE POLICY "찜 생성 정책" ON favorites
  FOR INSERT WITH CHECK (
    auth.uid() IN (SELECT auth_user_id FROM user_profiles WHERE id = user_id)
  );

-- 찜 삭제 정책 (기존과 동일)
CREATE POLICY "찜 삭제 정책" ON favorites
  FOR DELETE USING (
    auth.uid() IN (SELECT auth_user_id FROM user_profiles WHERE id = user_id)
  );

-- ========================================
-- 3. 완료 메시지
-- ========================================

SELECT 'favorites 테이블 RLS 정책이 수정되었습니다!' as message;
