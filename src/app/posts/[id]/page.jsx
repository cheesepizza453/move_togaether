'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import moment from 'moment';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Calendar, Clock, User, Phone, Heart } from 'lucide-react';
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
  const postId = params.id;

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [showApplyDialog, setShowApplyDialog] = useState(false);

  useEffect(() => {
    if (postId) {
      fetchPost();
    }
  }, [postId]);

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
        dday: moment(postData.deadline).diff(moment(), 'days'),
        isUrgent: moment(postData.deadline).diff(moment(), 'days') <= 1
      };

      setPost(formattedPost);

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
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => window.history.back()}
            className="flex items-center gap-2"
          >
            ← 뒤로
          </Button>
          <Button
            variant="ghost"
            onClick={handleFavoriteToggle}
            className={`flex items-center gap-2 ${
              isFavorite ? 'text-red-500' : 'text-gray-500'
            }`}
          >
            <Heart className={`h-5 w-5 ${isFavorite ? 'fill-current' : ''}`} />
            {isFavorite ? '즐겨찾기 해제' : '즐겨찾기'}
          </Button>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* 게시물 정보 */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
                  {post.title}
                </CardTitle>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    마감일: {post.deadline}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    D-{post.dday < 0 ? '마감' : post.dday}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                {post.isUrgent && (
                  <Badge variant="destructive">긴급</Badge>
                )}
                <Badge variant="outline">{post.dogSize}</Badge>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* 강아지 정보 */}
            <div>
              <h3 className="text-lg font-semibold mb-3">강아지 정보</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <span className="font-medium">이름:</span>
                  <span>{post.dog_name || '미입력'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">품종:</span>
                  <span>{post.breed || '미입력'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">크기:</span>
                  <span>{post.dogSize}</span>
                </div>
              </div>
            </div>

            {/* 이동 경로 */}
            <div>
              <h3 className="text-lg font-semibold mb-3">이동 경로</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-green-600 mt-1" />
                  <div>
                    <p className="font-medium text-green-600">출발지</p>
                    <p className="text-gray-700">{post.departure_address}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-red-600 mt-1" />
                  <div>
                    <p className="font-medium text-red-600">도착지</p>
                    <p className="text-gray-700">{post.arrival_address}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 상세 설명 */}
            {post.description && (
              <div>
                <h3 className="text-lg font-semibold mb-3">상세 설명</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{post.description}</p>
              </div>
            )}

            {/* 작성자 정보 */}
            <div>
              <h3 className="text-lg font-semibold mb-3">작성자 정보</h3>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-gray-600" />
                </div>
                <div>
                  <p className="font-medium">{post.user_profiles?.display_name || '익명'}</p>
                  <p className="text-sm text-gray-600">봉사자</p>
                </div>
              </div>
            </div>

            {/* 보호소 정보 (있는 경우) */}
            {post.shelters && (
              <div>
                <h3 className="text-lg font-semibold mb-3">보호소 정보</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-bold text-sm">보</span>
                    </div>
                    <div>
                      <p className="font-medium">{post.shelters.name}</p>
                      {post.shelters.verified && (
                        <Badge variant="secondary" className="text-xs">인증됨</Badge>
                      )}
                    </div>
                  </div>
                  {post.shelters.description && (
                    <p className="text-sm text-gray-600 mb-2">{post.shelters.description}</p>
                  )}
                  <div className="flex flex-wrap gap-2 text-xs">
                    {post.shelters.phone && (
                      <span className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {post.shelters.phone}
                      </span>
                    )}
                    {post.shelters.instagram && (
                      <span className="text-blue-600">Instagram</span>
                    )}
                    {post.shelters.naver_cafe && (
                      <span className="text-green-600">네이버 카페</span>
                    )}
                    {post.shelters.kakao_openchat && (
                      <span className="text-yellow-600">카카오 오픈채팅</span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 액션 버튼 */}
        <div className="sticky bottom-4 z-50">
          <div className="bg-white rounded-lg shadow-lg p-4">
            <div className="flex gap-3">
              <Button
                onClick={handleApply}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
                size="lg"
              >
                봉사 신청하기
              </Button>
              <Button
                variant="outline"
                onClick={handleFavoriteToggle}
                className={`px-6 ${
                  isFavorite ? 'text-red-500 border-red-500' : ''
                }`}
                size="lg"
              >
                <Heart className={`h-5 w-5 ${isFavorite ? 'fill-current' : ''}`} />
              </Button>
            </div>
          </div>
        </div>
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
    </div>
  );
}
