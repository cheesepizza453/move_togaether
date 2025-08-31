import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET: 게시물 목록 조회 (검색, 필터링 포함)
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page')) || 1
    const limit = parseInt(searchParams.get('limit')) || 10
    const search = searchParams.get('search') || ''
    const dogSize = searchParams.get('dogSize') || ''
    const status = searchParams.get('status') || 'active'

    let query = supabase
      .from('posts')
      .select(`
        *,
        user_profiles!inner(display_name, phone_visible),
        shelters!inner(name, verified)
      `)
      .eq('is_deleted', false)
      .eq('status', status)
      .order('created_at', { ascending: false })

    // 검색어가 있으면 제목이나 설명에서 검색
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
    }

    // 강아지 크기 필터
    if (dogSize) {
      query = query.eq('dog_size', dogSize)
    }

    // 페이지네이션
    const from = (page - 1) * limit
    const to = from + limit - 1
    query = query.range(from, to)

    const { data: posts, error, count } = await query

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 400 })
    }

    return NextResponse.json({
      posts,
      pagination: { page, limit, total: count || 0 }
    })
  } catch (error) {
    console.error('Posts GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST: 새 게시물 생성
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

    const body = await request.json()
    const {
      title,
      description,
      departure_address,
      departure_lat,
      departure_lng,
      arrival_address,
      arrival_lat,
      arrival_lng,
      dog_name,
      dog_size,
      dog_breed,
      dog_age,
      dog_characteristics,
      images,
      related_link,
      deadline
    } = body

    // 필수 필드 검증
    if (!title || !description || !departure_address || !arrival_address || !dog_name || !dog_size || !dog_breed || !deadline) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // 게시물 생성
    const { data: post, error } = await supabase
      .from('posts')
      .insert({
        user_id: profile.id,
        title,
        description,
        departure_address,
        departure_lat,
        departure_lng,
        arrival_address,
        arrival_lat,
        arrival_lng,
        dog_name,
        dog_size,
        dog_breed,
        dog_age,
        dog_characteristics,
        images: images || [],
        related_link,
        deadline,
        status: 'active'
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: 'Failed to create post' }, { status: 400 })
    }

    return NextResponse.json({ post }, { status: 201 })
  } catch (error) {
    console.error('Posts POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
