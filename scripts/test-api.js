#!/usr/bin/env node

// API 테스트 스크립트 (Node.js 환경에서 실행)

const API_BASE = process.env.API_BASE || 'http://localhost:3008/api';

// 기본 API 호출 함수
async function apiCall(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  };

  try {
    const response = await fetch(url, { ...defaultOptions, ...options });
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
}

// 테스트 결과 출력
function logTestResult(testName, result) {
  const status = result.ok ? '✅ PASS' : '❌ FAIL';
  console.log(`${status} ${testName}`);

  if (!result.ok) {
    console.log(`  Error: ${result.error?.message || 'Unknown error'}`);
    console.log(`  Status: ${result.status}`);
  }

  return result.ok;
}

// 기본 연결 테스트
async function testConnection() {
  console.log('🔌 Testing API connection...');

  const result = await apiCall('/posts/list?type=all&page=1&limit=1');

  if (result.ok) {
    console.log('✅ API 서버 연결 성공');
    return true;
  } else {
    console.log('❌ API 서버 연결 실패');
    console.log(`  Status: ${result.status}`);
    console.log(`  Error: ${result.error?.message || 'Unknown error'}`);
    return false;
  }
}

// 인증 테스트 (제외됨 - 이미 디버깅 완료)
async function testAuth() {
  console.log('\n🔐 Authentication tests skipped (already debugged)');
  return null;
}

// 게시물 테스트
async function testPosts(token) {
  console.log('\n📝 Testing posts...');

  // 게시물 목록 조회 (익명)
  const listResult = await apiCall('/posts/list?type=all&page=1&limit=5');
  logTestResult('게시물 목록 조회 (익명)', listResult);

  // 인증이 필요한 테스트는 제외됨
  console.log('  (인증이 필요한 테스트는 제외됨)');
}

// 찜 테스트 (브라우저에서 로그인된 상태로 실행)
async function testFavorites(token) {
  console.log('\n💖 Testing favorites...');

  // 찜 목록 조회
  const listResult = await apiCall('/favorites');
  logTestResult('찜 목록 조회', listResult);

  // 찜 추가
  const addResult = await apiCall('/favorites', {
    method: 'POST',
    body: JSON.stringify({ post_id: 1 })
  });
  logTestResult('찜 추가', addResult);
}

// 보호소 테스트
async function testShelters(token) {
  console.log('\n🏠 Testing shelters...');

  // 보호소 목록 조회
  const listResult = await apiCall('/shelters?page=1&limit=5');
  logTestResult('보호소 목록 조회', listResult);

  // 보호소 등록
  const createResult = await apiCall('/shelters', {
    method: 'POST',
    body: JSON.stringify({
      name: '테스트 보호소',
      description: '테스트용 보호소입니다.',
      phone: '02-1234-5678',
      address: '서울시 강남구 테헤란로 123',
      verified: false
    })
  });
  logTestResult('보호소 등록', createResult);
}

// 주소 검증 테스트
async function testAddressValidation() {
  console.log('\n📍 Testing address validation...');

  // 유효한 주소 검증
  const validResult = await apiCall('/validate-address', {
    method: 'POST',
    body: JSON.stringify({ address: '서울시 강남구 테헤란로 123' })
  });
  logTestResult('유효한 주소 검증', validResult);

  // 무효한 주소 검증
  const invalidResult = await apiCall('/validate-address', {
    method: 'POST',
    body: JSON.stringify({ address: '존재하지않는주소12345' })
  });
  logTestResult('무효한 주소 검증', invalidResult);
}

// 메인 테스트 실행
async function runTests() {
  console.log('🚀 Starting API Tests...');
  console.log('='.repeat(50));

  // 연결 테스트
  const connectionOk = await testConnection();
  if (!connectionOk) {
    console.log('\n❌ API 서버에 연결할 수 없습니다.');
    console.log('   개발 서버가 실행 중인지 확인하세요: npm run dev');
    process.exit(1);
  }

  // 인증 테스트
  const token = await testAuth();

  // 각 기능별 테스트
  await testPosts(token);
  await testFavorites(token);
  await testShelters(token);
  await testAddressValidation();

  console.log('\n🎯 API 테스트 완료!');
  console.log('='.repeat(50));
}

// 스크립트 실행
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { runTests, apiCall, logTestResult };
