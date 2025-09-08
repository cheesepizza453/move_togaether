'use client';

const Step3 = ({
  formData,
  errors,
  onFormDataChange
}) => {
  return (
    <div className="space-y-6">
      {/* 관련 게시글 링크 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          관련 게시글 링크
        </label>
        <input
          type="url"
          value={formData.relatedPostLink}
          onChange={(e) => onFormDataChange('relatedPostLink', e.target.value)}
          placeholder="관련 게시글 링크를 입력해주세요 (선택사항)"
          className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-colors ${
            errors.relatedPostLink ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.relatedPostLink && (
          <p className="text-xs text-red-500 mt-1">{errors.relatedPostLink}</p>
        )}
        <p className="text-xs text-gray-500 mt-1">
          관련 게시글이 있다면 링크를 입력해주세요. (예: 입양 공고, 보호소 정보 등)
        </p>
      </div>

      {/* 안내 메시지 */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-green-900 mb-2">거의 완료되었습니다!</h4>
        <p className="text-sm text-green-800">
          다음 단계에서 입력하신 정보를 확인하고 최종 제출할 수 있습니다.
        </p>
      </div>

      {/* 주의사항 */}
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-orange-900 mb-2">이동 봉사 주의사항</h4>
        <ul className="text-sm text-orange-800 space-y-1">
          <li>• 강아지의 안전을 최우선으로 고려해주세요</li>
          <li>• 이동 시간과 경로를 미리 확인해주세요</li>
          <li>• 긴급상황 시 연락 가능한 상태를 유지해주세요</li>
          <li>• 강아지의 특성(공격성, 질병 등)을 미리 파악해주세요</li>
        </ul>
      </div>
    </div>
  );
};

export default Step3;
