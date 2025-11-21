'use client';

import PhotoUpload from './PhotoUpload';

const Step2 = ({
                   title,
                   formData,
                   errors,
                   photoPreview,
                   onFormDataChange,
                   onPhotoChange,
                   onPhotoRemove,
                   inputStyle
               }) => {
    const sizeOptions = [
        { value: 'small', label: '소형' },
        { value: 'smallMedium', label: '중소형' },
        { value: 'medium', label: '중형' },
        { value: 'large', label: '대형' }
    ];

    return (
        <div className="space-y-6">
            <div className={'flex justify-between items-start'}>
                <h5 className={'text-20-m'}>{title}</h5>
                <p className={'flex items-start text-10-l text-[#DB1F1F]'}><span
                    className={'text-16-m mt-[-2px]'}>*</span>표시는 필수 입력 정보입니다.</p>
            </div>
            {/* 강아지 이름 */}
            <div className={'mb-[25px]'}>
                <label className="block text-16-m mb-[12px]">
                    동행견 이름<span className={'text-[#E17364] text-16-m'}>*</span>
                </label>
                <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => onFormDataChange('name', e.target.value)}
                    maxLength={20}
                    placeholder="동행견 이름을 입력해주세요"
                    className={`w-full ${inputStyle} ${
                        errors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                />
                <div className={'relative'}>
                {errors.name && (
                    <p className="text-xs text-red-500 mt-1">{errors.name}</p>
                )}
                <p className="absolute top-[4px] right-[5px] text-text-800 text-12-l">
                    {formData.name?.length ?? 0}/20
                </p>
                </div>
            </div>
            {/* 강아지 사진 */}
            <PhotoUpload
                photoPreview={photoPreview}
                onPhotoChange={onPhotoChange}
                onPhotoRemove={onPhotoRemove}
                error={errors.photo}
            />

            {/* 강아지 크기 */}
            <div>
                <label className="block text-16-m mb-[6px]">
                    사이즈<span className={'text-[#E17364] text-16-m'}>*</span>
                </label>
                <p className={'mb-[15px] text-[#676767] text-12-r'}>소형견 ~5kg | 중소형견 5.1~8kg | 중형견 8.1~20kg | 대형견 20.1kg~
                    20kg 초과</p>
                <div className={`${inputStyle} w-full px-[8px] py-[8px] gap-x-[8px] flex bg-gray-100 overflow-x-scroll`}>
                    {sizeOptions.map((option) => (
                        <button
                            key={option.value}
                            type="button"
                            onClick={() => onFormDataChange('size', option.value)}
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
                {errors.size && (
                    <p className="text-xs text-red-500 mt-1">{errors.size}</p>
                )}
            </div>

            {/* 견종 */}
            <div className={'flex flex-col'}>
                <label htmlFor={'breed'} className="block text-16-m mb-[12px]">
                    견종
                </label>
                <input
                    id={'breed'}
                    type="text"
                    maxLength={20}
                    value={formData.breed}
                    onChange={(e) => onFormDataChange('breed', e.target.value)}
                    placeholder="견종을 입력해주세요 (선택사항)"
                    className={`${inputStyle} w-full`}
                />
                <div className={'relative'}>
                    <p className="absolute top-[4px] right-[5px] text-text-800 text-12-l">
                        {formData.breed?.length ?? 0}/20
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Step2;
