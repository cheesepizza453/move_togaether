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
import { convertDogSize } from '@/lib/utils';
import IconLoading from "../../../public/img/icon/IconLoading";

const MyPage = () => {
  const { user, profile, loading, signOut } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('지원');
  const [activeSubTab, setActiveSubTab] = useState('진행중'); // 작성 탭의 하위 탭
  const [myPosts, setMyPosts] = useState([]);
  const [appliedPosts, setAppliedPosts] = useState([]);

  // D-day 계산 함수
  const getDday = (deadline) => {
    if (!deadline) return 0;
    return moment(deadline).diff(moment(), 'days');
  };

  // 상태 배지 생성 함수
  const getStatusBadge = (status, deadline) => {
    const dday = getDday(deadline);

    if (status === 'completed') {
      return {
        text: '완료',
        className: 'bg-gray-500 text-white'
      };
    } else if (status === 'cancelled') {
      return {
        text: '취소',
        className: 'bg-red-500 text-white'
      };
    } else if (dday < 0) {
      return {
        text: '마감',
        className: 'bg-gray-400 text-white'
      };
    } else if (dday <= 3) {
      return {
        text: '긴급',
        className: 'bg-red-500 text-white'
      };
    } else if (dday <= 7) {
      return {
        text: '마감임박',
        className: 'bg-orange-500 text-white'
      };
    } else {
      return {
        text: '진행중',
        className: 'bg-green-500 text-white'
      };
    }
  };

  // 날짜 포맷팅 함수
  const formatDate = (dateString) => {
    if (!dateString) return '';
    return moment(dateString).format('YYYY.MM.DD');
  };
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

    // 로딩 중이거나 사용자가 없으면 함수 종료
    if (loading || !user) {
      console.log('fetchTabData 건너뜀:', { loading, user: !!user });
      return;
    }

    try {
      setDataLoading(true);
      setError(null);

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
  }, [loadedTabs, loading, user]);

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
    if (!loading && user && profile && activeTab) {
      if (activeTab === '작성') {
        fetchTabData(activeTab, activeSubTab);
      } else {
        fetchTabData(activeTab);
      }
    }
  }, [activeTab, activeSubTab, user, profile, loading, fetchTabData]);

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
        <div className={'bg-white min-h-screen'}>
          <div className="flex items-center justify-between h-[78px] px-[30px] bg-white">
            <p className="text-22-m text-black">마이페이지</p>
            {/*</button>*/}
            <div className="w-6"></div>
          </div>
          <div className={'w-full flex justify-center pt-[60px]'}>
            <IconLoading/>
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
        <div className="flex items-center justify-between h-[78px] px-[30px] bg-white">
          {/* <button
          onClick={() => router.back()}
        >*/}
          <p className="text-22-m text-black">마이페이지</p>
        {/*</button>*/}
        <div className="w-6"></div>
      </div>

      {/* 프로필 정보 카드 */}
      <div className="px-[23px] pt-[27px]">
        <div className="">
          <div className="flex items-center">
            {/* 프로필 이미지 */}
            <div className="w-[70px] h-[70px] mr-[18px] rounded-full overflow-hidden bg-white flex-shrink-0">
              <Image
                src={profile?.profile_image || '/img/default_profile.jpg'}
                alt="프로필"
                width={70}
                height={70}
                className="w-full h-full object-cover"
              />
            </div>

            {/* 사용자 정보 */}
            <div className="flex-1 min-w-0">
              <h2 className="mb-[2px] text-18-b text-black">
                {profile?.display_name || '사용자'}
              </h2>
              <p className="mb-[5px] text-14-l text-[#535353]">
                {profile?.phone?.replace(
                    /(\d{3})(\d{4})(\d{4})/,
                    "$1-$2-$3") || ''}
              </p>
              <p className="text-12-r text-text-800 leading-relaxed">
                {profile?.bio || '소개글이 없습니다.'}
              </p>
            </div>
          </div>

          {/* 내 정보 수정 버튼 */}
          <Link
            href="/mypage/edit"
            className="flex justify-center items-center w-full h-[40px] mt-[12px] bg-[#FFF6D1] text-[#DBA913] rounded-[15px] border border-[#DBA108] text-16-m text-center transition-colors"
          >
            내 정보 수정
          </Link>
        </div>
      </div>

      {/* 탭 메뉴 */}
      <div className="mt-[24px] mb-[6px] mx-[23px] pb-[12px] border-b border-text-300">
        <div className="flex gap-x-[16px]">
          <button
            onClick={() => handleTabChange('지원')}
            className={` ${
              activeTab === '지원'
                ? 'text-16-b text-black'
                : 'text-16-m text-text-800'
            }`}
          >
            지원
          </button>
          <button
            onClick={() => handleTabChange('작성')}
            className={` ${
              activeTab === '작성'
                ? 'text-16-b text-black'
                : 'text-16-m text-text-800'
            }`}
          >
            작성
          </button>
        </div>
      </div>

      {/* 탭 콘텐츠 */}
      <div className="px-[23px] pb-6">
        {activeTab === '지원' && (
          <div className="space-y-[24px]">
            {dataLoading ? (
                <div className={'w-full flex justify-center pt-[60px]'}>
                  <IconLoading/>
                </div>
            ) : error ? (
                <div className="pt-[60px] flex flex-col items-center justify-center py-8">
                <div className="text-black text-16-m mb-[16px]">{error}</div>
                  <button
                      onClick={() => fetchTabData(activeTab)}
                      className="inline-block text-14-m bg-brand-main py-[10px] px-[20px] rounded-[15px]"
                  >
                    다시 시도
                  </button>
                </div>
            ) : appliedPosts.length === 0 ? (
                <div className="pt-[60px] bg-white text-center">
                  <div className="text-gray-500 mb-[16px]">
                    <p className="text-16-m text-black mb-[10px]">지원한 게시물이 없습니다</p>
                    <p className="text-12-r">관심 있는 봉사활동에 지원해보세요</p>
                  </div>
                  <Link
                      href="/"
                      className="inline-block text-14-m bg-brand-main py-[10px] px-[20px] rounded-[15px]"
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
                      <MyPageCard
                          key={post.id}
                          post={post}
                          tab={'apply'}
                      />
                  );
                })
            )}
          </div>
        )}

        {activeTab === '작성' && (
            <div className="space-y-[24px]">
              {/* 하위 탭 메뉴 */}
              <div className="flex space-x-[12px] pb-[5px]">
                <button
                    onClick={() => handleSubTabChange('진행중')}
                    className={`text-sm font-medium transition-colors outline-none focus:ring-0 ${
                        activeSubTab === '진행중'
                            ? 'text-brand-yellow-dark bg-brand-sub px-[6px] py-[2px] rounded-[3px]'
                            : 'text-14-m text-[#8b8b8b]'
                    }`}
                >
                  진행중
                </button>
                <button
                    onClick={() => handleSubTabChange('종료')}
                    className={`text-sm font-medium transition-colors outline-none focus:ring-0 ${
                        activeSubTab === '종료'
                            ? 'text-brand-yellow-dark bg-brand-sub px-[6px] py-[2px] rounded-[3px]'
                            : 'text-14-m text-[#8b8b8b]'
                    }`}
                >
                  종료
                </button>
                <button
                    onClick={() => handleSubTabChange('완료')}
                    className={`text-sm font-medium transition-colors outline-none focus:ring-0 ${
                        activeSubTab === '완료'
                            ? 'text-brand-yellow-dark bg-brand-sub px-[6px] py-[2px] rounded-[3px]'
                    : 'text-14-m text-[#8b8b8b]'
                }`}
              >
                완료
              </button>
            </div>

            {/* 하위 탭 콘텐츠 */}
            {dataLoading ? (
                <div className={'w-full flex justify-center pt-[60px]'}>
                  <IconLoading/>
                </div>
            ) : error ? (
                <div className="flex flex-col items-center justify-center py-8">
                <div className="text-red-500 mb-[20px]">{error}</div>
                  <button
                      onClick={() => fetchTabData('작성', activeSubTab)}
                      className="bg-yellow-400 text-gray-800 py-2 px-4 rounded-xl text-sm font-medium"
                  >
                    다시 시도
                  </button>
                </div>
            ) : myPosts.length === 0 ? (
                <div className="pt-[60px] text-center">
                  <div className="mb-[16px]">
                    <p className="text-16-m text-black mb-[10px]">
                      {activeSubTab === '진행중' && '진행중인 게시글이 없습니다'}
                      {activeSubTab === '종료' && '종료된 게시글이 없습니다'}
                      {activeSubTab === '완료' && '완료된 게시글이 없습니다'}
                    </p>
                    <p className="text-12-r">
                      {activeSubTab === '진행중' && '새로운 이동봉사 게시글을 작성해보세요'}
                      {activeSubTab === '종료' && '마감된 게시글을 확인할 수 있습니다'}
                      {activeSubTab === '완료' && '완료 처리된 게시글을 확인할 수 있습니다'}
                    </p>
                  </div>
                  {activeSubTab === '진행중' && (
                      <Link
                          href="/volunteer/create"
                          className="inline-block text-14-m bg-brand-main py-[10px] px-[20px] rounded-[15px]"
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
