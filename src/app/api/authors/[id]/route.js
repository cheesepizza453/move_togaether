import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import moment from 'moment';

export async function GET(request, { params }) {
  try {
    const { id: authorId } = await params;
    const { searchParams } = new URL(request.url);

    // 페이지네이션 파라미터
    const status = searchParams.get('status'); // 'active' 또는 'completed'
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;

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

    // status 파라미터가 없으면 기본 동작 (기존 호환성 유지)
    if (!status) {
      // 작성자의 게시물 조회 (전체)
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
    }

    // 페이지네이션 적용: status가 active 또는 completed인 경우
    const now = moment().toISOString();
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from('posts')
      .select('*', { count: 'exact' })
      .eq('user_id', authorId)
      .eq('is_deleted', false);

    // 필터링 로직
    if (status === 'active') {
      // activePosts: deadline이 아직 지나지 않았고 status가 active인 게시물
      query = query
        .eq('status', 'active')
        .gte('deadline', now);
    } else if (status === 'completed') {
      // completedPosts: deadline이 지났거나 status가 active가 아닌 게시물
      // Supabase에서는 OR 조건을 직접 지원하지 않으므로 두 가지 쿼리를 합쳐서 처리

      // 1. deadline이 지난 게시물 (status 상관없이 모두 포함)
      const { data: expiredPosts, error: expiredError } = await supabase
        .from('posts')
        .select('*')
        .eq('user_id', authorId)
        .eq('is_deleted', false)
        .lt('deadline', now)
        .order('created_at', { ascending: false });

      // 2. status가 active가 아닌 게시물 (deadline이 지나지 않았지만 status가 다른 경우)
      const { data: inactivePosts, error: inactiveError } = await supabase
        .from('posts')
        .select('*')
        .eq('user_id', authorId)
        .eq('is_deleted', false)
        .neq('status', 'active')
        .gte('deadline', now)
        .order('created_at', { ascending: false });

      if (expiredError || inactiveError) {
        console.error('게시물 조회 오류:', expiredError || inactiveError);
        return NextResponse.json({ error: '게시물을 불러올 수 없습니다.' }, { status: 500 });
      }

      // 두 결과를 합치고 중복 제거 (id 기준)
      const allCompletedPostsMap = new Map();
      [...(expiredPosts || []), ...(inactivePosts || [])].forEach(post => {
        if (!allCompletedPostsMap.has(post.id)) {
          allCompletedPostsMap.set(post.id, post);
        }
      });

      // 배열로 변환하고 정렬 (created_at 기준 내림차순)
      const allCompletedPosts = Array.from(allCompletedPostsMap.values())
        .sort((a, b) => moment(b.created_at).diff(moment(a.created_at)));

      // 페이지네이션 적용
      const totalCount = allCompletedPosts.length;
      const paginatedPosts = allCompletedPosts.slice(from, to + 1);

      // D-day 계산
      const postsWithDday = paginatedPosts.map(post => ({
        ...post,
        dday: moment(post.deadline).diff(moment(), 'days')
      }));

      // 가져온 게시글 수가 limit보다 적으면 더 이상 없음
      const hasMore = postsWithDday.length === limit;

      return NextResponse.json({
        success: true,
        author,
        posts: postsWithDday,
        pagination: {
          page,
          limit,
          total: totalCount,
          totalPages: Math.ceil(totalCount / limit),
          hasMore
        }
      });
    }

    // active 케이스 처리
    const { data: posts, error: postsError, count } = await query
      .order('created_at', { ascending: false })
      .range(from, to);

    if (postsError) {
      console.error('게시물 조회 오류:', postsError);
      return NextResponse.json({ error: '게시물을 불러올 수 없습니다.' }, { status: 500 });
    }

    // D-day 계산
    const postsWithDday = (posts || []).map(post => ({
      ...post,
      dday: moment(post.deadline).diff(moment(), 'days')
    }));

    // 가져온 게시글 수가 limit보다 적으면 더 이상 없음
    const hasMore = postsWithDday.length === limit;

    return NextResponse.json({
      success: true,
      author,
      posts: postsWithDday,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
        hasMore
      }
    });

  } catch (error) {
    console.error('작성자 정보 조회 API 오류:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
