-- 실종신고/지역 선택 기능에서 사용하는 posts 컬럼 보강
-- Supabase SQL Editor에서 운영 DB에 실행하세요.

ALTER TABLE posts
ADD COLUMN IF NOT EXISTS departure_sido VARCHAR(50),
ADD COLUMN IF NOT EXISTS departure_sigungu VARCHAR(80),
ADD COLUMN IF NOT EXISTS departure_dong VARCHAR(80),
ADD COLUMN IF NOT EXISTS arrival_sido VARCHAR(50),
ADD COLUMN IF NOT EXISTS arrival_sigungu VARCHAR(80),
ADD COLUMN IF NOT EXISTS arrival_dong VARCHAR(80),
ADD COLUMN IF NOT EXISTS missing_date DATE,
ADD COLUMN IF NOT EXISTS dog_description TEXT,
ADD COLUMN IF NOT EXISTS is_original BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS post_type VARCHAR(20) DEFAULT 'volunteer';

UPDATE posts
SET post_type = 'volunteer'
WHERE post_type IS NULL;

ALTER TABLE posts
ALTER COLUMN post_type SET DEFAULT 'volunteer';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'check_posts_post_type'
  ) THEN
    ALTER TABLE posts
    ADD CONSTRAINT check_posts_post_type
    CHECK (post_type IN ('volunteer', 'missing'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_posts_post_type_status_created_at
ON posts (post_type, status, created_at DESC);

COMMENT ON COLUMN posts.departure_sido IS '출발/목격 위치 시도';
COMMENT ON COLUMN posts.departure_sigungu IS '출발/목격 위치 시군구';
COMMENT ON COLUMN posts.departure_dong IS '출발/목격 위치 읍면동';
COMMENT ON COLUMN posts.arrival_sido IS '도착지 시도';
COMMENT ON COLUMN posts.arrival_sigungu IS '도착지 시군구';
COMMENT ON COLUMN posts.arrival_dong IS '도착지 읍면동';
COMMENT ON COLUMN posts.missing_date IS '실종견을 잃어버린 날짜';
COMMENT ON COLUMN posts.dog_description IS '실종견 설명';
COMMENT ON COLUMN posts.is_original IS '원글 여부';
COMMENT ON COLUMN posts.post_type IS '게시물 유형: volunteer 또는 missing';
