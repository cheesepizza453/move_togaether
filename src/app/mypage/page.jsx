'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import moment from 'moment';
import { ChevronLeft, Edit } from 'lucide-react';

const MyPage = () => {
  const { user, profile, loading, signOut } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('지원');
  const [myPosts, setMyPosts] = useState([]);
  const [appliedPosts, setAppliedPosts] = useState([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [error, setError] = useState(null);
  const [loadedTabs, setLoadedTabs] = useState(new Set());

  // 탭별 데이터 조회 함수
  const fetchTabData = async (tabType) => {
    if (loadedTabs.has(tabType)) {
      return; // 이미 로드된 탭은 다시 로드하지 않음
    }

    try {
      setDataLoading(true);
      setError(null);

      const session = await supabase.auth.getSession();
      if (!session.data.session) {
        throw new Error('로그인이 필요합니다.');
      }

      const type = tabType === '지원' ? 'applied' : 'my';
      const response = await fetch(`/api/posts/list?type=${type}&status=all`, {
        headers: {
          'Authorization': `Bearer ${session.data.session.access_token}`,
          'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '데이터를 불러오는 중 오류가 발생했습니다.');
      }

      const { posts } = await response.json();

      if (tabType === '지원') {
        setAppliedPosts(posts || []);
      } else {
        setMyPosts(posts || []);
      }

      // 로드된 탭 기록
      setLoadedTabs(prev => new Set([...prev, tabType]));

    } catch (err) {
      console.error(`${tabType} 탭 데이터 조회 오류:`, err);
      setError(err.message);
    } finally {
      setDataLoading(false);
    }
  };

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
      fetchTabData(activeTab);
    }
  }, [activeTab, user, profile]);

  // 탭 변경 핸들러
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setError(null); // 탭 변경 시 에러 초기화
  };

  // 유틸리티 함수들
  const convertDogSize = (size) => {
    const sizeMap = {
      'small': '소형견',
      'medium-small': '중소형견',
      'medium': '중형견',
      'large': '대형견'
    };
    return sizeMap[size] || size;
  };

  const formatDate = (date) => {
    return moment(date).format('YY/MM/DD');
  };

  const getDday = (deadline) => {
    const today = moment();
    const deadlineDate = moment(deadline);
    const diffDays = deadlineDate.diff(today, 'days');

    if (diffDays < 0) return `D+${Math.abs(diffDays)}`;
    if (diffDays === 0) return 'D-Day';
    return `D-${diffDays}`;
  };

  const getStatusBadge = (status, dday) => {
    if (status !== 'active') {
      return {
        text: '입양 완료',
        className: 'bg-green-100 text-green-600'
      };
    }

    const ddayNum = parseInt(dday.replace('D-', '').replace('D+', ''));
    if (ddayNum <= 3) {
      return {
        text: dday,
        className: 'bg-red-100 text-red-600'
      };
    } else if (ddayNum <= 7) {
      return {
        text: dday,
        className: 'bg-orange-100 text-orange-600'
      };
    } else {
      return {
        text: dday,
        className: 'bg-yellow-100 text-yellow-600'
      };
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
      <div className="px-4 pb-6">
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
      <div className="px-4 pb-6">
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
                const statusBadge = getStatusBadge(post.status, dday);

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
            {dataLoading ? (
              <div className="flex justify-center items-center py-8">
                <div className="text-gray-500">작성한 게시물을 불러오는 중...</div>
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
            ) : myPosts.length === 0 ? (
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 text-center">
                <div className="text-gray-500 mb-4">
                  <p className="text-lg font-medium mb-2">작성한 게시글이 없습니다</p>
                  <p className="text-sm">새로운 이동봉사 게시글을 작성해보세요</p>
                </div>
                <Link
                  href="/volunteer/create"
                  className="inline-block bg-yellow-400 text-gray-800 py-2 px-4 rounded-xl text-sm font-medium hover:bg-yellow-500 transition-colors"
                >
                  게시글 작성하기
                </Link>
              </div>
            ) : (
              myPosts.map((post) => {
                const dday = getDday(post.deadline);
                const statusBadge = getStatusBadge(post.status, dday);

                return (
                  <div key={post.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
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
                    <div className="flex space-x-2">
                      <Link
                        href={`/posts/${post.id}`}
                        className="flex-1 bg-yellow-400 text-gray-800 py-2 px-4 rounded-xl text-sm font-medium hover:bg-yellow-500 transition-colors text-center"
                      >
                        상세보기
                      </Link>
                      <button className="flex-1 bg-gray-100 text-gray-600 py-2 px-4 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors">
                        수정하기
                      </button>
                    </div>
                  </div>
                );
              })
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
