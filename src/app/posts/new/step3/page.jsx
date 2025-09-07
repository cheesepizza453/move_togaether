'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

const Step3Page = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    relatedPostLink: ''
  });
  const [errors, setErrors] = useState({});

  // 페이지 로드 시 로컬 스토리지에서 데이터 복원
  useEffect(() => {
    const savedData = localStorage.getItem('volunteerFormData');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        if (parsedData.step3) {
          setFormData(prev => ({
            ...prev,
            ...parsedData.step3
          }));
        }
      } catch (error) {
        console.error('로컬 스토리지 데이터 파싱 오류:', error);
      }
    }
  }, []);

  // 폼 데이터 변경 시 로컬 스토리지에 저장
  const updateFormData = (field, value) => {
    const newFormData = { ...formData, [field]: value };
    setFormData(newFormData);

    // 로컬 스토리지에 저장
    const savedData = localStorage.getItem('volunteerFormData');
    const parsedData = savedData ? JSON.parse(savedData) : {};
    parsedData.step3 = newFormData;
    localStorage.setItem('volunteerFormData', JSON.stringify(parsedData));
  };

  const handleGoBack = () => {
    router.back();
  };

  const handlePreview = () => {
    // 유효성 검사 (선택사항이므로 빈 값도 허용)
    setErrors({});

    // URL 형식 검증 (입력된 경우에만)
    if (formData.relatedPostLink.trim()) {
      const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
      if (!urlPattern.test(formData.relatedPostLink)) {
        setErrors({ relatedPostLink: '올바른 URL 형식이 아닙니다.' });
        return;
      }
    }

    // 미리보기 페이지로 이동
    router.push('/posts/new/preview');
  };

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
          <h1 className="text-lg font-semibold">이동 봉사 요청</h1>
        </div>

        {/* 진행률 표시 */}
        <div className="flex justify-center mt-4 space-x-2">
          <div className="w-2 h-2 rounded-full bg-yellow-500 flex items-center justify-center">
            <div className="w-1 h-1 bg-white rounded-full"></div>
          </div>
          <div className="w-2 h-2 rounded-full bg-yellow-500 flex items-center justify-center">
            <div className="w-1 h-1 bg-white rounded-full"></div>
          </div>
          <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
        </div>
      </div>

      {/* 메인 컨텐츠 */}
      <div className="px-6 py-8">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-2">추가 정보</h2>
        </div>

        <div className="space-y-6">
          {/* 관련 게시물 링크 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              관련 게시물 링크
            </label>
            <input
              type="url"
              value={formData.relatedPostLink}
              onChange={(e) => updateFormData('relatedPostLink', e.target.value)}
              placeholder="보호견과 관련된 게시물 링크를 입력해 주세요."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            />
            {errors.relatedPostLink && (
              <p className="text-xs text-red-500 mt-1">{errors.relatedPostLink}</p>
            )}
          </div>
        </div>

        {/* 미리보기 버튼 */}
        <button
          onClick={handlePreview}
          className="w-full mt-8 py-4 bg-yellow-500 text-white rounded-lg font-semibold hover:bg-yellow-600 transition-colors"
        >
          미리보기
        </button>
      </div>
    </div>
  );
};

export default Step3Page;
