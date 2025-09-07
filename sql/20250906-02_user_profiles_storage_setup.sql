-- 사용자 프로필 이미지 Storage 설정을 위한 SQL 쿼리
-- 생성일: 2025-09-06
-- 설명: 사용자 프로필 이미지 업로드를 위한 Storage 버킷 및 정책 설정
-- Supabase Dashboard의 Storage 섹션에서 실행하세요.

-- 1. user-profiles 버킷 생성
INSERT INTO storage.buckets (id, name, public)
VALUES ('user-profiles', 'user-profiles', true);

-- 2. Storage 정책 설정
-- 모든 사용자가 프로필 이미지를 조회할 수 있도록 설정
CREATE POLICY "user-profiles_select_policy" ON storage.objects
    FOR SELECT USING (bucket_id = 'user-profiles');

-- 인증된 사용자만 자신의 프로필 이미지를 업로드할 수 있도록 설정
CREATE POLICY "user-profiles_insert_policy" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'user-profiles'
        AND auth.role() = 'authenticated'
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

-- 인증된 사용자만 자신의 프로필 이미지를 수정할 수 있도록 설정
CREATE POLICY "user-profiles_update_policy" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'user-profiles'
        AND auth.role() = 'authenticated'
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

-- 인증된 사용자만 자신의 프로필 이미지를 삭제할 수 있도록 설정
CREATE POLICY "user-profiles_delete_policy" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'user-profiles'
        AND auth.role() = 'authenticated'
        AND auth.uid()::text = (storage.foldername(name))[1]
    );
