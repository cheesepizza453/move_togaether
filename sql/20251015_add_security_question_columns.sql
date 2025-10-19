-- 보안 질문/답변 컬럼 추가
-- 2025-10-15

-- user_profiles 테이블에 보안 질문/답변 컬럼 추가
ALTER TABLE user_profiles
ADD COLUMN security_question VARCHAR(100),
ADD COLUMN security_answer VARCHAR(100);

-- 컬럼에 대한 코멘트 추가
COMMENT ON COLUMN user_profiles.security_question IS '보안 질문 (아이디 찾기용)';
COMMENT ON COLUMN user_profiles.security_answer IS '보안 질문 답변 (아이디 찾기용)';

-- 보안 답변은 해시화해서 저장하는 것이 좋지만,
-- 현재는 단순 텍스트로 저장 (향후 보안 강화 시 해시화 적용)
