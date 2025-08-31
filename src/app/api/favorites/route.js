import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET: 사용자의 찜 목록 조회
export async function GET(request) {
  try {
    // 인증 토큰 확인
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
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

    // 찜 목록 조회
    const from = (page - 1) * limit
    const to = from + limit - 1

    const { data: favorites, error, count } = await supabase
      .from('favorites')
      .select(`
        *,
        posts!inner(
          id, title, dog_name, dog_size, dog_breed,
          departure_address, arrival_address, deadline, status
        )
      `)
      .eq('user_id', profile.id)
      .eq('is_deleted', false)
      .eq('posts.is_deleted', false)
      .order('created_at', { ascending: false })
      .range(from, to)

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch favorites' }, { status: 400 })
    }

    return NextResponse.json({
      favorites,
      pagination: { page, limit, total: count || 0 }
    })
  } catch (error) {
    console.error('Favorites GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST: 찜 추가
export async function POST(request) {
  try {
    // 인증 토큰 확인
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const body = await request.json()
    const { post_id } = body

    // 필수 필드 검증
    if (!post_id) {
      return NextResponse.json({ error: 'Missing post_id' }, { status: 400 })
    }

    // 게시물 존재 및 활성 상태 확인
    const { data: post, error: postError } = await supabase
      .from('posts')
      .select('id, status')
      .eq('id', post_id)
      .eq('is_deleted', false)
      .eq('status', 'active')
      .single()

    if (postError || !post) {
      return NextResponse.json({ error: 'Post not found or not active' }, { status: 404 })
    }

    // 사용자 프로필 확인
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('auth_user_id', user.id)
      .eq('is_deleted', false)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // 이미 찜한 게시물인지 확인
    const { data: existingFavorite, error: duplicateError } = await supabase
      .from('favorites')
      .select('id')
      .eq('post_id', post_id)
      .eq('user_id', profile.id)
      .eq('is_deleted', false)
      .single()

    if (existingFavorite) {
      return NextResponse.json({ error: 'Already favorited this post' }, { status: 400 })
    }

    // 찜 추가
    const { data: favorite, error } = await supabase
      .from('favorites')
      .insert({
        post_id,
        user_id: profile.id
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: 'Failed to add favorite' }, { status: 400 })
    }

    return NextResponse.json({ favorite }, { status: 201 })
  } catch (error) {
    console.error('Favorites POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE: 찜 제거
export async function DELETE(request) {
  try {
    // 인증 토큰 확인
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const post_id = searchParams.get('post_id')

    if (!post_id) {
      return NextResponse.json({ error: 'Missing post_id' }, { status: 400 })
    }

    // 사용자 프로필 확인
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('auth_user_id', user.id)
      .eq('is_deleted', false)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // 찜 제거 (소프트 삭제)
    const { error } = await supabase
      .from('favorites')
      .update({
        is_deleted: true,
        deleted_at: new Date().toISOString()
      })
      .eq('post_id', post_id)
      .eq('user_id', profile.id)
      .eq('is_deleted', false)

    if (error) {
      return NextResponse.json({ error: 'Failed to remove favorite' }, { status: 400 })
    }

    return NextResponse.json({ message: 'Favorite removed successfully' })
  } catch (error) {
    console.error('Favorites DELETE error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
