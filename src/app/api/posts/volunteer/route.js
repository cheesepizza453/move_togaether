import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';

export async function POST(request) {
  try {
    const requestBody = await request.json();

    const {
      title,
      departureAddress,
      departureSido,
      departureSigungu,
      departureDong,
      arrivalAddress,
      arrivalSido,
      arrivalSigungu,
      arrivalDong,
      description,
      name,
      photo,
      size,
      breed,
      relatedPostLink,
      isOriginal
    } = requestBody;

    // 필수 필드 검증
    if (!title || !departureAddress || !arrivalAddress || !name || !size) {
      return NextResponse.json({
        success: false,
        error: '필수 정보가 누락되었습니다.'
      }, { status: 400 });
    }

    // JWT 인증만 허용 (X-User-ID 헤더 우회 제거)
    const authHeader = request.headers.get('authorization');
    const apikeyHeader = request.headers.get('apikey');

    if (!apikeyHeader) {
      return NextResponse.json({
        success: false,
        error: 'API 키가 필요합니다.'
      }, { status: 401 });
    }

    if (!authHeader) {
      return NextResponse.json({
        success: false,
        error: '인증이 필요합니다.'
      }, { status: 401 });
    }

    const accessToken = authHeader.replace('Bearer ', '');
    const supabase = createServerSupabaseClient(accessToken);

    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
    if (authError || !authUser) {
      return NextResponse.json({
        success: false,
        error: '유효하지 않은 인증 정보입니다.'
      }, { status: 401 });
    }

    // 사용자 프로필 조회
    const { data: userProfile, error: profileError } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('auth_user_id', authUser.id)
      .single();

    if (profileError || !userProfile) {
      return NextResponse.json({
        success: false,
        error: '사용자 프로필을 찾을 수 없습니다.'
      }, { status: 404 });
    }

    // 사진 업로드
    let images = null;
    if (photo) {
      try {
        const base64Data = photo.split(',')[1];
        const buffer = Buffer.from(base64Data, 'base64');
        const fileName = `posts/${Date.now()}_${Math.random().toString(36).substring(2, 15)}.jpg`;

        const { error: uploadError } = await supabase.storage
          .from('post-images')
          .upload(fileName, buffer, { contentType: 'image/jpeg', upsert: false });

        if (!uploadError) {
          const { data: urlData } = supabase.storage.from('post-images').getPublicUrl(fileName);
          images = [urlData.publicUrl];
        }
      } catch {
        // 사진 처리 실패 시 사진 없이 등록 진행
      }
    }

    // DB 저장
    // 사용자 JWT로 저장해 RLS의 "게시물 작성 정책"을 그대로 적용한다.
    const { data, error } = await supabase
      .from('posts')
      .insert([{
        user_id: userProfile.id,
        title,
        description: description || '',
        departure_address: departureAddress,
        departure_sido: departureSido || null,
        departure_sigungu: departureSigungu || null,
        departure_dong: departureDong || null,
        arrival_address: arrivalAddress,
        arrival_sido: arrivalSido || null,
        arrival_sigungu: arrivalSigungu || null,
        arrival_dong: arrivalDong || null,
        dog_name: name,
        dog_size: size,
        dog_breed: breed || '',
        images,
        related_link: relatedPostLink || null,
        is_original: isOriginal !== false,
        post_type: 'volunteer',
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'active'
      }])
      .select()
      .single();

    if (error) {
      console.error('volunteer post insert error:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
      });
      return NextResponse.json({
        success: false,
        error: '데이터 저장에 실패했습니다.'
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data,
      message: '이동 봉사 요청이 성공적으로 등록되었습니다.'
    });

  } catch (error) {
    console.error('volunteer POST error:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
    });
    return NextResponse.json({
      success: false,
      error: '서버 오류가 발생했습니다.'
    }, { status: 500 });
  }
}
