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

    // post_id를 정수로 변환 (posts.id는 integer 타입)
    const postId = parseInt(post_id)

    // 찜 여부 확인
    const { data: favorite, error } = await request.supabase
      .from('favorites')
      .select('id')
      .eq('post_id', postId)
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
