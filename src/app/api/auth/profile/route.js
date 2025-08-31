import { NextResponse } from 'next/server'
import { withAuth } from '@/lib/auth-middleware'

// GET: 사용자 프로필 조회
export const GET = withAuth(async (request) => {
  try {
    // request.profile에는 이미 인증된 사용자 정보가 포함되어 있음
    const { profile } = request

    return NextResponse.json({ profile })
  } catch (error) {
    console.error('Profile GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})

// PUT: 사용자 프로필 수정
export const PUT = withAuth(async (request) => {
  try {
    const body = await request.json()
    const { display_name, phone, phone_visible, bio, instagram, naver_cafe, kakao_openchat } = body

    // 프로필 업데이트
    const { data: updatedProfile, error } = await request.supabase
      .from('user_profiles')
      .update({
        display_name,
        phone,
        phone_visible,
        bio,
        instagram,
        naver_cafe,
        kakao_openchat,
        updated_at: new Date().toISOString()
      })
      .eq('id', request.profile.id)
      .eq('is_deleted', false)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: 'Update failed' }, { status: 400 })
    }

    return NextResponse.json({ profile: updatedProfile })
  } catch (error) {
    console.error('Profile PUT error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})
