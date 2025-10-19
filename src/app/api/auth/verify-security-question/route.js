import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';

// POST: 보안 질문/답변 확인 (아이디 찾기용)
export async function POST(request) {
  try {
    const body = await request.json();
    const { nickname, securityQuestion, securityAnswer } = body;

    if (!nickname || !nickname.trim()) {
      return NextResponse.json({
        success: false,
        error: '닉네임을 입력해주세요.'
      }, { status: 400 });
    }

    if (!securityQuestion) {
      return NextResponse.json({
        success: false,
        error: '보안 질문을 선택해주세요.'
      }, { status: 400 });
    }

    if (!securityAnswer || !securityAnswer.trim()) {
      return NextResponse.json({
        success: false,
        error: '보안 질문 답변을 입력해주세요.'
      }, { status: 400 });
    }

    const supabase = createServerSupabaseClient();

    // 닉네임으로 사용자 프로필 조회
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('id, display_name, security_question, security_answer, email')
      .eq('display_name', nickname.trim())
      .eq('is_deleted', false)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({
        success: false,
        error: '사용자 정보를 찾을 수 없습니다.'
      }, { status: 404 });
    }

    // 보안 질문/답변 확인
    if (profile.security_question !== securityQuestion) {
      return NextResponse.json({
        success: true,
        verified: false,
        error: '보안 질문이 일치하지 않습니다.'
      });
    }

    // 답변 비교 (대소문자 구분 없이)
    if (profile.security_answer.toLowerCase() !== securityAnswer.trim().toLowerCase()) {
      return NextResponse.json({
        success: true,
        verified: false,
        error: '보안 질문 답변이 일치하지 않습니다.'
      });
    }

    // 인증 성공 - 이메일 반환
    return NextResponse.json({
      success: true,
      verified: true,
      email: profile.email,
      message: '보안 질문 확인이 완료되었습니다.'
    });

  } catch (error) {
    console.error('보안 질문 확인 API 오류:', error);
    return NextResponse.json({
      success: false,
      error: '보안 질문 확인 중 오류가 발생했습니다.'
    }, { status: 500 });
  }
}
