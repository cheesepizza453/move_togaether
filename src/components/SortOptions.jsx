'use client';

import { useState } from 'react';

const SortOptions = ({ onSortChange, activeSort: externalActiveSort }) => {
  const [internalActiveSort, setInternalActiveSort] = useState('latest');

  // 외부에서 전달받은 activeSort가 있으면 사용, 없으면 내부 상태 사용
  const activeSort = externalActiveSort || internalActiveSort;

  const sortOptions = [
    { id: 'latest', label: '최신순' },
    { id: 'deadline', label: '마감순' },
    //   가까운순 숨김
    /*{ id: 'distance', label: '가까운순' }*/
  ];

  const handleSortClick = (sortId) => {
    // 외부에서 activeSort를 관리하는 경우 내부 상태는 업데이트하지 않음
    if (!externalActiveSort) {
      setInternalActiveSort(sortId);
    }
    if (onSortChange) {
      onSortChange(sortId);
    }
  };

  return (
    <div className="flex space-x-[10px] ml-[7px]">
      {sortOptions.map((option) => (
        <button
          key={option.id}
          onClick={() => handleSortClick(option.id)}
          className={`text-button-guide-chart-location transition-colors relative text-16-m ${
            activeSort === option.id
              ? 'text-black'
              : 'text-text-800 hover:text-gray-700'
          }`}
        >
          {option.label}
          {activeSort === option.id &&
              <span className={'absolute block bottom-[-3px] left-0 w-full h-[3px] bg-brand-point rounded-full'}></span>}
        </button>
      ))}
    </div>
  );
};

export default SortOptions;
