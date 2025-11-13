'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { useDialogContext } from '@/components/DialogProvider';
import moment from 'moment';
import { Button } from '@/components/ui/button';
import { X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog";
import { cn, convertDogSize, formatDeadline, getProfileImageUrl } from "@/lib/utils";
import ProfileImage from '@/components/common/ProfileImage';
import IconRightArrow from "../../../../public/img/icon/IconRightArrow";
import IconHeart from "../../../../public/img/icon/IconHeart";
import IconLoading from "../../../../public/img/icon/IconLoading";

// 커스텀 AlertDialogContent (오버레이 없이)
const CustomAlertDialogContent = React.forwardRef(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Portal>
    <AlertDialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-[50%] top-[50%] z-[9999] grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-90 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
        className
      )}
      {...props}
    />
  </AlertDialogPrimitive.Portal>
));
CustomAlertDialogContent.displayName = AlertDialogPrimitive.Content.displayName;

export default function PostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, profile } = useAuth();
  const dialog = useDialogContext();
  const postId = params.id;

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const isFetchingRef = useRef(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [loginDialogContext, setLoginDialogContext] = useState('favorite'); // 'favorite' or 'inquiry'
  const [showApplyDialog, setShowApplyDialog] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [activeTab, setActiveTab] = useState(() => {
    // URL 쿼리 파라미터에서 tab 값을 확인하여 초기 탭 설정
    const tab = searchParams.get('tab');
    return tab === 'applicants' ? 'applicants' : 'post';
  });
  const [applicants, setApplicants] = useState([]);
  const [applicantsLoading, setApplicantsLoading] = useState(false);
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [showApplicantModal, setShowApplicantModal] = useState(false);
  const [isRecruitmentComplete, setIsRecruitmentComplete] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [myApplication, setMyApplication] = useState(null);
  const [showApplicationModal, setShowApplicationModal] = useState(false);

  // URL 쿼리 파라미터 변경 시 탭 업데이트
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'applicants') {
      setActiveTab('applicants');
    } else {
      setActiveTab('post');
    }
  }, [searchParams]);

  // 브라우저 뒤로가기/앞으로가기 이벤트 감지
  useEffect(() => {
    const handlePopState = () => {
      console.log('브라우저 뒤로가기/앞으로가기 감지 - 상태 초기화');
      // 모든 상태 초기화
      setPost(null);
      setLoading(true);
      setError(null);
      setIsFavorite(false);
      setFavoriteLoading(false);
      setShowLoginDialog(false);
      setShowApplyDialog(false);
      setApplicants([]);
      setApplicantsLoading(false);
      isFetchingRef.current = false;

      // API 재호출
      setTimeout(() => {
        if (postId) {
          fetchPost();
        }
      }, 100);
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [postId]);

  useEffect(() => {
    if (postId) {
      console.log('useEffect에서 fetchPost 호출, postId:', postId);

      // 브라우저 뒤로가기 대응: 모든 상태 초기화
      setPost(null);
      setLoading(true);
      setError(null);
      setIsFavorite(false);
      setFavoriteLoading(false);
      setShowLoginDialog(false);
      setShowApplyDialog(false);
      setApplicants([]);
      setApplicantsLoading(false);
      isFetchingRef.current = false;

      // 약간의 지연을 두고 API 호출
      const timer = setTimeout(() => {
        console.log('상태 초기화 완료, fetchPost 호출');
        fetchPost();
      }, 50);

      return () => {
        clearTimeout(timer);
        // 컴포넌트 언마운트 시 상태 정리
        console.log('상세 페이지 언마운트 - 상태 정리');
        isFetchingRef.current = false;
      };
    }
  }, [postId]);

  useEffect(() => {
    if (user && post) {
      let isOwnerCheck = false;

      // 1차 검증: auth.users.id와 user_profiles.auth_user_id 비교
      if (post.user_profiles?.auth_user_id) {
        const authUserId = String(user.id);
        const postAuthUserId = String(post.user_profiles.auth_user_id);
        isOwnerCheck = authUserId === postAuthUserId;

        console.log('Auth ID로 작성자 확인:', {
          authUserId: authUserId,
          postAuthUserId: postAuthUserId,
          isOwner: isOwnerCheck
        });
      }

      // 2차 검증: user_profiles.id와 posts.user_id 비교 (1차가 실패한 경우)
      if (!isOwnerCheck && profile?.id) {
        const profileId = String(profile.id);
        const postUserId = String(post.user_id);
        isOwnerCheck = profileId === postUserId;

        console.log('Profile ID로 작성자 확인:', {
          profileId: profileId,
          postUserId: postUserId,
          isOwner: isOwnerCheck
        });
      }

      // 3차 검증: 직접 auth.users.id와 posts.user_id 비교 (마지막 시도)
      if (!isOwnerCheck) {
        const userId = String(user.id);
        const postUserId = String(post.user_id);
        isOwnerCheck = userId === postUserId;

        console.log('직접 ID 비교로 작성자 확인:', {
          userId: userId,
          postUserId: postUserId,
          isOwner: isOwnerCheck
        });
      }

      console.log('최종 작성자 확인 결과:', {
        isOwner: isOwnerCheck,
        userEmail: user.email,
        postTitle: post.title,
        postUserProfile: post.user_profiles,
        currentUserProfile: profile
      });

      setIsOwner(isOwnerCheck);
    }
  }, [user, post, profile]);

  useEffect(() => {
    if (isOwner && postId) {
      fetchApplicants();
    }
  }, [isOwner, postId]);

  // 지원 여부 확인 함수 (자신이 작성하지 않은 게시물인 경우만)
  const checkApplicationStatus = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        return;
      }

      // 내가 신청한 목록 조회 (post_id 없이 호출하면 내가 신청한 모든 목록)
      const response = await fetch(`/api/inquiries`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        }
      });

      if (response.ok) {
        const result = await response.json();
        const applications = result.applications || [];
        // 현재 게시물에 대한 지원 내역 찾기
        const myApplicationData = applications.find(app => {
          // post_id가 직접 있는 경우 또는 posts 객체 안에 있는 경우
          const appPostId = app.post_id || app.posts?.id;
          return appPostId === parseInt(postId);
        });

        if (myApplicationData) {
          setHasApplied(true);
          setMyApplication(myApplicationData);
        } else {
          setHasApplied(false);
          setMyApplication(null);
        }
      }
    } catch (err) {
      console.error('지원 상태 확인 오류:', err);
    }
  }, [postId]);

  // 지원 여부 확인 (자신이 작성하지 않은 게시물인 경우만)
  useEffect(() => {
    if (user && post && !isOwner && postId) {
      checkApplicationStatus();
    }
  }, [user, post, isOwner, postId, checkApplicationStatus]);

  const fetchPost = async () => {
    // 중복 호출 방지
    if (isFetchingRef.current) {
      console.log('fetchPost 이미 실행 중 - 중복 호출 방지');
      return;
    }

    try {
      console.log('fetchPost 시작 - 로딩 상태를 true로 설정');
      isFetchingRef.current = true;
      setLoading(true);

      // API를 통해 게시물 정보 가져오기 - 브라우저 뒤로가기 대응을 위한 캐시 방지
      const response = await fetch(`/api/posts/${postId}?_t=${Date.now()}`, {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });

      if (!response.ok) {
        console.log('API 응답 오류:', response.status);
        if (response.status === 404) {
          setError('존재하지 않는 게시물입니다.');
        } else {
          setError('게시물을 불러올 수 없습니다.');
        }
        setLoading(false);
        return;
      }

      const { post: postData } = await response.json();

      if (!postData) {
        console.log('postData가 없음');
        setError('존재하지 않는 게시물입니다.');
        setLoading(false);
        return;
      }

      // 데이터 포맷팅
      const formattedPost = {
        ...postData,
        dogSize: convertDogSize(postData.dog_size),
        deadline: formatDeadline(postData.deadline),
        created_at: formatDeadline(postData.created_at), // 작성일 포맷팅
        dday: moment(postData.deadline).diff(moment(), 'days'),
        isUrgent: moment(postData.deadline).diff(moment(), 'days') <= 1
      };

      console.log('게시물 데이터 설정 완료:', formattedPost);
      setPost(formattedPost);
      setLoading(false); // 데이터 로드 성공 시 로딩 상태 해제

      console.log('포스트 데이터:', {
        postId: postData.id,
        userId: postData.user_id,
        title: postData.title,
        created_at: postData.created_at,
        deadline: postData.deadline
      });

      // 즐겨찾기 상태 확인 (API를 통해)
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.access_token) {
          const response = await fetch(`/api/favorites/check?postId=${postId}`, {
            headers: {
              'Authorization': `Bearer ${session.access_token}`,
              'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
            }
          });

          if (response.ok) {
            const result = await response.json();
            if (result.success) {
              setIsFavorite(result.isFavorite);
            }
          }
        }
      } catch (error) {
        console.error('즐겨찾기 상태 확인 오류:', error);
        // 오류가 발생해도 게시물은 계속 표시
      }

      // 지원 여부 확인은 useEffect에서 처리 (isOwner 결정 후)
    } catch (err) {
      console.error('게시물 조회 중 오류:', err);
      setError('게시물을 불러오는 중 오류가 발생했습니다.');
    } finally {
      console.log('fetchPost 완료 - 로딩 상태를 false로 설정');
      isFetchingRef.current = false;
      setLoading(false);
    }
  };

  const handleFavoriteToggle = async () => {
    try {
      setFavoriteLoading(true);

      // 세션 확인
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        setLoginDialogContext('favorite');
        setShowLoginDialog(true);
        return;
      }

      const headers = {
        'Authorization': `Bearer ${session.access_token}`,
        'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        'Content-Type': 'application/json'
      };

      if (isFavorite) {
        // 즐겨찾기 제거
        const response = await fetch(`/api/favorites?post_id=${postId}`, {
          method: 'DELETE',
          headers
        });

        if (response.ok) {
          setIsFavorite(false);
          //toast.success('즐겨찾기에서 제거되었습니다.');
        } else {
          const errorData = await response.json();
          console.error('즐겨찾기 제거 오류:', errorData);
          //toast.error('즐겨찾기 제거에 실패했습니다.');
        }
      } else {
        // 즐겨찾기 추가
        const response = await fetch('/api/favorites', {
          method: 'POST',
          headers,
          body: JSON.stringify({ post_id: postId })
        });

        if (response.ok) {
          setIsFavorite(true);
          //toast.success('즐겨찾기에 추가되었습니다.');
        } else {
          const errorData = await response.json();
          console.error('즐겨찾기 추가 오류:', errorData);
          //toast.error('즐겨찾기 추가에 실패했습니다.');
        }
      }
    } catch (err) {
      console.error('즐겨찾기 처리 오류:', err);
      toast.error('오류가 발생했습니다.');
    } finally {
      setFavoriteLoading(false);
    }
  };

  const handleApply = () => {
    setShowApplyDialog(true);
  };

  const handleInquiry = () => {
    if (!user) {
      setShowLoginDialog(true);
      setLoginDialogContext('inquiry');
      return;
    }
    router.push(`/posts/${postId}/inquiry`);
  };

  const handleViewApplication = () => {
    setShowApplicationModal(true);
  };

  const fetchApplicants = async () => {
    try {
      // 세션 토큰 가져오기
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        console.error('세션 토큰이 없습니다.');
        return;
      }

      const response = await fetch(`/api/inquiries?post_id=${postId}`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        }
      });

      if (response.ok) {
        const { applications } = await response.json();
        setApplicants(applications || []);
      } else {
        console.error('지원자 목록 조회 실패:', response.status);
      }
    } catch (err) {
      console.error('지원자 목록 조회 오류:', err);
    }
  };

  const handleApplicantClick = (applicant) => {
    setSelectedApplicant(applicant);
    setShowApplicantModal(true);
  };

  const handleRecruitmentComplete = () => {
    dialog.showConfirm(
      '모집 완료 시 상태를 변경할 수 없습니다.\n완료 하시겠습니까?',
      '모집 완료 확인',
      {
        confirmText: '확인',
        cancelText: '취소',
        onConfirm: confirmRecruitmentComplete
      }
    );
  };

  const confirmRecruitmentComplete = async () => {
    try {
      // 세션 토큰 가져오기
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        dialog.showError('로그인이 필요합니다.', '인증 오류');
        return;
      }

      const response = await fetch(`/api/posts/${postId}/complete`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setIsRecruitmentComplete(true);
        setApplicants([]);
        dialog.closeDialog();
        toast.success('모집이 완료되었습니다.');
      } else {
        const errorData = await response.json();
        console.error('모집 완료 API 오류:', errorData);
        dialog.showError('모집 완료 처리에 실패했습니다.', '오류');
      }
    } catch (err) {
      console.error('모집 완료 오류:', err);
      dialog.showError('모집 완료 처리 중 오류가 발생했습니다.', '오류');
    }
  };

  const handleCall = (phone) => {
    window.location.href = `tel:${phone}`;
  };

  const handleSMS = (phone) => {
    window.location.href = `sms:${phone}`;
  };

  const handleNaverMap = () => {
    if (post?.departure_address && post?.arrival_address) {
      try {
        // posts 데이터에서 위경도 정보 가져오기
        const startLat = post.departure_latitude || post.departure_lat;
        const startLng = post.departure_longitude || post.departure_lng;
        const endLat = post.arrival_latitude || post.arrival_lat;
        const endLng = post.arrival_longitude || post.arrival_lng;

        console.log('출발지 좌표:', { lat: startLat, lng: startLng });
        console.log('도착지 좌표:', { lat: endLat, lng: endLng });

        // 위경도가 있는 경우에만 좌표 기반 URL 생성
        if (startLat && startLng && endLat && endLng) {
          const url = `https://map.naver.com/p/directions/${startLng},${startLat},${encodeURIComponent(post.departure_address)}/${endLng},${endLat},${encodeURIComponent(post.arrival_address)}/-/car`;
          window.open(url, '_blank');
        } else {
          // 위경도가 없는 경우 검색 기반으로 대체
          const query = encodeURIComponent(`${post.departure_address}에서 ${post.arrival_address}까지`);
          const url = `https://map.naver.com/v5/search/${query}`;
          window.open(url, '_blank');
        }
      } catch (error) {
        console.error('네이버지도 링크 생성 오류:', error);
        // 오류 시 기본 길찾기 페이지로 이동
        window.open('https://map.naver.com/v5/directions', '_blank');
      }
    }
  };

  const handleKakaoMap = () => {
    if (post?.departure_address && post?.arrival_address) {
      // 카카오맵: 출발지와 도착지를 직접 지정하는 링크
      const startAddress = encodeURIComponent(post.departure_address);
      const endAddress = encodeURIComponent(post.arrival_address);
      const url = `https://map.kakao.com/?sName=${startAddress}&eName=${endAddress}`;
      window.open(url, '_blank');
    }
  };

  console.log('현재 로딩 상태:', loading);

  if (loading) {
    console.log('로딩 중 - 로딩 화면 표시');
    return (
        <div className="min-h-screen bg-white">
          {/* 헤더 */}
          <div className="w-full h-[72px] flex items-center justify-between px-[30px] py-[28px]">
            <button
                className={'p-[12px] pl-0 outline-none focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:outline-none'}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="9" height="16" viewBox="0 0 9 16" fill="none">
                <path d="M8 15L1 8" stroke="black" strokeWidth="2" strokeMiterlimit="10"
                      strokeLinecap="round"/>
                <path d="M8 0.999999L1 8" stroke="black" strokeWidth="2" strokeMiterlimit="10"
                      strokeLinecap="round"/>
              </svg>
            </button>
          </div>
          <div>
            <div>
              {/* 강아지 이미지 */}
              <div className="relative flex justify-center items-center w-full h-auto aspect-[402/343] bg-brand-bg">
                <IconLoading/>
              </div>

              {/* 게시물 정보 */}
              <div className="px-[28px] py-[20px] bg-white h-[106px]">
                <div className="bg-text-100 w-full h-[30px] rounded-[10px]"></div>
                <div className="mt-[10px] bg-text-100 w-[80px] h-[20px] rounded-[10px]"></div>
              </div>

              <div className="py-[24px] px-[22px] space-y-6 bg-brand-bg">
                {/* 찾아오는 길 */}
                <div>
                  <h3 className="text-16-b mb-[10px]">찾아오는 길</h3>
                  <div className="flex flex-col p-[18px] bg-white rounded-[15px] shadow-[0_0_12px_0_rgba(0,0,0,0.1)]">
                    {/* ... */}
                  </div>
                </div>

                {/* 상세 설명 */}
                <div>
                  <h3 className="text-16-b mb-[10px]">상세 설명</h3>
                  <div
                      className="flex flex-col p-[18px] min-h-[115px] bg-white rounded-[15px] shadow-[0_0_12px_0_rgba(0,0,0,0.1)]">
                    {/* ... */}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
    );
  }

  if (error) {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={() => window.history.back()}>
              뒤로 가기
            </Button>
          </div>
        </div>
    );
  }

  if (!post) {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-600 mb-4">게시물을 찾을 수 없습니다.</p>
            <Button onClick={() => window.history.back()}>
              뒤로 가기
            </Button>
          </div>
        </div>
    );
  }

  return (
      <div className={`min-h-screen ${isOwner && activeTab === 'applicants' && 'bg-brand-bg'}`}>
        {/* 헤더 */}
        <div className="bg-white">
          <div className={'flex flex-col items-center justify-between'}>
            {/* 네비게이션 */}
            <div className="w-full h-[72px] flex items-center justify-between px-[30px] py-[28px]">
              <div className={'flex items-center'}>
                <button
                    onClick={() => window.history.back()}
                    className={'p-[12px] pl-0 outline-none focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:outline-none'}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="9" height="16" viewBox="0 0 9 16" fill="none">
                    <path d="M8 15L1 8" stroke="black" strokeWidth="2" strokeMiterlimit="10"
                          strokeLinecap="round"/>
                    <path d="M8 0.999999L1 8" stroke="black" strokeWidth="2" strokeMiterlimit="10"
                          strokeLinecap="round"/>
                  </svg>
                </button>
                <h1 className="text-22-m text-black">
                  {isOwner ? '작성한 게시물' : '정보'}
                </h1>
              </div>
              <button
                  onClick={handleFavoriteToggle}
                  disabled={favoriteLoading}
                  className={'p-0 outline-none focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:outline-none disabled:opacity-50 disabled:cursor-not-allowed'}
              >
                <figure className="mt-[2px]">
                  {favoriteLoading ? (
                      <Loader2 className="size-[30px] animate-spin text-gray-400"/>
                  ) : (
                      <IconHeart className={'size-[30px] block'} fill={isFavorite ? '#F36C5E' : '#D2D2D2'}/>
                  )}
                </figure>
              </button>
            </div>

            {/* 탭 (작성자인 경우만) */}
            {isOwner && (
                <div
                    className="flex w-full h-[55px] px-[30px] gap-x-[16px] shadow-[0_6px_6px_0px_rgba(0,0,0,0.05)] bg-white z-20">
                  <button
                      onClick={() => setActiveTab('post')}
                      className={`text-center outline-none focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:outline-none ${
                          activeTab === 'post'
                              ? 'text-black text-16-b'
                              : 'text-text-800 text-16-m'
                      }`}
                  >
                    게시물
                  </button>
                  <button
                      onClick={() => setActiveTab('applicants')}
                      className={`text-center outline-none focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:outline-none ${
                          activeTab === 'applicants'
                              ? 'text-black text-16-b'
                              : 'text-text-800'
                      }`}
                  >
                    지원자<span
                      className={`ml-[2px] ${activeTab === 'applicants' ? 'text-brand-yellow-dark text-16-m' : 'text-text-800 text-16-r'}`}>{applicants.length}</span>
                  </button>
                </div>
            )}
          </div>
        </div>

        {/* 메인 콘텐츠 */}

        {/* 작성자 정보 */}
        {!isOwner &&
            <div className={'relative w-full h-[92px] px-[25px] rounded-b-[15px] bg-white z-20 overflow-hidden'}>
              <div className="w-full pt-[10px] flex items-center justify-between">
                {/* 링크 추가 */}
                <a className={'flex items-center gap-[9px]'} href={`/authors/${post.user_id}`}>
                  <ProfileImage
                    profileImage={post.user_profiles?.profile_image}
                    size={56}
                    alt="프로필 이미지"
                  />
                  <div>
                    <p className="pr-[30px] mb-[2px] text-18-b">{post.user_profiles?.display_name || '익명'}</p>
                    {/* 실제 전화번호 표시 */}
                    <p className="text-14-l text-[#6c6c6c]">{post.user_profiles?.phone || '연락처 없음'}</p>
                  </div>
                </a>
                {/* 링크 추가 */}
                <a className={'w-[16px]'} href={`/authors/${post.user_id}`}>
                  <figure className={'h-[14px]'}>
                    <IconRightArrow fill={'black'}/>
                  </figure>
                </a>
              </div>
            </div>
        }
        <div className={`${isOwner && activeTab === 'post' && 'mt-[-15px]'} ${isOwner && activeTab === 'applicants' && 'bg-white pt-[30px] px-[22px] mb-[10px]'}`}>
          {/* 게시물 탭 */}
          {activeTab === 'post' && (
              <div>
                {/* 강아지 이미지 */}
                <div className="mt-[-15px] relative w-full aspect-[402/343]">
                  <img
                      src={post.images?.[0] || '/img/dummy_thumbnail.jpg'}
                      alt="강아지 이미지"
                      className={'absolute top-1/2 left-1/2 w-full h-full -translate-x-1/2 -translate-y-1/2 object-cover'}
                      onError={(e) => {
                        e.target.src = '/img/dummy_thumbnail.jpg';
                      }}
                  />
                </div>

                {/* 게시물 정보 */}
                <div className="px-[28px] py-[20px] bg-white">
                  <div className={`flex items-center justify-between mb-[8px]`}>
                    <div>
                      {post.dday < 0 ?
                          <p className={'text-14-m'}>마감되었습니다</p>
                          :
                          <p className={'text-brand-point text-14-m'}><strong
                              className={'text-16-b'}>{post.dday}</strong>일
                            남았어요!</p>}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <p className="text-12-r text-[#8a8a8a]">
                        {post.created_at} 작성
                      </p>
                    </div>
                  </div>
                  <h1 className="text-18-b mb-[10px]">{post.title}</h1>
                  <div className={'flex gap-x-[4px] text-14-r'}>
                    <p>{post.dog_name || '미입력'}</p>
                    <p className={' text-text-800'}>{post.dogSize}</p>
                    <p className={'text-text-800'}>{post.dog_breed || '미입력'}</p>
                  </div>
                </div>

                <div className={'py-[24px] px-[22px] space-y-6 bg-brand-bg'}>
                  {/* 찾아오는 길 섹션 */}
                  <div className="">
                    <h3 className="text-16-b mb-[10px]">찾아오는 길</h3>
                    <div
                        className="flex flex-col p-[18px] bg-white rounded-[15px] shadow-[0_0_12px_0px_rgba(0,0,0,0.1)]">
                      <div className="flex items-center gap-x-[10px] mb-[4px]">
                    <span
                        className="px-[6px] py-[4px] rounded-full text-12-m inline-flex bg-brand-point text-white">출발지</span>
                        <p className="text-16-m">{post.departure_address}</p>
                      </div>
                      <div className="mb-[12px] flex items-center gap-x-[10px]">
                    <span
                        className="px-[6px] py-[5px] rounded-full text-12-m inline-flex bg-brand-point text-white">도착지</span>
                        <p className="text-16-m">{post.arrival_address}</p>
                      </div>
                      <div className={'flex gap-x-[4px]'}>
                        {/* 길찾기 버튼 */}
                        <button onClick={handleNaverMap}
                                className={'p-[7px] bg-[#fdbba2] text-white text-12-r rounded-[4px]'}>네이버 길찾기
                        </button>
                        <button onClick={handleKakaoMap}
                                className={'p-[7px] bg-[#fdbba2] text-white text-12-r rounded-[4px]'}>카카오맵 길찾기
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* 설명글 섹션 */}
                  {post.description && (
                      <div>
                        <h3 className="text-16-b mb-[10px]">상세 설명</h3>
                        <div
                            className={'flex flex-col p-[18px] min-h-[115px] bg-white rounded-[15px] shadow-[0_0_12px_0px_rgba(0,0,0,0.1)]'}>
                          <p className="text-text-800 text-16-r whitespace-pre-wrap leading-[1.25]">{post.description}</p>
                        </div>
                      </div>
                  )}
                </div>
              </div>
          )}

          {/* 지원자 탭 */}
          {activeTab === 'applicants' && (
              <div className="bg-brand-bg">
                {isRecruitmentComplete ? (
                    <div className="text-center pt-[100px]">
                      <div className="">
                        <div className="text-center">
                          <p className="text-16-m leading-[1.44] text-gray-700">
                            <strong className="text-brand-point">모집이 완료</strong>되어<br/>
                            신청자 정보를 확인하실 수 없습니다.
                          </p>
                        </div>
                      </div>
                    </div>
                ) : applicants.length === 0 ? (
                    <div className="pt-[200px] bg-white min-h-screen">
                      <p className="text-text-800 text-16-m text-center">아직 지원자가 없습니다.</p>
                    </div>
                ) : (
                    <div className="space-y-[10px]">
                      {applicants.map((applicant) => (
                          <div key={applicant.id}
                               className="py-[30px] px-[24px] bg-white rounded-[15px] shadow-[0_0_12px_0px_rgba(0,0,0,0.1)]">
                            <div className="mb-[12px] flex items-start justify-between">
                              <div className="flex flex-col">
                                <div className={'mb-[4px] flex items-center text-[#535353] gap-x-[5px]'}>
                                  <p className="text-18-b">{applicant.user_profiles?.display_name || '익명'}</p>
                                  |
                                  <p className="text-16-r text-text-800">{applicant.user_profiles?.phone || '연락처 없음'}</p>
                                </div>
                                <p className="text-12-r text-[#8a8a8a]">
                                  {moment(applicant.created_at).format('YY.MM.DD HH:mm')}
                                </p>
                              </div>
                            </div>
                            <div className="mb-4">
                              <div className={'flex items-center gap-x-[18px]'}>
                                <p className="w-full text-16-r text-brand-icon leading-[1.1] line-clamp-4">
                                  {applicant.message}
                                </p>
                                <div className="bg-gray-200 rounded-full flex items-center justify-center">
                                  <ProfileImage
                                    profileImage={applicant.user_profiles?.profile_image}
                                    size={54}
                                    alt="프로필 이미지"
                                  />
                                </div>
                              </div>
                              <div className={'mt-[10px] pb-[16px] border-b border-[#d9d9d9]'}>
                                <button
                                    onClick={() => handleApplicantClick(applicant)}
                                    className="text-blue-500 text-12-r"
                                >
                                  전체보기
                                </button>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button
                                  onClick={() => handleCall(applicant.user_profiles?.phone)}
                                  className="flex-1 h-[44px] bg-[#fbf1b4] text-16-m text-[#d4a108] py-2 px-4 rounded-[7px] shadow-[0_0_5px_0px_rgba(0,0,0,0.1)]"
                              >
                                전화하기
                              </button>
                              <button
                                  onClick={() => handleSMS(applicant.user_profiles?.phone)}
                                  className="flex-1 h-[44px] bg-[#fbf1b4] text-16-m text-[#d4a108] py-2 px-4 rounded-[7px] shadow-[0_0_5px_0px_rgba(0,0,0,0.1)]"
                              >
                                문자하기
                              </button>
                            </div>
                          </div>
                      ))}
                    </div>
                )}
              </div>
          )}

          {/* 액션 버튼 */}
          {!isOwner && (
              <div
                  className={'fixed bottom-0 left-0 right-0 pt-[15px] pb-[110px] max-w-[550px] w-full mx-auto bg-brand-bg/50 backdrop-blur-md'}>
                <div className="sticky bottom-4 z-50">
                  <div className="w-full max-w-[550px] mx-auto px-[23px]">
                    <div className="flex gap-3">
                      <Button
                          onClick={hasApplied ? handleViewApplication : handleInquiry}
                          className="rounded-[15px] text-16-m h-[54px] w-full flex-1 bg-brand-main"
                      >
                        {hasApplied ? '지원 내용 확인' : '문의하기'}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
          )}

          {/* 작성자용 액션 버튼 */}
          {isOwner && (
              <div
                  className={'fixed bottom-0 left-0 right-0 pt-[15px] pb-[110px] max-w-[550px] mx-auto bg-brand-bg/50 backdrop-blur-md'}>
                <div className="sticky bottom-4 z-50">
                  <div className="w-full max-w-[550px] mx-auto px-[44px]">
                    <div className="flex gap-3">
                      <Button
                          onClick={handleRecruitmentComplete}
                          disabled={isRecruitmentComplete}
                          className="rounded-[15px] text-16-m h-[54px] flex-1 bg-brand-main"
                      >
                        {isRecruitmentComplete ? '모집 완료됨' : '모집 완료'}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
          )}
        </div>

        {/* 로그인 필요 다이얼로그 */}
        <AlertDialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
          {/* 커스텀 오버레이 */}
          {showLoginDialog && (
              <div
                  className="fixed inset-0 z-[9998] bg-black/60"
                  onClick={() => setShowLoginDialog(false)}
              />
          )}
          <CustomAlertDialogContent
              className="z-[9999] fixed left-[50%] top-[50%] grid w-[85vw] rounded-[15px] max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border p-6 pt-[36px] shadow-[0_0_6px_0px_rgba(0,0,0,0.25)] bg-white">
            <AlertDialogHeader>
              <AlertDialogTitle>로그인이 필요합니다</AlertDialogTitle>
              <AlertDialogDescription>
                {loginDialogContext === 'favorite'
                    ? '찜 기능을 사용하려면 로그인해주세요.'
                    : '문의하기 기능을 사용하려면 로그인해주세요.'
                }
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex flex-row gap-3">
              <AlertDialogCancel className="mt-0 flex-1 text-16-m">취소</AlertDialogCancel>
              <AlertDialogAction onClick={() => window.location.href = '/login'} className="flex-1 text-16-m">
                로그인하기
              </AlertDialogAction>
            </AlertDialogFooter>
          </CustomAlertDialogContent>
        </AlertDialog>

        {/* 신청 기능 준비 중 다이얼로그 */}
        <AlertDialog open={showApplyDialog} onOpenChange={setShowApplyDialog}>
          {/* 커스텀 오버레이 */}
          {showApplyDialog && (
              <div
                  className="fixed inset-0 z-[9998] bg-black/60"
                  onClick={() => setShowApplyDialog(false)}
              />
          )}
          <CustomAlertDialogContent className="z-[9999] bg-white">
            <AlertDialogHeader>
              <AlertDialogTitle>신청 기능 준비 중</AlertDialogTitle>
              <AlertDialogDescription>
                봉사 신청 기능은 현재 준비 중입니다. 곧 만나보실 수 있습니다.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction onClick={() => setShowApplyDialog(false)}>
                확인
              </AlertDialogAction>
            </AlertDialogFooter>
          </CustomAlertDialogContent>
        </AlertDialog>

        {/* 지원자 상세 모달 */}
        {showApplicantModal && selectedApplicant && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-[15px] max-w-md w-full max-h-[80vh] overflow-y-auto">
                <div className="relative pt-[22px] pb-[18px] flex items-center justify-between">
                  <h3 className="w-full text-22-b text-[#333333] text-center">전체보기</h3>
                  <button
                      onClick={() => setShowApplicantModal(false)}
                      className="absolute p-1 top-[18px] right-[18px]"
                  >
                    <X className="h-5 w-5"/>
                  </button>
                </div>

                <div className="px-[20px]">
                  <div className="flex items-center justify-center gap-x-[4px] mb-[24px] text-text-800">
                      <p className="text-18-b ">{selectedApplicant.user_profiles?.display_name || '익명'}</p> |
                      <p className="text-16-r">{selectedApplicant.user_profiles?.phone.replace(/(\d{3})(\d{3,4})(\d{4})/, "$1-$2-$3") || '연락처 없음'}</p>
                  </div>

                  <div className="mb-[24px]">
                    <p className="text-center text-16-r text-gray-700 whitespace-pre-wrap max-h-[270px] overflow-y-auto">
                      {selectedApplicant.message}
                    </p>
                  </div>

                  <div className="mb-4">
                    <div className="flex gap-2">
                      <button
                          onClick={() => handleCall(selectedApplicant.user_profiles?.phone)}
                          className="flex-1 h-[44px] bg-[#fbf1b4] text-16-m text-[#d4a108] py-2 px-4 rounded-[7px] shadow-[0_0_5px_0px_rgba(0,0,0,0.1)]"
                  >
                    전화하기
                  </button>
                  <button
                    onClick={() => handleSMS(selectedApplicant.user_profiles?.phone)}
                    className="flex-1 h-[44px] bg-[#fbf1b4] text-16-m text-[#d4a108] py-2 px-4 rounded-[7px] shadow-[0_0_5px_0px_rgba(0,0,0,0.1)]"
                  >
                    문자하기
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 지원내용 확인 모달 */}
      {showApplicationModal && myApplication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[15px] max-w-md w-full max-h-[80vh] overflow-y-auto shadow-[0_0_12px_0px_rgba(0,0,0,0.1)]">
            <div className="p-6 flex items-center justify-between">
              <h3 className="text-20-m">지원 내용 확인</h3>
            </div>

            <div className="p-[20px] pt-0">
{/*              <div className="mb-6">
                <p className="text-14-m text-gray-600 mb-2">지원 상태</p>
                <div className="inline-block px-[9px] py-[4px] rounded-[7px] text-14-b bg-brand-point text-white">
                  {myApplication.status === 'pending' ? '대기중' :
                   myApplication.status === 'accepted' ? '수락됨' :
                   myApplication.status === 'rejected' ? '거절됨' : '확인중'}
                </div>
              </div>*/}

              <div className="mb-6">
                <div className="px-[15px] py-[20px] bg-brand-bg rounded-[15px] min-h-[100px]">
                  <p className="text-14-r text-gray-900 leading-[1.25] whitespace-pre-wrap break-words">
                    {myApplication.message || '메시지가 없습니다.'}
                  </p>
                </div>
                <p className="text-12-r text-text-800 text-right mt-[10px] mr-[10px]">
                  {moment(myApplication.created_at).format('YY.MM.DD  HH:MM')}
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                    onClick={() => setShowApplicationModal(false)}
                    className="flex-1 rounded-[15px] h-[54px] bg-brand-main text-black text-16-m"
                >
                  닫기
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
