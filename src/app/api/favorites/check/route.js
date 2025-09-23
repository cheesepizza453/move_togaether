import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get('postId');

    if (!postId) {
      return NextResponse.json({
        success: false,
        error: '게시물 ID가 필요합니다.'
      }, { status: 400 });
    }

    // 클라이언트에서 전달받은 인증 헤더 추출
    const authHeader = request.headers.get('authorization');
    const apikeyHeader = request.headers.get('apikey');

    if (!authHeader || !apikeyHeader) {
      return NextResponse.json({
        success: false,
        error: '인증이 필요합니다.'
      }, { status: 401 });
    }

    // Supabase 클라이언트를 인증 토큰과 함께 생성
    const accessToken = authHeader.replace('Bearer ', '');
    const supabase = createServerSupabaseClient(accessToken);

    // JWT 토큰에서 사용자 정보 추출
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({
        success: false,
        error: '유효하지 않은 인증 정보입니다.'
      }, { status: 401 });
    }

    // 사용자 프로필 ID 가져오기
    const { data: userProfile, error: profileError } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('auth_user_id', user.id)
      .single();

    if (profileError || !userProfile) {
      return NextResponse.json({
        success: false,
        error: '사용자 프로필을 찾을 수 없습니다.'
      }, { status: 404 });
    }

    // 즐겨찾기 상태 확인
    const { data: favoriteData, error: favoriteError } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', userProfile.id)
      .eq('post_id', postId)
      .single();

    if (favoriteError && favoriteError.code !== 'PGRST116') {
      console.error('즐겨찾기 확인 오류:', favoriteError);
      return NextResponse.json({
        success: false,
        error: '즐겨찾기 상태를 확인하는데 실패했습니다.'
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      isFavorite: !!favoriteData
    });

  } catch (error) {
    console.error('즐겨찾기 확인 API 오류:', error);
    return NextResponse.json({
      success: false,
      error: '서버 오류가 발생했습니다.'
    }, { status: 500 });
  }
}

