import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';

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

    // Supabase 클라이언트 생성 (익명 사용자용)
    const supabase = createServerSupabaseClient();

    // user_profiles 테이블에서 이메일 중복 확인 (provider 정보 포함)
    const { data: profileData, error: profileError } = await supabase
      .from('user_profiles')
      .select('id, provider, display_name')
      .eq('email', email.toLowerCase())
      .eq('is_deleted', false)
      .single();

    if (profileData) {
      const provider = profileData.provider || 'email';
      const providerName = provider === 'kakao' ? '카카오톡' : '이메일';
      const message = provider === 'kakao' ? '이미 카카오톡으로 가입된 이메일입니다.' : '이미 이메일로 가입된 이메일입니다.';

      return NextResponse.json({
        isDuplicate: true,
        message: message,
        available: false,
        duplicateInfo: {
          email: email.toLowerCase(),
          provider: provider,
          providerName: providerName,
          displayName: profileData.display_name
        }
      });
    }

    if (profileError && profileError.code !== 'PGRST116') {
      // PGRST116이 아닌 다른 에러인 경우
      console.error('이메일 중복 확인 오류:', profileError);
      return NextResponse.json(
        { error: '이메일 확인 중 오류가 발생했습니다.' },
        { status: 500 }
      );
    }

    // user_profiles에서 결과가 없음 = 이메일 사용 가능
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
