import { NextResponse } from 'next/server'
import { withAuth } from '@/lib/auth-middleware'
import { createServerSupabaseClient } from '@/lib/supabase'

// GET: 보호소 목록 조회 (검색, 필터링 포함)
export const GET = async (request) => {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page')) || 1
    const limit = parseInt(searchParams.get('limit')) || 10
    const search = searchParams.get('search') || ''
    const verified = searchParams.get('verified') || ''

    // 서버 사이드 Supabase 클라이언트 생성 (anon key 사용)
    const supabase = createServerSupabaseClient()

    let query = supabase
      .from('shelters')
      .select('*')
      .eq('is_deleted', false)
      .order('created_at', { ascending: false })

    // 검색어가 있으면 이름이나 설명에서 검색
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
    }

    // 인증 여부 필터
    if (verified === 'true') {
      query = query.eq('verified', true)
    } else if (verified === 'false') {
      query = query.eq('verified', false)
    }

    // 페이지네이션
    const from = (page - 1) * limit
    const to = from + limit - 1
    query = query.range(from, to)

    const { data: shelters, error, count } = await query

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch shelters' }, { status: 400 })
    }

    return NextResponse.json({
      shelters,
      pagination: { page, limit, total: count || 0 }
    })
  } catch (error) {
    console.error('Shelters GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST: 새 보호소 등록 (인증 필요)
export const POST = withAuth(async (request) => {
  try {
    const body = await request.json()
    const {
      name,
      description,
      phone,
      instagram,
      naver_cafe,
      kakao_openchat,
      address,
      verified = false
    } = body

    // 필수 필드 검증
    if (!name || !description || !phone) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // 보호소 등록
    const { data: shelter, error } = await request.supabase
      .from('shelters')
      .insert({
        name,
        description,
        phone,
        instagram,
        naver_cafe,
        kakao_openchat,
        address,
        verified,
        created_by: request.profile.id
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: 'Failed to create shelter' }, { status: 400 })
    }

    return NextResponse.json({ shelter }, { status: 201 })
  } catch (error) {
    console.error('Shelters POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})
