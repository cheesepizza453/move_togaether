import { NextResponse } from 'next/server'
import { withAuth } from '@/lib/auth-middleware'

// GET: 내가 작성한 게시물 목록
export const GET = withAuth(async (request) => {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page')) || 1
    const limit = parseInt(searchParams.get('limit')) || 10
    const status = searchParams.get('status') || 'all'

    let query = request.supabase
      .from('posts')
      .select(`
        *,
        applications!inner(id, status, created_at),
        favorites!inner(id)
      `)
      .eq('user_id', request.profile.id)
      .eq('is_deleted', false)

    // 상태별 필터링
    if (status !== 'all') {
      query = query.eq('status', status)
    }

    // 페이지네이션
    const from = (page - 1) * limit
    const to = from + limit - 1
    query = query.order('created_at', { ascending: false }).range(from, to)

    const { data: posts, error, count } = await query

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 400 })
    }

    return NextResponse.json({
      posts,
      pagination: { page, limit, total: count || 0 }
    })
  } catch (error) {
    console.error('My posts GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})
