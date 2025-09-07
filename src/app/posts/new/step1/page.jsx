'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

const Step1Page = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    departureAddress: '',
    arrivalAddress: '',
    description: ''
  });
  const [errors, setErrors] = useState({});

  // 페이지 로드 시 로컬 스토리지에서 데이터 복원
  useEffect(() => {
    const savedData = localStorage.getItem('volunteerFormData');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        setFormData(prev => ({
          ...prev,
          ...parsedData.step1
        }));
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
    parsedData.step1 = newFormData;
    localStorage.setItem('volunteerFormData', JSON.stringify(parsedData));
  };

  const handleGoBack = () => {
    router.back();
  };

  const handleNext = () => {
    // 유효성 검사
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = '제목을 입력해주세요.';
    } else if (formData.title.length > 20) {
      newErrors.title = '제목은 20자 이하로 입력해주세요.';
    }

    if (!formData.departureAddress.trim()) {
      newErrors.departureAddress = '출발지 주소를 입력해주세요.';
    }

    if (!formData.arrivalAddress.trim()) {
      newErrors.arrivalAddress = '도착지 주소를 입력해주세요.';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      router.push('/posts/new/step2');
    }
  };

  const handleSearchAddress = (type) => {
    // 주소 검색 로직 (추후 구현)
    console.log(`${type} 주소 검색`);
    // 임시로 더미 데이터 입력
    if (type === 'departure') {
      updateFormData('departureAddress', '서울특별시 강남구 테헤란로 123');
    } else {
      updateFormData('arrivalAddress', '부산광역시 해운대구 해운대로 456');
    }
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
          <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
          <div className="w-2 h-2 rounded-full bg-gray-300"></div>
          <div className="w-2 h-2 rounded-full bg-gray-300"></div>
        </div>
      </div>

      {/* 메인 컨텐츠 */}
      <div className="px-6 py-8">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-2">이동 봉사 정보</h2>
          <p className="text-sm text-gray-500">*표시는 필수 입력 정보입니다.</p>
        </div>

        <div className="space-y-6">
          {/* 제목 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              제목 *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => updateFormData('title', e.target.value)}
              placeholder="제목을 입력해주세요."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              maxLength={20}
            />
            <div className="flex justify-between items-center mt-1">
              <p className="text-xs text-gray-500">특수문자 불가</p>
              <p className="text-xs text-gray-400">{formData.title.length}/20</p>
            </div>
            {errors.title && (
              <p className="text-xs text-red-500 mt-1">{errors.title}</p>
            )}
          </div>

          {/* 이동경로 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              이동경로 *
            </label>

            {/* 출발지 */}
            <div className="mb-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={formData.departureAddress}
                  onChange={(e) => updateFormData('departureAddress', e.target.value)}
                  placeholder="출발지 주소를 검색해 주세요."
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => handleSearchAddress('departure')}
                  className="px-4 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors whitespace-nowrap"
                >
                  출발지 검색
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">출발지 주소를 입력해 주세요.</p>
              {errors.departureAddress && (
                <p className="text-xs text-red-500 mt-1">{errors.departureAddress}</p>
              )}
            </div>

            {/* 도착지 */}
            <div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={formData.arrivalAddress}
                  onChange={(e) => updateFormData('arrivalAddress', e.target.value)}
                  placeholder="도착지 주소를 검색해 주세요."
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => handleSearchAddress('arrival')}
                  className="px-4 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors whitespace-nowrap"
                >
                  도착지 검색
                </button>
              </div>
              {errors.arrivalAddress && (
                <p className="text-xs text-red-500 mt-1">{errors.arrivalAddress}</p>
              )}
            </div>
          </div>

          {/* 설명 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              설명
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => updateFormData('description', e.target.value)}
              placeholder="이번 이동 봉사에 대해 설명해 주세요.&#10;(희망 일정, 컨넬 지원 여부, 구조견에 대한 설명, 봉사자님께 전하는 말 등)"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent h-32 resize-none"
              maxLength={1000}
            />
            <p className="text-xs text-gray-400 mt-1 text-right">{formData.description.length}/1000</p>
          </div>
        </div>

        {/* 다음 버튼 */}
        <button
          onClick={handleNext}
          className="w-full mt-8 py-4 bg-gray-500 text-white rounded-lg font-semibold hover:bg-gray-600 transition-colors"
        >
          다음으로
        </button>
      </div>
    </div>
  );
};

export default Step1Page;
