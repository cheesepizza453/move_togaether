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
  onSelectAddress
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

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <div className="flex gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`flex-1 px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-colors ${inputBorderColor}`}
        />
        <button
          type="button"
          onClick={() => onSearch(baseAddress)}
          disabled={isSearchDisabled}
          className={`px-4 py-3 rounded-lg transition-colors whitespace-nowrap ${
            isSearchDisabled
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-yellow-500 text-white hover:bg-yellow-600'
          }`}
        >
          {isSearching ? '검색중...' : '검색'}
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
