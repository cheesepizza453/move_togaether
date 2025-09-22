import { createServerSupabaseClient } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const supabase = createServerSupabaseClient();

    // 인증 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { post_id, message } = body;

    if (!post_id || !message) {
      return NextResponse.json(
        { error: '필수 필드가 누락되었습니다.' },
        { status: 400 }
      );
    }

    // 포스트 존재 확인
    const { data: post, error: postError } = await supabase
      .from('posts')
      .select('id, user_id')
      .eq('id', post_id)
      .single();

    if (postError || !post) {
      return NextResponse.json(
        { error: '존재하지 않는 게시물입니다.' },
        { status: 404 }
      );
    }

    // 자신의 게시물에 문의하는지 확인
    if (post.user_id === user.id) {
      return NextResponse.json(
        { error: '자신의 게시물에는 문의할 수 없습니다.' },
        { status: 400 }
      );
    }

    // 문의 저장
    const { data: inquiry, error: inquiryError } = await supabase
      .from('inquiries')
      .insert({
        post_id,
        user_id: user.id,
        message: message.trim(),
        status: 'pending'
      })
      .select()
      .single();

    if (inquiryError) {
      console.error('문의 저장 오류:', inquiryError);
      return NextResponse.json(
        { error: '문의 저장에 실패했습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      inquiry
    });

  } catch (error) {
    console.error('문의 API 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    const supabase = createServerSupabaseClient();

    // 인증 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const post_id = searchParams.get('post_id');

    let query = supabase
      .from('inquiries')
      .select(`
        *,
        user_profiles!inquiries_user_id_fkey (
          display_name,
          phone
        )
      `)
      .eq('user_id', user.id);

    if (post_id) {
      query = query.eq('post_id', post_id);
    }

    const { data: inquiries, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('문의 조회 오류:', error);
      return NextResponse.json(
        { error: '문의 조회에 실패했습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      inquiries
    });

  } catch (error) {
    console.error('문의 조회 API 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
