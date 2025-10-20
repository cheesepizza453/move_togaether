-- 성능 최적화를 위한 인덱스 및 뷰 생성
-- 2025-10-15

-- 1. 게시물 테이블 인덱스 최적화
CREATE INDEX IF NOT EXISTS idx_posts_status_created_at
ON posts (status, created_at DESC)
WHERE is_deleted = false;

CREATE INDEX IF NOT EXISTS idx_posts_deadline_status
ON posts (deadline, status)
WHERE is_deleted = false AND status = 'active';

CREATE INDEX IF NOT EXISTS idx_posts_dog_size_status
ON posts (dog_size, status, created_at DESC)
WHERE is_deleted = false AND status = 'active';

CREATE INDEX IF NOT EXISTS idx_posts_breed_status
ON posts (dog_breed, status, created_at DESC)
WHERE is_deleted = false AND status = 'active';

-- 2. 사용자 프로필 테이블 인덱스 최적화
CREATE INDEX IF NOT EXISTS idx_user_profiles_auth_user_id
ON user_profiles (auth_user_id)
WHERE is_deleted = false;

CREATE INDEX IF NOT EXISTS idx_user_profiles_display_name
ON user_profiles (display_name)
WHERE is_deleted = false;

CREATE INDEX IF NOT EXISTS idx_user_profiles_email
ON user_profiles (email)
WHERE is_deleted = false;

-- 3. 즐겨찾기 테이블 인덱스 최적화
CREATE INDEX IF NOT EXISTS idx_favorites_user_id_created_at
ON favorites (user_id, created_at DESC)
WHERE is_deleted = false;

CREATE INDEX IF NOT EXISTS idx_favorites_post_id
ON favorites (post_id)
WHERE is_deleted = false;

-- 4. 게시물 이미지 테이블 인덱스 최적화
CREATE INDEX IF NOT EXISTS idx_post_images_post_id
ON post_images (post_id)
WHERE is_deleted = false;

-- 5. 성능 최적화된 뷰 생성
CREATE OR REPLACE VIEW active_posts_optimized AS
SELECT
    p.id,
    p.title,
    p.description,
    p.dog_name,
    p.dog_size,
    p.dog_breed,
    p.departure_address,
    p.arrival_address,
    p.departure_lat,
    p.departure_lng,
    p.arrival_lat,
    p.arrival_lng,
    p.deadline,
    p.status,
    p.created_at,
    p.updated_at,
    p.user_id,
    -- D-Day 계산
    CASE
        WHEN p.deadline::date = CURRENT_DATE THEN 0
        WHEN p.deadline::date > CURRENT_DATE THEN (p.deadline::date - CURRENT_DATE)
        ELSE -1
    END as dday,
    -- 작성자 정보
    up.display_name as author_name,
    up.profile_image as author_profile_image,
    -- 이미지 정보 (첫 번째 이미지만)
    (
        SELECT pi.image_url
        FROM post_images pi
        WHERE pi.post_id = p.id
        AND pi.is_deleted = false
        ORDER BY pi.created_at ASC
        LIMIT 1
    ) as first_image
FROM posts p
LEFT JOIN user_profiles up ON p.user_id = up.id
WHERE p.is_deleted = false
AND p.status = 'active'
AND p.deadline >= CURRENT_DATE;

-- 6. 통계 정보 업데이트 (쿼리 플래너 최적화)
ANALYZE posts;
ANALYZE user_profiles;
ANALYZE favorites;
ANALYZE post_images;

-- 7. RLS 정책 최적화를 위한 함수
CREATE OR REPLACE FUNCTION get_user_posts_count(user_id_param UUID)
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT COUNT(*)
        FROM posts
        WHERE user_id = user_id_param
        AND is_deleted = false
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. 성능 모니터링을 위한 함수
CREATE OR REPLACE FUNCTION log_slow_queries()
RETURNS TRIGGER AS $$
BEGIN
    -- 느린 쿼리 로깅 (실제 구현에서는 pg_stat_statements 사용 권장)
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 9. 자주 사용되는 쿼리를 위한 함수
CREATE OR REPLACE FUNCTION get_posts_by_filters(
    status_filter TEXT DEFAULT 'active',
    size_filter TEXT DEFAULT NULL,
    breed_filter TEXT DEFAULT NULL,
    limit_count INTEGER DEFAULT 20,
    offset_count INTEGER DEFAULT 0
)
RETURNS TABLE (
    id UUID,
    title TEXT,
    dog_name TEXT,
    dog_size TEXT,
    dog_breed TEXT,
    departure_address TEXT,
    arrival_address TEXT,
    deadline TIMESTAMPTZ,
    created_at TIMESTAMPTZ,
    dday INTEGER,
    first_image TEXT
) AS $$
BEGIN
    RETURN QUERY
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
        CASE
            WHEN p.deadline::date = CURRENT_DATE THEN 0
            WHEN p.deadline::date > CURRENT_DATE THEN (p.deadline::date - CURRENT_DATE)
            ELSE -1
        END as dday,
        (
            SELECT pi.image_url
            FROM post_images pi
            WHERE pi.post_id = p.id
            AND pi.is_deleted = false
            ORDER BY pi.created_at ASC
            LIMIT 1
        ) as first_image
    FROM posts p
    WHERE p.is_deleted = false
    AND p.status = status_filter
    AND p.deadline >= CURRENT_DATE
    AND (size_filter IS NULL OR p.dog_size = size_filter)
    AND (breed_filter IS NULL OR p.dog_breed ILIKE '%' || breed_filter || '%')
    ORDER BY p.created_at DESC
    LIMIT limit_count
    OFFSET offset_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. 캐시 무효화를 위한 함수
CREATE OR REPLACE FUNCTION invalidate_posts_cache()
RETURNS TRIGGER AS $$
BEGIN
    -- 캐시 무효화 로직 (Redis 연동 시 사용)
    PERFORM pg_notify('cache_invalidation', 'posts_updated');
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 11. 트리거 생성 (캐시 무효화)
CREATE TRIGGER trigger_invalidate_posts_cache
    AFTER INSERT OR UPDATE OR DELETE ON posts
    FOR EACH STATEMENT
    EXECUTE FUNCTION invalidate_posts_cache();

-- 12. 통계 정보 주기적 업데이트를 위한 함수
CREATE OR REPLACE FUNCTION update_table_statistics()
RETURNS VOID AS $$
BEGIN
    ANALYZE posts;
    ANALYZE user_profiles;
    ANALYZE favorites;
    ANALYZE post_images;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 13. 성능 최적화를 위한 설정
-- (실제 적용 시에는 데이터베이스 관리자와 상의 필요)
-- ALTER SYSTEM SET shared_preload_libraries = 'pg_stat_statements';
-- ALTER SYSTEM SET track_activity_query_size = 2048;
-- ALTER SYSTEM SET log_min_duration_statement = 1000;
-- ALTER SYSTEM SET log_statement = 'mod';
-- ALTER SYSTEM SET log_line_prefix = '%t [%p]: [%l-1] user=%u,db=%d,app=%a,client=%h ';

-- 14. 인덱스 사용률 확인을 위한 뷰
CREATE OR REPLACE VIEW index_usage_stats AS
SELECT
    schemaname,
    tablename,
    indexname,
    idx_tup_read,
    idx_tup_fetch,
    idx_scan,
    CASE
        WHEN idx_scan = 0 THEN 0
        ELSE (idx_tup_fetch::float / idx_scan)
    END as avg_tuples_per_scan
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;

-- 15. 느린 쿼리 모니터링을 위한 뷰 (pg_stat_statements 확장 필요)
-- CREATE OR REPLACE VIEW slow_queries AS
-- SELECT
--     query,
--     calls,
--     total_time,
--     mean_time,
--     rows
-- FROM pg_stat_statements
-- WHERE mean_time > 1000  -- 1초 이상 걸리는 쿼리
-- ORDER BY mean_time DESC;

COMMENT ON VIEW active_posts_optimized IS '성능 최적화된 활성 게시물 뷰';
COMMENT ON FUNCTION get_posts_by_filters IS '필터링된 게시물 조회 함수';
COMMENT ON FUNCTION invalidate_posts_cache IS '게시물 캐시 무효화 함수';
COMMENT ON VIEW index_usage_stats IS '인덱스 사용률 통계 뷰';
