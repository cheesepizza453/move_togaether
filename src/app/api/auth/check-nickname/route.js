import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';

export async function POST(request) {
  try {
    const { nickname } = await request.json();

    if (!nickname) {
      return NextResponse.json(
        { error: '닉네임이 필요합니다.' },
        { status: 400 }
      );
    }

    // 닉네임 형식 검증
    if (nickname.length < 2 || nickname.length > 20) {
      return NextResponse.json({
        isDuplicate: false,
        message: '닉네임은 2-20자 사이여야 합니다.',
        available: false
      });
    }

    // 특수문자 검증 (한글, 영문, 숫자만 허용)
    const nicknameRegex = /^[가-힣a-zA-Z0-9]+$/;
    if (!nicknameRegex.test(nickname)) {
      return NextResponse.json({
        isDuplicate: false,
        message: '닉네임은 한글, 영문, 숫자만 사용할 수 있습니다.',
        available: false
      });
    }

    // Supabase 클라이언트 생성 (익명 사용자용)
    const supabase = createServerSupabaseClient();

    // user_profiles 테이블에서 중복 체크
    const { data, error } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('display_name', nickname.trim())
      .eq('is_deleted', false)
      .single();

    if (error && error.code === 'PGRST116') {
      // 결과가 없음 = 중복되지 않음
      return NextResponse.json({
        isDuplicate: false,
        message: '사용 가능한 닉네임입니다.',
        available: true
      });
    }

    if (error) {
      console.error('닉네임 중복 체크 오류:', error);
      return NextResponse.json(
        { error: '중복 체크 중 오류가 발생했습니다.' },
        { status: 500 }
      );
    }

    // 결과가 있음 = 중복됨
    return NextResponse.json({
      isDuplicate: true,
      message: '이미 사용 중인 닉네임입니다.',
      available: false
    });

  } catch (error) {
    console.error('닉네임 중복 확인 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
