'use client';

import { useState } from 'react';
import { MapPin, ChevronRight, X } from 'lucide-react';

const LocationSelector = () => {
  const [currentLocation, setCurrentLocation] = useState('전국');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleLocationSelect = (location) => {
    setCurrentLocation(location);
    setIsModalOpen(false);
  };

  const predefinedLocations = [
    '전국', '서울', '부산', '대구', '인천', '광주', '대전', '울산', '세종',
    '경기', '강원', '충북', '충남', '전북', '전남', '경북', '경남', '제주'
  ];

  return (
    <div className="relative">
      {/* 위치 선택 버튼 - full-width */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="w-full flex items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors text-left"
      >
        <div className="flex items-center space-x-2">
          <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
          <span className="text-sm sm:text-base text-gray-700 font-medium">
            {currentLocation}
          </span>
        </div>
        <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
      </button>

      {/* 모달 */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full sm:w-80 max-h-96 overflow-hidden">
            {/* 모달 헤더 */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-base sm:text-lg font-semibold text-gray-800">
                위치 선택
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* 위치 목록 */}
            <div className="p-4 max-h-64 overflow-y-auto">
              <div className="grid grid-cols-2 gap-2">
                {predefinedLocations.map((location) => (
                  <button
                    key={location}
                    onClick={() => handleLocationSelect(location)}
                    className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                      currentLocation === location
                        ? 'bg-blue-100 text-blue-700 font-medium'
                        : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    {location}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationSelector;
