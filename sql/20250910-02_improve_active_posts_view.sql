-- 개선된 active_posts_view 생성
-- 기존 view 삭제
DROP VIEW IF EXISTS active_posts_view;

-- 개선된 view 생성
CREATE VIEW active_posts_view AS
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
  p.dog_age,
  p.dog_characteristics,
  p.images,
  p.related_link,
  p.deadline,
  p.status,
  p.created_at,
  p.updated_at,
  up.display_name AS author_name,
  up.phone AS author_phone,
  up.phone_visible AS author_phone_visible,
  up.bio AS author_bio,
  up.instagram AS author_instagram,
  up.naver_cafe AS author_naver_cafe,
  up.kakao_openchat AS author_kakao_openchat,
  COUNT(a.id) AS application_count,
  CASE 
    WHEN p.deadline < CURRENT_DATE THEN 'expired'
    WHEN p.deadline = CURRENT_DATE THEN 'today'
    WHEN p.deadline <= CURRENT_DATE + INTERVAL '3 days' THEN 'urgent'
    WHEN p.deadline <= CURRENT_DATE + INTERVAL '7 days' THEN 'soon'
    ELSE 'normal'
  END AS urgency_level
FROM posts p
JOIN user_profiles up ON p.user_id = up.id
LEFT JOIN applications a ON p.id = a.post_id AND a.is_deleted = false
WHERE p.is_deleted = false 
  AND p.status = 'active'
  AND p.deadline >= CURRENT_DATE
GROUP BY p.id, p.title, p.description, p.dog_name, p.dog_size, p.dog_breed, 
         p.departure_address, p.arrival_address, p.departure_lat, p.departure_lng, 
         p.arrival_lat, p.arrival_lng, p.dog_age, p.dog_characteristics, p.images, 
         p.related_link, p.deadline, p.status, p.created_at, p.updated_at, 
         up.display_name, up.phone, up.phone_visible, up.bio, up.instagram, 
         up.naver_cafe, up.kakao_openchat;
