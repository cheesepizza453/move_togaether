import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import moment from 'moment';

export async function GET(request, { params }) {
  try {
    const { id: authorId } = await params;

    if (!authorId) {
      return NextResponse.json({ error: '작성자 ID가 필요합니다.' }, { status: 400 });
    }

    const supabase = createServerSupabaseClient();

    // 작성자 정보 조회
    const { data: author, error: authorError } = await supabase
      .from('user_profiles')
      .select(`
        id,
        display_name,
        phone,
        bio,
        instagram,
        naver_cafe,
        kakao_openchat,
        profile_image,
        created_at,
        updated_at
      `)
      .eq('id', authorId)
      .single();

    if (authorError || !author) {
      return NextResponse.json({ error: '작성자를 찾을 수 없습니다.' }, { status: 404 });
    }

    // 작성자의 게시물 조회
    const { data: posts, error: postsError } = await supabase
      .from('posts')
      .select(`
        id,
        title,
        dog_name,
        dog_size,
        images,
        status,
        deadline,
        created_at
      `)
      .eq('user_id', authorId)
      .eq('is_deleted', false)
      .order('created_at', { ascending: false });

    if (postsError) {
      console.error('게시물 조회 오류:', postsError);
      return NextResponse.json({ error: '게시물을 불러올 수 없습니다.' }, { status: 500 });
    }

    // D-day 계산
    const postsWithDday = posts.map(post => ({
      ...post,
      dday: moment(post.deadline).diff(moment(), 'days')
    }));

    return NextResponse.json({
      success: true,
      author,
      posts: postsWithDday
    });

  } catch (error) {
    console.error('작성자 정보 조회 API 오류:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
