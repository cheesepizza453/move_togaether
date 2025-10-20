import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';

// POST: 이메일 중복 체크 (회원가입용)
export async function POST(request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email || !email.trim()) {
      return NextResponse.json({
        success: false,
        error: '이메일을 입력해주세요.'
      }, { status: 400 });
    }

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return NextResponse.json({
        success: false,
        error: '올바른 이메일 형식을 입력해주세요.'
      }, { status: 400 });
    }

    const supabase = createServerSupabaseClient();

    // 이메일로 사용자 프로필 조회
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('id, email, provider, display_name')
      .eq('email', email.trim())
      .eq('is_deleted', false)
      .single();

    if (profileError) {
      if (profileError.code === 'PGRST116') {
        // 프로필을 찾을 수 없음 = 중복되지 않음
        return NextResponse.json({
          success: true,
          isDuplicate: false,
          message: '사용 가능한 이메일입니다.',
          available: true
        });
      }

      console.error('이메일 중복 체크 오류:', profileError);
      return NextResponse.json({
        success: false,
        error: '이메일 확인 중 오류가 발생했습니다.'
      }, { status: 500 });
    }

    if (!profile) {
      return NextResponse.json({
        success: true,
        isDuplicate: false,
        message: '사용 가능한 이메일입니다.',
        available: true
      });
    }

    // 이메일이 이미 존재함 = 중복됨
    const providerName = profile.provider === 'kakao' ? '카카오톡' : '이메일';

    return NextResponse.json({
      success: true,
      isDuplicate: true,
      message: `이미 ${providerName}로 가입된 이메일입니다.`,
      available: false,
      provider: profile.provider,
      providerName: providerName
    });

  } catch (error) {
    console.error('이메일 중복 체크 API 오류:', error);
    return NextResponse.json({
      success: false,
      error: '이메일 확인 중 오류가 발생했습니다.'
    }, { status: 500 });
  }
}
