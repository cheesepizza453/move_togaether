import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'
import { withPerformanceMonitoring } from '@/lib/supabase-optimized'
import moment from 'moment'

// 간단한 메모리 캐시 (프로덕션에서는 Redis 사용 권장)
const cache = new Map()
const CACHE_TTL = 2 * 60 * 1000 // 2분

const getCachedData = (key) => {
  const cached = cache.get(key)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data
  }
  cache.delete(key)
  return null
}

const setCachedData = (key, data) => {
  cache.set(key, {
    data,
    timestamp: Date.now()
  })
}

// GET: 게시물 목록 조회 (페이지네이션, 정렬, deadline 필터 적용)
export const GET = withPerformanceMonitoring(async (request) => {
  try {
    const { searchParams } = new URL(request.url)
    const sortBy = searchParams.get('sortBy') || 'latest'
    const page = parseInt(searchParams.get('page')) || 1
    const limit = parseInt(searchParams.get('limit')) || 10

    // 캐시 키 생성
    const cacheKey = `posts_${sortBy}_${page}_${limit}`

    // 캐시에서 데이터 확인
    const cachedData = getCachedData(cacheKey)
    if (cachedData) {
      return NextResponse.json(cachedData, {
        headers: {
          'Cache-Control': 'public, max-age=120, s-maxage=120',
          'X-Cache': 'HIT'
        }
      })
    }

    // 익명 사용자용 Supabase 클라이언트 생성 (로그인 불필요)
    const supabase = createServerSupabaseClient()

    // 정렬 옵션에 따른 order by 설정
    let orderConfig
    switch (sortBy) {
      case 'latest':
        orderConfig = { column: 'created_at', ascending: false } // 최신순: 등록일 역순
        break
      case 'deadline':
        orderConfig = { column: 'created_at', ascending: true } // 종료순: 등록일순
        break
      default:
        orderConfig = { column: 'created_at', ascending: false }
    }

    // 현재 시간
    const now = moment().toISOString()

    // 페이지네이션 설정
    const from = (page - 1) * limit
    const to = from + limit - 1

    const { data, error, count } = await supabase
      .from('posts')
      .select('*', { count: 'exact' })
      .eq('status', 'active') // status가 active인 게시물만
      .gte('deadline', now) // deadline이 지나지 않은 게시물만
      .order(orderConfig.column, { ascending: orderConfig.ascending })
      .range(from, to)

    if (error) {
      console.error('게시물 조회 오류:', error)
      return NextResponse.json({ error: '게시물을 불러오는 중 오류가 발생했습니다.' }, { status: 400 })
    }

    const responseData = {
      posts: data || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
        hasMore: to < (count || 0) - 1
      }
    }

    // 캐시에 저장
    setCachedData(cacheKey, responseData)

    return NextResponse.json(responseData, {
      headers: {
        'Cache-Control': 'public, max-age=120, s-maxage=120',
        'X-Cache': 'MISS'
      }
    })
  } catch (error) {
    console.error('Posts GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}, 'posts-get')

// POST: 게시물 등록
export async function POST(request) {
  try {
    // 프록시 패턴: 클라이언트에서 전달받은 헤더를 그대로 사용
    const authHeader = request.headers.get('authorization')

    if (!authHeader) {
      return NextResponse.json({ error: '인증 헤더가 필요합니다.' }, { status: 401 })
    }

    // JWT 토큰에서 access_token 추출
    const accessToken = authHeader.replace('Bearer ', '')

    // 서버사이드 Supabase 클라이언트 생성
    const supabase = createServerSupabaseClient(accessToken)

    // JWT 토큰에서 사용자 정보 추출
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: '유효하지 않은 인증 정보입니다.' }, { status: 401 })
    }

    // 사용자 프로필 조회
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('auth_user_id', user.id)
      .eq('is_deleted', false)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ error: '사용자 프로필을 찾을 수 없습니다.' }, { status: 404 })
    }

    // 요청 본문 파싱
    const body = await request.json()
    const {
      title,
      description,
      name,
      size,
      breed,
      departure_address,
      arrival_address,
      departure_lat,
      departure_lng,
      arrival_lat,
      arrival_lng,
      deadline,
      images
    } = body

    // 필수 필드 검증
    if (!title || !description || !name || !size || !breed || !departure_address || !arrival_address) {
      return NextResponse.json({ error: '필수 필드가 누락되었습니다.' }, { status: 400 })
    }

    // 게시물 등록
    const { data, error } = await supabase
      .from('posts')
      .insert({
        user_id: profile.id,
        title,
        description,
        name,
        size,
        breed,
        departure_address,
        arrival_address,
        departure_lat,
        departure_lng,
        arrival_lat,
        arrival_lng,
        deadline,
        images: images || [],
        status: 'active'
      })
      .select()

    if (error) {
      console.error('게시물 등록 오류:', error)
      return NextResponse.json({ error: '게시물 등록 중 오류가 발생했습니다.' }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      post: data[0]
    })
  } catch (error) {
    console.error('Posts POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
