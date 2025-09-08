import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { address } = await request.json();

    if (!address) {
      return NextResponse.json(
        { success: false, error: '주소가 제공되지 않았습니다.' },
        { status: 400 }
      );
    }

    // 카카오맵 API 키 가져오기 (REST API 키 사용)
    const apiKey = process.env.KAKAO_MAPS_API_KEY;

    console.log('API 키 존재 여부:', !!apiKey);
    console.log('API 키 길이:', apiKey ? apiKey.length : 0);
    console.log('API 키 앞 10자리:', apiKey ? apiKey.substring(0, 10) + '...' : '없음');
    console.log('API 키 전체:', apiKey); // 임시로 전체 키 출력하여 확인

    if (!apiKey) {
      console.error('카카오맵 API 키가 설정되지 않았습니다.');
      return NextResponse.json(
        { success: false, error: 'API 설정 오류가 발생했습니다.' },
        { status: 500 }
      );
    }

    // 장소 검색 API와 주소 검색 API를 모두 시도
    const placeUrl = `https://dapi.kakao.com/v2/local/search/keyword.json?query=${encodeURIComponent(address)}`;
    const addressUrl = `https://dapi.kakao.com/v2/local/search/address.json?query=${encodeURIComponent(address)}`;

    console.log('장소 검색 URL:', placeUrl);
    console.log('주소 검색 URL:', addressUrl);

    // 카카오맵 API 시도
    console.log('카카오맵 API 시도 중...');

    try {
      // 먼저 장소 검색 API 시도
      const placeResponse = await fetch(placeUrl, {
        method: 'GET',
        headers: {
          'Authorization': `KakaoAK ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('장소 검색 API 응답 상태:', placeResponse.status);

      if (placeResponse.ok) {
        const placeData = await placeResponse.json();
        console.log('장소 검색 API 성공 응답:', JSON.stringify(placeData, null, 2));

        if (placeData.documents && placeData.documents.length > 0) {
          console.log('장소 검색 API: 유효한 장소 발견, 개수:', placeData.documents.length);
          console.log('첫 번째 결과:', placeData.documents[0]);
          return NextResponse.json({
            success: true,
            isValid: true,
            message: '유효한 장소입니다.',
            source: 'kakao-place',
            data: placeData.documents[0],
            results: placeData.documents
          });
        } else {
          console.log('장소 검색 API: 검색 결과 없음');
        }
      } else {
        console.log('장소 검색 API 오류:', placeResponse.status, placeResponse.statusText);
      }

      // 장소 검색에서 결과가 없으면 주소 검색 API 시도
      console.log('장소 검색 결과 없음, 주소 검색 API 시도...');
      const response = await fetch(addressUrl, {
        method: 'GET',
        headers: {
          'Authorization': `KakaoAK ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('카카오맵 API 응답 상태:', response.status);
      console.log('카카오맵 API 응답 헤더:', Object.fromEntries(response.headers.entries()));

      if (response.ok) {
        const data = await response.json();
        console.log('카카오맵 API 성공 응답:', JSON.stringify(data, null, 2));

        // AboutBranches.jsx와 동일한 검증 로직
                 if (data.documents && data.documents.length > 0) {
                   console.log('카카오맵 API: 유효한 주소 발견');
                   return NextResponse.json({
                     success: true,
                     isValid: true,
                     message: '유효한 주소입니다.',
                     source: 'kakao',
                     data: data.documents[0], // 첫 번째 결과 반환
                     results: data.documents // 모든 검색 결과 반환
                   });
                 } else {
                   console.log('카카오맵 API: 유효한 주소 없음');
                   return NextResponse.json({
                     success: true,
                     isValid: false,
                     message: '입력한 주소가 유효하지 않습니다.',
                     source: 'kakao',
                     results: []
                   });
                 }
      } else {
        const errorText = await response.text();
        console.error('카카오맵 API 오류:', response.status, response.statusText);
        console.error('카카오맵 API 에러 응답:', errorText);
        throw new Error(`카카오맵 API 오류: ${response.status}`);
      }
    } catch (kakaoError) {
      console.log('카카오맵 API 실패, 기본 검증 사용:', kakaoError.message);

      // 기본적인 주소 형식 검증 (한국 주소 패턴)
      const koreanAddressPattern = /^[가-힣\s\d\-\.]+$/;
      const hasValidStructure = /^[가-힣]+(시|도|구|군|동|로|길)/.test(address);
      const isValid = koreanAddressPattern.test(address) && address.length >= 5 && hasValidStructure;

      console.log('기본 검증 결과:', { isValid, address });

      return NextResponse.json({
        success: true,
        isValid: isValid,
        message: isValid ? '유효한 주소입니다.' : '입력한 주소가 유효하지 않습니다.',
        source: 'fallback'
      });
    }

  } catch (error) {
    console.error('주소 검증 오류:', error);
    return NextResponse.json(
      { success: false, error: '주소 검증 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
