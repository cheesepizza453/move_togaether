import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Supabase 클라이언트 생성 (서버 사이드)
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export async function POST(request) {
  try {
    console.log('서버 로그아웃 요청');

    // Supabase Auth에서 로그아웃
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.log('Supabase 로그아웃 에러:', error);
      return NextResponse.json(
        { success: false, error: '로그아웃 중 오류가 발생했습니다.' },
        { status: 500 }
      );
    }

    console.log('서버 로그아웃 성공');

    return NextResponse.json({
      success: true,
      message: '로그아웃이 완료되었습니다.'
    });

  } catch (error) {
    console.error('서버 로그아웃 처리 중 오류:', error);

    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
