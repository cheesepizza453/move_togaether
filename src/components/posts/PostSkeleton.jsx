import IconLoading from "../../../public/img/icon/IconLoading";
import React from "react";

const PostSkeleton= () => {
    return (
        <div className="min-h-screen bg-white">
            {/* 헤더 */}
            <div className="w-full h-[72px] flex items-center justify-between px-[30px] py-[28px]">
                <button
                    className={'p-[12px] pl-0 outline-none focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:outline-none'}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="9" height="16" viewBox="0 0 9 16" fill="none">
                        <path d="M8 15L1 8" stroke="black" strokeWidth="2" strokeMiterlimit="10"
                              strokeLinecap="round"/>
                        <path d="M8 0.999999L1 8" stroke="black" strokeWidth="2" strokeMiterlimit="10"
                              strokeLinecap="round"/>
                    </svg>
                </button>
            </div>
            <div>
                <div>
                    {/* 강아지 이미지 */}
                    <div className="relative flex justify-center items-center w-full h-auto aspect-[1/1] bg-brand-bg">
                        <IconLoading/>
                    </div>

                    {/* 게시물 정보 */}
                    <div className="px-[28px] py-[20px] bg-white h-[106px]">
                        <div className="bg-text-100 w-full h-[30px] rounded-[10px]"></div>
                        <div className="mt-[10px] bg-text-100 w-[80px] h-[20px] rounded-[10px]"></div>
                    </div>

                    <div className="py-[24px] px-[22px] space-y-6 bg-brand-bg">
                        {/* 찾아오는 길 */}
                        <div>
                            <h3 className="text-16-b mb-[10px]">찾아오는 길</h3>
                            <div
                                className="flex flex-col p-[18px] bg-white rounded-[15px] shadow-[0_0_12px_0_rgba(0,0,0,0.1)]">
                                {/* ... */}
                            </div>
                        </div>

                        {/* 상세 설명 */}
                        <div>
                            <h3 className="text-16-b mb-[10px]">상세 설명</h3>
                            <div
                                className="flex flex-col p-[18px] min-h-[115px] bg-white rounded-[15px] shadow-[0_0_12px_0_rgba(0,0,0,0.1)]">
                                {/* ... */}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
export default PostSkeleton;