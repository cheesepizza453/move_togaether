import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'

// GET: 사용자의 찜 목록 조회
export async function GET(request) {
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

    const { searchParams } = new URL(request.url)
    const includeDetails = searchParams.get('includeDetails') === 'true'

    // 사용자 프로필 ID 조회
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('auth_user_id', user.id)
      .eq('is_deleted', false)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    if (includeDetails) {
      // 즐겨찾기한 게시물의 상세 정보와 함께 조회
      const { data: favorites, error } = await supabase
        .from('favorites')
        .select(`
          post_id,
          posts (
            id,
            title,
            description,
            dog_name,
            dog_size,
            dog_breed,
            departure_address,
            arrival_address,
            departure_lat,
            departure_lng,
            arrival_lat,
            arrival_lng,
            deadline,
            images,
            status,
            created_at
          )
        `)
        .eq('user_id', profile.id)
        .eq('is_deleted', false)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('즐겨찾기 조회 오류:', error)
        return NextResponse.json({ error: 'Failed to fetch favorites' }, { status: 400 })
      }

      // 게시물 정보만 추출
      const favoritePosts = favorites?.map(fav => fav.posts).filter(Boolean) || []

      return NextResponse.json({
        favoritePosts
      })
    } else {
      // 찜한 게시물 ID 목록만 조회 (효율적인 찜 상태 확인용)
      const { data: favorites, error } = await supabase
        .from('favorites')
        .select('post_id')
        .eq('user_id', profile.id)
        .eq('is_deleted', false)

      if (error) {
        console.error('즐겨찾기 ID 조회 오류:', error)
        return NextResponse.json({ error: 'Failed to fetch favorites' }, { status: 400 })
      }

      // 게시물 ID 배열로 변환
      const favoritePostIds = favorites?.map(fav => fav.post_id) || []

      return NextResponse.json({
        favoritePostIds
      })
    }
  } catch (error) {
    console.error('Favorites GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST: 찜 추가
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
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // 요청 본문 파싱
    const body = await request.json()
    const { post_id } = body

    if (!post_id) {
      return NextResponse.json({ error: 'post_id is required' }, { status: 400 })
    }

    // 중복 확인
    const { data: existingFavorite, error: checkError } = await supabase
      .from('favorites')
      .select('id')
      .eq('post_id', post_id)
      .eq('user_id', profile.id)
      .eq('is_deleted', false)
      .single()

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('중복 확인 오류:', checkError)
      return NextResponse.json({ error: 'Failed to check existing favorite' }, { status: 400 })
    }

    if (existingFavorite) {
      return NextResponse.json({ error: 'Already favorited' }, { status: 409 })
    }

    // 찜 추가
    const { data, error } = await supabase
      .from('favorites')
      .insert({
        post_id,
        user_id: profile.id
      })
      .select()

    if (error) {
      console.error('즐겨찾기 추가 오류:', error)
      return NextResponse.json({ error: 'Failed to add favorite' }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      favorite: data[0]
    })
  } catch (error) {
    console.error('Favorites POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE: 찜 제거 (하드 삭제)
export async function DELETE(request) {
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
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // 쿼리 파라미터에서 post_id 추출
    const { searchParams } = new URL(request.url)
    const postId = searchParams.get('post_id')

    if (!postId) {
      return NextResponse.json({ error: 'post_id is required' }, { status: 400 })
    }

    // 찜 제거 (하드 삭제)
    const { data, error } = await supabase
      .from('favorites')
      .delete()
      .eq('post_id', postId)
      .eq('user_id', profile.id)
      .eq('is_deleted', false)
      .select()

    if (error) {
      console.error('즐겨찾기 제거 오류:', error)
      return NextResponse.json({ error: 'Failed to remove favorite' }, { status: 400 })
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ error: 'Favorite not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: 'Favorite removed successfully'
    })
  } catch (error) {
    console.error('Favorites DELETE error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
