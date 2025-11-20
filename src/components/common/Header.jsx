'use client';

import Link from 'next/link';
import {useAuth} from "@/hooks/useAuth";
import ProfileImage from "@/components/common/ProfileImage";

const Header = (props) => {
    const { user, profile, loading, signOut } = useAuth();

    if (loading) return null;

    const isLoggedIn = !!user;
    const hasProfile = !!profile;


    if (!props.title) {
        return (
            <header className="sticky top-0 z-40 bg-white w-full px-[23px]">
                <div className="w-full flex justify-between">
                    {/* 로고 - 중앙 정렬 */}
                    <div className="h-[60px] flex items-center justify-left">
                        <h1 className="text-banner-1 flex space-x-2">
                            <figure className={'w-[137px]'}>
                                <img className={'w-full'} src={'/img/header_logo.png'} alt={'무브투개더'}/>
                            </figure>
                        </h1>
                    </div>
                    <div className="flex items-center gap-3">

                        {/* 로그인 안 된 경우 → 로그인 버튼 */}
                        {!isLoggedIn && (
                            <Link
                                href="/login"
                                className="text-14-m text-text-800 px-[15px] py-[10px] border bg-brand-bg rounded-[15px]"
                            >
                                로그인
                            </Link>
                        )}

                        {/* 로그인 + 프로필 있음 → 프로필 이미지 */}
                        {isLoggedIn && hasProfile && (
                            <Link href="/mypage" className={'relative block w-[40px] h-[40px] rounded-full overflow-hidden'}>
                               <img
                                    src={profile.profile_image || '/img/default_profile.jpg'}
                                    alt="프로필"
                                    className="absolute top-1/2 left-1/2 w-full h-full -translate-x-1/2 -translate-y-1/2 object-cover"
                                />
                            </Link>
                        )}
                    </div>
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
