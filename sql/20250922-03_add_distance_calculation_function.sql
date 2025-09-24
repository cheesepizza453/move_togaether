-- 거리 계산을 위한 함수 생성
CREATE OR REPLACE FUNCTION get_posts_by_distance(
  user_lat DECIMAL,
  user_lng DECIMAL,
  page_offset INTEGER DEFAULT 0,
  page_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
  id INTEGER,
  user_id INTEGER,
  title VARCHAR,
  description TEXT,
  departure_address VARCHAR,
  departure_lat DECIMAL,
  departure_lng DECIMAL,
  arrival_address VARCHAR,
  arrival_lat DECIMAL,
  arrival_lng DECIMAL,
  dog_name VARCHAR,
  dog_size VARCHAR,
  dog_breed VARCHAR,
  dog_age INTEGER,
  dog_characteristics TEXT,
  images TEXT[],
  related_link VARCHAR,
  deadline DATE,
  status VARCHAR,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  is_deleted BOOLEAN,
  deleted_at TIMESTAMP,
  distance_km DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.user_id,
    p.title,
    p.description,
    p.departure_address,
    p.departure_lat,
    p.departure_lng,
    p.arrival_address,
    p.arrival_lat,
    p.arrival_lng,
    p.dog_name,
    p.dog_size,
    p.dog_breed,
    p.dog_age,
    p.dog_characteristics,
    p.images,
    p.related_link,
    p.deadline,
    p.status,
    p.created_at,
    p.updated_at,
    p.is_deleted,
    p.deleted_at,
    -- Haversine 공식을 사용한 거리 계산 (km 단위)
    ROUND(
      6371 * acos(
        cos(radians(user_lat)) *
        cos(radians(COALESCE(p.departure_lat, 0))) *
        cos(radians(COALESCE(p.departure_lng, 0)) - radians(user_lng)) +
        sin(radians(user_lat)) *
        sin(radians(COALESCE(p.departure_lat, 0)))
      )::DECIMAL, 2
    ) AS distance_km
  FROM posts p
  WHERE p.is_deleted = false
    AND p.status = 'active'
    AND p.departure_lat IS NOT NULL
    AND p.departure_lng IS NOT NULL
  ORDER BY distance_km ASC
  LIMIT page_limit
  OFFSET page_offset;
END;
$$ LANGUAGE plpgsql;

-- 함수에 대한 주석 추가
COMMENT ON FUNCTION get_posts_by_distance IS '사용자 위치를 기준으로 게시물을 거리순으로 정렬하여 반환하는 함수';
