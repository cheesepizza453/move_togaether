-- Move Togaether 데이터베이스 초기화
-- 생성일: 2025-08-31
-- 설명: 유기견 이동봉사 매칭 플랫폼의 모든 테이블과 기본 설정을 생성

-- ========================================
-- 1. 공통 함수 생성
-- ========================================

-- updated_at 자동 업데이트를 위한 트리거 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

COMMENT ON FUNCTION update_updated_at_column() IS '레코드 수정 시 updated_at 컬럼을 자동으로 현재 시간으로 업데이트하는 트리거 함수';

-- ========================================
-- 2. 사용자 프로필 테이블
-- ========================================

CREATE TABLE user_profiles (
  id SERIAL PRIMARY KEY,
  auth_user_id UUID REFERENCES auth.users(id) NOT NULL,
  display_name VARCHAR(100),
  phone VARCHAR(20),
  phone_visible BOOLEAN DEFAULT false,
  bio TEXT,
  instagram VARCHAR(100),
  naver_cafe VARCHAR(200),
  kakao_openchat VARCHAR(200),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  is_deleted BOOLEAN DEFAULT false,
  deleted_at TIMESTAMP,

  UNIQUE(auth_user_id)
);

-- 테이블 주석
COMMENT ON TABLE user_profiles IS '사용자 프로필 정보 테이블 - Supabase 인증 사용자의 추가 정보를 저장';

-- 컬럼 주석
COMMENT ON COLUMN user_profiles.id IS '사용자 프로필 고유 식별자 (자동 증가)';
COMMENT ON COLUMN user_profiles.auth_user_id IS 'Supabase 인증 사용자 ID (외래키)';
COMMENT ON COLUMN user_profiles.display_name IS '사용자 표시명 (최대 100자)';
COMMENT ON COLUMN user_profiles.phone IS '전화번호 (010-0000-0000 형식)';
COMMENT ON COLUMN user_profiles.phone_visible IS '전화번호 공개 여부 (기본값: 비공개)';
COMMENT ON COLUMN user_profiles.bio IS '사용자 자기소개 (제한 없음)';
COMMENT ON COLUMN user_profiles.instagram IS '인스타그램 계정명 (최대 100자)';
COMMENT ON COLUMN user_profiles.naver_cafe IS '네이버 카페 링크 (최대 200자)';
COMMENT ON COLUMN user_profiles.kakao_openchat IS '카카오톡 오픈채팅 링크 (최대 200자)';
COMMENT ON COLUMN user_profiles.created_at IS '생성일시 (자동 설정)';
COMMENT ON COLUMN user_profiles.updated_at IS '수정일시 (자동 설정)';
COMMENT ON COLUMN user_profiles.is_deleted IS '삭제 여부 (소프트 삭제)';
COMMENT ON COLUMN user_profiles.deleted_at IS '삭제일시 (소프트 삭제)';

-- 핵심 인덱스만 생성
CREATE INDEX idx_user_profiles_auth_user_id ON user_profiles(auth_user_id);

-- RLS 활성화 및 기본 정책
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- 사용자는 자신의 프로필만 조회/수정 가능
CREATE POLICY "사용자 프로필 접근 정책" ON user_profiles
  FOR ALL USING (auth.uid() = auth_user_id);

-- updated_at 자동 업데이트 트리거
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- 3. 봉사 요청 게시물 테이블
-- ========================================

CREATE TABLE posts (
  id SERIAL PRIMARY KEY,
  user_id SERIAL REFERENCES user_profiles(id) NOT NULL,
  title VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  departure_address VARCHAR(200) NOT NULL,
  departure_lat DECIMAL(10, 8),
  departure_lng DECIMAL(11, 8),
  arrival_address VARCHAR(200) NOT NULL,
  arrival_lat DECIMAL(10, 8),
  arrival_lng DECIMAL(11, 8),
  dog_name VARCHAR(50) NOT NULL,
  dog_size VARCHAR(20) NOT NULL,
  dog_breed VARCHAR(100) NOT NULL,
  dog_age INTEGER,
  dog_characteristics TEXT,
  images TEXT[],
  related_link VARCHAR(500),
  deadline DATE NOT NULL,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  is_deleted BOOLEAN DEFAULT false,
  deleted_at TIMESTAMP
);

-- 테이블 주석
COMMENT ON TABLE posts IS '봉사 요청 게시물 테이블 - 유기견 이동 봉사 요청 정보를 저장';

-- 컬럼 주석
COMMENT ON COLUMN posts.id IS '게시물 고유 식별자 (자동 증가)';
COMMENT ON COLUMN posts.user_id IS '작성자 ID (외래키)';
COMMENT ON COLUMN posts.title IS '게시물 제목 (최대 100자, 필수)';
COMMENT ON COLUMN posts.description IS '게시물 상세 내용 (제한 없음, 필수)';
COMMENT ON COLUMN posts.departure_address IS '출발지 주소 (최대 200자, 필수)';
COMMENT ON COLUMN posts.departure_lat IS '출발지 위도 (소수점 8자리까지)';
COMMENT ON COLUMN posts.departure_lng IS '출발지 경도 (소수점 8자리까지)';
COMMENT ON COLUMN posts.arrival_address IS '도착지 주소 (최대 200자, 필수)';
COMMENT ON COLUMN posts.arrival_lat IS '도착지 위도 (소수점 8자리까지)';
COMMENT ON COLUMN posts.arrival_lng IS '도착지 경도 (소수점 8자리까지)';
COMMENT ON COLUMN posts.dog_name IS '강아지 이름 (최대 50자, 필수)';
COMMENT ON COLUMN posts.dog_size IS '강아지 크기 (소형/중소형/중형/대형, 필수)';
COMMENT ON COLUMN posts.dog_breed IS '강아지 견종 (최대 100자, 필수)';
COMMENT ON COLUMN posts.dog_age IS '강아지 나이 (세)';
COMMENT ON COLUMN posts.dog_characteristics IS '강아지 특징 및 성격';
COMMENT ON COLUMN posts.images IS '이미지 URL 배열 (Supabase Storage)';
COMMENT ON COLUMN posts.related_link IS '관련 게시물 링크 (최대 500자)';
COMMENT ON COLUMN posts.deadline IS '마감일 (필수)';
COMMENT ON COLUMN posts.status IS '게시물 상태 (active/completed/expired, 기본값: active)';
COMMENT ON COLUMN posts.created_at IS '생성일시 (자동 설정)';
COMMENT ON COLUMN posts.updated_at IS '수정일시 (자동 설정)';
COMMENT ON COLUMN posts.is_deleted IS '삭제 여부 (소프트 삭제)';
COMMENT ON COLUMN posts.deleted_at IS '삭제일시 (소프트 삭제)';

-- 핵심 인덱스만 생성
CREATE INDEX idx_posts_user_id ON posts(user_id);
CREATE INDEX idx_posts_status_deadline ON posts(status, deadline);
CREATE INDEX idx_posts_location ON posts(departure_lat, departure_lng, arrival_lat, arrival_lng);

-- RLS 활성화 및 기본 정책
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 활성 게시물 조회 가능
CREATE POLICY "게시물 조회 정책" ON posts
  FOR SELECT USING (status = 'active' AND is_deleted = false);

-- 작성자만 자신의 게시물 수정/삭제 가능
CREATE POLICY "게시물 수정/삭제 정책" ON posts
  FOR ALL USING (
    auth.uid() IN (SELECT auth_user_id FROM user_profiles WHERE id = user_id)
  );

-- 로그인한 사용자만 게시물 작성 가능
CREATE POLICY "게시물 작성 정책" ON posts
  FOR INSERT WITH CHECK (
    auth.uid() IN (SELECT auth_user_id FROM user_profiles WHERE id = user_id)
  );

-- updated_at 자동 업데이트 트리거
CREATE TRIGGER update_posts_updated_at
    BEFORE UPDATE ON posts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- 4. 봉사 신청 테이블
-- ========================================

CREATE TABLE applications (
  id SERIAL PRIMARY KEY,
  post_id SERIAL REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  user_id SERIAL REFERENCES user_profiles(id) NOT NULL,
  message TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  is_deleted BOOLEAN DEFAULT false,
  deleted_at TIMESTAMP,

  UNIQUE(post_id, user_id)
);

-- 테이블 주석
COMMENT ON TABLE applications IS '봉사 신청 테이블 - 사용자의 봉사 신청 정보를 저장';

-- 컬럼 주석
COMMENT ON COLUMN applications.id IS '신청 고유 식별자 (자동 증가)';
COMMENT ON COLUMN applications.post_id IS '봉사 요청 게시물 ID (외래키)';
COMMENT ON COLUMN applications.user_id IS '신청자 ID (외래키)';
COMMENT ON COLUMN applications.message IS '신청 메시지 (제한 없음, 필수)';
COMMENT ON COLUMN applications.status IS '신청 상태 (pending/accepted/rejected/cancelled, 기본값: pending)';
COMMENT ON COLUMN applications.created_at IS '신청일시 (자동 설정)';
COMMENT ON COLUMN applications.updated_at IS '수정일시 (자동 설정)';
COMMENT ON COLUMN applications.is_deleted IS '삭제 여부 (소프트 삭제)';
COMMENT ON COLUMN applications.deleted_at IS '삭제일시 (소프트 삭제)';

-- 핵심 인덱스만 생성
CREATE INDEX idx_applications_post_user ON applications(post_id, user_id);

-- RLS 활성화 및 기본 정책
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

-- 게시물 작성자와 신청자만 조회 가능
CREATE POLICY "신청 조회 정책" ON applications
  FOR SELECT USING (
    is_deleted = false AND (
      auth.uid() IN (SELECT auth_user_id FROM user_profiles WHERE id = user_id) OR
      auth.uid() IN (
        SELECT up.auth_user_id
        FROM posts p
        JOIN user_profiles up ON p.user_id = up.id
        WHERE p.id = post_id
      )
    )
  );

-- 로그인한 사용자만 신청 가능
CREATE POLICY "신청 작성 정책" ON applications
  FOR INSERT WITH CHECK (
    auth.uid() IN (SELECT auth_user_id FROM user_profiles WHERE id = user_id)
  );

-- 신청자만 자신의 신청을 수정/삭제 가능
CREATE POLICY "신청 수정/삭제 정책" ON applications
  FOR ALL USING (
    auth.uid() IN (SELECT auth_user_id FROM user_profiles WHERE id = user_id)
  );

-- updated_at 자동 업데이트 트리거
CREATE TRIGGER update_applications_updated_at
    BEFORE UPDATE ON applications
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- 5. 보호소 정보 테이블
-- ========================================

CREATE TABLE shelters (
  id SERIAL PRIMARY KEY,
  user_id SERIAL REFERENCES user_profiles(id) NOT NULL,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  phone VARCHAR(20),
  instagram VARCHAR(100),
  naver_cafe VARCHAR(200),
  kakao_openchat VARCHAR(200),
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  is_deleted BOOLEAN DEFAULT false,
  deleted_at TIMESTAMP
);

-- 테이블 주석
COMMENT ON TABLE shelters IS '보호소 정보 테이블 - 보호소 및 관리자 정보를 저장';

-- 컬럼 주석
COMMENT ON COLUMN shelters.id IS '보호소 고유 식별자 (자동 증가)';
COMMENT ON COLUMN shelters.user_id IS '보호소 관리자 ID (외래키)';
COMMENT ON COLUMN shelters.name IS '보호소명 (최대 200자, 필수)';
COMMENT ON COLUMN shelters.description IS '보호소 소개글 (제한 없음)';
COMMENT ON COLUMN shelters.phone IS '보호소 전화번호 (010-0000-0000 형식)';
COMMENT ON COLUMN shelters.instagram IS '보호소 인스타그램 계정명 (최대 100자)';
COMMENT ON COLUMN shelters.naver_cafe IS '보호소 네이버 카페 링크 (최대 200자)';
COMMENT ON COLUMN shelters.kakao_openchat IS '보호소 카카오톡 오픈채팅 링크 (최대 200자)';
COMMENT ON COLUMN shelters.verified IS '보호소 인증 여부 (기본값: 미인증)';
COMMENT ON COLUMN shelters.created_at IS '생성일시 (자동 설정)';
COMMENT ON COLUMN shelters.updated_at IS '수정일시 (자동 설정)';
COMMENT ON COLUMN shelters.is_deleted IS '삭제 여부 (소프트 삭제)';
COMMENT ON COLUMN shelters.deleted_at IS '삭제일시 (소프트 삭제)';

-- 핵심 인덱스만 생성
CREATE INDEX idx_shelters_user_id ON shelters(user_id);
CREATE INDEX idx_shelters_verified ON shelters(verified);

-- RLS 활성화 및 기본 정책
ALTER TABLE shelters ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 인증된 보호소 조회 가능
CREATE POLICY "보호소 조회 정책" ON shelters
  FOR SELECT USING (verified = true AND is_deleted = false);

-- 보호소 관리자만 수정/삭제 가능
CREATE POLICY "보호소 수정/삭제 정책" ON shelters
  FOR ALL USING (
    auth.uid() IN (SELECT auth_user_id FROM user_profiles WHERE id = user_id)
  );

-- 로그인한 사용자만 보호소 정보 생성 가능
CREATE POLICY "보호소 생성 정책" ON shelters
  FOR INSERT WITH CHECK (
    auth.uid() IN (SELECT auth_user_id FROM user_profiles WHERE id = user_id)
  );

-- updated_at 자동 업데이트 트리거
CREATE TRIGGER update_shelters_updated_at
    BEFORE UPDATE ON shelters
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- 6. 찜 목록 테이블
-- ========================================

CREATE TABLE favorites (
  id SERIAL PRIMARY KEY,
  user_id SERIAL REFERENCES user_profiles(id) NOT NULL,
  post_id SERIAL REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  is_deleted BOOLEAN DEFAULT false,
  deleted_at TIMESTAMP,

  UNIQUE(user_id, post_id)
);

-- 테이블 주석
COMMENT ON TABLE favorites IS '찜 목록 테이블 - 사용자가 관심을 가진 게시물을 저장';

-- 컬럼 주석
COMMENT ON COLUMN favorites.id IS '찜 고유 식별자 (자동 증가)';
COMMENT ON COLUMN favorites.user_id IS '사용자 ID (외래키)';
COMMENT ON COLUMN favorites.post_id IS '게시물 ID (외래키)';
COMMENT ON COLUMN favorites.created_at IS '찜한 일시 (자동 설정)';
COMMENT ON COLUMN favorites.is_deleted IS '삭제 여부 (소프트 삭제)';
COMMENT ON COLUMN favorites.deleted_at IS '삭제일시 (소프트 삭제)';

-- 핵심 인덱스만 생성
CREATE INDEX idx_favorites_user_post ON favorites(user_id, post_id);

-- RLS 활성화 및 기본 정책
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- 사용자는 자신의 찜 목록만 조회 가능
CREATE POLICY "찜 목록 조회 정책" ON favorites
  FOR SELECT USING (
    auth.uid() IN (SELECT auth_user_id FROM user_profiles WHERE id = user_id)
    AND is_deleted = false
  );

-- 로그인한 사용자만 찜 가능
CREATE POLICY "찜 생성 정책" ON favorites
  FOR INSERT WITH CHECK (
    auth.uid() IN (SELECT auth_user_id FROM user_profiles WHERE id = user_id)
  );

-- 사용자는 자신의 찜만 삭제 가능
CREATE POLICY "찜 삭제 정책" ON favorites
  FOR DELETE USING (
    auth.uid() IN (SELECT auth_user_id FROM user_profiles WHERE id = user_id)
  );

-- ========================================
-- 7. 샘플 데이터 (테스트용)
-- ========================================

-- 샘플 사용자 프로필 (테스트용 더미 UUID)
INSERT INTO user_profiles (
  auth_user_id,
  display_name,
  phone,
  phone_visible,
  bio
) VALUES
('11111111-1111-1111-1111-111111111111', '김봉사', '010-1234-5678', true, '유기견 봉사에 관심이 많은 사람입니다.'),
('22222222-2222-2222-2222-222222222222', '이보호소', '010-2345-6789', true, '부천에 위치한 보호소입니다.'),
('33333333-3333-3333-3333-333333333333', '박지원자', '010-3456-7890', false, '차량으로 이동봉사를 도와드릴 수 있습니다.');

-- 샘플 보호소
INSERT INTO shelters (
  user_id,
  name,
  description,
  verified
) VALUES
(2, '부천 행복한 보호소', '부천에 위치한 보호소입니다.', true);

-- 샘플 게시물
INSERT INTO posts (
  user_id,
  title,
  description,
  departure_address,
  arrival_address,
  dog_name,
  dog_size,
  dog_breed,
  deadline,
  status
) VALUES
(2, '서울에서 대구까지 입양 예정인 강아지 호치의 이동 봉사자를 구합니다!', '호치는 2살 된 소형견 믹스입니다. 친근하고 활발한 성격입니다.', '서울특별시 중구 을지로 281', '대구광역시 남구 대명9동', '호치', '소형견', '믹스', '2025-10-27', 'active');

-- ========================================
-- 8. 유용한 뷰 생성
-- ========================================

-- 활성 게시물과 신청자 수를 보여주는 뷰
CREATE OR REPLACE VIEW active_posts_view AS
SELECT
  p.id,
  p.title,
  p.dog_name,
  p.dog_size,
  p.dog_breed,
  p.departure_address,
  p.arrival_address,
  p.deadline,
  p.created_at,
  up.display_name as author_name,
  COUNT(a.id) as application_count
FROM posts p
JOIN user_profiles up ON p.user_id = up.id
LEFT JOIN applications a ON p.id = a.post_id AND a.is_deleted = false
WHERE p.is_deleted = false AND p.status = 'active'
GROUP BY p.id, p.title, p.dog_name, p.dog_size, p.dog_breed, p.departure_address, p.arrival_address, p.deadline, p.created_at, up.display_name;

COMMENT ON VIEW active_posts_view IS '활성 게시물과 신청자 수를 보여주는 뷰';

-- ========================================
-- 9. 초기화 완료 메시지
-- ========================================

-- 초기화 완료 확인
SELECT 'Move Togaether 데이터베이스 초기화가 완료되었습니다!' as message;
SELECT COUNT(*) as user_profiles_count FROM user_profiles;
SELECT COUNT(*) as posts_count FROM posts;
SELECT COUNT(*) as applications_count FROM applications;
SELECT COUNT(*) as shelters_count FROM shelters;
SELECT COUNT(*) as favorites_count FROM favorites;
