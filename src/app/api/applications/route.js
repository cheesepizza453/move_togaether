import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'

// GET: 사용자의 봉사 신청 목록 조회
export async function GET(request) {
  try {
    // 인증 토큰 확인
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const supabase = createServerSupabaseClient(token)
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'my' // 'my': 내가 신청한 것, 'received': 내가 받은 신청

    if (type === 'my') {
      // 내가 신청한 봉사 목록
      const { data: applications, error } = await supabase
        .from('applications')
        .select(`
          *,
          posts!inner(title, dog_name, departure_address, arrival_address, deadline, status)
        `)
        .eq('user_id', (await supabase
          .from('user_profiles')
          .select('id')
          .eq('auth_user_id', user.id)
          .single()).data.id)
        .eq('is_deleted', false)
        .order('created_at', { ascending: false })

      if (error) {
        return NextResponse.json({ error: 'Failed to fetch applications' }, { status: 400 })
      }

      return NextResponse.json({ applications })
    } else if (type === 'received') {
      // 내가 받은 봉사 신청 목록 (내가 작성한 게시물에 대한 신청)
      const { data: applications, error } = await supabase
        .from('applications')
        .select(`
          *,
          posts!inner(title, dog_name, departure_address, arrival_address, deadline, status),
          user_profiles!inner(display_name, phone, phone_visible)
        `)
        .eq('posts.user_id', (await supabase
          .from('user_profiles')
          .select('id')
          .eq('auth_user_id', user.id)
          .single()).data.id)
        .eq('is_deleted', false)
        .order('created_at', { ascending: false })

      if (error) {
        return NextResponse.json({ error: 'Failed to fetch received applications' }, { status: 400 })
      }

      return NextResponse.json({ applications })
    }

    return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 })
  } catch (error) {
    console.error('Applications GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST: 봉사 신청 생성
export async function POST(request) {
  try {
    // 인증 토큰 확인
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const supabase = createServerSupabaseClient(token)
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const body = await request.json()
    const { post_id, message } = body

    // 필수 필드 검증
    if (!post_id || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
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

    // 중복 신청 확인
    const { data: existingApplication, error: duplicateError } = await supabase
      .from('applications')
      .select('id')
      .eq('post_id', post_id)
      .eq('user_id', profile.id)
      .eq('is_deleted', false)
      .single()

    if (existingApplication) {
      return NextResponse.json({ error: 'Already applied to this post' }, { status: 400 })
    }

    // 봉사 신청 생성
    const { data: application, error } = await supabase
      .from('applications')
      .insert({
        post_id,
        user_id: profile.id,
        message,
        status: 'pending'
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: 'Failed to create application' }, { status: 400 })
    }

    return NextResponse.json({ application }, { status: 201 })
  } catch (error) {
    console.error('Applications POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
