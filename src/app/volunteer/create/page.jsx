'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import FormStep from '@/components/volunteer/FormStep';
import Step1 from '@/components/volunteer/Step1';
import Step2 from '@/components/volunteer/Step2';
import Step2FindTogether from '@/components/volunteer/Step2FindTogether';
import Step3 from '@/components/volunteer/Step3';
import Preview from '@/components/volunteer/Preview';

const STEP_INPUT_STYLE = 'h-[52px] px-[18px] border rounded-[15px] text-text-800 focus:text-brand-yellow-dark focus:bg-brand-sub focus:outline-none focus:ring-1 focus:ring-[#FFD044] focus:border-transparent transition-colors';

const INITIAL_MOVE_DATA = {
  title: '',
  departureAddress: '',
  departureSido: '',
  departureSigungu: '',
  departureDong: '',
  arrivalAddress: '',
  arrivalSido: '',
  arrivalSigungu: '',
  arrivalDong: '',
  description: '',
  name: '',
  photo: null,
  size: '',
  breed: '',
  isOriginal: true,
  relatedPostLink: '',
};

// 실종신고: 실종견을 목격했을 때 위치·사진·정보를 제보하는 기능
const INITIAL_FIND_TOGETHER_DATA = {
  title: '',
  departureAddress: '',
  departureSido: '',
  departureSigungu: '',
  departureDong: '',
  description: '',
  name: '',
  photo: null,
  size: '',
  breed: '',
  dogDescription: '',
  isOriginal: true,
  relatedPostLink: '',
};

// 공통 인증 헤더 생성
const buildHeaders = (accessToken, userId) => {
  const headers = {
    'Content-Type': 'application/json',
    apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  };
  if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;
  else if (userId) headers['X-User-ID'] = userId;
  return headers;
};

const getAccessToken = async () => {
  try {
    const { data: { session } } = await Promise.race([
      supabase.auth.getSession(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 2000)),
    ]);
    return session?.access_token || null;
  } catch {
    return null;
  }
};

const VolunteerCreate = () => {
  const router = useRouter();
  const { user } = useAuth();

  // 브라우저 확장 프로그램 충돌 방지
  React.useEffect(() => {
    const handleError = (event) => {
      if (
        event.error?.message &&
        (event.error.message.includes('message port closed') ||
          event.error.message.includes('content.js'))
      ) {
        event.preventDefault();
        event.stopPropagation();
        return false;
      }
    };
    const handleUnhandledRejection = (event) => {
      if (
        event.reason?.message &&
        (event.reason.message.includes('message port closed') ||
          event.reason.message.includes('content.js'))
      ) {
        event.preventDefault();
        event.stopPropagation();
        return false;
      }
    };
    window.addEventListener('error', handleError, true);
    window.addEventListener('unhandledrejection', handleUnhandledRejection, true);
    return () => {
      window.removeEventListener('error', handleError, true);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection, true);
    };
  }, []);

  // ── 탭 ───────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState('move');

  // ── 이동봉사 상태 ─────────────────────────────────────────
  const [moveStep, setMoveStep] = useState(1);
  const [moveData, setMoveData] = useState(INITIAL_MOVE_DATA);
  const [moveErrors, setMoveErrors] = useState({});
  const [movePhotoPreview, setMovePhotoPreview] = useState(null);
  const [moveLoading, setMoveLoading] = useState(false);

  // ── 실종신고 상태 (실종견 목격 제보 기능) ────────────────────
  const [findTogetherStep, setFindTogetherStep] = useState(1);
  const [findTogetherData, setFindTogetherData] = useState(INITIAL_FIND_TOGETHER_DATA);
  const [findTogetherErrors, setFindTogetherErrors] = useState({});
  const [findTogetherPhotoPreview, setFindTogetherPhotoPreview] = useState(null);
  const [findTogetherLoading, setFindTogetherLoading] = useState(false);

  const handleTabChange = (tab) => {
    if (tab === activeTab) return;
    setActiveTab(tab);
    // 이동봉사 초기화
    setMoveStep(1);
    setMoveData(INITIAL_MOVE_DATA);
    setMoveErrors({});
    setMovePhotoPreview(null);
    // 실종신고 초기화
    setFindTogetherStep(1);
    setFindTogetherData(INITIAL_FIND_TOGETHER_DATA);
    setFindTogetherErrors({});
    setFindTogetherPhotoPreview(null);
  };

  const tabBar = (
    <div className="flex bg-white border-b border-gray-200">
      <button
        onClick={() => handleTabChange('move')}
        className={`flex-1 py-3 text-16-m border-b-2 transition-colors ${
          activeTab === 'move'
            ? 'border-brand-yellow-dark text-brand-yellow-dark'
            : 'border-transparent text-text-800'
        }`}
      >
        이동봉사
      </button>
      <button
        onClick={() => handleTabChange('findTogether')}
        className={`flex-1 py-3 text-16-m border-b-2 transition-colors ${
          activeTab === 'findTogether'
            ? 'border-brand-yellow-dark text-brand-yellow-dark'
            : 'border-transparent text-text-800'
        }`}
      >
        실종신고
      </button>
    </div>
  );

  // ── 이동봉사 핸들러 ───────────────────────────────────────

  const updateMoveData = (field, value) => {
    setMoveData((prev) => ({ ...prev, [field]: value }));
  };

  const handleMoveBack = () => {
    if (moveStep > 1) setMoveStep((prev) => prev - 1);
    else router.back();
  };

  const handleMoveNext = () => {
    const newErrors = {};
    if (moveStep === 1) {
      if (!moveData.title.trim()) newErrors.title = '제목을 입력해주세요.';
      else if (moveData.title.length > 100) newErrors.title = '제목은 100자 이하로 입력해주세요.';
      if (!moveData.description.trim()) newErrors.description = '설명을 입력해주세요.';
      else if (moveData.description.length > 800) newErrors.description = '설명은 800자 이하로 입력해주세요.';
      if (!moveData.departureDong) newErrors.departureAddress = '출발지를 시/도 → 시/군/구 → 읍/면/동 순으로 선택해주세요.';
      if (!moveData.arrivalDong) newErrors.arrivalAddress = '도착지를 시/도 → 시/군/구 → 읍/면/동 순으로 선택해주세요.';
    } else if (moveStep === 2) {
      if (!moveData.name.trim()) newErrors.name = '이름을 입력해주세요.';
      else if (moveData.name.length > 20) newErrors.name = '이름은 20자 이하로 입력해주세요.';
      if (!moveData.size) newErrors.size = '크기를 선택해주세요.';
    } else if (moveStep === 3) {
      if (moveData.relatedPostLink.trim()) {
        const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w .\-?=&%#]*)*\/?$/;
        if (!urlPattern.test(moveData.relatedPostLink)) newErrors.relatedPostLink = '올바른 URL 형식이 아닙니다.';
      }
    }
    setMoveErrors(newErrors);
    if (Object.keys(newErrors).length === 0) {
      if (moveStep < 3) setMoveStep((prev) => prev + 1);
      else setMoveStep(4);
    }
  };

  const handleMoveSubmit = async () => {
    if (moveLoading) return;
    setMoveLoading(true);
    try {
      if (!user) { toast.error('로그인이 필요합니다.'); router.push('/login'); return; }
      const accessToken = await getAccessToken();
      const headers = buildHeaders(accessToken, user?.id);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);
      const response = await fetch('/api/posts/volunteer', {
        method: 'POST',
        headers,
        body: JSON.stringify(moveData),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      if (!response.ok) {
        const errorText = await response.text();
        try { toast.error(JSON.parse(errorText).error || `서버 오류 (${response.status})`); }
        catch { toast.error(`서버 오류가 발생했습니다 (${response.status})`); }
        return;
      }
      const result = await response.json();
      if (result.success) { toast.success('이동 봉사 요청이 등록되었습니다!'); router.push('/'); }
      else toast.error(result.error || '등록에 실패했습니다.');
    } catch (error) {
      if (error.name === 'AbortError') toast.error('서버 응답이 지연되고 있습니다. 잠시 후 다시 시도해주세요.');
      else if (error.name === 'TypeError' && error.message.includes('fetch')) toast.error('네트워크 오류가 발생했습니다. 인터넷 연결을 확인해주세요.');
      else toast.error(`등록 중 오류가 발생했습니다: ${error.message}`);
    } finally {
      setMoveLoading(false);
    }
  };

  const isMoveNextDisabled = () => {
    if (moveStep === 1) return !moveData.title.trim() || !moveData.departureDong || !moveData.arrivalDong || !moveData.description.trim();
    if (moveStep === 2) return !moveData.name.trim() || !moveData.size;
    return false;
  };

  const getMoveStepTitle = () => {
    switch (moveStep) {
      case 1: return '무브 상세 정보';
      case 2: return '동행견 정보';
      case 3: return '추가 정보';
      default: return '무브 요청';
    }
  };

  // ── 실종신고 핸들러 (실종견 목격 제보) ─────────────────────

  const updateFindTogetherData = (field, value) => {
    setFindTogetherData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFindTogetherBack = () => {
    if (findTogetherStep > 1) setFindTogetherStep((prev) => prev - 1);
    else router.back();
  };

  const handleFindTogetherNext = () => {
    const newErrors = {};
    if (findTogetherStep === 1) {
      if (!findTogetherData.title.trim()) newErrors.title = '제목을 입력해주세요.';
      else if (findTogetherData.title.length > 100) newErrors.title = '제목은 100자 이하로 입력해주세요.';
      if (!findTogetherData.description.trim()) newErrors.description = '설명을 입력해주세요.';
      else if (findTogetherData.description.length > 800) newErrors.description = '설명은 800자 이하로 입력해주세요.';
      if (!findTogetherData.departureDong) newErrors.departureAddress = '위치를 시/도 → 시/군/구 → 읍/면/동 순으로 선택해주세요.';
    } else if (findTogetherStep === 2) {
      if (!findTogetherData.size) newErrors.size = '크기를 선택해주세요.';
      if (!findTogetherData.dogDescription.trim()) newErrors.dogDescription = '실종견 설명을 입력해주세요.';
    } else if (findTogetherStep === 3) {
      if (findTogetherData.relatedPostLink.trim()) {
        const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w .\-?=&%#]*)*\/?$/;
        if (!urlPattern.test(findTogetherData.relatedPostLink)) newErrors.relatedPostLink = '올바른 URL 형식이 아닙니다.';
      }
    }
    setFindTogetherErrors(newErrors);
    if (Object.keys(newErrors).length === 0) {
      if (findTogetherStep < 3) setFindTogetherStep((prev) => prev + 1);
      else setFindTogetherStep(4);
    }
  };

  const handleFindTogetherSubmit = async () => {
    if (findTogetherLoading) return;
    setFindTogetherLoading(true);
    try {
      if (!user) { toast.error('로그인이 필요합니다.'); router.push('/login'); return; }
      const accessToken = await getAccessToken();
      const headers = buildHeaders(accessToken, user?.id);
      const response = await fetch('/api/posts/find-together', {
        method: 'POST',
        headers,
        body: JSON.stringify(findTogetherData),
      });
      if (!response.ok) {
        const errorText = await response.text();
        try { toast.error(JSON.parse(errorText).error || `서버 오류 (${response.status})`); }
        catch { toast.error(`서버 오류가 발생했습니다 (${response.status})`); }
        return;
      }
      const result = await response.json();
      if (result.success) { toast.success('실종신고 글이 등록되었습니다!'); router.push('/'); }
      else toast.error(result.error || '등록에 실패했습니다.');
    } catch (error) {
      toast.error(`등록 중 오류가 발생했습니다: ${error.message}`);
    } finally {
      setFindTogetherLoading(false);
    }
  };

  const isFindTogetherNextDisabled = () => {
    if (findTogetherStep === 1) return !findTogetherData.title.trim() || !findTogetherData.departureDong || !findTogetherData.description.trim();
    if (findTogetherStep === 2) return !findTogetherData.size || !findTogetherData.dogDescription.trim();
    return false;
  };

  const getFindTogetherStepTitle = () => {
    switch (findTogetherStep) {
      case 1: return '실종신고 상세 정보';
      case 2: return '동행견 정보';
      case 3: return '추가 정보';
      default: return '실종신고';
    }
  };

  // ── 렌더 ─────────────────────────────────────────────────

  // 이동봉사 미리보기
  if (activeTab === 'move' && moveStep === 4) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white">
          <div className="flex items-center py-[28px] px-[30px]">
            <button onClick={() => setMoveStep(3)} className="mr-[12px]">
              <svg xmlns="http://www.w3.org/2000/svg" width="9" height="16" viewBox="0 0 9 16" fill="none">
                <path d="M8 15L1 8" stroke="black" strokeWidth="2" strokeMiterlimit="10" strokeLinecap="round"/>
                <path d="M8 0.999999L1 8" stroke="black" strokeWidth="2" strokeMiterlimit="10" strokeLinecap="round"/>
              </svg>
            </button>
            <h1 className="text-22-m text-black">게시물 미리보기</h1>
          </div>
        </div>
        <div className="px-4 py-6">
          <Preview
            formData={moveData}
            photoPreview={movePhotoPreview}
            onEdit={(step) => setMoveStep(step)}
            onSubmit={handleMoveSubmit}
            loading={moveLoading}
          />
        </div>
      </div>
    );
  }

  // 실종신고 미리보기
  if (activeTab === 'findTogether' && findTogetherStep === 4) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white">
          <div className="flex items-center py-[28px] px-[30px]">
            <button onClick={() => setFindTogetherStep(3)} className="mr-[12px]">
              <svg xmlns="http://www.w3.org/2000/svg" width="9" height="16" viewBox="0 0 9 16" fill="none">
                <path d="M8 15L1 8" stroke="black" strokeWidth="2" strokeMiterlimit="10" strokeLinecap="round"/>
                <path d="M8 0.999999L1 8" stroke="black" strokeWidth="2" strokeMiterlimit="10" strokeLinecap="round"/>
              </svg>
            </button>
            <h1 className="text-22-m text-black">게시물 미리보기</h1>
          </div>
        </div>
        <div className="px-4 py-6">
          <Preview
            formData={findTogetherData}
            photoPreview={findTogetherPhotoPreview}
            onEdit={(step) => setFindTogetherStep(step)}
            onSubmit={handleFindTogetherSubmit}
            loading={findTogetherLoading}
            submitLabel="실종신고 등록하기"
            dogSectionLabel="실종견 정보"
          />
        </div>
      </div>
    );
  }

  // 실종신고 탭 — 3단계 폼 (실종견 목격 제보)
  if (activeTab === 'findTogether') {
    return (
      <FormStep
        title="신규 무브 요청"
        stepNumber={findTogetherStep}
        totalSteps={3}
        onBack={handleFindTogetherBack}
        onNext={handleFindTogetherNext}
        isNextDisabled={isFindTogetherNextDisabled()}
        nextButtonText={findTogetherStep < 3 ? '다음으로' : '미리보기'}
        showNextButton={true}
        tabBar={tabBar}
        stepLabels={['실종 상세 정보', '실종견 정보', '추가 정보']}
      >
        {findTogetherStep === 1 && (
          <Step1
            title={getFindTogetherStepTitle()}
            formData={findTogetherData}
            errors={findTogetherErrors}
            onFormDataChange={updateFindTogetherData}
            showArrival={false}
            departureLabel="실종 위치"
            descriptionHint="목격 일시, 장소, 외형 특징, 이동 방향, 보호 중 여부, 남기고 싶은 말 등"
            descriptionPlaceholder={`실종신고에 대한 상세한 설명을 입력해 주세요.\n(목격 일시, 장소, 외형 특징, 이동 방향, 보호 중 여부, 남기고 싶은 말 등)`}
          />
        )}
        {findTogetherStep === 2 && (
          <Step2FindTogether
            title={getFindTogetherStepTitle()}
            formData={findTogetherData}
            errors={findTogetherErrors}
            photoPreview={findTogetherPhotoPreview}
            inputStyle={STEP_INPUT_STYLE}
            onFormDataChange={updateFindTogetherData}
            onPhotoChange={(base64) => {
              setFindTogetherPhotoPreview(base64);
              updateFindTogetherData('photo', base64);
            }}
            onPhotoRemove={() => {
              setFindTogetherPhotoPreview(null);
              updateFindTogetherData('photo', null);
            }}
          />
        )}
        {findTogetherStep === 3 && (
          <Step3
            title={getFindTogetherStepTitle()}
            formData={findTogetherData}
            errors={findTogetherErrors}
            onFormDataChange={updateFindTogetherData}
            inputStyle={STEP_INPUT_STYLE}
          />
        )}
      </FormStep>
    );
  }

  // 이동봉사 탭 (기본)
  return (
    <FormStep
      title="신규 무브 요청"
      stepNumber={moveStep}
      totalSteps={3}
      onBack={handleMoveBack}
      onNext={handleMoveNext}
      isNextDisabled={isMoveNextDisabled()}
      nextButtonText={moveStep < 3 ? '다음으로' : '미리보기'}
      showNextButton={true}
      tabBar={tabBar}
      stepLabels={['이동봉사 상세 정보', '동행견 정보', '추가 정보']}
    >
      {moveStep === 1 && (
        <Step1
          title={getMoveStepTitle()}
          formData={moveData}
          errors={moveErrors}
          onFormDataChange={updateMoveData}
        />
      )}
      {moveStep === 2 && (
        <Step2
          title={getMoveStepTitle()}
          formData={moveData}
          errors={moveErrors}
          photoPreview={movePhotoPreview}
          inputStyle={STEP_INPUT_STYLE}
          onFormDataChange={updateMoveData}
          onPhotoChange={(base64) => {
            setMovePhotoPreview(base64);
            updateMoveData('photo', base64);
          }}
          onPhotoRemove={() => {
            setMovePhotoPreview(null);
            updateMoveData('photo', null);
          }}
        />
      )}
      {moveStep === 3 && (
        <Step3
          title={getMoveStepTitle()}
          formData={moveData}
          errors={moveErrors}
          onFormDataChange={updateMoveData}
          inputStyle={STEP_INPUT_STYLE}
        />
      )}
    </FormStep>
  );
};

export default VolunteerCreate;
