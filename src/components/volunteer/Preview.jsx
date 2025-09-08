'use client';

import { Edit3 } from 'lucide-react';

const Preview = ({
  formData,
  photoPreview,
  onEdit,
  onSubmit,
  loading
}) => {
  const getSizeLabel = (size) => {
    const sizeMap = {
      small: '소형견 (10kg 이하)',
      medium: '중형견 (10-25kg)',
      large: '대형견 (25kg 이상)'
    };
    return sizeMap[size] || size;
  };

  return (
    <div className="space-y-6">
      {/* 봉사자 정보 */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">봉사자 정보</h3>
          <button
            type="button"
            onClick={() => onEdit(1)}
            className="flex items-center text-yellow-600 hover:text-yellow-700 transition-colors"
          >
            <Edit3 size={16} className="mr-1" />
            <span className="text-sm">수정</span>
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <span className="text-sm font-medium text-gray-600">제목:</span>
            <p className="text-sm text-gray-900 mt-1">{formData.title}</p>
          </div>

          <div>
            <span className="text-sm font-medium text-gray-600">출발지:</span>
            <p className="text-sm text-gray-900 mt-1">{formData.departureAddress}</p>
          </div>

          <div>
            <span className="text-sm font-medium text-gray-600">도착지:</span>
            <p className="text-sm text-gray-900 mt-1">{formData.arrivalAddress}</p>
          </div>

          <div>
            <span className="text-sm font-medium text-gray-600">설명:</span>
            <p className="text-sm text-gray-900 mt-1 whitespace-pre-wrap">{formData.description}</p>
          </div>
        </div>
      </div>

      {/* 강아지 정보 */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">강아지 정보</h3>
          <button
            type="button"
            onClick={() => onEdit(2)}
            className="flex items-center text-yellow-600 hover:text-yellow-700 transition-colors"
          >
            <Edit3 size={16} className="mr-1" />
            <span className="text-sm">수정</span>
          </button>
        </div>

        <div className="space-y-3">
          {photoPreview && (
            <div>
              <span className="text-sm font-medium text-gray-600">사진:</span>
              <img
                src={photoPreview}
                alt="강아지 사진"
                className="w-32 h-32 object-cover rounded-lg border border-gray-300 mt-2"
              />
            </div>
          )}

          <div>
            <span className="text-sm font-medium text-gray-600">이름:</span>
            <p className="text-sm text-gray-900 mt-1">{formData.name}</p>
          </div>

          <div>
            <span className="text-sm font-medium text-gray-600">크기:</span>
            <p className="text-sm text-gray-900 mt-1">{getSizeLabel(formData.size)}</p>
          </div>

          {formData.breed && (
            <div>
              <span className="text-sm font-medium text-gray-600">견종:</span>
              <p className="text-sm text-gray-900 mt-1">{formData.breed}</p>
            </div>
          )}
        </div>
      </div>

      {/* 추가 정보 */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">추가 정보</h3>
          <button
            type="button"
            onClick={() => onEdit(3)}
            className="flex items-center text-yellow-600 hover:text-yellow-700 transition-colors"
          >
            <Edit3 size={16} className="mr-1" />
            <span className="text-sm">수정</span>
          </button>
        </div>

        <div className="space-y-3">
          {formData.relatedPostLink ? (
            <div>
              <span className="text-sm font-medium text-gray-600">관련 게시글:</span>
              <a
                href={formData.relatedPostLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:text-blue-800 mt-1 block break-all"
              >
                {formData.relatedPostLink}
              </a>
            </div>
          ) : (
            <div>
              <span className="text-sm font-medium text-gray-600">관련 게시글:</span>
              <p className="text-sm text-gray-500 mt-1">없음</p>
            </div>
          )}
        </div>
      </div>

      {/* 최종 확인 메시지 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-900 mb-2">최종 확인</h4>
        <p className="text-sm text-blue-800">
          위 정보가 모두 정확한지 확인해주세요. 제출 후에는 수정이 어려울 수 있습니다.
        </p>
      </div>

      {/* 제출 버튼 */}
      <div className="pt-4">
        <button
          onClick={onSubmit}
          disabled={loading}
          className={`w-full py-4 px-6 rounded-lg font-medium transition-colors ${
            loading
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-green-500 text-white hover:bg-green-600'
          }`}
        >
          {loading ? '등록 중...' : '이동 봉사 등록하기'}
        </button>
      </div>
    </div>
  );
};

export default Preview;
