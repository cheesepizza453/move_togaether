import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    // 입력값 검증
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: '이메일과 비밀번호를 입력해주세요.' },
        { status: 400 }
      );
    }

    console.log('서버 로그인 시도:', { email, password: '***' });

    // Supabase 클라이언트 생성 (익명 사용자용)
    const supabase = createServerSupabaseClient();

    // Supabase Auth로 로그인
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      console.log('Supabase 로그인 에러:', error);

      let errorMessage = '로그인에 실패했습니다.';

      if (error.message.includes('Invalid login credentials')) {
        errorMessage = '이메일 또는 비밀번호가 올바르지 않습니다.';
      } else if (error.message.includes('Email not confirmed')) {
        errorMessage = '이메일 인증이 필요합니다. 가입하신 이메일을 확인해주세요.';
      } else if (error.message.includes('Too many requests')) {
        errorMessage = '너무 많은 로그인 시도가 있었습니다. 잠시 후 다시 시도해주세요.';
      }

      return NextResponse.json(
        { success: false, error: errorMessage },
        { status: 401 }
      );
    }

    // 로그인 성공
    console.log('서버 로그인 성공:', data.user.id);

    // 사용자 프로필 정보 조회
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('auth_user_id', data.user.id)
      .eq('is_deleted', false)
      .single();

    if (profileError && profileError.code !== 'PGRST116') {
      console.log('프로필 조회 에러:', profileError);
    }

    // 응답 데이터 구성 (민감한 정보 제거)
    const userData = {
      id: data.user.id,
      email: data.user.email,
      email_confirmed_at: data.user.email_confirmed_at,
      created_at: data.user.created_at,
      profile: profile || null
    };

    console.log('서버 로그인 응답 데이터:', {
      userId: userData.id,
      hasProfile: !!userData.profile,
      profileData: userData.profile
    });

    return NextResponse.json({
      success: true,
      message: '로그인이 완료되었습니다.',
      user: userData
    });

  } catch (error) {
    console.error('서버 로그인 처리 중 오류:', error);

    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
