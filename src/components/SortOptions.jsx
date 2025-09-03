'use client';

import { useState } from 'react';

const SortOptions = ({ onSortChange }) => {
  const [activeSort, setActiveSort] = useState('latest');

  const sortOptions = [
    { id: 'latest', label: '최신순' },
    { id: 'deadline', label: '종료순' },
    { id: 'distance', label: '가까운순' }
  ];

  const handleSortClick = (sortId) => {
    setActiveSort(sortId);
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
