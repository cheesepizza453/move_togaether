'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, User, Phone } from 'lucide-react';

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

      const response = await fetch('/api/inquiries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
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
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
                 <h1 className="text-lg font-semibold">문의하기</h1>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* 포스트 제목 */}
        <div className="mb-6">
          <h2 className="text-lg font-bold text-gray-900">
            {post.title}
          </h2>
        </div>

        {/* 지원자 정보 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base font-semibold">지원자 정보</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              문의자의 연락처가 임보자에게 공개됩니다. 남기신 문의는 삭제할 수 없으며 입양 완료 시 임보자는 지원자의 정보를 확인할 수 없습니다.
            </p>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-gray-600" />
              </div>
              <div>
                <p className="font-medium">{profile?.display_name || '사용자'}</p>
                <p className="text-sm text-gray-600">{profile?.phone || '연락처 없음'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 문의 폼 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">전달할 메시지</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="봉사 가능 열정, 이동수단 자차/대중교통 등 추가로 전달할 사항을 적어주세요. 개인 SNS로 미리 연락을 취하셨을 경우 연락한 채널과 마이디를 적어주시면 소통에 도움이 됩니다."
                  className="min-h-[120px] resize-none"
                  maxLength={1000}
                />
                <div className="flex justify-end mt-2">
                  <span className="text-sm text-gray-500">
                    {message.length}/1000
                  </span>
                </div>
              </div>

              <Button
                type="submit"
                disabled={submitting || !message.trim()}
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-medium"
                size="lg"
              >
                {submitting ? '전송 중...' : '문의 완료'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
