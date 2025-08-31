import { NextResponse } from 'next/server'
import { withAuth } from '@/lib/auth-middleware'

// GET: 특정 게시물 찜 여부 확인
export const GET = withAuth(async (request) => {
  try {
    const { searchParams } = new URL(request.url)
    const post_id = searchParams.get('post_id')

    if (!post_id) {
      return NextResponse.json({ error: 'Post ID required' }, { status: 400 })
    }

    // 찜 여부 확인
    const { data: favorite, error } = await request.supabase
      .from('favorites')
      .select('id')
      .eq('post_id', post_id)
      .eq('user_id', request.profile.id)
      .eq('is_deleted', false)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116: 결과 없음
      return NextResponse.json({ error: 'Failed to check favorite status' }, { status: 400 })
    }

    return NextResponse.json({
      isFavorited: !!favorite,
      favoriteId: favorite?.id || null
    })
  } catch (error) {
    console.error('Favorite check GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})
