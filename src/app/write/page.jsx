'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import {Input} from "@/components/ui/input";

const Write = () => {
    const [activeTab, setActiveTab] = useState('first');
    const [selectedSize, setSelectedSize] = useState('small');
    const [isPickupSelected, setIsPickupSelected] = useState(true);
    const [isDeliverySelected, setIsDeliverySelected] = useState(false);
    // 스타일 작업 필요~~
    return (
        <div className="mx-auto bg-white min-h-screen">
            {/* Progress Steps */}
            <div className="px-[30px] h-[90px]">
                <div className="flex items-center justify-between pt-[17px] relative">
                    <div className="flex flex-col items-center">
                      <span className={'relative block w-[24px] h-[24px] rounded-full bg-brand-main'}>
                        <span
                            className={'absolute block w-[12px] h-[12px] rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-brand-sub z-1'}></span>
                        </span>
                        <span className="text-xs mt-1 text-brand-yellow-dark text-12-m">이동 봉사 정보</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <span className={'relative block w-[24px] h-[24px] rounded-full bg-brand-main'}>
                        <span
                            className={'absolute block w-[12px] h-[12px] rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-brand-sub z-1'}></span>
                        </span>
                        <span className="text-xs mt-1 text-brand-yellow-dark text-12-m">구조견 정보</span>
                    </div>
                    <div className="flex flex-col items-center">
                        <div className="w-6 h-6 rounded-full bg-gray-300"></div>
                        <span className="text-xs mt-1 text-gray-500">추가 정보</span>
                    </div>
                </div>
            </div>

            {/* Tab Content */}
            <div className="px-4">
                {activeTab === 'first' && (
                    <div className="space-y-[22px]">
                        {/* 이동 봉사 정보 */}
                        <div className={'flex justify-between'}>
                            <h2 className="mt-[4px] text-20-m">이동 봉사 정보</h2>
                            <p className="text-10-l text-[#DB1F1F]"><i className={'font-bold'}>*</i> 표시는 필수 입력 정보입니다</p>
                        </div>

                        {/* 제목 */}
                        <div>
                        <Input placeHolder={'제목을 입력해 주세요.'} label={'제목'} isRequired={true} maxLength={20} allowSpecialChar={false}/>
                        <div className={'flex justify-between mt-[6px] mx-[8px]'}>
                            <p className={'text-9-r text-[#8B8B8B]'}>특수문자 불가</p>
                        </div>
                        </div>

                        {/* 이동경로 */}
                        <div>
                            <label className="block text-16-m mb-[12px]">
                                이동경로<span className="text-[#E17364]">*</span>
                            </label>
                            <div className="space-y-3">
                                <div className="flex gap-3">
                                    <Input placeHolder={'출발지 주소를 입력해 주세요.'} disabled={'disabled'}/>
                                    <button
                                        onClick={() => setIsPickupSelected(!isPickupSelected)}
                                        className={`flex-1 py-3 px-4 rounded-lg border ${
                                            isPickupSelected ? 'bg-yellow-400 border-yellow-400' : 'bg-gray-50 border-gray-200'
                                        }`}
                                    >
                                        <span className={isPickupSelected ? 'text-black font-medium' : 'text-gray-500'}>
                                          출발지 검색
                                        </span>
                                    </button>
                                </div>
                                <div className="flex gap-3">
                                    <Input placeHolder={'도착지 주소를 입력해 주세요.'}/>
                                    <button
                                        onClick={() => setIsDeliverySelected(!isDeliverySelected)}
                                        className={`flex-1 py-3 px-4 rounded-lg border ${
                                            isDeliverySelected ? 'bg-yellow-400 border-yellow-400' : 'bg-gray-50 border-gray-200'
                                        }`}
                                    >
                                        <span className={isDeliverySelected ? 'text-black font-medium' : 'text-gray-500'}>
                                          도착지 검색
                                        </span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* 설명 */}
                        <div>
                            <label className="block text-sm font-medium mb-2">설명</label>
                            <textarea
                                placeholder="이번 이동 봉사에 대해 설명해 주세요.
(희망 일정, 전달 지원 여부, 구조견에 대한 설명, 봉사자님께 전하는 말 등)"
                                className="w-full px-4 py-3 border border-gray-200 rounded-lg h-32 resize-none"
                            />
                            <div className="text-right text-xs text-gray-400 mt-1">0/1000</div>
                        </div>

                        {/* 다음으로 버튼 */}
                        <button className="w-full py-4 bg-gray-200 text-gray-500 rounded-lg font-medium">
                            다음으로
                        </button>
                    </div>
                )}

                {activeTab === 'second' && (
                    <div className="space-y-6">
                        {/* 구조견 정보 */}
                        <div>
                            <h2 className="text-lg font-medium mb-1">구조견 정보</h2>
                            <p className="text-xs text-red-500">* 표시는 필수 입력 정보입니다</p>
                        </div>

                        {/* 이름 */}
                        <div>
                            <label className="block text-sm font-medium mb-2">이름</label>
                            <input
                                type="text"
                                placeholder="이름을 입력해주세요."
                                className="w-full px-4 py-3 border border-gray-200 rounded-lg"
                            />
                            <div className="text-right text-xs text-gray-400 mt-1">0/20</div>
                        </div>

                        {/* 사진 */}
                        <div>
                            <label className="block text-sm font-medium mb-2">사진</label>
                            <p className="text-xs text-gray-500 mb-2">총 5장의 이미지를 업로드 할 수 있습니다.</p>
                            <div className="flex gap-3">
                                <div className="w-20 h-20 rounded-lg overflow-hidden">
                                    <img src="/" alt="Pet" className="w-full h-full object-cover" />
                                </div>
                                <button className="w-20 h-20 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                                    <Plus className="w-6 h-6 text-gray-400" />
                                </button>
                            </div>
                        </div>

                        {/* 크기 */}
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                크기<span className="text-red-500">*</span>
                            </label>
                            <p className="text-xs text-gray-500 mb-3">
                                소형: 5kg | 중소형: 5.1kg~8kg | 중형: 8.1kg~20kg | 대형: 20.1kg
                            </p>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setSelectedSize('small')}
                                    className={`flex-1 py-2 px-4 rounded-lg ${
                                        selectedSize === 'small' ? 'bg-yellow-400' : 'bg-gray-100'
                                    }`}
                                >
                                    소형
                                </button>
                                <button
                                    onClick={() => setSelectedSize('medium-small')}
                                    className={`flex-1 py-2 px-4 rounded-lg ${
                                        selectedSize === 'medium-small' ? 'bg-yellow-400' : 'bg-gray-100'
                                    }`}
                                >
                                    중소형
                                </button>
                                <button
                                    onClick={() => setSelectedSize('medium')}
                                    className={`flex-1 py-2 px-4 rounded-lg ${
                                        selectedSize === 'medium' ? 'bg-yellow-400' : 'bg-gray-100'
                                    }`}
                                >
                                    중형
                                </button>
                                <button
                                    onClick={() => setSelectedSize('large')}
                                    className={`flex-1 py-2 px-4 rounded-lg ${
                                        selectedSize === 'large' ? 'bg-yellow-400' : 'bg-gray-100'
                                    }`}
                                >
                                    대형
                                </button>
                            </div>
                        </div>

                        {/* 견종 */}
                        <div>
                            <label className="block text-sm font-medium mb-2">견종</label>
                            <input
                                type="text"
                                placeholder="견종을 입력하세요."
                                className="w-full px-4 py-3 border border-gray-200 rounded-lg"
                            />
                            <div className="text-right text-xs text-gray-400 mt-1">0/20</div>
                        </div>

                        {/* 다음으로 버튼 */}
                        <button className="w-full py-4 bg-yellow-400 text-black rounded-lg font-medium">
                            다음으로
                        </button>
                    </div>
                )}

                {activeTab === 'third' && (
                    <div className="space-y-6">
                        {/* 추가 정보 */}
                        <div>
                            <h2 className="text-lg font-medium mb-1">추가 정보</h2>
                        </div>

                        {/* 관련 게시물 링크 */}
                        <div>
                            <label className="block text-sm font-medium mb-2">관련 게시물 링크</label>
                            <input
                                type="text"
                                placeholder="보호견과 관련된 게시물 링크를 입력해 주세요."
                                className="w-full px-4 py-3 border border-gray-200 rounded-lg"
                            />
                        </div>

                        {/* 미리보기 버튼 */}
                        <button className="w-full py-4 bg-yellow-400 text-black rounded-lg font-medium">
                            미리보기
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Write