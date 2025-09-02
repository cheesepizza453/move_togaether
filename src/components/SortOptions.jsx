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
    <div className="flex space-x-6">
      {sortOptions.map((option) => (
        <button
          key={option.id}
          onClick={() => handleSortClick(option.id)}
          className={`text-button-guide-chart-location transition-colors ${
            activeSort === option.id
              ? 'text-yellow-500 border-b-2 border-yellow-500 -pb-2'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
};

export default SortOptions;
