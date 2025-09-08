'use client';

const FormStep = ({
  title,
  description,
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
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* 헤더 */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {showBackButton && (
              <button
                onClick={onBack}
                className="mr-3 p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}
            <div>
              <h1 className="text-xl font-bold text-gray-900">{title}</h1>
              <p className="text-sm text-gray-600">{description}</p>
            </div>
          </div>
        </div>

        {/* 진행률 표시 */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
            <span>단계 {stepNumber} / {totalSteps}</span>
            <span>{Math.round((stepNumber / totalSteps) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-yellow-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(stepNumber / totalSteps) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* 컨텐츠 */}
      <div className="px-4 py-6 flex-1">
        {children}
      </div>

      {/* 하단 버튼 */}
      {showNextButton && (
        <div className="bg-white border-t border-gray-200 p-4 mb-20">
          <div className="max-w-md mx-auto">
            <button
              onClick={onNext}
              disabled={isNextDisabled}
              className={`w-full py-4 px-6 rounded-lg font-medium transition-colors ${
                isNextDisabled
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-yellow-500 text-white hover:bg-yellow-600'
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
