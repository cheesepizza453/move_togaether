import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'

// GET: 개별 게시물 조회
export async function GET(request, { params }) {
  try {
    const { id } = await params

    const supabase = createServerSupabaseClient()
    const { data: post, error } = await supabase
      .from('posts')
      .select(`
        *,
        user_profiles!posts_user_id_fkey(
          id,
          auth_user_id,
          display_name,
          phone_visible,
          phone
        )
      `)
      .eq('id', id)
      .eq('is_deleted', false)
      .eq('status', 'active')
      .single()

    if (error) {
      console.error('Post query error:', error)
      return NextResponse.json({ error: 'Post not found', details: error.message }, { status: 404 })
    }

    return NextResponse.json({ post })
  } catch (error) {
    console.error('Post GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT: 게시물 수정
export async function PUT(request, { params }) {
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

    const { id } = await params
    const body = await request.json()

    // 게시물 작성자 확인
    const { data: post, error: postError } = await supabase
      .from('posts')
      .select('user_id')
      .eq('id', id)
      .eq('is_deleted', false)
      .single()

    if (postError || !post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    // 사용자 프로필 확인
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('auth_user_id', user.id)
      .eq('is_deleted', false)
      .single()

    if (profileError || !profile || profile.id !== post.user_id) {
      return NextResponse.json({ error: 'Not authorized to modify this post' }, { status: 403 })
    }

    // 게시물 업데이트
    const { data: updatedPost, error } = await supabase
      .from('posts')
      .update({
        ...body,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('is_deleted', false)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: 'Update failed' }, { status: 400 })
    }

    return NextResponse.json({ post: updatedPost })
  } catch (error) {
    console.error('Post PUT error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE: 게시물 삭제 (소프트 삭제)
export async function DELETE(request, { params }) {
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

    const { id } = await params

    // 게시물 작성자 확인
    const { data: post, error: postError } = await supabase
      .from('posts')
      .select('user_id')
      .eq('id', id)
      .eq('is_deleted', false)
      .single()

    if (postError || !post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    // 사용자 프로필 확인
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('auth_user_id', user.id)
      .eq('is_deleted', false)
      .single()

    if (profileError || !profile || profile.id !== post.user_id) {
      return NextResponse.json({ error: 'Not authorized to delete this post' }, { status: 403 })
    }

    // 소프트 삭제
    const { error } = await supabase
      .from('posts')
      .update({
        is_deleted: true,
        deleted_at: new Date().toISOString()
      })
      .eq('id', id)

    if (error) {
      return NextResponse.json({ error: 'Delete failed' }, { status: 400 })
    }

    return NextResponse.json({ message: 'Post deleted successfully' })
  } catch (error) {
    console.error('Post DELETE error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
