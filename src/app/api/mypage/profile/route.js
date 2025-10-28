import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';

// GET: 사용자 프로필 조회
export async function GET(request) {
  try {
    const authHeader = request.headers.get('authorization');
    const apikeyHeader = request.headers.get('apikey');

    if (!authHeader || !apikeyHeader) {
      return NextResponse.json({
        success: false,
        error: '인증이 필요합니다.'
      }, { status: 401 });
    }

    const accessToken = authHeader.replace('Bearer ', '');
    const supabase = createServerSupabaseClient(accessToken);

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({
        success: false,
        error: '유효하지 않은 인증 정보입니다.'
      }, { status: 401 });
    }

    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('auth_user_id', user.id)
      .eq('is_deleted', false)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({
        success: false,
        error: '사용자 프로필을 찾을 수 없습니다.'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      profile
    });

  } catch (error) {
    console.error('프로필 조회 API 오류:', error);
    return NextResponse.json({
      success: false,
      error: '서버 오류가 발생했습니다.'
    }, { status: 500 });
  }
}

// PUT: 사용자 프로필 업데이트
export async function PUT(request) {
  try {
    const authHeader = request.headers.get('authorization');
    const apikeyHeader = request.headers.get('apikey');

    if (!authHeader || !apikeyHeader) {
      return NextResponse.json({
        success: false,
        error: '인증이 필요합니다.'
      }, { status: 401 });
    }

    const accessToken = authHeader.replace('Bearer ', '');
    const supabase = createServerSupabaseClient(accessToken);

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({
        success: false,
        error: '유효하지 않은 인증 정보입니다.'
      }, { status: 401 });
    }

    const body = await request.json();
    const {
      display_name,
      phone,
      bio,
      profile_image,
      instagram,
      naver_cafe,
      kakao_openchat,
      security_question,
      security_answer
    } = body;

    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .update({
        display_name,
        phone,
        bio,
        profile_image,
        instagram,
        naver_cafe,
        kakao_openchat,
        security_question,
        security_answer,
        updated_at: new Date().toISOString()
      })
      .eq('auth_user_id', user.id)
      .eq('is_deleted', false)
      .select()
      .single();

    if (profileError) {
      console.error('프로필 업데이트 오류:', profileError);
      return NextResponse.json({
        success: false,
        error: '프로필 업데이트에 실패했습니다.'
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      profile
    });

  } catch (error) {
    console.error('프로필 업데이트 API 오류:', error);
    return NextResponse.json({
      success: false,
      error: '서버 오류가 발생했습니다.'
    }, { status: 500 });
  }
}
