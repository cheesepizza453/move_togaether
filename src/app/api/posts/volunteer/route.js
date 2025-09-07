import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export async function POST(request) {
  try {
    const {
      title,
      departureAddress,
      arrivalAddress,
      description,
      name,
      photo,
      size,
      breed,
      relatedPostLink
    } = await request.json();

    // 필수 필드 검증
    if (!title || !departureAddress || !arrivalAddress || !name || !size) {
      return NextResponse.json({
        success: false,
        error: '필수 정보가 누락되었습니다.'
      }, { status: 400 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    // 현재 사용자 정보 가져오기
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({
        success: false,
        error: '인증이 필요합니다.'
      }, { status: 401 });
    }

    // JWT 토큰에서 사용자 ID 추출
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

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

        // Supabase Storage에 업로드
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('post-images')
          .upload(fileName, buffer, {
            contentType: 'image/jpeg',
            upsert: false
          });

        if (uploadError) {
          console.error('사진 업로드 오류:', uploadError);
          return NextResponse.json({
            success: false,
            error: '사진 업로드에 실패했습니다.'
          }, { status: 500 });
        }

        // 공개 URL 생성
        const { data: urlData } = supabase.storage
          .from('post-images')
          .getPublicUrl(fileName);

        images = [urlData.publicUrl];
      } catch (error) {
        console.error('사진 처리 오류:', error);
        return NextResponse.json({
          success: false,
          error: '사진 처리 중 오류가 발생했습니다.'
        }, { status: 500 });
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
          arrival_address: arrivalAddress,
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

    return NextResponse.json({
      success: true,
      data,
      message: '이동 봉사 요청이 성공적으로 등록되었습니다.'
    });

  } catch (error) {
    console.error('API 오류:', error);
    return NextResponse.json({
      success: false,
      error: '서버 오류가 발생했습니다.'
    }, { status: 500 });
  }
}
