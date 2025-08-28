'use client';

import { useState } from 'react';

const SortOptions = ({ onSortChange }) => {
  const [activeSort, setActiveSort] = useState('latest');

  const sortOptions = [
    { id: 'latest', label: '최신순' },
    { id: 'deadline', label: '마감순' },
    { id: 'distance', label: '가까운순' }
  ];

  const handleSortClick = (sortId) => {
    setActiveSort(sortId);
    if (onSortChange) {
      onSortChange(sortId);
    }
  };

  return (
    <div className="flex flex-wrap gap-2 sm:gap-2">
      {sortOptions.map((option) => (
        <button
          key={option.id}
          onClick={() => handleSortClick(option.id)}
          className={`flex-1 sm:flex-none px-3 sm:px-4 py-2.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
            activeSort === option.id
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
};

export default SortOptions;
