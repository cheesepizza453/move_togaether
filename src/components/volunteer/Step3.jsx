'use client';

const Step3 = ({
  formData,
  errors,
  onFormDataChange,
    title,
    inputStyle
}) => {
  return (
      <div className="space-y-6">
        <div className={'flex justify-between items-start'}>
          <h5 className={'text-20-m'}>{title}</h5>
        </div>
        {/* 관련 게시글 링크 */}
        <div>
          <label htmlFor={'relatedPostLink'} className="block text-16-m mb-[6px]">
            관련 게시글 링크
          </label>
          <p className="text-xs text-gray-500 mb-[12px]">
            관련 게시글이 있다면 링크를 입력해주세요. (예: 입양 공고, 유튜브 링크 등)
          </p>
          <input
              maxLength={300}
              id={'relatedPostLink'}
              type="url"
              value={formData.relatedPostLink}
              onChange={(e) => onFormDataChange('relatedPostLink', e.target.value)}
              placeholder="동행견과 관련된 게시물 링크를 입력해 주세요. (선택사항)"
              className={`${inputStyle} w-full ${
                  errors.relatedPostLink ? 'border-red-500' : 'border-gray-300'
              }`}
          />
          {errors.relatedPostLink && (
              <p className="text-xs text-red-500 mt-1">{errors.relatedPostLink}</p>
          )}
        </div>

        {/* 안내 메시지 */}
        <div className="bg-[#BFE1C5] border border-[#2BA03E] rounded-[15px] p-4">
          <h4 className="text-12-m font-medium text-green-900 mb-2">거의 완료되었습니다!</h4>
          <p className="text-12-r text-green-800">
            다음 단계에서 입력하신 정보를 확인하고 업로드할 수 있습니다.
          </p>
        </div>
      </div>
  );
};

export default Step3;
