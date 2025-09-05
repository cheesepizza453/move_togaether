'use client';

import { useState } from 'react';
// 보호자정보 리스트
const PostCardInfo = ({ post }) => {
  const [isFavorite, setIsFavorite] = useState(post.isFavorite || false);

  const {
    id,
    title,
    dogName,
    dogSize,
    dogBreed,
    departureAddress,
    arrivalAddress,
    deadline,
    images = [],
    status = 'active',
    dday,
    created,
  } = post;

  const toggleFavorite = (e) => {
    e.stopPropagation();
    setIsFavorite(!isFavorite);
  };

  const handleCardClick = () => {
    // 게시물 상세 페이지로 이동
    window.location.href = `/posts/${id}`;
  };

  // D-day 배지 색상 결정
  const getDdayColor = (dday) => {
    if (dday <= 7) return 'bg-brand-point text-white';
    if (dday <= 14) return 'bg-brand-main text-white';
    return 'bg-[#FFE889] text-brand-yellow-dark';
  };

  return (

  <div className={'flex flex-col justify-between'}>
      <div className={'flex items-center gap-x-[10px]'}>
        <div>
          <span className={'relative block w-[15px] h-[15px] rounded-full bg-[#ffec9c]'}>
            <span className={'absolute block w-[9px] h-[9px] rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-brand-main z-1'}></span>
          </span>
        </div>
        <p className={'text-12-r text-brand-icon'}>{created}</p>
      </div>

      <div
          className="mt-[8px] relative ml-[25px] px-[25px] py-[25px] bg-text-100 rounded-[15px] cursor-pointer"
          onClick={handleCardClick}
      >
        <span className={'absolute left-[-25px] top-0 block mx-[7px] w-[1px] h-full bg-brand-main'}></span>
        <div className="flex space-x-[20px]">
          {/* 왼쪽 텍스트 영역 */}
          <div className="min-w-0 flex flex-col w-full">
            {/* D-day 배지 - border 위에 겹쳐서 표시 */}
            <div className="flex">
              <span
                  className={`flex items-center justify-center px-[9px] h-[22px] rounded-[7px] text-14-b ${getDdayColor(dday)}`}>
                D-{dday}
              </span>
            </div>
            {/* 제목 */}
            <h3 className="mt-[8px] min-h-[35px] text-list-1 leading-normal line-clamp-2 text-12-m">
              {title}
            </h3>
            {/* 강아지 정보와 날짜 */}
            <div className="flex justify-between items-end mt-[4px] text-text-800">
              <div className="text-name-breed text-10-r">
                {dogName} / {dogSize}
              </div>
            </div>
          </div>
          {/* 오른쪽 이미지 영역 */}
          <div className="flex-shrink-0 relative">
            {/* 강아지 이미지 */}
            <figure
                className="relative w-[85px] h-[85px] overflow-hidden bg-gray-200 rounded-[15px] shadow-[0_0_15px_0px_rgba(0,0,0,0.1)]">
              <img
                  className={'absolute top-1/2 left-1/2 max-w-full max-h-full -translate-x-1/2 -translate-y-1/2 object-contain'}
                  src={"/img/dummy_thumbnail.jpg"} alt={'Dummy'}/>
            </figure>
          </div>
      </div>
    </div>
  </div>
  );
};

export default PostCardInfo;
