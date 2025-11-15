'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import ProfileImage from '@/components/common/ProfileImage';

export default function InquiryPage() {
  const params = useParams();
  const router = useRouter();
  const { user, profile } = useAuth();
  const postId = params.id;

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (postId) {
      fetchPost();
    }
  }, [postId]);

  const fetchPost = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/posts/${postId}`);

      if (!response.ok) {
        throw new Error('게시물을 불러올 수 없습니다.');
      }

      const { post: postData } = await response.json();
      setPost(postData);
    } catch (err) {
      console.error('게시물 조회 중 오류:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!message.trim()) {
      alert('메시지를 입력해주세요.');
      return;
    }

    try {
      setSubmitting(true);

      // Supabase 세션에서 토큰 가져오기
      const { data: { session } } = await supabase.auth.getSession();

      const headers = {
        'Content-Type': 'application/json',
      };

      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
        headers['apikey'] = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      }

      const response = await fetch('/api/inquiries', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          post_id: postId,
          message: message.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error('문의 전송에 실패했습니다.');
      }

      alert('문의가 성공적으로 전송되었습니다.');
      router.back();
    } catch (err) {
      console.error('문의 전송 오류:', err);
      alert('문의 전송 중 오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">게시물을 찾을 수 없습니다.</p>
          <Button onClick={() => router.back()}>
            뒤로 가기
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* 헤더 */}
      <div className="bg-white">
        <div className="w-full h-[72px] flex items-center justify-between px-[30px] py-[28px]">
          <div className={'flex items-center'}>
            <button
                onClick={() => router.back()}
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
              문의하기
            </h1>
          </div>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="max-w-4xl mx-auto px-[18px]">
        {/* 포스트 제목 */}
        <div className="mb-[30px]">
          <h2 className="px-[10px] text-18-b text-black leading-[1.25]">
            {post.title}
          </h2>
        </div>

        {/* 지원자 정보 */}
        <Card className="rounded-[15px] mb-[24px] p-[20px] shadow-[0_0_12px_0_rgba(0,0,0,0.07)]">
          <CardHeader>
            <CardTitle className="text-16-b mb-[6px]">지원자 정보</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-[20px] text-12-r text-[#676767] leading-[1.25]">
              문의는 한 번 남기면 지울 수 없어요! 문의가 전달되면 내 연락처가 요청자에게만 공개되며, 강아지가 이동을 마치면 임보자는 지원자님의 정보를 다시 확인할 수 없답니다.
            </p>
            <div className="flex items-center gap-3">
              <div className="bg-yellow-100 overflow-hidden rounded-full shadow-[0_0_9px_0_rgba(0,0,0,0.2)]">
                <ProfileImage
                  profileImage={profile?.profile_image}
                  size={40}
                  alt="profile"
                />
              </div>
              <div className={'flex items-center gap-x-[5px]'}>
                <p className="text-18-b">{profile?.display_name || '익명'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 문의 폼 */}
        <Card>
          <CardHeader>
            <CardTitle className="mb-[12px] text-16-b">전달할 메시지 <span className="text-red-500">*</span></CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="봉사 가능 일정, 이동수단(자차/대중교통) 등 추가로 전달할 사항을 적어주세요. 개인 SNS로 미리 연락을 취하셨을 경우 연락한 채널과 마이디를 적어주시면 소통에 도움이 됩니다."
                    className="p-[15px] min-h-[160px] rounded-[15px] text-14-r resize-none bg-text-100 border border-text-300 text-text-800 focus:bg-brand-bg focus-visible:ring-0 focus-visible:ring-transparent focus:outline-none focus:border-brand-main focus:text-brand-yellow-dark"
                    maxLength={1000}
                />
                <div className="flex justify-end mt-[8px]">
                  <span className="text-12-l text-text-800">
                    {message.length}/1000
                  </span>
                </div>
              </div>
              <div
                  className={'fixed bottom-[86px] left-0 right-0 pt-[15px] pb-[24px] max-w-[550px] mx-auto bg-white'}>
                <div className="sticky bottom-4 z-50">
                  <div className="w-full max-w-[550px] mx-auto px-[18px]">
                    <Button
                        disabled={submitting || !message.trim()}
                        className="w-full rounded-[15px] text-16-m h-[54px] flex-1 bg-brand-main"
                    >
                      {submitting ? '전송 중...' : '문의 완료'}
                    </Button>
                  </div>
                </div>
                  </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
);
}
