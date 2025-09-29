'use client';

import LocationSelector from './LocationSelector';

const Header = (props) => {
    if (!props.title) {
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
                    {/* <div className="w-full">
                        <LocationSelector />
                    </div> */}
                </div>
            </header>
        )
    }

    if (props.title) {
        return (
            <div className="w-full h-[65px] flex items-center justify-start">
                <a href="">
                    <figure>
                        <svg xmlns="http://www.w3.org/2000/svg" width="9" height="16" viewBox="0 0 9 16" fill="none">
                            <path d="M8 15L1 8" stroke="black" strokeWidth="2" strokeMiterlimit="10" strokeLinecap="round"/>
                            <path d="M8 0.999999L1 8" stroke="black" strokeWidth="2" strokeMiterlimit="10" strokeLinecap="round"/>
                        </svg>
                    </figure>
                    <p>{props.title}</p>
                </a>
            </div>
        )
    }
};

export default Header;
