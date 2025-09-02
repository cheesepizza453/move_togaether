'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

const MyPage = () => {
  const { user, loading, logout, requireAuth } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // 로그인 상태 확인 및 리다이렉트
    requireAuth();
  }, [requireAuth]);

  const handleLogout = () => {
    logout();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto"></div>
          <p className="mt-4 text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // 리다이렉트 중이므로 아무것도 렌더링하지 않음
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* 헤더 */}
      <div className="bg-white shadow-sm border-b border-gray-200 px-4 py-4">
        <h1 className="text-xl font-semibold text-gray-800">마이페이지</h1>
      </div>

      {/* 사용자 정보 */}
      <div className="bg-white border-b border-gray-200 px-4 py-6">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center">
            <span className="text-2xl">👤</span>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-800">{user?.name}</h2>
            <p className="text-gray-600">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* 메뉴 목록 */}
      <div className="bg-white mt-4">
        <div className="px-4">
          <div className="py-4 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 text-gray-600">📝</div>
                <span className="text-gray-800">내 봉사 내역</span>
              </div>
              <div className="text-gray-400">&gt;</div>
            </div>
          </div>

          <div className="py-4 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 text-gray-600">❤️</div>
                <span className="text-gray-800">저장한 봉사</span>
              </div>
              <div className="text-gray-400">&gt;</div>
            </div>
          </div>

          <div className="py-4 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 text-gray-600">⚙️</div>
                <span className="text-gray-800">설정</span>
              </div>
              <div className="text-gray-400">&gt;</div>
            </div>
          </div>

          <div className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 text-gray-600">❓</div>
                <span className="text-gray-800">고객센터</span>
              </div>
              <div className="text-gray-400">&gt;</div>
            </div>
          </div>
        </div>
      </div>

      {/* 로그아웃 버튼 */}
      <div className="px-4 mt-6">
        <button
          onClick={handleLogout}
          className="w-full bg-red-500 text-white font-semibold py-3 rounded-lg hover:bg-red-600 transition-colors"
        >
          로그아웃
        </button>
      </div>
    </div>
  );
};

export default MyPage;
