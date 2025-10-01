import { NextResponse } from 'next/server';
import { createServerSupabaseClient, createAdminSupabaseClient } from '@/lib/supabase';

export async function POST(request) {
  const startTime = Date.now();
  try {
    console.log('=== 봉사자 등록 API 시작 ===');
    console.log('요청 시간:', new Date().toISOString());
    console.log('요청 헤더:', Object.fromEntries(request.headers.entries()));

    // 요청 본문 파싱
    console.log('요청 본문 파싱 시작...');
    const requestBody = await request.json();
    console.log('요청 본문 파싱 완료');

    const {
      title,
      departureAddress,
      departureLat,
      departureLng,
      arrivalAddress,
      arrivalLat,
      arrivalLng,
      description,
      name,
      photo,
      size,
      breed,
      relatedPostLink
    } = requestBody;

    console.log('받은 데이터:', {
      title,
      departureAddress,
      departureLat,
      departureLng,
      arrivalAddress,
      arrivalLat,
      arrivalLng,
      description,
      name,
      size,
      breed,
      relatedPostLink,
      hasPhoto: !!photo,
      photoLength: photo ? photo.length : 0
    });

    // 필수 필드 검증
    if (!title || !departureAddress || !arrivalAddress || !name || !size) {
      console.log('필수 필드 누락:', { title, departureAddress, arrivalAddress, name, size });
      return NextResponse.json({
        success: false,
        error: '필수 정보가 누락되었습니다.'
      }, { status: 400 });
    }

    // 클라이언트에서 전달받은 인증 헤더 추출
    const authHeader = request.headers.get('authorization');
    const apikeyHeader = request.headers.get('apikey');
    const userIdHeader = request.headers.get('x-user-id');

    console.log('인증 헤더:', {
      hasAuth: !!authHeader,
      hasApikey: !!apikeyHeader,
      hasUserId: !!userIdHeader,
      authLength: authHeader?.length,
      userId: userIdHeader
    });

    if (!apikeyHeader) {
      console.log('API 키 헤더 누락');
      return NextResponse.json({
        success: false,
        error: 'API 키가 필요합니다.'
      }, { status: 401 });
    }

    let supabase, user;

    if (authHeader) {
      // Authorization 헤더가 있으면 인증된 사용자로 처리
      console.log('인증된 사용자로 처리');
      const accessToken = authHeader.replace('Bearer ', '');
      supabase = createServerSupabaseClient(accessToken);

      // JWT 토큰에서 사용자 정보 추출
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
      console.log('사용자 인증 결과:', { user: !!authUser, error: authError?.message });

      if (authError || !authUser) {
        console.log('인증 실패:', authError);
        return NextResponse.json({
          success: false,
          error: '유효하지 않은 인증 정보입니다.'
        }, { status: 401 });
      }

      user = authUser;
    } else if (userIdHeader) {
      // X-User-ID 헤더가 있으면 해당 사용자로 처리
      console.log('X-User-ID 헤더로 사용자 처리:', userIdHeader);
      supabase = createServerSupabaseClient();
      user = { id: userIdHeader };
    } else {
      // 인증 정보가 없으면 에러
      console.log('인증 정보 없음');
      return NextResponse.json({
        success: false,
        error: '인증이 필요합니다.'
      }, { status: 401 });
    }

    // 사용자 프로필 ID 가져오기
    console.log('사용자 프로필 조회 시작, user.id:', user.id);
    const { data: userProfile, error: profileError } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('auth_user_id', user.id)
      .single();

    console.log('사용자 프로필 조회 결과:', { userProfile, error: profileError?.message });

    if (profileError || !userProfile) {
      console.log('사용자 프로필 없음:', profileError);
      return NextResponse.json({
        success: false,
        error: '사용자 프로필을 찾을 수 없습니다.'
      }, { status: 404 });
    }

    // 사진이 있는 경우 Supabase Storage에 업로드
    let images = null;
    if (photo) {
      try {
        // Base64 데이터를 Blob으로 변환
        const base64Data = photo.split(',')[1];
        const buffer = Buffer.from(base64Data, 'base64');

        // 파일명 생성 (타임스탬프 + 랜덤 문자열)
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(2, 15);
        const fileName = `posts/${timestamp}_${randomString}.jpg`;

        // Authorization 헤더가 있으면 일반 클라이언트 사용, 없으면 관리자 클라이언트 사용
        const storageSupabase = authHeader ? supabase : createAdminSupabaseClient();

        // Supabase Storage에 업로드
        const { error: uploadError } = await storageSupabase.storage
          .from('post-images')
          .upload(fileName, buffer, {
            contentType: 'image/jpeg',
            upsert: false
          });

        if (uploadError) {
          console.error('사진 업로드 오류:', uploadError);
          // 사진 업로드 실패 시에도 계속 진행 (사진 없이 등록)
          console.log('사진 업로드 실패했지만 계속 진행합니다.');
          images = null;
        } else {
          // 공개 URL 생성
          const { data: urlData } = storageSupabase.storage
            .from('post-images')
            .getPublicUrl(fileName);

          images = [urlData.publicUrl];
          console.log('사진 업로드 성공:', urlData.publicUrl);
        }
      } catch (error) {
        console.error('사진 처리 오류:', error);
        // 사진 처리 오류 시에도 계속 진행 (사진 없이 등록)
        console.log('사진 처리 오류가 발생했지만 계속 진행합니다.');
        images = null;
      }
    }

    // 기존 posts 테이블에 저장
    const { data, error } = await supabase
      .from('posts')
      .insert([
        {
          user_id: userProfile.id,
          title,
          description: description || '',
          departure_address: departureAddress,
          departure_lat: departureLat,
          departure_lng: departureLng,
          arrival_address: arrivalAddress,
          arrival_lat: arrivalLat,
          arrival_lng: arrivalLng,
          dog_name: name,
          dog_size: size,
          dog_breed: breed || '',
          images: images,
          related_link: relatedPostLink || null,
          deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30일 후
          status: 'active'
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('데이터베이스 저장 오류:', error);
      return NextResponse.json({
        success: false,
        error: '데이터 저장에 실패했습니다.'
      }, { status: 500 });
    }

    const endTime = Date.now();
    console.log('=== 봉사자 등록 API 성공 ===');
    console.log('처리 시간:', endTime - startTime, 'ms');
    console.log('등록된 데이터 ID:', data?.id);

    return NextResponse.json({
      success: true,
      data,
      message: '이동 봉사 요청이 성공적으로 등록되었습니다.'
    });

  } catch (error) {
    const endTime = Date.now();
    console.error('=== 봉사자 등록 API 오류 ===');
    console.error('처리 시간:', endTime - startTime, 'ms');
    console.error('오류 상세:', error);
    console.error('오류 스택:', error.stack);

    return NextResponse.json({
      success: false,
      error: '서버 오류가 발생했습니다.'
    }, { status: 500 });
  }
}
