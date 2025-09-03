import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function POST(request) {
  try {
    const { userInfo, display_name, phone, phone_visible, bio, instagram, naver_cafe, kakao_openchat } = await request.json();

    if (!userInfo || !userInfo.email) {
      return NextResponse.json(
        { success: false, error: '사용자 정보가 필요합니다.' },
        { status: 400 }
      );
    }

    console.log('카카오톡 회원가입 요청:', { userInfo, display_name });

    // Supabase 클라이언트 생성
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // 이메일 중복 체크
    const { data: existingProfile, error: checkError } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('email', userInfo.email.toLowerCase())
      .eq('is_deleted', false)
      .single();

    if (existingProfile) {
      return NextResponse.json(
        { success: false, error: '이미 가입된 이메일입니다.' },
        { status: 400 }
      );
    }

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('이메일 중복 체크 오류:', checkError);
      return NextResponse.json(
        { success: false, error: '이메일 확인 중 오류가 발생했습니다.' },
        { status: 500 }
      );
    }

    // Supabase Auth로 카카오톡 사용자 생성
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: userInfo.email.toLowerCase(),
      password: `kakao_${userInfo.id}_${Date.now()}`, // 임시 비밀번호
      options: {
        data: {
          provider: 'kakao',
          kakao_id: userInfo.id,
          kakao_nickname: userInfo.nickname,
          kakao_profile_image: userInfo.profile_image,
          display_name,
          phone,
          phone_visible,
          bio,
          instagram,
          naver_cafe,
          kakao_openchat,
          profile_created: false
        }
      }
    });

    if (authError) {
      console.error('Supabase Auth 회원가입 오류:', authError);

      let errorMessage = '회원가입 중 오류가 발생했습니다.';

      if (authError.message.includes('already registered') ||
          authError.message.includes('already been registered') ||
          authError.message.includes('User already registered')) {
        errorMessage = '이미 가입된 이메일입니다.';
      }

      return NextResponse.json(
        { success: false, error: errorMessage },
        { status: 400 }
      );
    }

    // user_profiles 테이블에 프로필 생성
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .insert({
        auth_user_id: authData.user.id,
        email: userInfo.email.toLowerCase(),
        display_name,
        phone: phone || null,
        phone_visible: phone_visible || false,
        bio: bio || null,
        instagram: instagram || null,
        naver_cafe: naver_cafe || null,
        kakao_openchat: kakao_openchat || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (profileError) {
      console.error('프로필 생성 오류:', profileError);
      // 프로필 생성 실패해도 회원가입은 성공으로 처리 (나중에 수정 가능)
    } else {
      console.log('카카오톡 프로필 생성 성공:', profile.id);
    }

    // user_metadata에 프로필 생성 완료 플래그 업데이트
    const { error: updateError } = await supabase.auth.updateUser({
      data: { profile_created: true }
    });

    if (updateError) {
      console.error('메타데이터 업데이트 오류:', updateError);
    }

    // 응답 데이터 구성
    const userData = {
      id: authData.user.id,
      email: authData.user.email,
      created_at: authData.user.created_at
    };

    return NextResponse.json({
      success: true,
      message: '카카오톡 회원가입이 완료되었습니다.',
      user: userData,
      profile: profile
    });

  } catch (error) {
    console.error('카카오톡 회원가입 처리 중 오류:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
