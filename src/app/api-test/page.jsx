'use client';

import { useState, useEffect } from 'react';
import { runAllTests, authTests, postsTests, favoritesTests, sheltersTests, applicationsTests, addressTests } from '@/lib/api-tests';
import { runTestGroup, apiCall } from '@/lib/test-utils';

export default function ApiTestPage() {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState('all');
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  const testGroups = {
    all: { name: '전체 테스트', tests: null },
    auth: { name: '인증 테스트', tests: authTests },
    posts: { name: '게시물 테스트', tests: postsTests },
    favorites: { name: '찜 테스트', tests: favoritesTests },
    shelters: { name: '보호소 테스트', tests: sheltersTests },
    applications: { name: '신청 테스트', tests: applicationsTests },
    address: { name: '주소 검증 테스트', tests: addressTests }
  };

  // 인증 상태 확인
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const result = await apiCall('/favorites');
        setIsAuthenticated(result.status !== 401);
      } catch (error) {
        setIsAuthenticated(false);
      }
    };
    checkAuth();
  }, []);

  const runTests = async () => {
    setIsRunning(true);
    setResults(null);

    try {
      let result;
      if (selectedGroup === 'all') {
        result = await runAllTests();
      } else {
        const group = testGroups[selectedGroup];
        result = await runTestGroup(group.name, group.tests);
      }
      setResults(result);
    } catch (error) {
      console.error('Test execution error:', error);
      setResults({ error: error.message });
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">API 테스트 도구</h1>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              테스트 그룹 선택
            </label>
            <select
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={isRunning}
            >
              {Object.entries(testGroups).map(([key, group]) => (
                <option key={key} value={key}>
                  {group.name}
                </option>
              ))}
            </select>
          </div>

          {isAuthenticated === false && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
              <div className="flex items-center">
                <div className="text-red-600 mr-2">⚠️</div>
                <div>
                  <p className="text-red-800 font-medium">로그인이 필요합니다</p>
                  <p className="text-red-700 text-sm">인증이 필요한 API 테스트를 실행하려면 먼저 로그인해주세요.</p>
                </div>
              </div>
            </div>
          )}

          {isAuthenticated === true && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
              <div className="flex items-center">
                <div className="text-green-600 mr-2">✅</div>
                <p className="text-green-800 font-medium">로그인 상태입니다. 모든 API 테스트를 실행할 수 있습니다.</p>
              </div>
            </div>
          )}

          <div className="mb-6">
            <button
              onClick={runTests}
              disabled={isRunning}
              className={`w-full py-3 px-6 rounded-md font-medium ${
                isRunning
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500'
              } text-white transition-colors`}
            >
              {isRunning ? '테스트 실행 중...' : '테스트 실행'}
            </button>
          </div>

          {isRunning && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-3"></div>
                <span className="text-blue-800">테스트를 실행하고 있습니다...</span>
              </div>
            </div>
          )}

          {results && (
            <div className="mt-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">테스트 결과</h2>

              {results.error ? (
                <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-red-800">오류: {results.error}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-md">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-900">총 테스트</span>
                      <span className="text-lg font-bold text-gray-900">
                        {results.totalPassed || results.passed}/{results.totalTests || results.total}
                      </span>
                    </div>
                    <div className="mt-2">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full transition-all duration-300"
                          style={{
                            width: `${((results.totalPassed || results.passed) / (results.totalTests || results.total)) * 100}%`
                          }}
                        ></div>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        성공률: {(((results.totalPassed || results.passed) / (results.totalTests || results.total)) * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>

                  <div className="p-4 bg-white border border-gray-200 rounded-md">
                    <h3 className="font-medium text-gray-900 mb-2">콘솔 로그</h3>
                    <p className="text-sm text-gray-600">
                      자세한 테스트 결과는 브라우저 개발자 도구의 콘솔을 확인하세요.
                    </p>
                    <div className="mt-2 p-3 bg-gray-100 rounded text-xs font-mono">
                      F12 → Console 탭에서 확인
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-md">
            <h3 className="font-medium text-blue-800 mb-2">ℹ️ 테스트 안내</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• 테스트 실행 전에 개발 서버가 실행 중인지 확인하세요 (npm run dev)</li>
              <li>• <strong>브라우저에서 로그인된 상태로 테스트를 실행하세요</strong></li>
              <li>• 인증이 필요한 API들도 테스트됩니다 (찜, 신청, 게시물 생성 등)</li>
              <li>• 데이터베이스에 테스트 데이터가 생성될 수 있습니다</li>
              <li>• 실제 데이터베이스 연결이 필요합니다</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
