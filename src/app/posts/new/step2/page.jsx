'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, X, Plus } from 'lucide-react';

const Step2Page = () => {
  const router = useRouter();
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    name: '',
    photo: null,
    size: '',
    breed: ''
  });
  const [errors, setErrors] = useState({});
  const [photoPreview, setPhotoPreview] = useState(null);

  // 페이지 로드 시 로컬 스토리지에서 데이터 복원
  useEffect(() => {
    const savedData = localStorage.getItem('volunteerFormData');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        if (parsedData.step2) {
          setFormData(prev => ({
            ...prev,
            ...parsedData.step2
          }));

          // 사진이 있다면 미리보기 설정
          if (parsedData.step2.photo) {
            setPhotoPreview(parsedData.step2.photo);
          }
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
    parsedData.step2 = newFormData;
    localStorage.setItem('volunteerFormData', JSON.stringify(parsedData));
  };

  const handleGoBack = () => {
    router.back();
  };

  const handleNext = () => {
    // 유효성 검사
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = '이름을 입력해주세요.';
    } else if (formData.name.length > 20) {
      newErrors.name = '이름은 20자 이하로 입력해주세요.';
    }

    if (!formData.size) {
      newErrors.size = '크기를 선택해주세요.';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      router.push('/posts/new/step3');
    }
  };

  const handlePhotoUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // 파일 크기 검증 (5MB 제한)
      if (file.size > 5 * 1024 * 1024) {
        alert('파일 크기는 5MB 이하로 업로드해주세요.');
        return;
      }

      // 이미지 파일 검증
      if (!file.type.startsWith('image/')) {
        alert('이미지 파일만 업로드 가능합니다.');
        return;
      }

      // FileReader로 이미지 미리보기 생성
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64String = e.target.result;
        setPhotoPreview(base64String);
        updateFormData('photo', base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    setPhotoPreview(null);
    updateFormData('photo', null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSizeChange = (size) => {
    updateFormData('size', size);
  };

  const sizeOptions = [
    { value: 'small', label: '소형', description: '5kg' },
    { value: 'medium-small', label: '중소형', description: '5.1kg~8kg' },
    { value: 'medium', label: '중형', description: '8.1kg~20kg' },
    { value: 'large', label: '대형', description: '20.1kg' }
  ];

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
          <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
          <div className="w-2 h-2 rounded-full bg-gray-300"></div>
        </div>
      </div>

      {/* 메인 컨텐츠 */}
      <div className="px-6 py-8">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-2">구조견 정보</h2>
          <p className="text-sm text-gray-500">*표시는 필수 입력 정보입니다.</p>
        </div>

        <div className="space-y-6">
          {/* 이름 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              이름 *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => updateFormData('name', e.target.value)}
              placeholder="이름을 입력해주세요."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              maxLength={20}
            />
            <p className="text-xs text-gray-400 mt-1 text-right">{formData.name.length}/20</p>
            {errors.name && (
              <p className="text-xs text-red-500 mt-1">{errors.name}</p>
            )}
          </div>

          {/* 사진 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              사진
            </label>
            <p className="text-xs text-gray-500 mb-3">총 1장의 이미지를 업로드 할 수 있습니다.</p>

            <div className="flex gap-3">
              {/* 사진 미리보기 */}
              {photoPreview ? (
                <div className="relative">
                  <img
                    src={photoPreview}
                    alt="구조견 사진"
                    className="w-20 h-20 object-cover rounded-lg border border-gray-300"
                  />
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center hover:border-yellow-500 transition-colors"
                >
                  <Plus size={24} className="text-gray-400" />
                </button>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
            />
          </div>

          {/* 크기 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              크기 *
            </label>
            <p className="text-xs text-gray-500 mb-3">소형: 5kg | 중소형: 5.1kg~8kg | 중형: 8.1kg~20kg | 대형: 20.1kg</p>

            <div className="grid grid-cols-2 gap-3">
              {sizeOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleSizeChange(option.value)}
                  className={`p-3 rounded-lg border-2 transition-colors ${
                    formData.size === option.value
                      ? 'border-yellow-500 bg-yellow-50 text-yellow-700'
                      : 'border-gray-300 hover:border-yellow-300'
                  }`}
                >
                  <div className="text-sm font-medium">{option.label}</div>
                  <div className="text-xs text-gray-500">{option.description}</div>
                </button>
              ))}
            </div>
            {errors.size && (
              <p className="text-xs text-red-500 mt-1">{errors.size}</p>
            )}
          </div>

          {/* 견종 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              견종
            </label>
            <input
              type="text"
              value={formData.breed}
              onChange={(e) => updateFormData('breed', e.target.value)}
              placeholder="견종을 입력하세요."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              maxLength={20}
            />
            <p className="text-xs text-gray-400 mt-1 text-right">{formData.breed.length}/20</p>
          </div>
        </div>

        {/* 다음 버튼 */}
        <button
          onClick={handleNext}
          className="w-full mt-8 py-4 bg-yellow-500 text-white rounded-lg font-semibold hover:bg-yellow-600 transition-colors"
        >
          다음으로
        </button>
      </div>
    </div>
  );
};

export default Step2Page;
