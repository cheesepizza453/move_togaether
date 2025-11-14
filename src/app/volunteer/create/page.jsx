'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import FormStep from '@/components/volunteer/FormStep';
import Step1 from '@/components/volunteer/Step1';
import Step2 from '@/components/volunteer/Step2';
import Step3 from '@/components/volunteer/Step3';
import Preview from '@/components/volunteer/Preview';

const VolunteerCreate = () => {
  const router = useRouter();
  const { user } = useAuth();

  // 전역 에러 핸들러 추가 (브라우저 확장 프로그램 충돌 방지)
  React.useEffect(() => {
    const handleError = (event) => {
      if (
          event.error &&
          event.error.message &&
          (event.error.message.includes('message port closed') ||
              event.error.message.includes('content.js'))
      ) {
        console.warn(
            '브라우저 확장 프로그램과의 충돌 감지, 무시합니다:',
            event.error
        );
        event.preventDefault();
        event.stopPropagation();
        return false;
      }
    };

    const handleUnhandledRejection = (event) => {
      if (
          event.reason &&
          event.reason.message &&
          (event.reason.message.includes('message port closed') ||
              event.reason.message.includes('content.js'))
      ) {
        console.warn(
            '브라우저 확장 프로그램과의 충돌 감지, 무시합니다:',
            event.reason
        );
        event.preventDefault();
        event.stopPropagation();
        return false;
      }
    };

    const originalConsoleError = console.error;
    console.error = (...args) => {
      const message = args.join(' ');
      if (
          message.includes('message port closed') ||
          message.includes('content.js')
      ) {
        console.warn('확장 프로그램 오류 무시:', ...args);
        return;
      }
      originalConsoleError.apply(console, args);
    };

    window.addEventListener('error', handleError, true);
    window.addEventListener(
        'unhandledrejection',
        handleUnhandledRejection,
        true
    );

    return () => {
      window.removeEventListener('error', handleError, true);
      window.removeEventListener(
          'unhandledrejection',
          handleUnhandledRejection,
          true
      );
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
      setFormData((prev) => ({ ...prev, [field]: value }));
    } catch (error) {
      console.error('폼 데이터 업데이트 오류:', error);
    }
  };

  const handleGoBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    } else {
      router.back();
    }
  };

  const handleNext = () => {
    const newErrors = {};

    if (currentStep === 1) {
      if (!formData.title.trim()) {
        newErrors.title = '제목을 입력해주세요.';
      } else if (formData.title.length > 100) {
        newErrors.title = '제목은 100자 이하로 입력해주세요.';
      }

      if (!formData.description.trim()) {
        newErrors.description = '설명을 입력해주세요.';
      } else if (formData.description.length > 1000) {
        newErrors.description = '설명은 800자 이하로 입력해주세요.';
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
      if (!formData.name.trim()) {
        newErrors.name = '이름을 입력해주세요.';
      } else if (formData.name.length > 20) {
        newErrors.name = '이름은 20자 이하로 입력해주세요.';
      }

      if (!formData.size) {
        newErrors.size = '크기를 선택해주세요.';
      }
    } else if (currentStep === 3) {
      if (formData.relatedPostLink.trim()) {
        const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w .\-?=&%#]*)*\/?$/;
        if (!urlPattern.test(formData.relatedPostLink)) {
          newErrors.relatedPostLink = '올바른 URL 형식이 아닙니다.';
        }
      }
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      if (currentStep < 3) {
        setCurrentStep((prev) => prev + 1);
      } else {
        setCurrentStep(4); // 미리보기
      }
    }
  };

  const handleSearchAddress = async (type, baseAddress) => {
    if (!baseAddress.trim()) return;

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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: baseAddress }),
      });

      const data = await response.json();

      if (data.success && data.results) {
        if (type === 'departure') {
          setDepartureSearchResults(data.results);
        } else {
          setArrivalSearchResults(data.results);
        }

        setAddressValidation((prev) => ({
          ...prev,
          [type]: {
            isValid: data.isValid,
            message: data.message,
          },
        }));
      } else {
        if (type === 'departure') {
          setDepartureSearchResults([]);
        } else {
          setArrivalSearchResults([]);
        }

        setAddressValidation((prev) => ({
          ...prev,
          [type]: {
            isValid: false,
            message: '주소 검색 중 오류가 발생했습니다.',
          },
        }));
      }
    } catch (error) {
      console.error('주소 검색 오류:', error);
      if (type === 'departure') {
        setDepartureSearchResults([]);
      } else {
        setArrivalSearchResults([]);
      }

      setAddressValidation((prev) => ({
        ...prev,
        [type]: {
          isValid: false,
          message: '주소 검색 중 오류가 발생했습니다.'
        }
      }));
    } finally {
      if (type === 'departure') {
        setIsSearchingDeparture(false);
      } else {
        setIsSearchingArrival(false);
      }
    }
  };

  const handleAddressChange = (type, value) => {
    updateFormData(
        type === 'departure' ? 'departureAddress' : 'arrivalAddress',
        value
    );

    if (type === 'departure') {
      updateFormData('departureLat', null);
      updateFormData('departureLng', null);
      setDepartureSearchResults([]);
    } else {
      updateFormData('arrivalLat', null);
      updateFormData('arrivalLng', null);
      setArrivalSearchResults([]);
    }

    setAddressValidation((prev) => ({
      ...prev,
      [type]: { isValid: null, message: '' },
    }));
  };

  const handleSelectDepartureAddress = (selectedAddress, detailAddress = '') => {
    const baseAddress =
        selectedAddress.road_address_name ||
        selectedAddress.address_name ||
        selectedAddress.place_name;

    const fullAddress = detailAddress
        ? `${baseAddress} ${detailAddress}`
        : baseAddress;

    const lat = selectedAddress.y ? parseFloat(selectedAddress.y) : null;
    const lng = selectedAddress.x ? parseFloat(selectedAddress.x) : null;

    updateFormData('departureAddress', fullAddress);
    updateFormData('departureLat', lat);
    updateFormData('departureLng', lng);

    setDepartureSearchResults([]);
    setAddressValidation((prev) => ({
      ...prev,
      departure: { isValid: true, message: '유효한 주소입니다.' },
    }));
  };

  const handleSelectArrivalAddress = (selectedAddress, detailAddress = '') => {
    const baseAddress =
        selectedAddress.road_address_name ||
        selectedAddress.address_name ||
        selectedAddress.place_name;

    const fullAddress = detailAddress
        ? `${baseAddress} ${detailAddress}`
        : baseAddress;

    const lat = selectedAddress.y ? parseFloat(selectedAddress.y) : null;
    const lng = selectedAddress.x ? parseFloat(selectedAddress.x) : null;

    updateFormData('arrivalAddress', fullAddress);
    updateFormData('arrivalLat', lat);
    updateFormData('arrivalLng', lng);

    setArrivalSearchResults([]);
    setAddressValidation((prev) => ({
      ...prev,
      arrival: { isValid: true, message: '유효한 주소입니다.' },
    }));
  };

  const handleEdit = (step) => {
    setCurrentStep(step);
  };

  const handleSubmit = async () => {
    const startTime = Date.now();
    console.log('=== 제출 시작 ===', new Date().toISOString());
    console.log('폼 데이터:', formData);
    console.log('현재 로딩 상태:', loading);
    console.log('현재 사용자:', user);

    if (loading) {
      console.log('이미 로딩 중이므로 제출 무시');
      return;
    }

    setLoading(true);

    try {
      console.log('=== 1단계: 세션 확인 시작 ===');
      console.log('AuthContext 사용자:', {
        hasUser: !!user,
        userId: user?.id,
        userEmail: user?.email,
      });

      if (!user) {
        toast.error('로그인이 필요합니다.');
        router.push('/login');
        return;
      }

      console.log('=== 2단계: 사용자 인증 완료, 토큰 확인 시작 ===');

      let accessToken = null;

      try {
        console.log('토큰 확인 시작...');
        const tokenStartTime = Date.now();

        const sessionPromise = supabase.auth.getSession();
        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('토큰 확인 타임아웃')), 2000)
        );

        const {
          data: { session },
          error: sessionError,
        } = await Promise.race([sessionPromise, timeoutPromise]);

        const tokenEndTime = Date.now();

        if (sessionError) {
          console.log('토큰 확인 에러 (무시하고 진행):', sessionError.message);
        } else if (session?.access_token) {
          accessToken = session.access_token;
          console.log('토큰 확인 성공:', {
            duration: tokenEndTime - tokenStartTime + 'ms',
            tokenLength: accessToken.length,
          });
        } else {
          console.log('토큰 없음, 사용자 ID로 진행');
        }
      } catch (error) {
        console.log('토큰 확인 실패 (무시하고 진행):', error.message);
      }

      console.log('=== 3단계: API 호출 준비 ===');

      const headers = {
        'Content-Type': 'application/json',
        apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      };

      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
      } else if (user?.id) {
        headers['X-User-ID'] = user.id;
      }

      const requestData = {
        ...formData,
        photo: formData.photo
            ? `[Base64 데이터 ${formData.photo.length}자]`
            : null,
      };
      console.log('전송할 데이터 요약:', requestData);

      console.log('=== 4단계: API 호출 시작 ===');

      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        console.log('타임아웃 발생! 요청 중단');
        controller.abort();
      }, 30000);

      console.log('fetch 요청 시작...');
      const fetchStartTime = Date.now();

      const response = await fetch('/api/posts/volunteer', {
        method: 'POST',
        headers,
        body: JSON.stringify(formData),
        signal: controller.signal,
      });

      const fetchEndTime = Date.now();
      clearTimeout(timeoutId);

      console.log('=== 5단계: API 응답 받음 ===');
      console.log('fetch 완료:', {
        duration: fetchEndTime - fetchStartTime + 'ms',
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries()),
      });

      if (!response.ok) {
        console.error('API 응답 오류:', response.status, response.statusText);
        const errorText = await response.text();
        console.error('오류 응답 내용:', errorText);

        try {
          const errorResult = JSON.parse(errorText);
          toast.error(errorResult.error || `서버 오류 (${response.status})`);
        } catch {
          toast.error(`서버 오류가 발생했습니다 (${response.status})`);
        }
        return;
      }

      console.log('=== 6단계: 응답 파싱 시작 ===');
      const parseStartTime = Date.now();
      const result = await response.json();
      const parseEndTime = Date.now();

      console.log('응답 파싱 완료:', {
        duration: parseEndTime - parseStartTime + 'ms',
        result,
      });

      console.log('=== 7단계: 결과 처리 ===');
      if (result.success) {
        toast.success('이동 봉사 요청이 등록되었습니다!');
        router.push('/');
      } else {
        toast.error(result.error || '등록에 실패했습니다.');
      }
    } catch (error) {
      const endTime = Date.now();
      console.error('=== 등록 오류 발생 ===');
      console.error('오류 정보:', {
        name: error.name,
        message: error.message,
        stack: error.stack,
        duration: endTime - startTime + 'ms',
      });

      if (error.name === 'AbortError') {
        toast.error('서버 응답이 지연되고 있습니다. 잠시 후 다시 시도해주세요.');
      } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
        toast.error('네트워크 오류가 발생했습니다. 인터넷 연결을 확인해주세요.');
      } else {
        toast.error(`등록 중 오류가 발생했습니다: ${error.message}`);
      }
    } finally {
      const totalTime = Date.now() - startTime;
      console.log('=== 제출 완료 ===');
      console.log('총 소요 시간:', totalTime + 'ms');
      setLoading(false);
    }
  };

  const isNextDisabled = () => {
    if (currentStep === 1) {
      return (
          !formData.title.trim() ||
          !formData.departureAddress.trim() ||
          !formData.description.trim() ||
          addressValidation.departure.isValid !== true ||
          addressValidation.arrival.isValid !== true
      );
    } else if (currentStep === 2) {
      return !formData.name.trim() || !formData.size;
    }
    return false;
  };

  const getStepInfo = () => {
    switch (currentStep) {
      case 1:
        return { title: '이동 봉사 정보' };
      case 2:
        return { title: '임보견 정보' };
      case 3:
        return { title: '추가 정보' };
      default:
        return { title: '이동 봉사 요청' };
    }
  };

  const stepInfo = getStepInfo();
  const inputStyle =
      'h-[52px] px-[18px] border rounded-[15px] text-text-800 focus:text-brand-yellow-dark focus:bg-brand-sub focus:outline-none focus:ring-1 focus:ring-[#FFD044] focus:border-transparent transition-colors';

  // 미리보기 단계
  if (currentStep === 4) {
    return (
        <div className="min-h-screen bg-gray-50">
          {/* 헤더 */}
          <div className="bg-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center py-[28px] px-[30px]">
                <button onClick={handleGoBack} className="mr-[12px]">
                  <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="9"
                      height="16"
                      viewBox="0 0 9 16"
                      fill="none"
                  >
                    <path
                        d="M8 15L1 8"
                        stroke="black"
                        strokeWidth="2"
                        strokeMiterlimit="10"
                        strokeLinecap="round"
                    />
                    <path
                        d="M8 0.999999L1 8"
                        stroke="black"
                        strokeWidth="2"
                        strokeMiterlimit="10"
                        strokeLinecap="round"
                    />
                  </svg>
                </button>
                <div>
                  <h1 className="text-22-m text-black">게시물 미리보기</h1>
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
          title="이동 봉사 요청"
          stepNumber={currentStep}
          totalSteps={3}
          onBack={handleGoBack}
          onNext={handleNext}
          isNextDisabled={isNextDisabled()}
          nextButtonText={currentStep < 3 ? '다음으로' : '미리보기'}
          showNextButton={true}
      >
        {currentStep === 1 && (
            <Step1
                title={stepInfo.title}
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
                inputStyle={inputStyle}
            />
        )}

        {currentStep === 2 && (
            <Step2
                title={stepInfo.title}
                formData={formData}
                errors={errors}
                photoPreview={photoPreview}
                inputStyle={inputStyle}
                onFormDataChange={updateFormData}
                // PhotoUpload 에서 압축된 base64 를 여기로 넘겨줌
                onPhotoChange={(base64) => {
                  setPhotoPreview(base64);
                  updateFormData('photo', base64);
                }}
                onPhotoRemove={() => {
                  setPhotoPreview(null);
                  updateFormData('photo', null);
                }}
            />
        )}

        {currentStep === 3 && (
            <Step3
                title={stepInfo.title}
                formData={formData}
                errors={errors}
                onFormDataChange={updateFormData}
                inputStyle={inputStyle}
            />
        )}
      </FormStep>
  );
};

export default VolunteerCreate;