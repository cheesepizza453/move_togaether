import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function POST(request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: '이메일이 필요합니다.' },
        { status: 400 }
      );
    }

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: '유효하지 않은 이메일 형식입니다.' },
        { status: 400 }
      );
    }

    // Supabase 클라이언트 생성 (anon key 사용)
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // 회원가입 시도를 통해 이메일 중복 확인
    // 이미 등록된 이메일인 경우 에러 발생
    const { data, error } = await supabase.auth.signUp({
      email: email.toLowerCase(),
      password: 'temp_password_for_check_123!', // 임시 비밀번호
      options: {
        emailRedirectTo: undefined // 이메일 리다이렉트 비활성화
      }
    });

    if (error) {
      // "User already registered" 에러인 경우 중복
      if (error.message.includes('already registered') ||
          error.message.includes('already been registered') ||
          error.message.includes('User already registered') ||
          error.message.includes('already exists')) {
        return NextResponse.json({
          isDuplicate: true,
          message: '이미 사용 중인 이메일입니다.',
          available: false,
          duplicateInfo: {
            email: email.toLowerCase(),
            provider: 'email' // 정확한 provider는 알 수 없음
          }
        });
      }

      // 다른 에러인 경우 (네트워크 오류 등)
      console.error('이메일 중복 확인 오류:', error);
      return NextResponse.json(
        { error: '이메일 확인 중 오류가 발생했습니다.' },
        { status: 500 }
      );
    }

    // 회원가입이 성공한 경우 (임시 사용자 생성됨)
    // 이 사용자는 실제 회원가입 시에 사용될 수 있음
    // 또는 나중에 정리할 수 있음

    // 에러가 없고 사용자가 생성된 경우 이메일 사용 가능
    return NextResponse.json({
      isDuplicate: false,
      message: '사용 가능한 이메일입니다.',
      available: true,
      duplicateInfo: null
    });

  } catch (error) {
    console.error('이메일 중복 확인 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
