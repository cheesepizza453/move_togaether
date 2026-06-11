'use client';

const Step3 = ({
  formData,
  errors,
  onFormDataChange,
    title,
    inputStyle
}) => {
  const isNoDirectContact = formData.isOriginal === false;

  return (
      <div className="space-y-6">
          <div className={'flex justify-between items-start'}>
              <h5 className={'text-20-m'}>{title}</h5>
          </div>
          {/* 원본 글 여부
        <div>
          <label className="block text-16-m mb-[6px]">컨텍 여부</label>
          <div className="flex flex-col gap-[10px] mt-[10px]">
            <label className="flex items-center gap-[10px] cursor-pointer">
              <input
                  type="radio"
                  name="isOriginal"
                  value="true"
                  checked={formData.isOriginal === true}
                  onChange={() => onFormDataChange('isOriginal', true)}
                  className="accent-brand-yellow-dark w-4 h-4"
              />
              <span className="text-14-r">지원자와 직접 소통할게요.</span>
            </label>
            <label className="flex items-center gap-[10px] cursor-pointer">
              <input
                  type="radio"
                  name="isOriginal"
                  value="false"
                  checked={formData.isOriginal === false}
                  onChange={() => onFormDataChange('isOriginal', false)}
                  className="accent-brand-yellow-dark w-4 h-4"
              />
              <span className="text-14-r">기존에 업로드한 플랫폼에서 지원자와 소통할게요.</span>
            </label>
          </div>
        </div>

        */}

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

          <div>
              <label className="flex items-start gap-[10px] cursor-pointer">
                  <input
                      type="checkbox"
                      checked={isNoDirectContact}
                      onChange={(e) => onFormDataChange('isOriginal', !e.target.checked)}
                      className="sr-only peer"
                  />
                  <span
                      className="mt-[1px] flex h-[20px] w-[20px] min-w-[20px] shrink-0 basis-[20px] items-center justify-center rounded-full border border-text-300 bg-white peer-focus-visible:ring-2 peer-focus-visible:ring-[#FFD044] peer-focus-visible:ring-offset-2 peer-checked:border-transparent peer-checked:bg-[#FFD044]">
              <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 25"
                  fill="none"
                  className={`h-[20px] w-[20px] shrink-0 ${isNoDirectContact ? 'opacity-100' : 'opacity-0'}`}
                  aria-hidden="true"
              >
                <circle cx="12" cy="12.75" r="12" fill="#FFD044"></circle>
                <path d="M6 12.55L11.376 17.75" stroke="white" strokeWidth="2" strokeMiterlimit="10"
                      strokeLinecap="round"></path>
                <path d="M11.28 17.75L18.0002 8.75" stroke="white" strokeWidth="2" strokeMiterlimit="10"
                      strokeLinecap="round"></path>
              </svg>
            </span>
                  <span className="text-14-r text-text-800">
              이 게시물에 봉사자 지원 연락 받지 않기
            </span>
              </label>
              <p className="text-xs text-gray-500 mt-[8px] ml-[26px]">
                  체크 시, 지원자는 관련 게시물 링크로 이동해 지원하게 됩니다.
              </p>
          </div>
      </div>
  );
};

export default Step3;
