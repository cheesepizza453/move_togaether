import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    console.log('카카오 콜백 API 호출됨');

    const body = await request.json();
    console.log('요청 body:', body);

    const { code } = body;

    if (!code) {
      console.error('인증 코드가 없음:', body);
      return NextResponse.json(
        { success: false, error: '인증 코드가 필요합니다.' },
        { status: 400 }
      );
    }

    console.log('카카오 인증 코드:', code);

    // 환경변수 확인
    const clientId = process.env.NEXT_PUBLIC_KAKAO_JS_KEY;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    const redirectUri = `${appUrl}/signup/kakao`;

    console.log('환경변수 확인:');
    console.log('- clientId:', clientId ? '설정됨' : '없음');
    console.log('- appUrl:', appUrl);
    console.log('- redirectUri:', redirectUri);

    if (!clientId) {
      console.error('KAKAO_JS_KEY 환경변수가 설정되지 않음');
      return NextResponse.json(
        { success: false, error: '서버 설정 오류가 발생했습니다.' },
        { status: 500 }
      );
    }

    if (!appUrl) {
      console.error('NEXT_PUBLIC_APP_URL 환경변수가 설정되지 않음');
      return NextResponse.json(
        { success: false, error: '서버 설정 오류가 발생했습니다.' },
        { status: 500 }
      );
    }

    // 카카오톡 액세스 토큰 요청
    const tokenParams = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: clientId,
      redirect_uri: redirectUri,
      code: code,
    });

    console.log('카카오 토큰 요청 파라미터:', tokenParams.toString());

    const tokenResponse = await fetch('https://kauth.kakao.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: tokenParams,
    });

    console.log('카카오 토큰 응답 상태:', tokenResponse.status);

    const tokenData = await tokenResponse.json();
    console.log('카카오 토큰 응답 데이터:', tokenData);

    if (!tokenResponse.ok) {
      console.error('카카오톡 토큰 요청 실패:', {
        status: tokenResponse.status,
        statusText: tokenResponse.statusText,
        data: tokenData
      });
      return NextResponse.json(
        {
          success: false,
          error: `카카오톡 인증에 실패했습니다. (${tokenData.error || '알 수 없는 오류'})`,
          details: tokenData
        },
        { status: 400 }
      );
    }

    // 카카오톡 사용자 정보 요청
    console.log('카카오 사용자 정보 요청 시작');

    const userResponse = await fetch('https://kapi.kakao.com/v2/user/me', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
        'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
      },
    });

    console.log('카카오 사용자 정보 응답 상태:', userResponse.status);

    const userData = await userResponse.json();
    console.log('카카오 사용자 정보 응답 데이터:', userData);

    if (!userResponse.ok) {
      console.error('카카오톡 사용자 정보 요청 실패:', {
        status: userResponse.status,
        statusText: userResponse.statusText,
        data: userData
      });
      return NextResponse.json(
        {
          success: false,
          error: `사용자 정보를 가져올 수 없습니다. (${userData.msg || '알 수 없는 오류'})`,
          details: userData
        },
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
    console.error('카카오톡 콜백 처리 오류:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    return NextResponse.json(
      {
        success: false,
        error: '서버 오류가 발생했습니다.',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}
