'use client';

import { useState } from 'react';
import { MapPin, ChevronRight, X } from 'lucide-react';
import IconRightArrow from "../../public/img/icon/IconRightArrow";

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
      {/* 위치 선택 버튼 - 노란색 배경 */}
      <button
          onClick={() => setIsModalOpen(true)}
          className="w-full flex items-center justify-between px-[20px] py-[15px] bg-[#fff6d1] border-2 border-brand-main rounded-[15px] hover:bg-[#f0e8c0] transition-colors text-left"
      >
        <div className="flex items-center space-x-2">
          {/* <MapPin className="w-5 h-5 text-yellow-800" /> */}
          <svg width="19" height="23" viewBox="0 0 19 23" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
                d="M12.1556 10.4341C11.819 10.0975 11.745 9.3188 11.3706 8.97557C10.0243 7.74142 8.34133 8.52679 7.66815 10.0975C7.33157 10.5463 6.6584 10.6585 6.20961 11.1073C5.08766 12.117 5.53644 14.1366 6.99498 14.5853C8.22913 14.9219 9.57548 14.5853 10.9218 14.8097C11.7072 14.8097 12.3804 14.8097 13.0535 14.4731C14.2877 13.8 14.3999 12.0048 13.3901 11.1073C13.0535 10.7707 12.4922 10.6585 12.1556 10.4341Z"
                fill="#333333"/>
            <path
                d="M10.1365 6.05853C10.1365 6.95609 10.8096 7.62926 11.4828 7.62926C12.156 7.62926 12.8292 6.95609 12.8292 6.05853C12.8292 5.16096 12.2682 4.3756 11.4828 4.3756C10.6975 4.3756 10.1365 5.16096 10.1365 6.05853Z"
                fill="#333333"/>
            <path
                d="M15.5219 8.63899C15.1853 9.53655 14.3999 9.98533 13.7267 9.76094C13.0536 9.53655 12.6048 8.75118 12.9414 7.85362C13.278 6.95606 14.0633 6.39508 14.7365 6.61947C15.4097 6.84386 15.7463 7.74143 15.5219 8.63899Z"
                fill="#333333"/>
            <path
                d="M9.68762 6.05853C9.68762 6.95609 9.01445 7.62926 8.34128 7.62926C7.66811 7.62926 6.99493 6.95609 6.99493 6.05853C6.99493 5.16096 7.55591 4.3756 8.34128 4.3756C9.12665 4.3756 9.68762 5.16096 9.68762 6.05853Z"
                fill="#333333"/>
            <path
                d="M4.19011 8.63899C4.5267 9.53655 5.31206 9.98533 5.98524 9.76094C6.65841 9.53655 7.10719 8.75118 6.7706 7.85362C6.43402 6.95606 5.64865 6.39508 4.97548 6.61947C4.30231 6.84386 3.96572 7.74143 4.19011 8.63899Z"
                fill="#333333"/>
            <path
                d="M9.91216 -1.52588e-05H9.79997C4.63898 -1.52588e-05 0.599945 4.37561 0.599945 9.64879C0.599945 14.922 2.73166 17.3903 7.66826 21.6537C8.00484 21.8781 8.56582 22.4391 9.79997 22.4391C11.0341 22.4391 11.5951 21.8781 11.9317 21.5415C16.7561 17.5025 19 14.8098 19 9.64879C19 4.4878 14.961 -1.52588e-05 9.91216 -1.52588e-05ZM11.0341 20.4196C10.6576 20.7348 10.5853 20.9805 9.91216 20.9805C9.23899 20.9805 9.0146 20.7561 8.79021 20.5317C3.85361 16.3805 2.17068 14.1366 2.17068 9.64879C2.17068 5.16097 5.64874 1.57072 9.68777 1.57072H9.79997C14.0634 1.57072 17.4293 5.27317 17.4293 9.64879C17.4293 14.0244 15.8585 16.3805 11.0341 20.4196Z"
                fill="#333333"/>
          </svg>

          <span className="text-button-guide-chart-location text-brand-yellow-dark font-medium text-16-m">
            {currentLocation}
          </span>
        </div>
        <figure className={'w-[9px] h-[18px]'}>
          <IconRightArrow/>
        </figure>
      </button>

      {/* 모달 */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full sm:w-80 max-h-96 overflow-hidden">
            {/* 모달 헤더 */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-base font-semibold text-gray-800">
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
            <div className="p-4 max-h-[53px]] overflow-y-auto">
              <div className="grid grid-cols-2 gap-2">
                {predefinedLocations.map((location) => (
                  <button
                    key={location}
                    onClick={() => handleLocationSelect(location)}
                    className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                      currentLocation === location
                        ? 'bg-yellow-100 text-yellow-800 font-medium'
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
