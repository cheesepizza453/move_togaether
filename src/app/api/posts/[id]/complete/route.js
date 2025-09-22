import { createServerSupabaseClient } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function POST(request, { params }) {
  try {
    const supabase = createServerSupabaseClient();
    const { id } = params;

    // 인증 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    // 포스트 존재 확인 및 작성자 확인
    const { data: post, error: postError } = await supabase
      .from('posts')
      .select('id, user_id, status')
      .eq('id', id)
      .single();

    if (postError || !post) {
      return NextResponse.json(
        { error: '존재하지 않는 게시물입니다.' },
        { status: 404 }
      );
    }

    if (post.user_id !== user.id) {
      return NextResponse.json(
        { error: '권한이 없습니다.' },
        { status: 403 }
      );
    }

    // 이미 완료된 게시물인지 확인
    if (post.status === 'completed') {
      return NextResponse.json(
        { error: '이미 모집이 완료된 게시물입니다.' },
        { status: 400 }
      );
    }

    // 게시물 상태를 완료로 변경
    const { error: updateError } = await supabase
      .from('posts')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString()
      })
      .eq('id', id);

    if (updateError) {
      console.error('게시물 상태 업데이트 오류:', updateError);
      return NextResponse.json(
        { error: '모집 완료 처리에 실패했습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: '모집이 완료되었습니다.'
    });

  } catch (error) {
    console.error('모집 완료 API 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
