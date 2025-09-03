-- user_profiles 테이블에 email 컬럼 추가
ALTER TABLE public.user_profiles
ADD COLUMN email VARCHAR(255) UNIQUE;

-- 기존 데이터에 이메일 정보 추가 (auth.users와 조인)
UPDATE public.user_profiles
SET email = au.email
FROM auth.users au
WHERE user_profiles.auth_user_id = au.id;

-- email 컬럼에 NOT NULL 제약 조건 추가
ALTER TABLE public.user_profiles
ALTER COLUMN email SET NOT NULL;

-- email 컬럼에 코멘트 추가
COMMENT ON COLUMN public.user_profiles.email IS '사용자 이메일 주소 (auth.users와 동기화)';

-- 이메일 중복 체크를 위한 인덱스 추가
CREATE INDEX idx_user_profiles_email ON public.user_profiles(email) WHERE is_deleted = false;
