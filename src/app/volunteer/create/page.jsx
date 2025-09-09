'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { supabase, getSession } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import FormStep from '@/components/volunteer/FormStep';
import Step1 from '@/components/volunteer/Step1';
import Step2 from '@/components/volunteer/Step2';
import Step3 from '@/components/volunteer/Step3';
import Preview from '@/components/volunteer/Preview';

const VolunteerCreate = () => {
  const router = useRouter();
  const fileInputRef = useRef(null);
  const { user, session } = useAuth();

  // 전역 에러 핸들러 추가 (브라우저 확장 프로그램 충돌 방지)
  React.useEffect(() => {
    const handleError = (event) => {
      if (event.error && event.error.message &&
          (event.error.message.includes('message port closed') ||
           event.error.message.includes('content.js'))) {
        console.warn('브라우저 확장 프로그램과의 충돌 감지, 무시합니다:', event.error);
        event.preventDefault();
        event.stopPropagation();
        return false;
      }
    };

    const handleUnhandledRejection = (event) => {
      if (event.reason && event.reason.message &&
          (event.reason.message.includes('message port closed') ||
           event.reason.message.includes('content.js'))) {
        console.warn('브라우저 확장 프로그램과의 충돌 감지, 무시합니다:', event.reason);
        event.preventDefault();
        event.stopPropagation();
        return false;
      }
    };

    // 더 강력한 에러 핸들링
    const originalConsoleError = console.error;
    console.error = (...args) => {
      const message = args.join(' ');
      if (message.includes('message port closed') || message.includes('content.js')) {
        console.warn('확장 프로그램 오류 무시:', ...args);
        return;
      }
      originalConsoleError.apply(console, args);
    };

    window.addEventListener('error', handleError, true);
    window.addEventListener('unhandledrejection', handleUnhandledRejection, true);

    return () => {
      window.removeEventListener('error', handleError, true);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection, true);
      console.error = originalConsoleError;
    };
  }, []);

  // 현재 단계 상태
  const [currentStep, setCurrentStep] = useState(1);

  // 폼 데이터 상태
  const [formData, setFormData] = useState({
    // Step 1: 이동 봉사 정보
    title: '',
    departureAddress: '',
    departureLat: null,
    departureLng: null,
    arrivalAddress: '',
    arrivalLat: null,
    arrivalLng: null,
    description: '',
    // Step 2: 구조견 정보
    name: '',
    photo: null,
    size: '',
    breed: '',
    // Step 3: 추가 정보
    relatedPostLink: ''
  });

  // 에러 상태
  const [errors, setErrors] = useState({});

  // 사진 미리보기 상태
  const [photoPreview, setPhotoPreview] = useState(null);

  // 로딩 상태
  const [loading, setLoading] = useState(false);

  // 주소 검증 상태
  const [addressValidation, setAddressValidation] = useState({
    departure: { isValid: null, message: '' },
    arrival: { isValid: null, message: '' }
  });

  // 주소 검색 결과 상태
  const [departureSearchResults, setDepartureSearchResults] = useState([]);
  const [arrivalSearchResults, setArrivalSearchResults] = useState([]);
  const [isSearchingDeparture, setIsSearchingDeparture] = useState(false);
  const [isSearchingArrival, setIsSearchingArrival] = useState(false);

  // 폼 데이터 변경 (에러 핸들링 추가)
  const updateFormData = (field, value) => {
    try {
      setFormData(prev => ({ ...prev, [field]: value }));
    } catch (error) {
      console.error('폼 데이터 업데이트 오류:', error);
    }
  };

  const handleGoBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      router.back();
    }
  };

  const handleNext = () => {
    const newErrors = {};

    if (currentStep === 1) {
      // Step 1 유효성 검사
      if (!formData.title.trim()) {
        newErrors.title = '제목을 입력해주세요.';
      } else if (formData.title.length > 100) {
        newErrors.title = '제목은 100자 이하로 입력해주세요.';
      }

      if (!formData.description.trim()) {
        newErrors.description = '설명을 입력해주세요.';
      } else if (formData.description.length > 1000) {
        newErrors.description = '설명은 1000자 이하로 입력해주세요.';
      }

      if (!formData.departureAddress.trim()) {
        newErrors.departureAddress = '출발지 주소를 입력해주세요.';
      } else if (addressValidation.departure.isValid !== true) {
        newErrors.departureAddress = '출발지 주소를 검증해주세요.';
      }

      if (!formData.arrivalAddress.trim()) {
        newErrors.arrivalAddress = '도착지 주소를 입력해주세요.';
      } else if (addressValidation.arrival.isValid !== true) {
        newErrors.arrivalAddress = '도착지 주소를 검증해주세요.';
      }
    } else if (currentStep === 2) {
      // Step 2 유효성 검사
      if (!formData.name.trim()) {
        newErrors.name = '이름을 입력해주세요.';
      } else if (formData.name.length > 20) {
        newErrors.name = '이름은 20자 이하로 입력해주세요.';
      }

      if (!formData.size) {
        newErrors.size = '크기를 선택해주세요.';
      }
    } else if (currentStep === 3) {
      // Step 3 유효성 검사 (URL 형식 검증)
      if (formData.relatedPostLink.trim()) {
        const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
        if (!urlPattern.test(formData.relatedPostLink)) {
          newErrors.relatedPostLink = '올바른 URL 형식이 아닙니다.';
        }
      }
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      if (currentStep < 3) {
        setCurrentStep(currentStep + 1);
      } else {
        // 미리보기 모드로 전환
        setCurrentStep(4);
      }
    }
  };


  const handleSearchAddress = async (type, baseAddress) => {
    if (!baseAddress.trim()) {
      return;
    }

    // 검색 중 상태 설정
    if (type === 'departure') {
      setIsSearchingDeparture(true);
      setDepartureSearchResults([]);
    } else {
      setIsSearchingArrival(true);
      setArrivalSearchResults([]);
    }

    try {
      const response = await fetch('/api/validate-address', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ address: baseAddress }),
      });

      const data = await response.json();

      if (data.success && data.results) {
        // 검색 결과 저장
        if (type === 'departure') {
          setDepartureSearchResults(data.results);
        } else {
          setArrivalSearchResults(data.results);
        }

        // 검증 상태 업데이트
        setAddressValidation(prev => ({
          ...prev,
          [type]: {
            isValid: data.isValid,
            message: data.message
          }
        }));
      } else {
        // 검색 실패 시
        if (type === 'departure') {
          setDepartureSearchResults([]);
        } else {
          setArrivalSearchResults([]);
        }

        setAddressValidation(prev => ({
          ...prev,
          [type]: {
            isValid: false,
            message: '주소 검색 중 오류가 발생했습니다.'
          }
        }));
      }
    } catch (error) {
      console.error('주소 검색 오류:', error);
      if (type === 'departure') {
        setDepartureSearchResults([]);
      } else {
        setArrivalSearchResults([]);
      }

      setAddressValidation(prev => ({
        ...prev,
        [type]: {
          isValid: false,
          message: '주소 검색 중 오류가 발생했습니다.'
        }
      }));
    } finally {
      // 검색 중 상태 해제
      if (type === 'departure') {
        setIsSearchingDeparture(false);
      } else {
        setIsSearchingArrival(false);
      }
    }
  };

  // 주소 입력 변경 핸들러
  const handleAddressChange = (type, value) => {
    updateFormData(type === 'departure' ? 'departureAddress' : 'arrivalAddress', value);

    // 주소가 변경되면 위경도 좌표도 초기화
    if (type === 'departure') {
      updateFormData('departureLat', null);
      updateFormData('departureLng', null);
      setDepartureSearchResults([]);
    } else {
      updateFormData('arrivalLat', null);
      updateFormData('arrivalLng', null);
      setArrivalSearchResults([]);
    }

    // 주소가 변경되면 검증 상태 초기화
    setAddressValidation(prev => ({
      ...prev,
      [type]: { isValid: null, message: '' }
    }));
  };

  // 주소 선택 핸들러
  const handleSelectDepartureAddress = (selectedAddress, detailAddress = '') => {
    // 주소를 우선적으로 사용 (도로명주소 > 지번주소 > 장소명)
    const baseAddress = selectedAddress.road_address_name ||
                       selectedAddress.address_name ||
                       selectedAddress.place_name;

    // 상세주소가 있으면 추가
    const fullAddress = detailAddress ? `${baseAddress} ${detailAddress}` : baseAddress;

    // 위경도 좌표 추출
    const lat = selectedAddress.y ? parseFloat(selectedAddress.y) : null;
    const lng = selectedAddress.x ? parseFloat(selectedAddress.x) : null;

    updateFormData('departureAddress', fullAddress);
    updateFormData('departureLat', lat);
    updateFormData('departureLng', lng);

    setDepartureSearchResults([]);
    setAddressValidation(prev => ({
      ...prev,
      departure: { isValid: true, message: '유효한 주소입니다.' }
    }));
  };

  const handleSelectArrivalAddress = (selectedAddress, detailAddress = '') => {
    // 주소를 우선적으로 사용 (도로명주소 > 지번주소 > 장소명)
    const baseAddress = selectedAddress.road_address_name ||
                       selectedAddress.address_name ||
                       selectedAddress.place_name;

    // 상세주소가 있으면 추가
    const fullAddress = detailAddress ? `${baseAddress} ${detailAddress}` : baseAddress;

    // 위경도 좌표 추출
    const lat = selectedAddress.y ? parseFloat(selectedAddress.y) : null;
    const lng = selectedAddress.x ? parseFloat(selectedAddress.x) : null;

    updateFormData('arrivalAddress', fullAddress);
    updateFormData('arrivalLat', lat);
    updateFormData('arrivalLng', lng);

    setArrivalSearchResults([]);
    setAddressValidation(prev => ({
      ...prev,
      arrival: { isValid: true, message: '유효한 주소입니다.' }
    }));
  };

  const handlePhotoUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // 파일 크기 검증 (500KB 제한)
      if (file.size > 500 * 1024) {
        toast.error('파일 크기는 500KB 이하로 업로드해주세요.');
        return;
      }

      // 이미지 파일 검증
      if (!file.type.startsWith('image/')) {
        toast.error('이미지 파일만 업로드 가능합니다.');
        return;
      }

      // FileReader로 이미지 미리보기 생성 (Promise 기반)
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const base64String = e.target.result;
          setPhotoPreview(base64String);
          updateFormData('photo', base64String);
        } catch (error) {
          console.error('이미지 처리 오류:', error);
          toast.error('이미지 처리 중 오류가 발생했습니다.');
        }
      };

      reader.onerror = (error) => {
        console.error('파일 읽기 오류:', error);
        toast.error('파일을 읽는 중 오류가 발생했습니다.');
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

  const handleEdit = (step) => {
    setCurrentStep(step);
  };

  const handleSubmit = async () => {
    console.log('=== 제출 시작 ===');
    console.log('폼 데이터:', formData);
    setLoading(true);

    try {
      // 세션 확인 (AuthContext의 user와 직접 세션 확인 조합)
      console.log('세션 확인 중...');
      console.log('AuthContext 사용자:', {
        hasUser: !!user,
        userId: user?.id
      });

      if (!user) {
        console.log('사용자 없음, 로그인 페이지로 이동');
        toast.error('로그인이 필요합니다.');
        router.push('/login');
        return;
      }

      // 현재 세션에서 토큰 가져오기
      const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !currentSession) {
        console.log('세션 토큰 없음, 로그인 페이지로 이동');
        toast.error('세션이 만료되었습니다. 다시 로그인해주세요.');
        router.push('/login');
        return;
      }

      console.log('세션 확인 완료:', {
        hasSession: !!currentSession,
        hasToken: !!currentSession?.access_token
      });

      // 서버로 데이터 전송 (타임아웃 추가)
      console.log('API 호출 시작...');

      const fetchPromise = fetch('/api/posts/volunteer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentSession.access_token}`,
          'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        },
        body: JSON.stringify(formData),
      });

      const fetchTimeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('API 호출 타임아웃')), 30000)
      );

      const response = await Promise.race([fetchPromise, fetchTimeoutPromise]);

      console.log('API 응답 상태:', response.status);
      const result = await response.json();
      console.log('API 응답 결과:', result);

      if (result.success) {
        console.log('등록 성공!');
        toast.success('이동 봉사 요청이 등록되었습니다!');
        router.push('/');
      } else {
        console.log('등록 실패:', result.error);
        toast.error(result.error || '등록에 실패했습니다.');
      }
    } catch (error) {
      console.error('등록 오류:', error);

      if (error.message === 'API 호출 타임아웃') {
        toast.error('서버 응답이 지연되고 있습니다. 잠시 후 다시 시도해주세요.');
      } else {
        toast.error('등록 중 오류가 발생했습니다.');
      }
    } finally {
      console.log('제출 완료, 로딩 상태 해제');
      setLoading(false);
    }
  };

  // 다음 버튼 비활성화 조건
  const isNextDisabled = () => {
    if (currentStep === 1) {
      return !formData.title.trim() ||
             !formData.departureAddress.trim() ||
             !formData.description.trim() ||
             addressValidation.departure.isValid !== true ||
             addressValidation.arrival.isValid !== true;
    } else if (currentStep === 2) {
      return !formData.name.trim() || !formData.size;
    }
    return false;
  };

  // 단계별 제목과 설명
  const getStepInfo = () => {
    switch (currentStep) {
      case 1:
        return {
          title: '이동 봉사 정보',
          description: '봉사 활동에 대한 기본 정보를 입력해주세요'
        };
      case 2:
        return {
          title: '강아지 정보',
          description: '이동할 강아지의 정보를 입력해주세요'
        };
      case 3:
        return {
          title: '추가 정보',
          description: '관련 게시글 링크 등 추가 정보를 입력해주세요'
        };
      default:
        return {
          title: '이동 봉사 요청',
          description: '봉사 활동을 등록해주세요'
        };
    }
  };

  const stepInfo = getStepInfo();

  // 미리보기 단계인 경우
  if (currentStep === 4) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* 헤더 */}
        <div className="bg-white border-b border-gray-200 px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={handleGoBack}
                className="mr-3 p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">이동 봉사 요청 미리보기</h1>
                <p className="text-sm text-gray-600">입력하신 정보를 확인하고 등록해주세요</p>
              </div>
            </div>
          </div>
        </div>

        {/* 컨텐츠 */}
        <div className="px-4 py-6">
          <Preview
            formData={formData}
            photoPreview={photoPreview}
            onEdit={handleEdit}
            onSubmit={handleSubmit}
            loading={loading}
          />
        </div>
      </div>
    );
  }

  return (
    <FormStep
      title={stepInfo.title}
      description={stepInfo.description}
      stepNumber={currentStep}
      totalSteps={3}
      onBack={handleGoBack}
      onNext={handleNext}
      isNextDisabled={isNextDisabled()}
      nextButtonText={currentStep < 3 ? '다음' : '미리보기'}
      showNextButton={true}
    >
      {currentStep === 1 && (
        <Step1
          formData={formData}
          errors={errors}
          addressValidation={addressValidation}
          onFormDataChange={updateFormData}
          onAddressChange={handleAddressChange}
          onSearchAddress={handleSearchAddress}
          departureSearchResults={departureSearchResults}
          arrivalSearchResults={arrivalSearchResults}
          isSearchingDeparture={isSearchingDeparture}
          isSearchingArrival={isSearchingArrival}
          onSelectDepartureAddress={handleSelectDepartureAddress}
          onSelectArrivalAddress={handleSelectArrivalAddress}
        />
      )}

      {currentStep === 2 && (
        <Step2
          formData={formData}
          errors={errors}
          photoPreview={photoPreview}
          onFormDataChange={updateFormData}
          onPhotoChange={(base64) => {
            setPhotoPreview(base64);
            updateFormData('photo', base64);
          }}
          onPhotoRemove={() => {
            setPhotoPreview(null);
            updateFormData('photo', null);
            if (fileInputRef.current) {
              fileInputRef.current.value = '';
            }
          }}
        />
      )}

      {currentStep === 3 && (
        <Step3
          formData={formData}
          errors={errors}
          onFormDataChange={updateFormData}
        />
      )}
    </FormStep>
  );
};

export default VolunteerCreate;
