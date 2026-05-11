import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';

export async function POST(request) {
  try {
    const {
      email,
      password,
      nickname,
      introduction,
      phone,
      contactChannels,
      channelInputs,
      securityQuestion,
      securityAnswer,
    } = await request.json();

    // 입력값 검증
    if (!email || !password || !nickname) {
      return NextResponse.json(
        { success: false, error: '필수 정보가 누락되었습니다.' },
        { status: 400 }
      );
    }

    console.log('서버 회원가입 시도:', { email, nickname, phone, securityQuestion });

    const supabase = createServerSupabaseClient();

    // Supabase Auth로 회원가입
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          nickname,
          introduction,
          phone,
          contactChannels,
          channelInputs,
          securityQuestion,
          securityAnswer,
          provider: 'email',
          profile_created: false
        },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3008'}/verify-email?type=signup`
      }
    });

    if (error) {
      console.log('Supabase 회원가입 에러:', error);

      let errorMessage = '회원가입 중 오류가 발생했습니다.';

      if (error.message.includes('already registered') ||
          error.message.includes('already been registered') ||
          error.message.includes('User already registered') ||
          error.message.includes('already exists')) {
        errorMessage = '이미 사용 중인 이메일입니다. 다른 이메일을 사용해주세요.';
      } else if (error.message.includes('password')) {
        errorMessage = '비밀번호 형식이 올바르지 않습니다.';
      } else if (error.message.includes('email')) {
        errorMessage = '이메일 형식이 올바르지 않습니다.';
      } else if (error.message.includes('rate limit')) {
        errorMessage = '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.';
      } else if (error.message.includes('network') || error.message.includes('timeout')) {
        errorMessage = '네트워크 오류가 발생했습니다. 인터넷 연결을 확인해주세요.';
      }

      return NextResponse.json(
        { success: false, error: errorMessage },
        { status: 400 }
      );
    }

    // 회원가입 성공
    console.log('서버 회원가입 성공:', data.user.id);
    console.log('user_metadata:', data.user.user_metadata); // test

    // 자동 로그인 시도 (이메일 인증 전이면 실패할 수 있음 – 정상)
    try {
      const { data: signInData, error: signInError } =
          await supabase.auth.signInWithPassword({
            email,
            password,
          });

      if (signInError) {
        console.log(
            '자동 로그인 실패 (이메일 인증 필요/기타):',
            signInError.message
        );
      } else {
        console.log('자동 로그인 성공:', signInData.user.id);
      }
    } catch (autoLoginError) {
      console.log(
          '자동 로그인 시도 중 오류 (정상적인 플로우일 수 있음):',
          autoLoginError.message
      );
    }

    const userData = {
      id: data.user.id,
      email: data.user.email,
      created_at: data.user.created_at,
      nickname: data.user.user_metadata?.nickname || ''
    };

    return NextResponse.json({
      success: true,
      message: '회원가입이 완료되었습니다. 이메일을 확인하여 계정을 활성화해주세요.',
      user: userData
    });
  } catch (error) {
    console.error('서버 회원가입 처리 중 오류:', error);

    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
