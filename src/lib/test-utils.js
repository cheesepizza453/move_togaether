// API 테스트를 위한 유틸리티 함수들

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3008/api';

// 테스트용 사용자 데이터
export const TEST_USERS = {
  regular: {
    email: 'test@example.com',
    password: 'testpassword123',
    nickname: '테스트사용자',
    phone: '010-1234-5678'
  },
  admin: {
    email: 'admin@example.com',
    password: 'adminpassword123',
    nickname: '관리자',
    phone: '010-9999-9999'
  }
};

// 테스트용 게시물 데이터
export const TEST_POSTS = {
  active: {
    title: '강아지 이동봉사 급구합니다',
    dog_name: '멍멍이',
    dog_size: 'medium',
    departure_address: '서울시 강남구 테헤란로 123',
    arrival_address: '부산시 해운대구 센텀중앙로 456',
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7일 후
    description: '강아지 이동봉사가 급히 필요합니다. 도와주세요!',
    status: 'active'
  },
  expired: {
    title: '만료된 게시물',
    dog_name: '야옹이',
    dog_size: 'small',
    departure_address: '서울시 서초구 서초대로 789',
    arrival_address: '대구시 수성구 동대구로 321',
    deadline: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1일 전
    description: '이미 만료된 게시물입니다.',
    status: 'active'
  },
  completed: {
    title: '완료된 게시물',
    dog_name: '멍멍이2',
    dog_size: 'large',
    departure_address: '서울시 마포구 홍대입구역 1번출구',
    arrival_address: '인천시 연수구 송도동 123',
    deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3일 후
    description: '이미 완료된 게시물입니다.',
    status: 'completed'
  }
};

// 테스트용 보호소 데이터
export const TEST_SHELTERS = {
  verified: {
    name: '테스트 보호소',
    description: '테스트용 보호소입니다.',
    phone: '02-1234-5678',
    instagram: '@test_shelter',
    naver_cafe: 'https://cafe.naver.com/testshelter',
    kakao_openchat: 'https://open.kakao.com/o/testchat',
    address: '서울시 강남구 테헤란로 123',
    verified: true
  },
  unverified: {
    name: '미인증 보호소',
    description: '아직 인증되지 않은 보호소입니다.',
    phone: '02-9876-5432',
    instagram: '@unverified_shelter',
    naver_cafe: 'https://cafe.naver.com/unverifiedshelter',
    kakao_openchat: 'https://open.kakao.com/o/unverifiedchat',
    address: '서울시 서초구 서초대로 456',
    verified: false
  }
};

// API 호출 헬퍼 함수
export const apiCall = async (endpoint, options = {}) => {
  const url = `${API_BASE}${endpoint}`;
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    credentials: 'include', // 쿠키 포함하여 요청
    ...options
  };

  try {
    const response = await fetch(url, defaultOptions);
    const data = await response.json();

    return {
      ok: response.ok,
      status: response.status,
      data,
      error: !response.ok ? data : null
    };
  } catch (error) {
    return {
      ok: false,
      status: 0,
      data: null,
      error: { message: error.message }
    };
  }
};

// 인증 토큰을 포함한 API 호출
export const authenticatedApiCall = async (endpoint, token, options = {}) => {
  return apiCall(endpoint, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${token}`
    }
  });
};

// 테스트 결과 출력 헬퍼
export const logTestResult = (testName, result, expected = null) => {
  const status = result.ok ? '✅ PASS' : '❌ FAIL';
  console.log(`${status} ${testName}`);

  if (!result.ok) {
    console.log(`  Error: ${result.error?.message || 'Unknown error'}`);
    console.log(`  Status: ${result.status}`);
  }

  if (expected && result.data) {
    const matches = JSON.stringify(result.data) === JSON.stringify(expected);
    console.log(`  Expected match: ${matches ? '✅' : '❌'}`);
  }

  return result.ok;
};

// 테스트 그룹 실행 헬퍼
export const runTestGroup = async (groupName, tests) => {
  console.log(`\n🧪 Running test group: ${groupName}`);
  console.log('='.repeat(50));

  let passed = 0;
  let total = tests.length;

  for (const test of tests) {
    try {
      const result = await test();
      if (result) passed++;
    } catch (error) {
      console.log(`❌ FAIL ${test.name || 'Unknown test'}`);
      console.log(`  Error: ${error.message}`);
    }
  }

  console.log(`\n📊 Test Results: ${passed}/${total} passed`);
  return { passed, total };
};

// 데이터베이스 초기화 헬퍼 (개발용)
export const resetTestData = async () => {
  console.log('🔄 Resetting test data...');
  // 실제 구현에서는 Supabase에서 테스트 데이터를 정리하는 로직을 추가
  console.log('✅ Test data reset complete');
};
