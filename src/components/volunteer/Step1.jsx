'use client';

import AddressInput from './AddressInput';

const Step1 = ({
                   title,
                   formData,
                   errors,
                   addressValidation,
                   onFormDataChange,
                   onAddressChange,
                   onSearchAddress,
                   departureSearchResults = [],
                   arrivalSearchResults = [],
                   isSearchingDeparture = false,
                   isSearchingArrival = false,
                   onSelectDepartureAddress,
                   onSelectArrivalAddress,
                   inputStyle
               }) => {

    return (
        <div className="space-y-6">
            <div className={'flex justify-between items-start'}>
                <h5 className={'text-20-m'}>{title}</h5>
                <p className={'flex items-start text-10-l text-[#DB1F1F]'}><span
                    className={'text-16-m mt-[-2px]'}>*</span>표시는 필수 입력 정보입니다.</p>
            </div>
            {/* 제목 */}
            <div className={'mt-[20px]'}>
                <label htmlFor={'title'} className="block text-16-m mb-[12px]">
                    제목<span className={'text-[#E17364] text-16-m'}>*</span>
                </label>
                <input
                    id={'title'}
                    type="text"
                    value={formData.title}
                    maxLength={20}
                    onChange={(e) => {
                        try {
                            onFormDataChange('title', e.target.value);
                        } catch (error) {
                            console.error('제목 입력 오류:', error);
                        }
                    }}
                    placeholder="제목을 입력해주세요"
                    className={`w-full ${inputStyle} ${
                        errors.title ? 'border-red-500' : 'border-gray-300'
                    }`}
                />
                <div className="relative flex justify-between items-center mt-1">
                    <div>
                        {errors.title && (
                            <p className="text-xs text-red-500">{errors.title}</p>
                        )}
                    </div>
                    <p className="absolute top-[2px] right-[5px] text-text-800 text-12-l">
                        {formData.title?.length || 0}/20
                    </p>
                </div>
            </div>

            {/* 이동 경로 */}
            <div className="space-y-4">
                <h3 className="block text-16-m mb-[12px]">이동 경로<span className={'text-[#E17364] text-16-m'}>*</span></h3>
                <AddressInput
                    label="출발지"
                    value={formData.departureAddress}
                    onChange={(value) => onAddressChange('departure', value)}
                    onSearch={(baseAddress) => onSearchAddress('departure', baseAddress)}
                    validation={addressValidation.departure}
                    placeholder="출발지 주소를 검색해주세요"
                    error={errors.departureAddress}
                    searchResults={departureSearchResults}
                    isSearching={isSearchingDeparture}
                    onSelectAddress={onSelectDepartureAddress}
                    inputStyle={inputStyle}
                />

                <AddressInput
                    label="도착지"
                    value={formData.arrivalAddress}
                    onChange={(value) => onAddressChange('arrival', value)}
                    onSearch={(baseAddress) => onSearchAddress('arrival', baseAddress)}
                    validation={addressValidation.arrival}
                    placeholder="도착지 주소를 검색해주세요"
                    error={errors.arrivalAddress}
                    searchResults={arrivalSearchResults}
                    isSearching={isSearchingArrival}
                    onSelectAddress={onSelectArrivalAddress}
                    inputStyle={inputStyle}
                />
            </div>

            {/* 설명 */}
            <div>
                <label htmlFor={'description'} className="block text-16-m mb-[12px]">
                    설명<span className={'text-[#E17364] text-16-m'}>*</span>
                </label>
                <textarea
                    maxLength={800}
                    id={'description'}
                    value={formData.description}
                    onChange={(e) => {
                        try {
                            onFormDataChange('description', e.target.value);
                        } catch (error) {
                            console.error('설명 입력 오류:', error);
                        }
                    }}
                    onInput={(e) => {
                        try {
                            onFormDataChange('description', e.target.value);
                        } catch (error) {
                            console.error('설명 입력 오류 (onInput):', error);
                        }
                    }}
                    placeholder={`이동 봉사에 대한 상세한 설명을 입력해주세요.\n(희망 일정, 켄넬 지원 여부, 공격성, 질병, 임보견에 대한 설명, 봉사자님께 전하는 말 등)`}
                    rows={4}
                    className={`${inputStyle} w-full resize-none py-[14px] min-h-[140px] ${
                        errors.description ? 'border-red-500' : 'border-gray-300'
                    }`}
                />
                <div className={'relative'}>
                    {errors.description && (
                        <p className="text-xs text-red-500 mt-1">{errors.description}</p>
                    )}
                    <p className="absolute right-[5px] text-text-800 text-12-l">
                        {formData.description?.length || 0}/800
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Step1;
