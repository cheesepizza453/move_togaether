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

    console.log('카카오톡 로그인 요청:', { email: userInfo.email });

    // Supabase 클라이언트 생성
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // 이메일로 기존 사용자 확인
    const { data: existingProfile, error: checkError } = await supabase
      .from('user_profiles')
      .select('id, provider, display_name, auth_user_id')
      .eq('email', userInfo.email.toLowerCase())
      .eq('is_deleted', false)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('사용자 확인 오류:', checkError);
      return NextResponse.json(
        { success: false, error: '사용자 확인 중 오류가 발생했습니다.' },
        { status: 500 }
      );
    }

    if (existingProfile) {
      // 기존 사용자인 경우
      if (existingProfile.provider === 'kakao') {
        // 카카오톡으로 가입된 사용자 - Supabase Auth에서 사용자 찾기
        const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers();

        if (usersError) {
          console.error('사용자 목록 조회 오류:', usersError);
          return NextResponse.json(
            { success: false, error: '사용자 조회 중 오류가 발생했습니다.' },
            { status: 500 }
          );
        }

        const authUser = users.find(user => user.id === existingProfile.auth_user_id);

        if (authUser) {
          // 카카오톡 사용자 정보와 함께 응답
          return NextResponse.json({
            success: true,
            message: '카카오톡 로그인 성공',
            user: {
              id: authUser.id,
              email: authUser.email,
              created_at: authUser.created_at
            },
            profile: existingProfile,
            isExistingUser: true,
            needsClientAuth: true // 클라이언트에서 세션 생성 필요
          });
        } else {
          return NextResponse.json(
            { success: false, error: '인증 정보를 찾을 수 없습니다.' },
            { status: 400 }
          );
        }
      } else {
        // 다른 방식으로 가입된 사용자
        const providerName = existingProfile.provider === 'email' ? '이메일' : '기타';
        return NextResponse.json(
          {
            success: false,
            error: `이미 ${providerName}로 가입된 이메일입니다.`,
            duplicateInfo: {
              provider: existingProfile.provider,
              providerName: providerName,
              displayName: existingProfile.display_name
            }
          },
          { status: 400 }
        );
      }
    } else {
      // 신규 사용자
      return NextResponse.json(
        {
          success: false,
          needsSignup: true,
          message: '신규 사용자입니다. 회원가입을 진행합니다.'
        },
        { status: 200 }
      );
    }

  } catch (error) {
    console.error('카카오톡 로그인 처리 중 오류:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
