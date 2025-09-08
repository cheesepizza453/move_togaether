'use client';

const AddressSearchResults = ({
  results,
  onSelectAddress,
  isLoading,
  currentDetailAddress = ''
}) => {
  if (isLoading) {
    return (
      <div className="mt-2 p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-500 mr-2"></div>
          <span className="text-sm text-gray-600">주소를 검색하고 있습니다...</span>
        </div>
      </div>
    );
  }

  if (!results || results.length === 0) {
    return null;
  }

  return (
    <div className="mt-2 border border-gray-200 rounded-lg bg-white shadow-lg max-h-48 overflow-y-auto">
      {results.map((result, index) => (
        <button
          key={index}
          onClick={() => onSelectAddress(result, currentDetailAddress)}
          className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
        >
          <div className="text-sm font-medium text-gray-900">
            {result.road_address_name || result.address_name}
          </div>
          {result.place_name && (
            <div className="text-xs text-gray-500 mt-1">
              장소: {result.place_name}
            </div>
          )}
          {result.address_name && result.road_address_name && result.address_name !== result.road_address_name && (
            <div className="text-xs text-gray-500">
              지번: {result.address_name}
            </div>
          )}
          {result.category_name && (
            <div className="text-xs text-blue-500 mt-1">
              {result.category_name}
            </div>
          )}
        </button>
      ))}
    </div>
  );
};

export default AddressSearchResults;
