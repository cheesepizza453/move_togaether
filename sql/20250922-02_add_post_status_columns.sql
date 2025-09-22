-- posts 테이블에 status와 completed_at 컬럼 추가
ALTER TABLE posts
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE;

-- status 컬럼에 인덱스 추가
CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status);

-- completed_at 컬럼에 인덱스 추가
CREATE INDEX IF NOT EXISTS idx_posts_completed_at ON posts(completed_at);
