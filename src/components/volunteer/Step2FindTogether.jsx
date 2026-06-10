'use client';

import PhotoUpload from './PhotoUpload';

// 실종신고 탭 전용 Step2 — 이름 없음, 사진·사이즈 선택사항, 실종견 및 상황 설명 추가
const Step2FindTogether = ({
  title,
  formData,
  errors,
  photoPreview,
  onFormDataChange,
  onPhotoChange,
  onPhotoRemove,
  inputStyle,
}) => {
  const sizeOptions = [
    { value: 'small', label: '소형' },
    { value: 'smallMedium', label: '중소형' },
    { value: 'medium', label: '중형' },
    { value: 'large', label: '대형' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <h5 className="text-20-m">{title}</h5>
        <p className="flex items-start text-10-l text-[#DB1F1F]">
          <span className="text-16-m mt-[-2px]">*</span>표시는 필수 입력 정보입니다.
        </p>
      </div>

      {/* 실종견 사진 (선택사항) */}
      <div>
        <p className="block text-16-m mb-[6px]">실종견 사진 <span className="text-12-r text-text-800">(선택사항)</span></p>
        <PhotoUpload
          photoPreview={photoPreview}
          onPhotoChange={onPhotoChange}
          onPhotoRemove={onPhotoRemove}
          error={errors.photo}
          hideLabel
        />
      </div>

      {/* 사이즈 (선택사항) */}
      <div>
        <label className="block text-16-m mb-[6px]">
          사이즈<span className="text-[#E17364] text-16-m">*</span>
        </label>
        <p className="mb-[15px] text-[#676767] text-12-r">
          소형견 ~5kg | 중소형견 5.1~8kg | 중형견 8.1~20kg | 대형견 20.1kg~
        </p>
        <div className={`${inputStyle} w-full px-[8px] py-[8px] gap-x-[8px] flex bg-gray-100 overflow-x-scroll`}>
          {sizeOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => onFormDataChange('size', formData.size === option.value ? '' : option.value)}
              className={`w-auto rounded-full py-[8px] text-16-m focus:outline-none flex-1 ${
                formData.size === option.value
                  ? 'bg-brand-main text-black'
                  : 'bg-text-300 text-text-800'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* 견종 (선택사항) */}
      <div className="flex flex-col">
        <label htmlFor="breed-find" className="block text-16-m mb-[12px]">견종</label>
        <input
          id="breed-find"
          type="text"
          maxLength={20}
          value={formData.breed}
          onChange={(e) => onFormDataChange('breed', e.target.value)}
          placeholder="견종을 입력해주세요 (선택사항)"
          className={`${inputStyle} w-full border-gray-300`}
        />
        <div className="relative">
          <p className="absolute top-[4px] right-[5px] text-text-800 text-12-l">
            {formData.breed?.length ?? 0}/20
          </p>
        </div>
      </div>

      {/* 실종견 및 상황 설명 */}
      <div>
        <label htmlFor="dog-description" className="block text-16-m mb-[6px]">
          실종견 및 상황 설명<span className="text-[#E17364] text-16-m">*</span>
        </label>
        <textarea
          id="dog-description"
          maxLength={800}
          value={formData.dogDescription}
          onChange={(e) => onFormDataChange('dogDescription', e.target.value)}
          placeholder="외형 특징, 행동 특징, 실종 당시 상황, 이동 방향, 보호 중 여부 등을 입력해주세요."
          rows={3}
          className={`w-full px-[18px] border border-gray-300 rounded-[15px] text-text-800 focus:text-brand-yellow-dark focus:bg-brand-sub focus:outline-none focus:ring-1 focus:ring-[#FFD044] focus:border-transparent transition-colors resize-none py-[14px] min-h-[100px]`}
        />
        <div className="relative">
          {errors.dogDescription && (
            <p className="text-xs text-red-500 mt-1">{errors.dogDescription}</p>
          )}
          <p className="absolute right-[5px] text-text-800 text-12-l">
            {formData.dogDescription?.length ?? 0}/800
          </p>
        </div>
      </div>
    </div>
  );
};

export default Step2FindTogether;
