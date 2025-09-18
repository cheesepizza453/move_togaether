'use client';

import AddressSearchResults from './AddressSearchResults';

const AddressInput = ({
  label,
  value,
  onChange,
  onSearch,
  validation,
  placeholder,
  error,
  searchResults = [],
  isSearching = false,
  onSelectAddress,
  inputStyle
}) => {
  const isSearchDisabled = !value.trim() || validation.isValid === true;
  const inputBorderColor = validation.isValid === true
    ? 'border-green-500 bg-green-50'
    : validation.isValid === false
    ? 'border-red-500 bg-red-50'
    : 'border-gray-300';

  // 주소와 상세주소 분리
  const extractBaseAddress = (fullAddress) => {
    // 상세주소 패턴 (동, 호, 층 등)
    const detailPattern = /\s+\d+동\s+\d+호|\s+\d+층|\s+\d+번지|\s+상가|\s+지하\d+층/;
    const match = fullAddress.match(detailPattern);

    if (match) {
      const detailIndex = fullAddress.indexOf(match[0]);
      return {
        baseAddress: fullAddress.substring(0, detailIndex).trim(),
        detailAddress: fullAddress.substring(detailIndex).trim()
      };
    }

    return {
      baseAddress: fullAddress,
      detailAddress: ''
    };
  };

  const { baseAddress, detailAddress } = extractBaseAddress(value);

  // 엔터키 핸들러
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !isSearchDisabled && !isSearching) {
      onSearch(baseAddress);
    }
  };

  return (
    <div className="relative">
      <label htmlFor={value} className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <div className="flex gap-2">
        <input
          id={value}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          className={`w-full ${inputStyle} ${inputBorderColor}`}
        />
        <button
          type="button"
          onClick={() => onSearch(baseAddress)}
          disabled={isSearchDisabled || isSearching}
          className={`px-4 py-3 rounded-lg transition-colors whitespace-nowrap flex items-center justify-center ${
            isSearchDisabled || isSearching
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-brand-main text-black'
          }`}
        >
          {isSearching ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              검색중...
            </>
          ) : (
              `${label} 검색`
          )}
        </button>
      </div>

      {/* 검색 결과 */}
      <AddressSearchResults
        results={searchResults}
        onSelectAddress={onSelectAddress}
        isLoading={isSearching}
        currentDetailAddress={detailAddress}
      />

      {/* 도움말 텍스트 */}
      <p className="text-xs text-gray-500 mt-1">
        {label}를 입력해 주세요.
      </p>

      {/* 검증 메시지 */}
      {validation.message && validation.isValid === false && (
        <p className="text-xs text-red-500 mt-1">
          {validation.message}
        </p>
      )}

      {/* 에러 메시지 */}
      {error && (
        <p className="text-xs text-red-500 mt-1">{error}</p>
      )}
    </div>
  );
};

export default AddressInput;
