import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { code } = await request.json();

    if (!code) {
      return NextResponse.json(
        { success: false, error: '인증 코드가 필요합니다.' },
        { status: 400 }
      );
    }

    // 카카오톡 액세스 토큰 요청
    const tokenResponse = await fetch('https://kauth.kakao.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: process.env.NEXT_PUBLIC_KAKAO_JS_KEY,
        redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/signup/kakao`,
        code: code,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok) {
      console.error('카카오톡 토큰 요청 실패:', tokenData);
      return NextResponse.json(
        { success: false, error: '카카오톡 인증에 실패했습니다.' },
        { status: 400 }
      );
    }

    // 카카오톡 사용자 정보 요청
    const userResponse = await fetch('https://kapi.kakao.com/v2/user/me', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
        'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
      },
    });

    const userData = await userResponse.json();

    if (!userResponse.ok) {
      console.error('카카오톡 사용자 정보 요청 실패:', userData);
      return NextResponse.json(
        { success: false, error: '사용자 정보를 가져올 수 없습니다.' },
        { status: 400 }
      );
    }

    // 사용자 정보 정리
    const userInfo = {
      id: userData.id,
      email: userData.kakao_account?.email,
      nickname: userData.kakao_account?.profile?.nickname,
      name: userData.kakao_account?.name,
      profile_image: userData.kakao_account?.profile?.profile_image_url,
      thumbnail_image: userData.kakao_account?.profile?.thumbnail_image_url,
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
    };

    // 이메일이 필수인데 없는 경우
    if (!userInfo.email) {
      return NextResponse.json(
        {
          success: false,
          error: '이메일 정보가 필요합니다. 카카오톡 계정 설정에서 이메일을 공개해주세요.'
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      userInfo,
      message: '카카오톡 인증이 완료되었습니다.'
    });

  } catch (error) {
    console.error('카카오톡 콜백 처리 오류:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
