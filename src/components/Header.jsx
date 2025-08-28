'use client';

import LocationSelector from './LocationSelector';

const Header = () => {
  return (
    <header className="bg-white shadow-sm sticky top-0 z-40">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        {/* 로고 - 좌측 상단 */}
        <div className="flex justify-start items-center py-3 sm:py-4">
          <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-blue-600">
            Move Togaether
          </h1>
        </div>

        {/* 위치 선택기 - full-width */}
        <div className="w-full pb-3 sm:pb-4">
          <LocationSelector />
        </div>
      </div>
    </header>
  );
};

export default Header;
