'use client';

import LocationSelector from './LocationSelector';

const Header = () => {
  return (
    <header className="sticky top-0 z-40 bg-brand-bg w-full px-[23px] pt-[15px] pb-[18px]">
      <div className="w-full">
        {/* 로고 - 중앙 정렬 */}
        <div className="flex justify-left items-left mb-[17px]">
          <h1 className="text-banner-1 flex space-x-2">
            <figure className={'w-[137px]'}>
              <img className={'w-full'} src={'/img/header_logo.png'} alt={'무브투개더'}/>
            </figure>
          </h1>
        </div>

        {/* 위치 선택기 */}
        <div className="w-full">
            <LocationSelector />
        </div>
      </div>
    </header>
  );
};

export default Header;
