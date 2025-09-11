'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/hooks/useAuth';
import { ChevronLeft, Edit } from 'lucide-react';

const MyPage = () => {
  const { user, profile, loading, signOut } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('지원');

  // 로그인 상태 확인
  useEffect(() => {
    console.log('마이페이지 - 인증 상태:', { user, profile, loading });

    if (!loading && !user) {
      console.log('마이페이지 - 로그인되지 않음, 로그인 페이지로 리다이렉트');
      // 로그인되지 않은 경우 로그인 페이지로 리다이렉트
      router.push('/login');
    }
  }, [user, loading, router]);

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
      <div className="flex items-center justify-between px-4 py-3 bg-white">
        <button
          onClick={() => router.back()}
          className="text-gray-600 text-lg"
        >
          <span className="flex items-center">
            <ChevronLeft size={20} className="text-gray-600 display-inline-block" />
            <span className="ml-1">마이페이지</span>
          </span>
        </button>
        <div className="w-6"></div>
      </div>

      {/* 프로필 정보 카드 */}
      <div className="px-4 py-6">
        <div className="bg-[#FFE066] rounded-2xl p-6">
          <div className="flex items-center">
            {/* 프로필 이미지 */}
            <div className="w-20 h-20 rounded-full overflow-hidden bg-white flex-shrink-0 mr-4">
              <Image
                src={profile?.profile_image_url || '/img/default_profile.jpg'}
                alt="프로필"
                width={80}
                height={80}
                className="w-full h-full object-cover"
              />
            </div>

            {/* 사용자 정보 */}
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-bold text-gray-800 mb-1">
                {profile?.display_name || '사용자'}
              </h2>
              <p className="text-sm text-gray-600 mb-1">
                {profile?.phone || '010-0000-0000'}
              </p>
              <p className="text-xs text-gray-500 leading-relaxed">
                {profile?.bio || '소개글이 없습니다.'}
              </p>
            </div>
          </div>

          {/* 내 정보 수정 버튼 */}
          <button className="w-full mt-4 bg-yellow-400 text-gray-800 py-3 px-4 rounded-xl font-semibold text-center hover:bg-yellow-500 transition-colors">
            내 정보 수정
          </button>
        </div>
      </div>

      {/* 탭 메뉴 */}
      <div className="px-4 pb-6">
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('지원')}
            className={`flex-1 py-3 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === '지원'
                ? 'bg-white text-gray-800 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            지원
          </button>
          <button
            onClick={() => setActiveTab('작성')}
            className={`flex-1 py-3 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === '작성'
                ? 'bg-white text-gray-800 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            작성
          </button>
        </div>
      </div>

      {/* 탭 콘텐츠 */}
      <div className="px-4 pb-6">
        {activeTab === '지원' && (
          <div className="space-y-4">
            {/* 지원한 게시글 목록 */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center mb-3">
                <div className="w-12 h-12 bg-gray-100 rounded-lg mr-3 flex-shrink-0"></div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-gray-800 mb-1 line-clamp-2">
                    서울에서 대구까지 입양 예정 강아지 호치의 이동을 도와 주실 보호자 구합니다.
                  </h3>
                  <p className="text-xs text-gray-500 mb-2">호치 / 소형견</p>
                  <p className="text-xs text-gray-400">25/01/01</p>
                </div>
                <div className="ml-2">
                  <span className="inline-block bg-red-100 text-red-600 text-xs px-2 py-1 rounded-full font-medium">
                    D-10
                  </span>
                </div>
              </div>
              <button className="w-full bg-yellow-400 text-gray-800 py-2 px-4 rounded-xl text-sm font-medium hover:bg-yellow-500 transition-colors">
                24.10.01 지원
              </button>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center mb-3">
                <div className="w-12 h-12 bg-gray-100 rounded-lg mr-3 flex-shrink-0"></div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-gray-800 mb-1 line-clamp-2">
                    강아지 이동 봉사 구합니다.
                  </h3>
                  <p className="text-xs text-gray-500 mb-2">통통치 / 중형견</p>
                  <p className="text-xs text-gray-400">25/01/01</p>
                </div>
                <div className="ml-2">
                  <span className="inline-block bg-green-100 text-green-600 text-xs px-2 py-1 rounded-full font-medium">
                    입양
                  </span>
                </div>
              </div>
              <button className="w-full bg-yellow-400 text-gray-800 py-2 px-4 rounded-xl text-sm font-medium hover:bg-yellow-500 transition-colors">
                24.10.01 지원
              </button>
            </div>
          </div>
        )}

        {activeTab === '작성' && (
          <div className="space-y-4">
            {/* 작성한 게시글 목록 */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center mb-3">
                <div className="w-12 h-12 bg-gray-100 rounded-lg mr-3 flex-shrink-0"></div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-gray-800 mb-1 line-clamp-2">
                    작성한 게시글이 없습니다.
                  </h3>
                  <p className="text-xs text-gray-500">새로운 이동봉사 게시글을 작성해보세요.</p>
                </div>
              </div>
              <Link
                href="/write"
                className="w-full bg-yellow-400 text-gray-800 py-2 px-4 rounded-xl text-sm font-medium hover:bg-yellow-500 transition-colors text-center block"
              >
                게시글 작성하기
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* 하단 여백 */}
      <div className="h-20"></div>
    </div>
  );
};

export default MyPage;