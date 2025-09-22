'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import moment from 'moment';
import { ChevronLeft, Edit } from 'lucide-react';
import { myPageAPI, handleAPIError } from '@/lib/api-client';
import MyPageCard from '@/components/MyPageCard';

const MyPage = () => {
  const { user, profile, loading, signOut } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('지원');
  const [activeSubTab, setActiveSubTab] = useState('진행중'); // 작성 탭의 하위 탭
  const [myPosts, setMyPosts] = useState([]);
  const [appliedPosts, setAppliedPosts] = useState([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [error, setError] = useState(null);
  const [loadedTabs, setLoadedTabs] = useState(new Set());

  // 탭별 데이터 조회 함수
  const fetchTabData = useCallback(async (tabType, subTabType = null, forceRefresh = false) => {
    const tabKey = subTabType ? `${tabType}-${subTabType}` : tabType;

    // 강제 새로고침이 아닌 경우에만 캐시 확인
    if (!forceRefresh && loadedTabs.has(tabKey)) {
      return; // 이미 로드된 탭은 다시 로드하지 않음
    }

    try {
      setDataLoading(true);
      setError(null);

      if (!user) {
        throw new Error('로그인이 필요합니다.');
      }

      let posts;
      if (tabType === '지원') {
        const result = await myPageAPI.getAppliedPosts();
        posts = result.posts;
      } else {
        // 작성 탭의 경우 하위 탭에 따라 다른 API 호출
        if (subTabType === '진행중') {
          const result = await myPageAPI.getMyPostsInProgress();
          posts = result.posts;
        } else if (subTabType === '종료') {
          const result = await myPageAPI.getMyPostsExpired();
          posts = result.posts;
        } else if (subTabType === '완료') {
          const result = await myPageAPI.getMyPostsCompleted();
          posts = result.posts;
        } else {
          const result = await myPageAPI.getMyPosts();
          posts = result.posts;
        }
      }

      // 데이터 설정 전에 현재 탭이 여전히 활성 상태인지 확인
      if (tabType === '지원') {
        setAppliedPosts(posts || []);
      } else {
        setMyPosts(posts || []);
      }

      // 로드된 탭 기록
      setLoadedTabs(prev => new Set([...prev, tabKey]));

    } catch (err) {
      console.error(`${tabType} 탭 데이터 조회 오류:`, err);
      const errorInfo = handleAPIError(err);
      setError(errorInfo.message);

      // 에러 발생 시 해당 탭의 데이터 초기화
      if (tabType === '지원') {
        setAppliedPosts([]);
      } else {
        setMyPosts([]);
      }
    } finally {
      setDataLoading(false);
    }
  }, [loadedTabs]);

  // 로그인 상태 확인
  useEffect(() => {
    console.log('마이페이지 - 인증 상태:', { user, profile, loading });

    if (!loading && !user) {
      console.log('마이페이지 - 로그인되지 않음, 로그인 페이지로 리다이렉트');
      // 로그인되지 않은 경우 로그인 페이지로 리다이렉트
      router.push('/login');
    }
  }, [user, loading, router]);

  // 활성 탭 변경 시 데이터 조회
  useEffect(() => {
    if (user && profile && activeTab) {
      if (activeTab === '작성') {
        fetchTabData(activeTab, activeSubTab);
      } else {
        fetchTabData(activeTab);
      }
    }
  }, [activeTab, activeSubTab, user, profile, fetchTabData]);

  // 탭 변경 핸들러
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setError(null); // 탭 변경 시 에러 초기화

    // 탭 변경 시 데이터 초기화
    if (tab === '지원') {
      setAppliedPosts([]);
    } else {
      setMyPosts([]);
    }

    if (tab === '작성') {
      // 작성 탭으로 변경 시 기본 하위 탭(진행중)으로 설정
      setActiveSubTab('진행중');
      fetchTabData(tab, '진행중', true); // 강제 새로고침
    } else {
      fetchTabData(tab, null, true); // 강제 새로고침
    }
  };

  // 하위 탭 변경 핸들러
  const handleSubTabChange = (subTab) => {
    setActiveSubTab(subTab);
    setError(null);

    // 하위 탭 변경 시 데이터 초기화
    setMyPosts([]);

    fetchTabData('작성', subTab, true); // 강제 새로고침
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
        <div className="p-6">
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
          <Link
            href="/mypage/edit"
            className="w-full mt-4 bg-[#FFF6D1] text-[#DBA913] py-3 px-4 rounded-[20px] border border-[#DBA108] font-semibold text-center transition-colors block hover:bg-[#FFF0B3]"
          >
            내 정보 수정
          </Link>
        </div>
      </div>

      {/* 탭 메뉴 */}
      <div className="px-[23px] pb-6">
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => handleTabChange('지원')}
            className={`flex-1 py-3 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === '지원'
                ? 'bg-white text-gray-800 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            지원
          </button>
          <button
            onClick={() => handleTabChange('작성')}
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
      <div className="px-[23px] pb-6">
        {activeTab === '지원' && (
          <div className="space-y-4">
            {dataLoading ? (
              <div className="flex justify-center items-center py-8">
                <div className="text-gray-500">지원한 게시물을 불러오는 중...</div>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-8">
                <div className="text-red-500 mb-4">{error}</div>
                <button
                  onClick={() => fetchTabData(activeTab)}
                  className="bg-yellow-400 text-gray-800 py-2 px-4 rounded-xl text-sm font-medium hover:bg-yellow-500 transition-colors"
                >
                  다시 시도
                </button>
              </div>
            ) : appliedPosts.length === 0 ? (
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 text-center">
                <div className="text-gray-500 mb-4">
                  <p className="text-lg font-medium mb-2">지원한 게시물이 없습니다</p>
                  <p className="text-sm">관심 있는 봉사활동에 지원해보세요</p>
                </div>
                <Link
                  href="/"
                  className="inline-block bg-yellow-400 text-gray-800 py-2 px-4 rounded-xl text-sm font-medium hover:bg-yellow-500 transition-colors"
                >
                  봉사활동 보러가기
                </Link>
              </div>
            ) : (
              appliedPosts.map((app) => {
                const post = app.post;
                const dday = getDday(post.deadline);
                const statusBadge = getStatusBadge(post.status, post.deadline);

                return (
                  <div key={app.application_id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                    <div className="flex items-center mb-3">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg mr-3 flex-shrink-0 overflow-hidden">
                        {post.images && post.images.length > 0 ? (
                          <img
                            src={post.images[0]}
                            alt={post.dog_name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                            이미지 없음
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-gray-800 mb-1 line-clamp-2">
                          {post.title}
                        </h3>
                        <p className="text-xs text-gray-500 mb-2">{post.dog_name} / {convertDogSize(post.dog_size)}</p>
                        <p className="text-xs text-gray-400">{formatDate(post.created_at)}</p>
                      </div>
                      <div className="ml-2">
                        <span className={`inline-block text-xs px-2 py-1 rounded-full font-medium ${statusBadge.className}`}>
                          {statusBadge.text}
                        </span>
                      </div>
                    </div>
                    <button className="w-full bg-yellow-400 text-gray-800 py-2 px-4 rounded-xl text-sm font-medium hover:bg-yellow-500 transition-colors">
                      {formatDate(app.application_date)} 지원
                    </button>
                  </div>
                );
              })
            )}
          </div>
        )}

        {activeTab === '작성' && (
          <div className="space-y-4">
            {/* 하위 탭 메뉴 */}
            <div className="flex space-x-6 py-2">
              <button
                onClick={() => handleSubTabChange('진행중')}
                className={`text-sm font-medium transition-colors ${
                  activeSubTab === '진행중'
                    ? 'text-yellow-500 font-bold'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                진행중
              </button>
              <button
                onClick={() => handleSubTabChange('종료')}
                className={`text-sm font-medium transition-colors ${
                  activeSubTab === '종료'
                    ? 'text-yellow-500 font-bold'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                종료
              </button>
              <button
                onClick={() => handleSubTabChange('완료')}
                className={`text-sm font-medium transition-colors ${
                  activeSubTab === '완료'
                    ? 'text-yellow-500 font-bold'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                완료
              </button>
            </div>

            {/* 하위 탭 콘텐츠 */}
            {dataLoading ? (
              <div className="flex justify-center items-center py-8">
                <div className="text-gray-500">{activeSubTab} 게시물을 불러오는 중...</div>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-8">
                <div className="text-red-500 mb-4">{error}</div>
                <button
                  onClick={() => fetchTabData('작성', activeSubTab)}
                  className="bg-yellow-400 text-gray-800 py-2 px-4 rounded-xl text-sm font-medium hover:bg-yellow-500 transition-colors"
                >
                  다시 시도
                </button>
              </div>
            ) : myPosts.length === 0 ? (
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 text-center">
                <div className="text-gray-500 mb-4">
                  <p className="text-lg font-medium mb-2">
                    {activeSubTab === '진행중' && '진행중인 게시글이 없습니다'}
                    {activeSubTab === '종료' && '종료된 게시글이 없습니다'}
                    {activeSubTab === '완료' && '완료된 게시글이 없습니다'}
                  </p>
                  <p className="text-sm">
                    {activeSubTab === '진행중' && '새로운 이동봉사 게시글을 작성해보세요'}
                    {activeSubTab === '종료' && '마감된 게시글을 확인할 수 있습니다'}
                    {activeSubTab === '완료' && '완료 처리된 게시글을 확인할 수 있습니다'}
                  </p>
                </div>
                {activeSubTab === '진행중' && (
                  <Link
                    href="/volunteer/create"
                    className="inline-block bg-yellow-400 text-gray-800 py-2 px-4 rounded-xl text-sm font-medium hover:bg-yellow-500 transition-colors"
                  >
                    게시글 작성하기
                  </Link>
                )}
              </div>
            ) : (
              myPosts.map((post) => (
                <MyPageCard
                  key={post.id}
                  post={post}
                  activeSubTab={activeSubTab}
                />
              ))
            )}
          </div>
        )}
      </div>

      {/* 하단 여백 */}
      <div className="h-20"></div>
    </div>
  );
};

export default MyPage;
