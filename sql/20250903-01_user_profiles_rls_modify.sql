-- 닉네임 중복 체크를 위한 정책 추가
CREATE POLICY "닉네임 중복 체크 정책" ON public.user_profiles
FOR SELECT
TO public
USING (true);
