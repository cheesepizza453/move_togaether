import { createServerSupabaseClient } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    // 요청 헤더에서 Authorization 토큰 추출
    const authHeader = request.headers.get('authorization');
    const accessToken = authHeader?.replace('Bearer ', '');

    console.log('API 요청 토큰:', { authHeader, accessToken });

    const supabase = createServerSupabaseClient(accessToken);

    // 인증 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    console.log('API 인증 확인:', { user: user?.id, authError });

    if (authError || !user) {
      console.log('인증 실패:', authError);
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

    // 사용자 프로필 ID 조회
    const { data: userProfile, error: profileError } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('auth_user_id', user.id)
      .single();

    if (profileError || !userProfile) {
      return NextResponse.json(
        { error: '사용자 프로필을 찾을 수 없습니다.' },
        { status: 404 }
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

    // 자신의 게시물에 신청하는지 확인
    if (post.user_id === userProfile.id) {
      return NextResponse.json(
        { error: '자신의 게시물에는 신청할 수 없습니다.' },
        { status: 400 }
      );
    }

    // 중복 신청 확인
    const { data: existingApplication } = await supabase
      .from('applications')
      .select('id')
      .eq('post_id', post_id)
      .eq('user_id', userProfile.id)
      .eq('is_deleted', false)
      .single();

    if (existingApplication) {
      return NextResponse.json(
        { error: '이미 신청한 게시물입니다.' },
        { status: 400 }
      );
    }

    // 신청 저장
    const { data: application, error: applicationError } = await supabase
      .from('applications')
      .insert({
        post_id,
        user_id: userProfile.id,
        message: message.trim(),
        status: 'pending'
      })
      .select()
      .single();

    if (applicationError) {
      console.error('신청 저장 오류:', applicationError);
      return NextResponse.json(
        { error: '신청 저장에 실패했습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      application
    });

  } catch (error) {
    console.error('신청 API 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    // 요청 헤더에서 Authorization 토큰 추출
    const authHeader = request.headers.get('authorization');
    const accessToken = authHeader?.replace('Bearer ', '');

    const supabase = createServerSupabaseClient(accessToken);

    // 인증 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    // 사용자 프로필 ID 조회
    const { data: userProfile, error: profileError } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('auth_user_id', user.id)
      .single();

    if (profileError || !userProfile) {
      return NextResponse.json(
        { error: '사용자 프로필을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    const { searchParams } = new URL(request.url);
    const post_id = searchParams.get('post_id');

    let query = supabase
      .from('applications')
      .select(`
        *,
        user_profiles!applications_user_id_fkey (
          display_name,
          phone
        )
      `)
      .eq('is_deleted', false);

    if (post_id) {
      // 특정 포스트의 신청자 목록 (작성자만 조회 가능)
      query = query.eq('post_id', post_id);
    } else {
      // 내가 신청한 목록
      query = query.eq('user_id', userProfile.id);
    }

    const { data: applications, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('신청 조회 오류:', error);
      return NextResponse.json(
        { error: '신청 조회에 실패했습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      applications
    });

  } catch (error) {
    console.error('신청 조회 API 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
