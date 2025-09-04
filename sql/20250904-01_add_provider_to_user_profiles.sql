-- user_profiles 테이블에 provider 컬럼 추가
-- 생성일: 2025-09-04
-- 설명: 사용자 가입 방식을 구분하기 위한 provider 컬럼 추가 (email, kakao)

-- ========================================
-- 1. provider 컬럼 추가
-- ========================================

-- provider 컬럼 추가 (기본값: 'email')
ALTER TABLE public.user_profiles
ADD COLUMN provider VARCHAR(20) DEFAULT 'email' NOT NULL;

-- provider 컬럼에 코멘트 추가
COMMENT ON COLUMN public.user_profiles.provider IS '사용자 가입 방식 (email: 이메일 가입, kakao: 카카오톡 가입)';

-- ========================================
-- 2. 기존 데이터 업데이트
-- ========================================

-- 기존 사용자들의 provider를 'email'로 설정 (이미 기본값이지만 명시적으로 설정)
UPDATE public.user_profiles
SET provider = 'email'
WHERE provider IS NULL;

-- ========================================
-- 3. 인덱스 및 제약 조건 추가
-- ========================================

-- provider 컬럼에 인덱스 추가 (중복 체크 성능 향상)
CREATE INDEX idx_user_profiles_provider ON public.user_profiles(provider) WHERE is_deleted = false;

-- provider 컬럼에 체크 제약 조건 추가 (유효한 값만 허용)
ALTER TABLE public.user_profiles
ADD CONSTRAINT chk_user_profiles_provider
CHECK (provider IN ('email', 'kakao'));

-- ========================================
-- 4. RLS 정책 업데이트
-- ========================================

-- 기존 RLS 정책은 그대로 유지 (provider 컬럼 추가로 인한 변경 없음)
-- 사용자는 여전히 자신의 프로필만 조회/수정 가능

-- ========================================
-- 5. 마이그레이션 완료 확인
-- ========================================

-- 마이그레이션 완료 확인
SELECT 'user_profiles 테이블에 provider 컬럼이 성공적으로 추가되었습니다!' as message;

-- 컬럼 정보 확인
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default,
    col_description(pgc.oid, pa.attnum) as comment
FROM information_schema.columns isc
JOIN pg_class pgc ON pgc.relname = isc.table_name
JOIN pg_namespace pgn ON pgn.oid = pgc.relnamespace
JOIN pg_attribute pa ON pa.attrelid = pgc.oid AND pa.attname = isc.column_name
WHERE isc.table_name = 'user_profiles'
    AND isc.table_schema = 'public'
    AND isc.column_name = 'provider';

-- 기존 데이터 확인
SELECT
    provider,
    COUNT(*) as user_count
FROM public.user_profiles
WHERE is_deleted = false
GROUP BY provider;

