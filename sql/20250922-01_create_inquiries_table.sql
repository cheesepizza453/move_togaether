-- 문의 테이블 생성
CREATE TABLE IF NOT EXISTS inquiries (
  id SERIAL PRIMARY KEY,
  post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'read', 'replied', 'closed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_inquiries_post_id ON inquiries(post_id);
CREATE INDEX IF NOT EXISTS idx_inquiries_user_id ON inquiries(user_id);
CREATE INDEX IF NOT EXISTS idx_inquiries_status ON inquiries(status);
CREATE INDEX IF NOT EXISTS idx_inquiries_created_at ON inquiries(created_at);

-- RLS 정책 설정
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;

-- 사용자는 자신의 문의만 조회 가능
CREATE POLICY "Users can view their own inquiries" ON inquiries
  FOR SELECT USING (auth.uid() = user_id);

-- 사용자는 자신의 문의만 생성 가능
CREATE POLICY "Users can create their own inquiries" ON inquiries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 사용자는 자신의 문의만 수정 가능
CREATE POLICY "Users can update their own inquiries" ON inquiries
  FOR UPDATE USING (auth.uid() = user_id);

-- 포스트 작성자는 해당 포스트의 모든 문의 조회 가능
CREATE POLICY "Post owners can view inquiries for their posts" ON inquiries
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM posts
      WHERE posts.id = inquiries.post_id
      AND posts.user_id = auth.uid()
    )
  );

-- 포스트 작성자는 해당 포스트의 문의 상태 수정 가능
CREATE POLICY "Post owners can update inquiry status" ON inquiries
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM posts
      WHERE posts.id = inquiries.post_id
      AND posts.user_id = auth.uid()
    )
  );

-- 업데이트 시 updated_at 자동 갱신
CREATE OR REPLACE FUNCTION update_inquiries_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_inquiries_updated_at
  BEFORE UPDATE ON inquiries
  FOR EACH ROW
  EXECUTE FUNCTION update_inquiries_updated_at();
