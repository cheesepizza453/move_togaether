'use client';

import {IconCreateComplete, IconCreateInDone, IconCreateInProgress} from "@/components/icon/iconCreate";
import {useEffect, useState} from "react";

const FormStep = ({
  title,
  children,
  stepNumber,
  totalSteps,
  onBack,
  onNext,
  isNextDisabled = false,
  nextButtonText = '다음',
  showBackButton = true,
  showNextButton = true
}) => {
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            const scrollTop = window.scrollY;
            setIsScrolled(scrollTop > 0);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

  const stepLabels = ['이동 봉사 정보', '임보견 정보', '추가 정보'];
    const renderStepIcon = (step) => {
        if (step < stepNumber) {
            // 완료된 단계 - 체크 아이콘
            return (
                <div className={'relative w-[24px] h-[24px] z-10'}>
                    <IconCreateComplete/>
                    {(step === 1 || step === 2) && (
                        <span className={'block absolute top-[12px] left-[24px] w-[30vw] min-[550px]:w-[160px] h-[2px] bg-brand-main z-[-1]'}></span>
                    )}
                </div>
            );
        } else if (step === stepNumber) {
            // 현재 단계 - 원형 아이콘
            return (
                <div className={'relative w-[24px] h-[24px] z-10'}>
                    <IconCreateInProgress/>
                    {(step === 1 || step === 2) &&  (
                        <span className={'block absolute top-[12px] left-[24px] w-[30vw] min-[550px]:w-[160px] h-[2px] bg-gray-300 z-[-1]'}></span>
                    )}
                </div>
            );
        } else {
            // 미완료 단계 - 회색 원
            return (
                <div className={'relative w-[24px] h-[24px] z-10'}>
                    <IconCreateInDone/>
                    {(step === 1 || step === 2) && (
                        <span className={'block absolute top-[12px] left-[24px] w-[30vw] min-[550px]:w-[160px] h-[2px] bg-gray-300 z-[-1]'}></span>
                    )}
                </div>
            );
        }
    };


  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center py-[28px] px-[30px]">
            {showBackButton && (
                <button
                    onClick={onBack}
                    className="mr-[12px]"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="9" height="16" viewBox="0 0 9 16" fill="none">
                        <path d="M8 15L1 8" stroke="black" strokeWidth="2" strokeMiterlimit="10"
                              strokeLinecap="round"/>
                        <path d="M8 0.999999L1 8" stroke="black" strokeWidth="2" strokeMiterlimit="10"
                              strokeLinecap="round"/>
                    </svg>
                </button>
            )}
              <div>
                  <h1 className="text-22-m text-black">{title}</h1>
              </div>
          </div>
        </div>
      </div>
        {/* 진행률 표시 */}
        <div className={`sticky top-0 z-50 bg-white h-[90px] pt-[17px] transition-shadow duration-300 ${
            isScrolled ? 'shadow-[0_2px_5px_0_rgba(0,0,0,0.15)]' : ''
        }`}>
            <div className="flex items-start justify-between">
                {Array.from({length: totalSteps}, (_, index) => {
                    const step = index + 1;
                    return (
                        <div key={step} className="relative flex items-center w-full">
                            <div className="relative flex flex-col items-center w-full">
                                {renderStepIcon(step)}
                                <span className={`absolute block top-[30px] text-center w-full text-12-m ${
                                    step <= stepNumber ? 'text-brand-yellow-dark font-medium' : 'text-text-800'
                                }`}>
                              {stepLabels[index]}
                              </span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
      {/* 컨텐츠 */}
      <div className="px-4 py-6 flex-1 bg-white">
        {children}
      </div>

      {/* 하단 버튼 */}
      {showNextButton && (
          <div className="bg-white p-4 pb-[80px]">
            <div className="max-w-md mx-auto">
              <button
                  onClick={onNext}
                  disabled={isNextDisabled}
                  className={`w-full py-[14px] rounded-[15px] ${
                      isNextDisabled
                          ? 'bg-text-300 text-text-100 cursor-not-allowed'
                          : 'bg-brand-main text-black'
                  }`}
              >
                {nextButtonText}
              </button>
            </div>
          </div>
      )}
    </div>
  );
};

export default FormStep;
