'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import moment from 'moment';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import IconRightArrow from "../../../../public/img/icon/IconRightArrow";

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

      // 즐겨찾기 상태 확인
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: favoriteData } = await supabase
          .from('favorites')
          .select('id')
          .eq('user_id', user.id)
          .eq('post_id', postId)
          .single();

        setIsFavorite(!!favoriteData);
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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setShowLoginDialog(true);
        return;
      }

      if (isFavorite) {
        // 즐겨찾기 제거
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('post_id', postId);

        if (error) throw error;
        setIsFavorite(false);
      } else {
        // 즐겨찾기 추가
        const { error } = await supabase
          .from('favorites')
          .insert({
            user_id: user.id,
            post_id: postId
          });

        if (error) throw error;
        setIsFavorite(true);
      }
    } catch (err) {
      console.error('즐겨찾기 처리 오류:', err);
      // 에러는 콘솔에만 기록
    }
  };

  const handleGoBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      router.back();
    }
  };

  const handleApply = () => {
    setShowApplyDialog(true);
  };

/*  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">게시물을 불러오는 중...</p>
        </div>
      </div>
    );
  }*/

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
      <div className="min-h-screen bg-white">
        {/* 헤더 */}
        {/*      <div className="bg-white shadow-sm border-b">
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
      </div>*/}
        <div className="bg-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center py-[28px] px-[30px]">
                  <button
                      onClick={handleGoBack}
                      className="mr-[12px]"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="9" height="16" viewBox="0 0 9 16" fill="none">
                      <path d="M8 15L1 8" stroke="black" strokeWidth="2" strokeMiterlimit="10"
                            strokeLinecap="round"/>
                      <path d="M8 0.999999L1 8" stroke="black" strokeWidth="2" strokeMiterlimit="10"
                            strokeLinecap="round"/>
                    </svg>
                  </button>
              <div>
                <h1 className="text-22-m text-black">정보</h1>
              </div>
            </div>
          </div>
        </div>

        {/* 메인 콘텐츠 */}
        <div className="max-w-4xl mx-auto">

          {/* 작성자 정보 */}
          <div className={'relative w-full h-[92px] px-[25px] rounded-b-[15px] bg-white z-10'}>
            <div className="pt-[10px] flex items-center justify-between">
              {/* 링크 추가 */}
              <a className={'flex items-center gap-[9px]'} href={'/'}>
                <div className="relative w-[56px] h-[56px] rounded-full overflow-hidden flex items-center justify-center">
                  {/* 프로필 이미지 추가 */}
                  <img src={'/img/default_profile.jpg'} alt={'이미지'} className={'absolute top-1/2 left-1/2 w-full h-full -translate-x-1/2 -translate-y-1/2 object-cover'}/>
                </div>
                <div>
                  <p className="pr-[30px] mb-[2px] text-18-b">{post.user_profiles?.display_name || '익명'}</p>
                  {/* 전화번호 추가 */}
                  <p className="text-14-l text-[#6c6c6c]">010-0000-0000</p>
                </div>
              </a>
              {/* 링크 추가 */}
              <a className={''} href={'/'}>
                <figure className={'h-[14px]'}>
                  <IconRightArrow fill={'black'}/>
                </figure>
              </a>
            </div>
          </div>
          {/* 게시물 정보 */}
          <Card className="mt-[-15px]">
            {/* 이미지 */}
            <div className={''}>
              <figure className={'relative w-full aspect-[402/343]'}>
                <img src={'/img/dummy_content.jpg'} alt={'이미지'} className={'absolute top-1/2 left-1/2 w-full h-full -translate-x-1/2 -translate-y-1/2 object-cover'}/>
              </figure>
            </div>
            <CardHeader className={'px-[28px] py-[20px]'}>
              <div className="flex flex-col items-start justify-between">
                <div className={'w-full flex flex-col'}>
                  <div className={`flex items-center justify-between mb-[8px]`}>
                    <div>
                    {post.dday < 0 ?
                      <p className={'text-14-m'}>마감되었습니다</p>
                      :
                      <p className={'text-brand-point text-14-m'}><strong className={'text-16-b'}>{post.dday}</strong>일 남았어요!</p>}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <p className="text-12-r text-[#8a8a8a]">
                        {post.deadline} 작성
                      </p>
                    </div>
                  </div>
                  <CardTitle className="text-18-b mb-[10px]">
                    {post.title}
                  </CardTitle>
                  <div className={'flex gap-x-[4px] text-14-r'}>
                    <p>{post.dog_name || '미입력'}</p>
                    <p className={' text-text-800'}>{post.dogSize}</p>
                    <p className={'text-text-800'}>{post.dog_breed || '미입력'}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                </div>
              </div>
            </CardHeader>
            <CardContent className="py-[24px] px-[22px] space-y-6 bg-brand-bg">
              {/* 이동 경로 */}
              <div className={''}>
                <h3 className="text-16-b mb-[10px]">찾아오는 길</h3>
                <div className="flex flex-col p-[18px] bg-white rounded-[15px] shadow-[0_0_12px_0px_rgba(0,0,0,0.1)]">
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
                    <button className={'p-[5px] bg-[#E4E6EB] text-[#808288] text-12-r rounded-[4px]'}>네이버 길찾기</button>
                    <button className={'p-[5px] bg-[#E4E6EB] text-[#808288] text-12-r rounded-[4px]'}>카카오톡 길찾기</button>
                  </div>
                </div>
              </div>

              {/* 상세 설명 */}
              {post.description && (
                  <div>
                    <h3 className="text-16-b mb-[10px]">상세 설명</h3>
                    <div className={'flex flex-col p-[18px] min-h-[115px] bg-white rounded-[15px] shadow-[0_0_12px_0px_rgba(0,0,0,0.1)]'}>
                    <p className="text-text-800 text-16-r whitespace-pre-wrap">{post.description}</p>
                    </div>
                  </div>
              )}
            </CardContent>
          </Card>

          {/* 액션 버튼 */}
          <div className={'fixed bottom-[86px] left-0 right-0 px-[22px] pt-[15px] pb-[24px] bg-brand-bg'}>
            <div className="sticky bottom-4 z-50">
              <div className="">
                <div className="flex gap-3">
                  <Button
                      onClick={handleApply}
                      className="flex-1 bg-brand-main"
                      size="lg"
                  >
                    봉사 신청하기
                  </Button>
                </div>
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
