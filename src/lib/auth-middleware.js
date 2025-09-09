import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// API 라우트용 인증 미들웨어 (프록시 패턴)
export const withAuth = (handler) => {
  return async (request) => {
    try {
      // 프록시 패턴: 클라이언트에서 전달받은 헤더를 그대로 사용
      const authHeader = request.headers.get('authorization')
      const apikeyHeader = request.headers.get('apikey')

      if (!authHeader || !apikeyHeader) {
        return new Response(
          JSON.stringify({ error: '인증 헤더가 필요합니다.' }),
          { status: 401, headers: { 'Content-Type': 'application/json' } }
        )
      }

      // 프록시용 Supabase 클라이언트 생성
      const supabase = createClient(supabaseUrl, supabaseAnonKey, {
        global: {
          headers: {
            Authorization: authHeader,
            apikey: apikeyHeader
          }
        }
      })

      // JWT 토큰에서 사용자 정보 추출
      const { data: { user }, error: authError } = await supabase.auth.getUser()

      if (authError || !user) {
        return new Response(
          JSON.stringify({ error: '유효하지 않은 인증 정보입니다.' }),
          { status: 401, headers: { 'Content-Type': 'application/json' } }
        )
      }

      // 사용자 프로필 확인
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('id, display_name')
        .eq('auth_user_id', user.id)
        .eq('is_deleted', false)
        .single()

      if (profileError || !profile) {
        return new Response(
          JSON.stringify({ error: 'Profile not found' }),
          { status: 404, headers: { 'Content-Type': 'application/json' } }
        )
      }

      // 인증된 사용자 정보를 request에 추가
      request.user = user
      request.profile = profile
      request.supabase = supabase

      // 원본 핸들러 실행
      return handler(request)
    } catch (error) {
      console.error('Auth middleware error:', error)
      return new Response(
        JSON.stringify({ error: 'Internal server error' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }
  }
}

// 특정 권한이 필요한 API용 미들웨어
export const withPermission = (requiredPermission) => {
  return (handler) => {
    return withAuth(async (request) => {
      // 여기에 권한 검증 로직 추가 가능
      // 예: 관리자 권한, 게시물 작성자 권한 등

      return handler(request)
    })
  }
}

// 게시물 작성자 권한 확인
export const withPostOwnership = (handler) => {
  return withAuth(async (request) => {
    const { params } = request
    const postId = params?.id || request.nextUrl?.searchParams.get('post_id')

    if (!postId) {
      return new Response(
        JSON.stringify({ error: 'Post ID required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // 게시물 작성자 확인
    const { data: post, error } = await request.supabase
      .from('posts')
      .select('user_id')
      .eq('id', postId)
      .eq('is_deleted', false)
      .single()

    if (error || !post) {
      return new Response(
        JSON.stringify({ error: 'Post not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      )
    }

    if (post.user_id !== request.profile.id) {
      return new Response(
        JSON.stringify({ error: 'Not authorized to modify this post' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      )
    }

    return handler(request)
  })
}
