'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Edit3 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

const PreviewPage = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    step1: {},
    step2: {},
    step3: {}
  });
  const [loading, setLoading] = useState(false);

  // 페이지 로드 시 로컬 스토리지에서 모든 데이터 복원
  useEffect(() => {
    const savedData = localStorage.getItem('volunteerFormData');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        setFormData(parsedData);
      } catch (error) {
        console.error('로컬 스토리지 데이터 파싱 오류:', error);
        toast.error('데이터를 불러올 수 없습니다.');
        router.push('/posts/new/step1');
      }
    } else {
      toast.error('저장된 데이터가 없습니다.');
      router.push('/posts/new/step1');
    }
  }, [router]);

  const handleGoBack = () => {
    router.back();
  };

  const handleEdit = (step) => {
    router.push(`/posts/new/step${step}`);
  };

  const handleSubmit = async () => {
    setLoading(true);

    try {
      // Supabase에서 현재 사용자의 세션 토큰 가져오기
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        toast.error('로그인이 필요합니다.');
        router.push('/login');
        return;
      }

      // 서버로 데이터 전송
      const response = await fetch('/api/posts/volunteer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          ...formData.step1,
          ...formData.step2,
          ...formData.step3
        }),
      });

      const result = await response.json();

      if (result.success) {
        // 성공 시 로컬 스토리지 정리
        localStorage.removeItem('volunteerFormData');
        toast.success('이동 봉사 요청이 등록되었습니다!');
        router.push('/');
      } else {
        toast.error(result.error || '등록에 실패했습니다.');
      }
    } catch (error) {
      console.error('등록 오류:', error);
      toast.error('등록 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const getSizeLabel = (size) => {
    const sizeMap = {
      'small': '소형 (5kg)',
      'medium-small': '중소형 (5.1kg~8kg)',
      'medium': '중형 (8.1kg~20kg)',
      'large': '대형 (20.1kg)'
    };
    return sizeMap[size] || size;
  };

  if (!formData.step1.title) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-yellow-500 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">데이터 로딩 중...</h2>
          <p className="text-gray-500">잠시만 기다려주세요.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* 헤더 */}
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="flex items-center">
          <button
            onClick={handleGoBack}
            className="mr-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft size={20} className="text-gray-600" />
          </button>
          <h1 className="text-lg font-semibold">이동 봉사 요청 미리보기</h1>
        </div>
      </div>

      {/* 메인 컨텐츠 */}
      <div className="px-6 py-8">
        <div className="space-y-8">
          {/* 1단계: 이동 봉사 정보 */}
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-800">이동 봉사 정보</h2>
              <button
                onClick={() => handleEdit(1)}
                className="flex items-center text-yellow-600 hover:text-yellow-700 transition-colors"
              >
                <Edit3 size={16} className="mr-1" />
                <span className="text-sm">수정</span>
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <span className="text-sm font-medium text-gray-600">제목:</span>
                <p className="text-gray-800">{formData.step1.title}</p>
              </div>

              <div>
                <span className="text-sm font-medium text-gray-600">출발지:</span>
                <p className="text-gray-800">{formData.step1.departureAddress}</p>
              </div>

              <div>
                <span className="text-sm font-medium text-gray-600">도착지:</span>
                <p className="text-gray-800">{formData.step1.arrivalAddress}</p>
              </div>

              {formData.step1.description && (
                <div>
                  <span className="text-sm font-medium text-gray-600">설명:</span>
                  <p className="text-gray-800 whitespace-pre-wrap">{formData.step1.description}</p>
                </div>
              )}
            </div>
          </div>

          {/* 2단계: 구조견 정보 */}
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-800">구조견 정보</h2>
              <button
                onClick={() => handleEdit(2)}
                className="flex items-center text-yellow-600 hover:text-yellow-700 transition-colors"
              >
                <Edit3 size={16} className="mr-1" />
                <span className="text-sm">수정</span>
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <span className="text-sm font-medium text-gray-600">이름:</span>
                <p className="text-gray-800">{formData.step2.name}</p>
              </div>

              {formData.step2.photo && (
                <div>
                  <span className="text-sm font-medium text-gray-600">사진:</span>
                  <div className="mt-2">
                    <img
                      src={formData.step2.photo}
                      alt="구조견 사진"
                      className="w-32 h-32 object-cover rounded-lg border border-gray-300"
                    />
                  </div>
                </div>
              )}

              <div>
                <span className="text-sm font-medium text-gray-600">크기:</span>
                <p className="text-gray-800">{getSizeLabel(formData.step2.size)}</p>
              </div>

              {formData.step2.breed && (
                <div>
                  <span className="text-sm font-medium text-gray-600">견종:</span>
                  <p className="text-gray-800">{formData.step2.breed}</p>
                </div>
              )}
            </div>
          </div>

          {/* 3단계: 추가 정보 */}
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-800">추가 정보</h2>
              <button
                onClick={() => handleEdit(3)}
                className="flex items-center text-yellow-600 hover:text-yellow-700 transition-colors"
              >
                <Edit3 size={16} className="mr-1" />
                <span className="text-sm">수정</span>
              </button>
            </div>

            <div className="space-y-3">
              {formData.step3.relatedPostLink ? (
                <div>
                  <span className="text-sm font-medium text-gray-600">관련 게시물 링크:</span>
                  <a
                    href={formData.step3.relatedPostLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline block mt-1 break-all"
                  >
                    {formData.step3.relatedPostLink}
                  </a>
                </div>
              ) : (
                <p className="text-gray-500 text-sm">관련 게시물 링크가 없습니다.</p>
              )}
            </div>
          </div>
        </div>

        {/* 제출 버튼 */}
        <div className="mt-8 space-y-3">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className={`w-full py-4 rounded-lg font-semibold transition-colors ${
              loading
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-yellow-500 text-white hover:bg-yellow-600'
            }`}
          >
            {loading ? '등록 중...' : '이동 봉사 요청 등록하기'}
          </button>

          <button
            onClick={() => router.push('/posts/new/step1')}
            className="w-full py-3 text-gray-600 hover:text-gray-800 transition-colors"
          >
            처음부터 다시 작성하기
          </button>
        </div>
      </div>
    </div>
  );
};

export default PreviewPage;
