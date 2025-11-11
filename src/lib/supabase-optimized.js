import { supabase, createServerSupabaseClient } from './supabase';

/**
 * Supabase 최적화된 쿼리 유틸리티
 */

// 쿼리 결과 캐싱을 위한 간단한 메모리 캐시
const queryCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5분

/**
 * 캐시된 쿼리 결과 가져오기
 */
const getCachedResult = (key) => {
  const cached = queryCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  queryCache.delete(key);
  return null;
};

/**
 * 쿼리 결과 캐시에 저장
 */
const setCachedResult = (key, data) => {
  queryCache.set(key, {
    data,
    timestamp: Date.now()
  });
};

/**
 * 캐시 키 생성
 */
const createCacheKey = (table, filters, select = '*') => {
  return `${table}_${JSON.stringify(filters)}_${select}`;
};

/**
 * 최적화된 게시물 목록 조회
 */
export const getOptimizedPosts = async (filters = {}, options = {}) => {
  const {
    sortBy = 'created_at',
    sortOrder = 'desc',
    limit = 20,
    offset = 0,
    useCache = true
  } = options;

  const cacheKey = createCacheKey('posts', { ...filters, sortBy, sortOrder, limit, offset });

  if (useCache) {
    const cached = getCachedResult(cacheKey);
    if (cached) return cached;
  }

  try {
    let query = supabase
      .from('active_posts')
      .select(`
        id,
        title,
        dog_name,
        dog_size,
        dog_breed,
        departure_address,
        arrival_address,
        deadline,
        status,
        created_at,
        updated_at,
        distance,
        dday,
        images:post_images(image_url)
      `)
      .eq('is_deleted', false);

    // 필터 적용
    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    if (filters.dogSize) {
      query = query.eq('dog_size', filters.dogSize);
    }
    if (filters.breed) {
      query = query.ilike('dog_breed', `%${filters.breed}%`);
    }

    // 정렬 적용
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    // 페이지네이션
    query = query.range(offset, offset + limit - 1);

    const { data, error } = await query;

    if (error) throw error;

    // 결과 캐시에 저장
    if (useCache) {
      setCachedResult(cacheKey, data);
    }

    return data;
  } catch (error) {
    console.error('Error fetching optimized posts:', error);
    throw error;
  }
};

/**
 * 최적화된 사용자 프로필 조회
 */
export const getOptimizedUserProfile = async (userId, useCache = true) => {
  const cacheKey = createCacheKey('user_profiles', { userId });

  if (useCache) {
    const cached = getCachedResult(cacheKey);
    if (cached) return cached;
  }

  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select(`
        id,
        auth_user_id,
        email,
        display_name,
        bio,
        phone,
        profile_image,
        instagram,
        naver_cafe,
        kakao_openchat,
        provider,
        created_at,
        updated_at
      `)
      .eq('auth_user_id', userId)
      .eq('is_deleted', false)
      .single();

    if (error) throw error;

    if (useCache) {
      setCachedResult(cacheKey, data);
    }

    return data;
  } catch (error) {
    console.error('Error fetching optimized user profile:', error);
    throw error;
  }
};

/**
 * 최적화된 즐겨찾기 목록 조회
 */
export const getOptimizedFavorites = async (userId, useCache = true) => {
  const cacheKey = createCacheKey('favorites', { userId });

  if (useCache) {
    const cached = getCachedResult(cacheKey);
    if (cached) return cached;
  }

  try {
    const { data, error } = await supabase
      .from('favorites')
      .select(`
        id,
        post_id,
        created_at,
        posts:post_id (
          id,
          title,
          dog_name,
          dog_size,
          dog_breed,
          departure_address,
          arrival_address,
          deadline,
          status,
          created_at,
          distance,
          dday,
          images:post_images(image_url)
        )
      `)
      .eq('user_id', userId)
      .eq('is_deleted', false)
      .order('created_at', { ascending: false });

    if (error) throw error;

    if (useCache) {
      setCachedResult(cacheKey, data);
    }

    return data;
  } catch (error) {
    console.error('Error fetching optimized favorites:', error);
    throw error;
  }
};

/**
 * 배치 쿼리 실행 (여러 쿼리를 한 번에 실행)
 */
export const executeBatchQueries = async (queries) => {
  try {
    const promises = queries.map(query => query());
    const results = await Promise.allSettled(promises);

    return results.map((result, index) => ({
      index,
      success: result.status === 'fulfilled',
      data: result.status === 'fulfilled' ? result.value : null,
      error: result.status === 'rejected' ? result.reason : null
    }));
  } catch (error) {
    console.error('Error executing batch queries:', error);
    throw error;
  }
};

/**
 * 캐시 무효화
 */
export const invalidateCache = (pattern) => {
  if (pattern) {
    // 특정 패턴과 일치하는 캐시만 삭제
    for (const [key] of queryCache) {
      if (key.includes(pattern)) {
        queryCache.delete(key);
      }
    }
  } else {
    // 전체 캐시 삭제
    queryCache.clear();
  }
};

/**
 * 스토리지 최적화된 이미지 URL 생성
 */
export const getOptimizedImageUrl = (bucket, path, options = {}) => {
  const {
    width,
    height,
    quality = 80,
    format = 'webp'
  } = options;

  let url = supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;

  // 이미지 변환 파라미터 추가 (Supabase Transform 기능 사용)
  if (width || height || quality !== 80 || format !== 'webp') {
    const params = new URLSearchParams();
    if (width) params.append('width', width);
    if (height) params.append('height', height);
    if (quality !== 80) params.append('quality', quality);
    if (format !== 'webp') params.append('format', format);

    url += `?${params.toString()}`;
  }

  return url;
};

/**
 * 연결 상태 확인
 */
export const checkConnection = async () => {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('count')
      .limit(1);

    return { connected: !error, error };
  } catch (error) {
    return { connected: false, error };
  }
};

/**
 * 쿼리 성능 모니터링
 */
export const withPerformanceMonitoring = (queryFn, queryName) => {
  return async (...args) => {
    const startTime = performance.now();

    try {
      const result = await queryFn(...args);
      const endTime = performance.now();
      const duration = endTime - startTime;

      console.log(`Query ${queryName} completed in ${duration.toFixed(2)}ms`);

      return result;
    } catch (error) {
      const endTime = performance.now();
      const duration = endTime - startTime;

      console.error(`Query ${queryName} failed after ${duration.toFixed(2)}ms:`, error);
      throw error;
    }
  };
};
