import { NextResponse } from 'next/server';

const REGCODE_API_BASE = 'https://grpc-proxy-server-mkvo6j4wsq-du.a.run.app/v1/regcodes';

const fetchRegcodes = async (params) => {
  const url = new URL(REGCODE_API_BASE);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) url.searchParams.set(key, value);
  });

  const response = await fetch(url, {
    headers: { Accept: 'application/json' },
    next: { revalidate: 60 * 60 * 24 * 7 },
  });

  if (!response.ok) {
    throw new Error(`Regcode API failed: ${response.status}`);
  }

  const data = await response.json();
  return Array.isArray(data.regcodes) ? data.regcodes : [];
};

const toOption = (region, parentName = '') => {
  const label = parentName && region.name.startsWith(`${parentName} `)
    ? region.name.slice(parentName.length + 1)
    : region.name;

  return {
    code: region.code,
    name: label,
    fullName: region.name,
  };
};

const uniqueByCode = (regions) => {
  const seen = new Set();
  return regions.filter((region) => {
    if (seen.has(region.code)) return false;
    seen.add(region.code);
    return true;
  });
};

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const level = searchParams.get('level') || 'sido';
    const sidoCode = searchParams.get('sidoCode');
    const sidoName = searchParams.get('sidoName') || '';
    const sigunguCode = searchParams.get('sigunguCode');
    const sigunguName = searchParams.get('sigunguName') || '';

    if (level === 'sido') {
      const [standardSidos, sejong] = await Promise.all([
        fetchRegcodes({ regcode_pattern: '*00000000' }),
        fetchRegcodes({ regcode_pattern: '36*00000' }),
      ]);

      const regions = uniqueByCode([...standardSidos, ...sejong]);
      return NextResponse.json({ success: true, data: regions.map((region) => toOption(region)) });
    }

    if (level === 'sigungu') {
      if (!sidoCode || !sidoName) {
        return NextResponse.json(
          { success: false, error: '시/도 정보가 필요합니다.' },
          { status: 400 }
        );
      }

      if (sidoCode.startsWith('36')) {
        return NextResponse.json({
          success: true,
          data: [{ code: sidoCode, name: sidoName, fullName: sidoName }],
        });
      }

      const regions = await fetchRegcodes({
        regcode_pattern: `${sidoCode.slice(0, 2)}*00000`,
        is_ignore_zero: 'true',
      });

      return NextResponse.json({
        success: true,
        data: regions.map((region) => toOption(region, sidoName)),
      });
    }

    if (level === 'dong') {
      if (!sigunguCode || !sidoName || !sigunguName) {
        return NextResponse.json(
          { success: false, error: '시/군/구 정보가 필요합니다.' },
          { status: 400 }
        );
      }

      const regions = await fetchRegcodes({
        regcode_pattern: `${sigunguCode.slice(0, 5)}*`,
        is_ignore_zero: 'true',
      });

      const parentName = sidoName === sigunguName ? sidoName : `${sidoName} ${sigunguName}`;
      const eupMyeonDongs = regions.filter((region) => (
        region.code.endsWith('00') && !region.code.endsWith('00000')
      ));

      return NextResponse.json({
        success: true,
        data: eupMyeonDongs.map((region) => toOption(region, parentName)),
      });
    }

    return NextResponse.json(
      { success: false, error: '지원하지 않는 지역 단계입니다.' },
      { status: 400 }
    );
  } catch (error) {
    console.error('regions API error:', error);
    return NextResponse.json(
      { success: false, error: '지역 정보를 불러오지 못했습니다.' },
      { status: 500 }
    );
  }
}
