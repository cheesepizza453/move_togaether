import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'
import moment from 'moment'

// GET: 게시물 목록 조회 (통합 API)
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'all' // all, my, applied, favorites
    const sortBy = searchParams.get('sortBy') || 'latest'
    const page = parseInt(searchParams.get('page')) || 1
    const limit = parseInt(searchParams.get('limit')) || 10
    const status = searchParams.get('status') || 'active' // active, completed, all
    const filter = searchParams.get('filter') // in_progress, expired (마이페이지 하위 필터용)

    // 인증이 필요한 타입들
    const authRequiredTypes = ['my', 'applied', 'favorites']
    let supabase, profile = null

    if (authRequiredTypes.includes(type)) {
      const authHeader = request.headers.get('authorization')
      if (!authHeader) {
        return NextResponse.json({ error: '인증 헤더가 필요합니다.' }, { status: 401 })
      }

      const accessToken = authHeader.replace('Bearer ', '')
      supabase = createServerSupabaseClient(accessToken)

      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) {
        return NextResponse.json({ error: '유효하지 않은 인증 정보입니다.' }, { status: 401 })
      }

      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('auth_user_id', user.id)
        .eq('is_deleted', false)
        .single()

      if (profileError || !profileData) {
        return NextResponse.json({ error: '사용자 프로필을 찾을 수 없습니다.' }, { status: 404 })
      }

      profile = profileData
    } else {
      // 익명 사용자용
      supabase = createServerSupabaseClient()
    }

    // 정렬 옵션 설정
    let orderConfig
    switch (sortBy) {
      case 'latest':
        orderConfig = { column: 'created_at', ascending: false }
        break
      case 'deadline':
        orderConfig = { column: 'deadline', ascending: true }
        break
      default:
        orderConfig = { column: 'created_at', ascending: false }
    }

    // 페이지네이션 설정
    const from = (page - 1) * limit
    const to = from + limit - 1

    let query

    switch (type) {
      case 'all':
        // 전체 게시물 (메인 페이지) - view 사용
        if (status === 'active') {
          query = supabase
            .from('active_posts_view')
            .select('*', { count: 'exact' })
            .order(orderConfig.column, { ascending: orderConfig.ascending })
            .range(from, to)
        } else {
          // completed나 all의 경우 posts 테이블 직접 조회
          query = supabase
            .from('posts')
            .select('*', { count: 'exact' })
            .eq('is_deleted', false)
            .order(orderConfig.column, { ascending: orderConfig.ascending })
            .range(from, to)

          if (status === 'completed') {
            query = query.or('status.neq.active,deadline.lt.' + moment().toISOString())
          }
        }
        break

      case 'my':
        // 내가 작성한 게시물
        query = supabase
          .from('posts')
          .select('*', { count: 'exact' })
          .eq('user_id', profile.id)
          .eq('is_deleted', false)
          .order(orderConfig.column, { ascending: orderConfig.ascending })
          .range(from, to)

        // 하위 필터 처리 (진행중, 종료, 완료)
        if (filter) {
          const now = moment().toISOString()
          if (filter === 'in_progress') {
            // 진행중: deadline 미지남 + status active
            query = query.eq('status', 'active').gte('deadline', now)
          } else if (filter === 'expired') {
            // 종료: deadline 지남 + status active
            query = query.eq('status', 'active').lt('deadline', now)
          }
        } else if (status !== 'all') {
          if (status === 'active') {
            const now = moment().toISOString()
            query = query.eq('status', 'active').gte('deadline', now)
          } else if (status === 'completed') {
            query = query.or('status.neq.active,deadline.lt.' + moment().toISOString())
          } else {
            query = query.eq('status', status)
          }
        }
        break

      case 'applied':
        // 지원한 게시물
        query = supabase
          .from('applications')
          .select(`
            id,
            message,
            status,
            created_at,
            posts!inner (
              id,
              title,
              description,
              dog_name,
              dog_size,
              dog_breed,
              departure_address,
              arrival_address,
              deadline,
              images,
              status,
              created_at
            )
          `, { count: 'exact' })
          .eq('user_id', profile.id)
          .eq('is_deleted', false)
          .order('created_at', { ascending: false })
          .range(from, to)

        if (status !== 'all') {
          if (status === 'active') {
            const now = moment().toISOString()
            query = query.eq('posts.status', 'active').gte('posts.deadline', now)
          } else if (status === 'completed') {
            query = query.or('posts.status.neq.active,posts.deadline.lt.' + moment().toISOString())
          }
        }
        break

      case 'favorites':
        // 즐겨찾기 게시물
        query = supabase
          .from('favorites')
          .select(`
            post_id,
            created_at,
            posts!inner (
              id,
              title,
              description,
              dog_name,
              dog_size,
              dog_breed,
              departure_address,
              arrival_address,
              deadline,
              images,
              status,
              created_at
            )
          `, { count: 'exact' })
          .eq('user_id', profile.id)
          .order('created_at', { ascending: false })
          .range(from, to)

        if (status === 'active') {
          const now = moment().toISOString()
          query = query.eq('posts.status', 'active').gte('posts.deadline', now)
        } else if (status === 'completed') {
          query = query.or('posts.status.neq.active,posts.deadline.lt.' + moment().toISOString())
        }
        break

      default:
        return NextResponse.json({ error: '유효하지 않은 타입입니다.' }, { status: 400 })
    }

    const { data, error, count } = await query

    if (error) {
      console.error('게시물 조회 오류:', error)
      return NextResponse.json({ error: '게시물을 불러오는 중 오류가 발생했습니다.' }, { status: 400 })
    }

    console.log(`${type} 타입 조회 결과:`, { data, count, error });

    // 데이터 정리
    let posts = []
    if (type === 'applied') {
      posts = data?.map(app => ({
        application_id: app.id,
        application_message: app.message,
        application_status: app.status,
        application_date: app.created_at,
        post: app.posts
      })) || []
    } else if (type === 'favorites') {
      posts = data?.map(fav => ({
        favorite_id: fav.post_id,
        favorited_at: fav.created_at,
        post: fav.posts
      })) || []
    } else {
      posts = data || []

      // 'my' 타입인 경우 각 게시물의 지원자 수 조회
      if (type === 'my' && posts.length > 0) {
        const postIds = posts.map(post => post.id)

        // 각 게시물별 지원자 수 조회
        const { data: applicationsData, error: applicationsError } = await supabase
          .from('applications')
          .select('post_id')
          .in('post_id', postIds)
          .eq('status', 'pending') // 대기 중인 지원만 카운트

        if (!applicationsError && applicationsData) {
          // post_id별로 지원자 수 계산
          const applicantCounts = applicationsData.reduce((acc, app) => {
            acc[app.post_id] = (acc[app.post_id] || 0) + 1
            return acc
          }, {})

          // 각 게시물에 지원자 수 추가
          posts = posts.map(post => ({
            ...post,
            applicant_count: applicantCounts[post.id] || 0
          }))
        }
      }
    }

    // 페이지네이션 정보 계산
    const total = count || 0;
    const totalPages = Math.ceil(total / limit);
    const hasMore = page < totalPages && posts.length === limit;

    console.log('페이지네이션 정보:', {
      page,
      limit,
      total,
      totalPages,
      hasMore,
      postsLength: posts.length,
      to,
      from
    });

    return NextResponse.json({
      posts,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasMore
      }
    })

  } catch (error) {
    console.error('Posts list GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
