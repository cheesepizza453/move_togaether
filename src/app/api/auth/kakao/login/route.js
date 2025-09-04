import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function POST(request) {
  try {
    const { userInfo } = await request.json();

    if (!userInfo || !userInfo.email) {
      return NextResponse.json(
        { success: false, error: '사용자 정보가 필요합니다.' },
        { status: 400 }
      );
    }

    console.log('카카오톡 로그인 요청:', { userInfo });

    // Supabase 클라이언트 생성
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // 기존 사용자 프로필 확인
    const { data: existingProfile, error: profileError } = await supabase
      .from('user_profiles')
      .select('id, auth_user_id, display_name, provider')
      .eq('email', userInfo.email.toLowerCase())
      .eq('is_deleted', false)
      .single();

    if (profileError && profileError.code !== 'PGRST116') {
      console.error('프로필 조회 오류:', profileError);
      return NextResponse.json(
        { success: false, error: '사용자 정보를 확인할 수 없습니다.' },
        { status: 500 }
      );
    }

    if (!existingProfile) {
      return NextResponse.json(
        {
          success: false,
          error: '가입되지 않은 이메일입니다. 회원가입을 진행해주세요.',
          needsSignup: true
        },
        { status: 400 }
      );
    }

    // 카카오톡으로 가입된 사용자인지 확인
    if (existingProfile.provider !== 'kakao') {
      const providerName = existingProfile.provider === 'email' ? '이메일' : '이메일';
      return NextResponse.json(
        {
          success: false,
          error: `이미 ${providerName}으로 가입된 계정입니다.`,
          duplicateInfo: {
            provider: existingProfile.provider,
            providerName: providerName,
            displayName: existingProfile.display_name
          }
        },
        { status: 400 }
      );
    }

    // Supabase Auth에서 사용자 정보 조회
    const { data: authData, error: authError } = await supabase.auth.admin.getUserById(existingProfile.auth_user_id);

    if (authError) {
      console.error('Supabase Auth 사용자 조회 오류:', authError);
      return NextResponse.json(
        { success: false, error: '사용자 인증 정보를 확인할 수 없습니다.' },
        { status: 500 }
      );
    }

    if (!authData.user) {
      return NextResponse.json(
        { success: false, error: '사용자 정보를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 카카오톡 사용자 정보 업데이트 (최신 정보로 동기화)
    const { error: updateError } = await supabase.auth.admin.updateUserById(existingProfile.auth_user_id, {
      user_metadata: {
        ...authData.user.user_metadata,
        kakao_id: userInfo.id,
        kakao_nickname: userInfo.nickname,
        kakao_profile_image: userInfo.profile_image,
        last_kakao_login: new Date().toISOString()
      }
    });

    if (updateError) {
      console.error('카카오톡 사용자 정보 업데이트 오류:', updateError);
      // 업데이트 실패해도 로그인은 진행
    }

    // 응답 데이터 구성
    const userData = {
      id: authData.user.id,
      email: authData.user.email,
      created_at: authData.user.created_at,
      profile: existingProfile
    };

    return NextResponse.json({
      success: true,
      message: '카카오톡 로그인이 완료되었습니다.',
      user: userData,
      isExistingUser: true
    });

  } catch (error) {
    console.error('카카오톡 로그인 처리 중 오류:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

