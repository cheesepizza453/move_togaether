'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { User, Settings, Heart, MessageCircle, LogOut, Edit } from 'lucide-react';

const MyPage = () => {
  const { user, profile, loading, signOut, createProfileManually } = useAuth();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // 로그인 상태 확인
  useEffect(() => {
    console.log('마이페이지 - 인증 상태:', { user, profile, loading });

    if (!loading && !user) {
      console.log('마이페이지 - 로그인되지 않음, 로그인 페이지로 리다이렉트');
      // 로그인되지 않은 경우 로그인 페이지로 리다이렉트
      router.push('/login');
    }
  }, [user, loading, router]);

  // 로그아웃 처리
  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      console.log('마이페이지에서 로그아웃 시작');
      const result = await signOut();
      console.log('로그아웃 결과:', result);

      // 로그아웃 성공 여부와 관계없이 메인 페이지로 이동
      // (상태 초기화는 signOut에서 이미 처리됨)
      router.push('/');
    } catch (error) {
      console.error('로그아웃 오류:', error);
      // 오류가 발생해도 메인 페이지로 이동
      router.push('/');
    } finally {
      setIsLoggingOut(false);
    }
  };

  // 로딩 중이거나 로그인되지 않은 경우
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500 mx-auto mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // 리다이렉트 중
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-[#FFDD44] px-6 py-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-black">마이페이지</h1>
            <p className="text-gray-700 mt-1">
              안녕하세요, {profile?.display_name || user.email}님!
            </p>
          </div>
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
            <User size={32} className="text-gray-600" />
          </div>
        </div>
      </div>

      {/* 사용자 정보 카드 */}
      <div className="px-6 py-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">프로필 정보</h2>
            <button className="text-yellow-600 hover:text-yellow-700">
              <Edit size={20} />
            </button>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-sm text-gray-500">닉네임</label>
              <p className="text-gray-800">{profile?.display_name || '미설정'}</p>
            </div>

            <div>
              <label className="text-sm text-gray-500">이메일</label>
              <p className="text-gray-800">{user.email}</p>
            </div>

            <div>
              <label className="text-sm text-gray-500">연락처</label>
              <p className="text-gray-800">{profile?.phone || '미설정'}</p>
            </div>

            {profile?.bio && (
              <div>
                <label className="text-sm text-gray-500">소개</label>
                <p className="text-gray-800">{profile.bio}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 메뉴 리스트 */}
      <div className="px-6 pb-6">
        <div className="space-y-2">
          {/* 내 게시글 */}
          <Link href="/mypage/posts" className="flex items-center p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <MessageCircle size={24} className="text-gray-600 mr-4" />
            <div className="flex-1">
              <h3 className="font-medium text-gray-800">내 게시글</h3>
              <p className="text-sm text-gray-500">작성한 이동봉사 게시글 관리</p>
            </div>
          </Link>

          {/* 찜한 게시글 */}
          <Link href="/mypage/favorites" className="flex items-center p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <Heart size={24} className="text-gray-600 mr-4" />
            <div className="flex-1">
              <h3 className="font-medium text-gray-800">찜한 게시글</h3>
              <p className="text-sm text-gray-500">관심 있는 이동봉사 게시글</p>
            </div>
          </Link>

          {/* 설정 */}
          <Link href="/mypage/settings" className="flex items-center p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <Settings size={24} className="text-gray-600 mr-4" />
            <div className="flex-1">
              <h3 className="font-medium text-gray-800">설정</h3>
              <p className="text-sm text-gray-500">계정 및 알림 설정</p>
            </div>
          </Link>

          {/* 프로필 생성 버튼 (디버깅용) */}
          {user && !profile && (
            <button
              onClick={createProfileManually}
              className="w-full flex items-center p-4 bg-white border border-yellow-200 rounded-lg hover:bg-yellow-50 transition-colors"
            >
              <User size={24} className="text-yellow-600 mr-4" />
              <div className="flex-1 text-left">
                <h3 className="font-medium text-yellow-600">프로필 생성</h3>
                <p className="text-sm text-gray-500">user_metadata에서 프로필 생성</p>
              </div>
            </button>
          )}

          {/* 로그아웃 */}
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="w-full flex items-center p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <LogOut size={24} className="text-red-600 mr-4" />
            <div className="flex-1 text-left">
              <h3 className="font-medium text-red-600">로그아웃</h3>
              <p className="text-sm text-gray-500">
                {isLoggingOut ? '로그아웃 중...' : '계정에서 로그아웃'}
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* 하단 여백 */}
      <div className="h-20"></div>
    </div>
  );
};

export default MyPage;