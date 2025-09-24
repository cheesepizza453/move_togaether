import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { lat, lng } = await request.json();

    if (!lat || !lng) {
      return NextResponse.json(
        { success: false, error: '좌표가 제공되지 않았습니다.' },
        { status: 400 }
      );
    }

    // 카카오맵 API 키 가져오기 (REST API 키 사용)
    const apiKey = process.env.KAKAO_MAPS_API_KEY;

    console.log('좌표→주소 변환 API 호출:', { lat, lng });
    console.log('API 키 존재 여부:', !!apiKey);

    if (!apiKey) {
      console.error('카카오맵 API 키가 설정되지 않았습니다.');
      return NextResponse.json(
        { success: false, error: 'API 설정 오류가 발생했습니다.' },
        { status: 500 }
      );
    }

    // 좌표→주소 변환 API 호출
    const coordUrl = `https://dapi.kakao.com/v2/local/geo/coord2address.json?x=${lng}&y=${lat}`;

    console.log('좌표→주소 변환 URL:', coordUrl);

    try {
      const response = await fetch(coordUrl, {
        method: 'GET',
        headers: {
          'Authorization': `KakaoAK ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('좌표→주소 변환 API 응답 상태:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('좌표→주소 변환 API 오류 응답:', errorText);
        throw new Error(`API 호출 실패: ${response.status}`);
      }

      const data = await response.json();
      console.log('좌표→주소 변환 API 응답 데이터:', data);

      if (data.documents && data.documents.length > 0) {
        const document = data.documents[0];
        const address = document.address || document.road_address;

        if (address) {
          const fullAddress = address.address_name ||
            `${address.region_1depth_name} ${address.region_2depth_name} ${address.region_3depth_name}`.trim();

          console.log('변환된 주소:', fullAddress);

          return NextResponse.json({
            success: true,
            address: fullAddress,
            data: address
          });
        }
      }

      return NextResponse.json({
        success: false,
        error: '주소를 찾을 수 없습니다.'
      });

    } catch (apiError) {
      console.error('카카오맵 API 호출 오류:', apiError);
      return NextResponse.json(
        { success: false, error: '주소 변환에 실패했습니다.' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('좌표→주소 변환 API 오류:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
