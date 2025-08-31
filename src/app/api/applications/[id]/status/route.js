import { NextResponse } from 'next/server'
import { withAuth } from '@/lib/auth-middleware'

// PUT: 봉사 신청 상태 변경 (수락/거절)
export const PUT = withAuth(async (request) => {
  try {
    const { id } = request.params
    const body = await request.json()
    const { status, message } = body

    // 상태 값 검증
    if (!['accepted', 'rejected', 'completed'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    // 봉사 신청 존재 및 권한 확인
    const { data: application, error: appError } = await request.supabase
      .from('applications')
      .select(`
        *,
        posts!inner(user_id, title)
      `)
      .eq('id', id)
      .eq('is_deleted', false)
      .single()

    if (appError || !application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 })
    }

    // 게시물 작성자만 상태 변경 가능
    if (application.posts.user_id !== request.profile.id) {
      return NextResponse.json({ error: 'Not authorized to modify this application' }, { status: 403 })
    }

    // 봉사 신청 상태 업데이트
    const { data: updatedApplication, error } = await request.supabase
      .from('applications')
      .update({
        status,
        message: message || application.message,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('is_deleted', false)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: 'Failed to update application' }, { status: 400 })
    }

    // 수락된 경우 게시물 상태를 'in_progress'로 변경
    if (status === 'accepted') {
      await request.supabase
        .from('posts')
        .update({
          status: 'in_progress',
          updated_at: new Date().toISOString()
        })
        .eq('id', application.post_id)
        .eq('is_deleted', false)
    }

    return NextResponse.json({ application: updatedApplication })
  } catch (error) {
    console.error('Application status PUT error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})
