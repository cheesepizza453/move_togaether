-- favorites 테이블 구조 변경: id 컬럼 제거, post_id와 user_id를 복합키로 설정
-- 실행일: 2025-09-10
-- 목적: favorites 테이블에서 불필요한 id 컬럼 제거하고 post_id, user_id를 복합키로 설정

-- 1. 기존 primary key 제약조건 삭제
ALTER TABLE favorites DROP CONSTRAINT IF EXISTS favorites_pkey;

-- 2. id 컬럼 삭제
ALTER TABLE favorites DROP COLUMN IF EXISTS id;

-- 3. 관련 시퀀스 삭제 (있다면)
DROP SEQUENCE IF EXISTS favorites_id_seq;

-- 4. user_id와 post_id의 시퀀스 제거 (외래키 필드이므로 시퀀스 불필요)
ALTER TABLE favorites ALTER COLUMN user_id DROP DEFAULT;
DROP SEQUENCE IF EXISTS favorites_user_id_seq;

ALTER TABLE favorites ALTER COLUMN post_id DROP DEFAULT;
DROP SEQUENCE IF EXISTS favorites_post_id_seq;

-- 5. post_id와 user_id를 복합키로 설정 (Primary Key)
ALTER TABLE favorites ADD CONSTRAINT favorites_pkey PRIMARY KEY (post_id, user_id);

-- 6. 테이블 구조 확인
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'favorites'
ORDER BY ordinal_position;

-- 7. 제약조건 확인
SELECT
  constraint_name,
  constraint_type,
  table_name
FROM information_schema.table_constraints
WHERE table_name = 'favorites';
