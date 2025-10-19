import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';

// POST: 닉네임 존재 여부 확인 (아이디 찾기용)
export async function POST(request) {
  try {
    const body = await request.json();
    const { nickname } = body;

    if (!nickname || !nickname.trim()) {
      return NextResponse.json({
        success: false,
        error: '닉네임을 입력해주세요.'
      }, { status: 400 });
    }

    const supabase = createServerSupabaseClient();

    // 닉네임으로 사용자 프로필 조회
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('id, display_name, security_question, security_answer')
      .eq('display_name', nickname.trim())
      .eq('is_deleted', false)
      .single();

    if (profileError) {
      if (profileError.code === 'PGRST116') {
        // 프로필을 찾을 수 없음
        return NextResponse.json({
          success: true,
          exists: false,
          message: '존재하지 않는 닉네임입니다.'
        });
      }

      console.error('닉네임 확인 오류:', profileError);
      return NextResponse.json({
        success: false,
        error: '닉네임 확인 중 오류가 발생했습니다.'
      }, { status: 500 });
    }

    if (!profile) {
      return NextResponse.json({
        success: true,
        exists: false,
        message: '존재하지 않는 닉네임입니다.'
      });
    }

    // 보안 질문이 설정되어 있는지 확인
    if (!profile.security_question || !profile.security_answer) {
      return NextResponse.json({
        success: false,
        error: '보안 질문이 설정되지 않은 계정입니다. 고객센터에 문의해주세요.'
      }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      exists: true,
      message: '닉네임이 확인되었습니다.',
      hasSecurityQuestion: true
    });

  } catch (error) {
    console.error('닉네임 확인 API 오류:', error);
    return NextResponse.json({
      success: false,
      error: '닉네임 확인 중 오류가 발생했습니다.'
    }, { status: 500 });
  }
}
