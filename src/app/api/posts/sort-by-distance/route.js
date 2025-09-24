import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';

export async function POST(request) {
  try {
    // Authorization 헤더에서 토큰 추출
    const authHeader = request.headers.get('authorization');
    let supabase, user;

    if (authHeader) {
      // Authorization 헤더가 있으면 인증된 사용자로 처리
      const accessToken = authHeader.replace('Bearer ', '');
      supabase = createServerSupabaseClient(accessToken);

      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
      if (authError || !authUser) {
        return NextResponse.json(
          { error: '인증이 필요합니다.' },
          { status: 401 }
        );
      }
      user = authUser;
    } else {
      // Authorization 헤더가 없으면 익명 사용자로 처리
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    const { latitude, longitude, page = 1, limit = 10 } = await request.json();

    if (!latitude || !longitude) {
      return NextResponse.json(
        { error: '위치 정보가 필요합니다.' },
        { status: 400 }
      );
    }

    // 거리 계산을 위한 SQL 함수 사용
    const { data: posts, error } = await supabase
      .rpc('get_posts_by_distance', {
        user_lat: latitude,
        user_lng: longitude,
        page_offset: (page - 1) * limit,
        page_limit: limit
      });

    if (error) {
      console.error('거리 기반 정렬 오류:', error);
      return NextResponse.json(
        { error: '게시물 조회에 실패했습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      posts: posts || [],
      pagination: {
        page,
        limit,
        hasMore: posts && posts.length === limit
      }
    });

  } catch (error) {
    console.error('거리 기반 정렬 API 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
