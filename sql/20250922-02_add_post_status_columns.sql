-- posts 테이블의 status 컬럼에 CHECK 제약조건 추가
ALTER TABLE posts
ADD CONSTRAINT IF NOT EXISTS check_posts_status
CHECK (status IN ('active', 'completed', 'cancelled'));

-- posts 테이블에 completed_at 컬럼 추가
ALTER TABLE posts
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE;

-- status 컬럼에 인덱스 추가 (이미 있을 수 있음)
CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status);

-- completed_at 컬럼에 인덱스 추가
CREATE INDEX IF NOT EXISTS idx_posts_completed_at ON posts(completed_at);
