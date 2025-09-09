import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// GET: 사용자의 찜 목록 조회
export async function GET(request) {
  try {
    // 프록시 패턴: 클라이언트에서 전달받은 헤더를 그대로 사용
    const authHeader = request.headers.get('authorization')
    const apikeyHeader = request.headers.get('apikey')

    if (!authHeader || !apikeyHeader) {
      return NextResponse.json({ error: '인증 헤더가 필요합니다.' }, { status: 401 })
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
      return NextResponse.json({ error: '유효하지 않은 인증 정보입니다.' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page')) || 1
    const limit = parseInt(searchParams.get('limit')) || 10

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

    // 찜한 게시물 ID 목록만 조회 (효율적인 찜 상태 확인용)
    const { data: favorites, error } = await supabase
      .from('favorites')
      .select('post_id')
      .eq('user_id', profile.id)
      .eq('is_deleted', false)

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch favorites' }, { status: 400 })
    }

    // 게시물 ID 배열로 변환
    const favoritePostIds = favorites?.map(fav => fav.post_id) || []

    return NextResponse.json({
      favoritePostIds
    })
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
    const apikeyHeader = request.headers.get('apikey')

    if (!authHeader || !apikeyHeader) {
      return NextResponse.json({ error: '인증 헤더가 필요합니다.' }, { status: 401 })
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
      return NextResponse.json({ error: '유효하지 않은 인증 정보입니다.' }, { status: 401 })
    }

    const body = await request.json()
    const { post_id } = body

    console.log('Favorites POST - Received data:', { post_id, type: typeof post_id })

    // 필수 필드 검증
    if (!post_id) {
      console.log('Favorites POST - Missing post_id')
      return NextResponse.json({ error: 'Missing post_id' }, { status: 400 })
    }

    // post_id를 정수로 변환 (posts.id는 integer 타입)
    const postId = parseInt(post_id)
    console.log('Favorites POST - Converted postId:', { postId, type: typeof postId })

    // 게시물 존재 및 활성 상태 확인
    const { data: post, error: postError } = await supabase
      .from('posts')
      .select('id, status')
      .eq('id', postId)
      .eq('is_deleted', false)
      .eq('status', 'active')
      .single()

    if (postError || !post) {
      console.log('Favorites POST - Post not found:', { postError, post })
      return NextResponse.json({ error: 'Post not found or not active' }, { status: 404 })
    }

    // 사용자 프로필 확인 (user_profiles.id 사용)
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('auth_user_id', user.id)
      .eq('is_deleted', false)
      .single()

    if (profileError || !profile) {
      console.log('Favorites POST - Profile not found:', { profileError, profile })
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    console.log('Favorites POST - Profile found:', {
      profile: profile,
      profileId: profile.id,
      profileIdType: typeof profile.id,
      profileKeys: Object.keys(profile)
    })

    // 이미 찜한 게시물인지 확인
    const { data: existingFavorite, error: duplicateError } = await supabase
      .from('favorites')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', profile.id)
      .eq('is_deleted', false)
      .single()

    if (existingFavorite) {
      return NextResponse.json({ error: 'Already favorited this post' }, { status: 400 })
    }

    // 찜 추가
    console.log('Favorites POST - Inserting favorite:', {
      post_id: postId,
      user_id: profile.id,
      user_id_type: typeof profile.id
    });

    const { data: favorite, error } = await supabase
      .from('favorites')
      .insert({
        post_id: postId,
        user_id: profile.id
      })
      .select()
      .single()

    if (error) {
      console.error('Favorites POST - Insert error:', {
        error: error,
        post_id: postId,
        user_id: profile.id,
        user_id_type: typeof profile.id
      });
      return NextResponse.json({ error: 'Failed to add favorite', details: error.message }, { status: 400 })
    }

    console.log('Favorites POST - Successfully added favorite:', favorite);

    return NextResponse.json({ favorite }, { status: 201 })
  } catch (error) {
    console.error('Favorites POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE: 찜 제거
export async function DELETE(request) {
  try {
    console.log('=== Favorites DELETE API 시작 ===');

    // 프록시 패턴: 클라이언트에서 전달받은 헤더를 그대로 사용
    const authHeader = request.headers.get('authorization')
    const apikeyHeader = request.headers.get('apikey')

    console.log('DELETE 요청 헤더:', {
      hasAuth: !!authHeader,
      hasApikey: !!apikeyHeader
    });

    if (!authHeader || !apikeyHeader) {
      return NextResponse.json({ error: '인증 헤더가 필요합니다.' }, { status: 401 })
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
      return NextResponse.json({ error: '유효하지 않은 인증 정보입니다.' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const post_id = searchParams.get('post_id')

    console.log('DELETE 요청 파라미터:', { post_id, type: typeof post_id });

    if (!post_id) {
      return NextResponse.json({ error: 'Missing post_id' }, { status: 400 })
    }

    // post_id를 정수로 변환 (posts.id는 integer 타입)
    const postId = parseInt(post_id)
    console.log('변환된 postId:', { postId, type: typeof postId });

    // 사용자 프로필 확인 (user_profiles.id 사용)
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('auth_user_id', user.id)
      .eq('is_deleted', false)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // 찜 제거 (하드 삭제)
    console.log('찜 제거 시도:', {
      postId,
      userId: profile.id,
      userIdType: typeof profile.id
    });

    const { data, error } = await supabase
      .from('favorites')
      .delete()
      .eq('post_id', postId)
      .eq('user_id', profile.id)
      .eq('is_deleted', false)
      .select()

    console.log('찜 제거 결과:', { data, error });

    if (error) {
      console.error('찜 제거 실패:', error);
      return NextResponse.json({ error: 'Failed to remove favorite', details: error.message }, { status: 400 })
    }

    console.log('찜 제거 성공');
    return NextResponse.json({ message: 'Favorite removed successfully' })
  } catch (error) {
    console.error('Favorites DELETE error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
