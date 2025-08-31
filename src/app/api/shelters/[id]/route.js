import { NextResponse } from 'next/server'
import { withAuth } from '@/lib/auth-middleware'
import { createServerSupabaseClient } from '@/lib/supabase'

// GET: 개별 보호소 조회
export const GET = async (request, { params }) => {
  try {
    const { id } = params

    // 서버 사이드 Supabase 클라이언트 생성 (anon key 사용)
    const supabase = createServerSupabaseClient()

    const { data: shelter, error } = await supabase
      .from('shelters')
      .select('*')
      .eq('id', id)
      .eq('is_deleted', false)
      .single()

    if (error) {
      return NextResponse.json({ error: 'Shelter not found' }, { status: 404 })
    }

    return NextResponse.json({ shelter })
  } catch (error) {
    console.error('Shelter GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT: 보호소 정보 수정
export const PUT = withAuth(async (request, { params }) => {
  try {
    const { id } = params
    const body = await request.json()

    // 보호소 존재 및 권한 확인
    const { data: shelter, error: shelterError } = await request.supabase
      .from('shelters')
      .select('created_by')
      .eq('id', id)
      .eq('is_deleted', false)
      .single()

    if (shelterError || !shelter) {
      return NextResponse.json({ error: 'Shelter not found' }, { status: 404 })
    }

    // 보호소 등록자만 수정 가능
    if (shelter.created_by !== request.profile.id) {
      return NextResponse.json({ error: 'Not authorized to modify this shelter' }, { status: 403 })
    }

    // 보호소 정보 업데이트
    const { data: updatedShelter, error } = await request.supabase
      .from('shelters')
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

    return NextResponse.json({ shelter: updatedShelter })
  } catch (error) {
    console.error('Shelter PUT error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})
