'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import moment from 'moment';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Calendar, Clock, User, Phone, Heart, MessageCircle, Users, X } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function PostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, profile } = useAuth();
  const postId = params.id;

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [showApplyDialog, setShowApplyDialog] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [activeTab, setActiveTab] = useState('post');
  const [applicants, setApplicants] = useState([]);
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [showApplicantModal, setShowApplicantModal] = useState(false);
  const [isRecruitmentComplete, setIsRecruitmentComplete] = useState(false);

  useEffect(() => {
    if (postId) {
      fetchPost();
    }
  }, [postId]);

  useEffect(() => {
    if (user && post) {
      const isOwnerCheck = user.id === post.user_id;
      console.log('작성자 확인:', {
        userId: user.id,
        postUserId: post.user_id,
        isOwner: isOwnerCheck,
        userEmail: user.email,
        postTitle: post.title
      });
      setIsOwner(isOwnerCheck);
    }
  }, [user, post]);

  useEffect(() => {
    if (isOwner && postId) {
      fetchApplicants();
    }
  }, [isOwner, postId]);

  const fetchPost = async () => {
    try {
      setLoading(true);

      // API를 통해 게시물 정보 가져오기
      const response = await fetch(`/api/posts/${postId}`);

      if (!response.ok) {
        if (response.status === 404) {
          setError('존재하지 않는 게시물입니다.');
        } else {
          setError('게시물을 불러올 수 없습니다.');
        }
        return;
      }

      const { post: postData } = await response.json();

      if (!postData) {
        setError('존재하지 않는 게시물입니다.');
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

      setPost(formattedPost);

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
    } catch (err) {
      console.error('게시물 조회 중 오류:', err);
      setError('게시물을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const convertDogSize = (size) => {
    const sizeMap = {
      'small': '소형견',
      'medium': '중형견',
      'large': '대형견'
    };
    return sizeMap[size] || size;
  };

  const formatDeadline = (deadline) => {
    return moment(deadline).format('YY/MM/DD');
  };

  const handleFavoriteToggle = async () => {
    try {
      // 세션 확인
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
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
          toast.success('즐겨찾기에서 제거되었습니다.');
        } else {
          const errorData = await response.json();
          console.error('즐겨찾기 제거 오류:', errorData);
          toast.error('즐겨찾기 제거에 실패했습니다.');
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
          toast.success('즐겨찾기에 추가되었습니다.');
        } else {
          const errorData = await response.json();
          console.error('즐겨찾기 추가 오류:', errorData);
          toast.error('즐겨찾기 추가에 실패했습니다.');
        }
      }
    } catch (err) {
      console.error('즐겨찾기 처리 오류:', err);
      toast.error('오류가 발생했습니다.');
    }
  };

  const handleApply = () => {
    setShowApplyDialog(true);
  };

  const handleInquiry = () => {
    if (!user) {
      setShowLoginDialog(true);
      return;
    }
    router.push(`/posts/${postId}/inquiry`);
  };

  const fetchApplicants = async () => {
    try {
      const response = await fetch(`/api/inquiries?post_id=${postId}`);
      if (response.ok) {
        const { inquiries } = await response.json();
        setApplicants(inquiries || []);
      }
    } catch (err) {
      console.error('지원자 목록 조회 오류:', err);
    }
  };

  const handleApplicantClick = (applicant) => {
    setSelectedApplicant(applicant);
    setShowApplicantModal(true);
  };

  const handleRecruitmentComplete = async () => {
    try {
      const response = await fetch(`/api/posts/${postId}/complete`, {
        method: 'POST',
      });

      if (response.ok) {
        setIsRecruitmentComplete(true);
        setApplicants([]);
        alert('모집이 완료되었습니다.');
      } else {
        alert('모집 완료 처리에 실패했습니다.');
      }
    } catch (err) {
      console.error('모집 완료 오류:', err);
      alert('모집 완료 처리 중 오류가 발생했습니다.');
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">게시물을 불러오는 중...</p>
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
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white">
        {/* 네비게이션 */}
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <Button
            variant="ghost"
            onClick={() => window.history.back()}
            className="p-2"
          >
            ←
          </Button>
          <h1 className="text-lg font-semibold">
            {isOwner ? '작성한 게시물' : '정보'}
          </h1>
          {!isOwner && (
            <Button
              variant="ghost"
              onClick={handleFavoriteToggle}
              className={`p-2 ${
                isFavorite ? 'text-red-500' : 'text-gray-500'
              }`}
            >
              <Heart className={`h-5 w-5 ${isFavorite ? 'fill-current' : ''}`} />
            </Button>
          )}
        </div>

        {/* 탭 (작성자인 경우만) */}
        {isOwner && (
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('post')}
              className={`flex-1 py-3 text-center font-medium ${
                activeTab === 'post'
                  ? 'text-black border-b-2 border-black'
                  : 'text-gray-500'
              }`}
            >
              게시물
            </button>
            <button
              onClick={() => setActiveTab('applicants')}
              className={`flex-1 py-3 text-center font-medium ${
                activeTab === 'applicants'
                  ? 'text-black border-b-2 border-black'
                  : 'text-gray-500'
              }`}
            >
              지원자 {applicants.length}
            </button>
          </div>
        )}
      </div>

      {/* 메인 콘텐츠 */}
      <div className="bg-white min-h-screen">
        {/* 게시물 탭 */}
        {activeTab === 'post' && (
          <div>
            {/* 강아지 이미지 */}
            <div className="relative">
              <img
                src={post.dog_image || '/img/dummy_thumbnail.jpg'}
                alt="강아지 이미지"
                className="w-full h-64 object-cover"
              />
            </div>

            {/* 게시물 정보 */}
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="bg-red-500 text-white text-sm px-2 py-1 rounded">
                  {post.dday}일 남았어요!
                </span>
                <span className="text-sm text-gray-500">{post.created_at} 작성</span>
              </div>

              <h1 className="text-lg font-bold mb-2">{post.title}</h1>
              <p className="text-sm text-gray-600 mb-6">{post.dog_name} {post.dogSize}</p>
              {/* 찾아오는 길 섹션 */}
              <div className="bg-gray-100 rounded-lg p-4 mb-4">
                <h3 className="text-base font-semibold mb-3">찾아오는 길</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="bg-red-500 text-white text-xs px-2 py-1 rounded">출발지</span>
                    <span className="text-sm">{post.departure_address}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded">도착지</span>
                    <span className="text-sm">{post.arrival_address}</span>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={handleNaverMap}
                      className="bg-gray-200 hover:bg-gray-300 text-gray-600 text-xs px-3 py-1 rounded transition-colors"
                    >
                      네이버 길찾기
                    </button>
                    <button
                      onClick={handleKakaoMap}
                      className="bg-gray-200 hover:bg-gray-300 text-gray-600 text-xs px-3 py-1 rounded transition-colors"
                    >
                      카카오톡 길찾기
                    </button>
                  </div>
                </div>
              </div>

              {/* 설명글 섹션 */}
              <div className="bg-gray-100 rounded-lg p-4">
                <h3 className="text-base font-semibold mb-3">설명글</h3>
                <p className="text-sm text-gray-700">{post.description}</p>
              </div>
            </div>
          </div>
        )}

        {/* 지원자 탭 */}
        {activeTab === 'applicants' && (
          <div className="p-4">
            {isRecruitmentComplete ? (
              <div className="text-center py-12">
                <p className="text-red-600 text-lg">
                  모집이 종료되어 신청자 정보를 확인할 수 없습니다.
                </p>
              </div>
            ) : applicants.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">아직 지원자가 없습니다.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {applicants.map((applicant) => (
                  <div key={applicant.id} className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-gray-600" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{applicant.user_profiles?.display_name || '익명'}</p>
                          <p className="text-xs text-gray-600">{applicant.user_profiles?.phone || '연락처 없음'}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">
                          {moment(applicant.created_at).format('YY.MM.DD HH:mm')}
                        </p>
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="text-sm text-gray-700 line-clamp-3">
                        {applicant.message}
                      </p>
                      <button
                        onClick={() => handleApplicantClick(applicant)}
                        className="text-blue-600 text-xs mt-2 hover:underline"
                      >
                        전체보기
                      </button>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleCall(applicant.user_profiles?.phone)}
                        className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-black text-sm py-2 px-4 rounded"
                      >
                        전화하기
                      </button>
                      <button
                        onClick={() => handleSMS(applicant.user_profiles?.phone)}
                        className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm py-2 px-4 rounded"
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
          <div className="sticky bottom-0 bg-white border-t p-4 mt-4">
            <Button
              onClick={handleInquiry}
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-medium py-3"
            >
              문의하기
            </Button>
          </div>
        )}

        {/* 작성자용 액션 버튼 */}
        {isOwner && (
          <div className="sticky bottom-0 bg-white border-t p-4 mt-4">
            <Button
              onClick={handleRecruitmentComplete}
              disabled={isRecruitmentComplete}
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-medium py-3"
            >
              {isRecruitmentComplete ? '모집 완료됨' : '모집 완료'}
            </Button>
          </div>
        )}
      </div>

      {/* 로그인 필요 다이얼로그 */}
      <AlertDialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>로그인이 필요합니다</AlertDialogTitle>
            <AlertDialogDescription>
              찜 기능을 사용하려면 로그인해주세요.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction onClick={() => window.location.href = '/login'}>
              로그인하기
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 신청 기능 준비 중 다이얼로그 */}
      <AlertDialog open={showApplyDialog} onOpenChange={setShowApplyDialog}>
        <AlertDialogContent>
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
        </AlertDialogContent>
      </AlertDialog>

      {/* 지원자 상세 모달 */}
      {showApplicantModal && selectedApplicant && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="text-lg font-semibold">전체보기</h3>
              <button
                onClick={() => setShowApplicantModal(false)}
                className="p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-gray-600" />
                </div>
                <div>
                  <p className="font-medium text-sm">{selectedApplicant.user_profiles?.display_name || '익명'}</p>
                  <p className="text-xs text-gray-600">{selectedApplicant.user_profiles?.phone || '연락처 없음'}</p>
                </div>
              </div>

              <div className="mb-6">
                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  {selectedApplicant.message}
                </p>
              </div>

              <div className="mb-4">
                <p className="text-sm font-medium text-gray-600 mb-2">연락하기</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleCall(selectedApplicant.user_profiles?.phone)}
                    className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-black text-sm py-2 px-4 rounded flex items-center justify-center gap-2"
                  >
                    <Phone className="h-4 w-4" />
                    전화하기
                  </button>
                  <button
                    onClick={() => handleSMS(selectedApplicant.user_profiles?.phone)}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm py-2 px-4 rounded flex items-center justify-center gap-2"
                  >
                    <MessageCircle className="h-4 w-4" />
                    문자하기
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
