'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import moment from 'moment';
import ProfileImage from '@/components/common/ProfileImage';
import { myPageAPI, applicationsAPI, handleAPIError } from '@/lib/api-client';
import MyPageCard from '@/components/MyPageCard';
import IconLoading from "../../../public/img/icon/IconLoading";
import Image from "next/image";
import Header from "@/components/common/Header";
import {
  deleteNotification,
  getNotificationState,
  getUnreadNotificationCount,
  getVisibleNotifications,
  markNotificationAsRead,
  markNotificationsAsRead,
} from '@/lib/notifications';

const MyPage = () => {
  const { user, profile, loading, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState('지원');
  const [activeSubTab, setActiveSubTab] = useState('진행중'); // 작성 탭의 하위 탭
  const [myPosts, setMyPosts] = useState([]);
  const [appliedPosts, setAppliedPosts] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [, setNotificationStateVersion] = useState(0);
  // 종료 탭 숨김!
  const subTabs = ['진행중', '완료'];

  // 날짜 포맷팅 함수
  const formatDate = (dateString) => {
    if (!dateString) return '';
    return moment(dateString).format('YYYY.MM.DD');
  };

  const truncateTitle = (title) => {
    if (!title) return '게시물';
    return title.length > 20 ? `${title.slice(0, 19)}...` : title;
  };
  const visibleNotifications = getVisibleNotifications(notifications, profile?.id);
  const unreadNotificationCount = getUnreadNotificationCount(notifications, profile?.id);
  const readNotificationIds = new Set(getNotificationState(profile?.id).readIds);
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
      if (tabType === '알림') {
        const result = await applicationsAPI.getReceivedApplications();
        posts = result.applications;
      } else if (tabType === '지원') {
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
      if (tabType === '알림') {
        setNotifications(posts || []);
      } else if (tabType === '지원') {
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
      if (tabType === '알림') {
        setNotifications([]);
      } else if (tabType === '지원') {
        setAppliedPosts([]);
      } else {
        setMyPosts([]);
      }
    } finally {
      setDataLoading(false);
    }
  }, [loadedTabs, loading, user]);

  // 활성 탭 변경 시 데이터 조회
  useEffect(() => {
    if (!loading && user && activeTab) {
      if (activeTab === '작성') {
        fetchTabData(activeTab, activeSubTab);
      } else {
        fetchTabData(activeTab);
      }
    }
  }, [activeTab, activeSubTab, user, profile, loading, fetchTabData]);

  useEffect(() => {
    const fetchNotificationSummary = async () => {
      if (loading || !user || !profile?.id || activeTab === '알림') return;

      try {
        const result = await applicationsAPI.getReceivedApplications();
        setNotifications(result.applications || []);
      } catch (err) {
        console.error('알림 요약 조회 오류:', err);
      }
    };

    fetchNotificationSummary();
  }, [activeTab, loading, user, profile?.id]);

  // 탭 변경 핸들러
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setError(null); // 탭 변경 시 에러 초기화

    // 탭 변경 시 데이터 초기화
    if (tab === '알림') {
      setNotifications([]);
    } else if (tab === '지원') {
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
    if (!subTabs.includes(subTab)) return;
    setActiveSubTab(subTab);
    setError(null);

    // 하위 탭 변경 시 데이터 초기화
    setMyPosts([]);

    fetchTabData('작성', subTab, true); // 강제 새로고침
  };

  const handleNotificationClick = (notificationId) => {
    markNotificationAsRead(profile?.id, notificationId);
    setNotificationStateVersion((version) => version + 1);
  };

  const handleReadAllNotifications = () => {
    markNotificationsAsRead(profile?.id, visibleNotifications);
    setNotificationStateVersion((version) => version + 1);
  };

  const handleDeleteNotification = (event, notificationId) => {
    event.preventDefault();
    event.stopPropagation();
    deleteNotification(profile?.id, notificationId);
    setNotificationStateVersion((version) => version + 1);
  };


  // 로딩 중이거나 로그인되지 않은 경우
  if (loading) {
    return (
        <div className={'bg-white min-h-screen'}>
          <Header title={'마이페이지'}/>
          <div className={'w-full flex justify-center pt-[20vh]'}>
            <IconLoading/>
          </div>
        </div>
    );
  }

  return (
      <div className="min-h-screen bg-white">
        <Header title={'마이페이지'}/>
        {/* 프로필 정보 카드 */}
        <div className="px-[23px] pt-[27px]">
        <div className="">
          <div className="flex items-center">
            {/* 프로필 이미지 */}
            <ProfileImage
              profileImage={profile?.profile_image}
              size={70}
              alt="프로필"
              className="mr-[18px] bg-white flex-shrink-0"
            />

            {/* 사용자 정보 */}
            <div className="flex-1 min-w-0">
              <h2 className="mb-[4px] text-18-b text-black">
                {profile?.display_name || '사용자'}
              </h2>
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
            onClick={() => handleTabChange('알림')}
            className={` ${
              activeTab === '알림'
                ? 'text-16-b text-black'
                : 'text-16-m text-text-800'
            }`}
          >
            알림
            {unreadNotificationCount > 0 && (
                <span className="ml-[4px] inline-flex min-w-[16px] h-[16px] px-[4px] items-center justify-center rounded-full bg-brand-point text-white text-[10px] leading-none">
                  {unreadNotificationCount > 99 ? '99+' : unreadNotificationCount}
                </span>
            )}
          </button>
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
        {activeTab === '알림' && (
          <div className="space-y-[10px]">
            {dataLoading ? (
                <div className={'w-full flex justify-center pt-[20vh]'}>
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
            ) : visibleNotifications.length === 0 ? (
                <div className="pt-[60px] bg-white text-center">
                  <div className="text-gray-500 mb-[16px]">
                    <figure className={'flex justify-center mb-[10px]'}>
                      <Image src={'img/empty_icon.png'} alt={''} width={120} height={120}/>
                    </figure>
                    <p className="text-16-m text-black mb-[10px]">새 알림이 없습니다</p>
                    <p className="text-12-r">게시물에 지원자가 등록되면 알려드릴게요</p>
                  </div>
                </div>
            ) : (
                <>
                  <div className="flex justify-end pb-[2px]">
                    <button
                        onClick={handleReadAllNotifications}
                        className="text-12-r text-text-800 underline disabled:text-text-500"
                        disabled={unreadNotificationCount === 0}
                    >
                      모두 읽음
                    </button>
                  </div>
                  {visibleNotifications.map((notification) => {
                    const postTitle = truncateTitle(notification.posts?.title);
                    const applicantName = notification.user_profiles?.display_name || '지원자';
                    const isUnread = !readNotificationIds.has(String(notification.id));

                    return (
                        <Link
                            key={notification.id}
                            href={`/posts/${notification.post_id}?tab=applicants`}
                            onClick={() => handleNotificationClick(notification.id)}
                            className={`relative block py-[18px] pl-[18px] pr-[54px] bg-white rounded-[15px] shadow-[0_0_12px_0px_rgba(0,0,0,0.1)] ${
                                isUnread ? 'border border-brand-main' : 'border border-transparent'
                            }`}
                        >
                          {isUnread && (
                              <span className="absolute left-[8px] top-[18px] w-[6px] h-[6px] rounded-full bg-brand-point" />
                          )}
                          <p className={`text-14-m leading-[1.4] ${isUnread ? 'text-black' : 'text-text-800'}`}>
                            <span className="text-brand-yellow-dark">{postTitle}</span> 게시물에 {applicantName}님이 지원했어요.
                          </p>
                          <p className="mt-[6px] text-12-r text-text-800">
                            {formatDate(notification.created_at)}
                          </p>
                          <button
                              onClick={(event) => handleDeleteNotification(event, notification.id)}
                              className="absolute right-[16px] top-[18px] text-12-r text-text-800 underline"
                              aria-label="알림 삭제"
                          >
                            삭제
                          </button>
                        </Link>
                    );
                  })}
                </>
            )}
          </div>
        )}

        {activeTab === '지원' && (
          <div className="space-y-[24px]">
            {dataLoading ? (
                <div className={'w-full flex justify-center pt-[20vh]'}>
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
                    <figure className={'flex justify-center mb-[10px]'}>
                      <Image src={'img/empty_icon.png'} alt={''} width={120} height={120}/>
                    </figure>
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
                  const appliedAt = app.application_date;

                  return (
                      <MyPageCard
                          key={post.id}
                          post={post}
                          tab={'apply'}
                          appliedAt={appliedAt}
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
                {subTabs.map((tab) => (
                    <button
                        key={tab}
                        onClick={() => handleSubTabChange(tab)}
                        className={`text-sm font-medium transition-colors outline-none focus:ring-0 ${
                            activeSubTab === tab
                                ? 'text-brand-yellow-dark bg-brand-sub px-[6px] py-[2px] rounded-[3px]'
                                : 'text-14-m text-[#8b8b8b]'
                        }`}
                    >
                      {tab}
                    </button>
                ))}
              </div>

            {/* 하위 탭 콘텐츠 */}
            {dataLoading ? (
                <div className={'w-full flex justify-center pt-[10vh]'}>
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
                  <figure className={'flex justify-center mb-[10px]'}>
                    <Image src={'img/empty_icon.png'} alt={''} width={120} height={120}/>
                  </figure>
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
