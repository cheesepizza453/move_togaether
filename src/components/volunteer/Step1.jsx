'use client';

import AddressInput from './AddressInput';

const Step1 = ({
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
  onSelectArrivalAddress
}) => {
  return (
    <div className="space-y-6">
      {/* 제목 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          제목 *
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => {
            try {
              onFormDataChange('title', e.target.value);
            } catch (error) {
              console.error('제목 입력 오류:', error);
            }
          }}
          placeholder="이동 봉사 제목을 입력해주세요"
          className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-colors ${
            errors.title ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.title && (
          <p className="text-xs text-red-500 mt-1">{errors.title}</p>
        )}
      </div>

      {/* 이동 경로 */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">이동 경로</h3>

        <AddressInput
          label="출발지"
          value={formData.departureAddress}
          onChange={(value) => onAddressChange('departure', value)}
          onSearch={(baseAddress) => onSearchAddress('departure', baseAddress)}
          validation={addressValidation.departure}
          placeholder="출발지 주소를 입력해주세요"
          error={errors.departureAddress}
          searchResults={departureSearchResults}
          isSearching={isSearchingDeparture}
          onSelectAddress={onSelectDepartureAddress}
        />

        <AddressInput
          label="도착지"
          value={formData.arrivalAddress}
          onChange={(value) => onAddressChange('arrival', value)}
          onSearch={(baseAddress) => onSearchAddress('arrival', baseAddress)}
          validation={addressValidation.arrival}
          placeholder="도착지 주소를 입력해주세요"
          error={errors.arrivalAddress}
          searchResults={arrivalSearchResults}
          isSearching={isSearchingArrival}
          onSelectAddress={onSelectArrivalAddress}
        />
      </div>

      {/* 설명 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          설명 *
        </label>
        <textarea
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
          placeholder="이동 봉사에 대한 상세 설명을 입력해주세요"
          rows={4}
          className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-colors resize-none ${
            errors.description ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.description && (
          <p className="text-xs text-red-500 mt-1">{errors.description}</p>
        )}
      </div>

      {/* 설명 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-900 mb-2">이동 봉사란?</h4>
        <p className="text-sm text-blue-800">
          유기견을 보호소에서 입양자에게 안전하게 이동시키는 봉사활동입니다.
          출발지와 도착지 주소를 정확히 입력해주세요.
        </p>
      </div>
    </div>
  );
};

export default Step1;
