'use client';

const SortOptions = ({ activeType, onTypeChange, activeSort, onSortChange }) => {
  const types = [
    { id: 'volunteer', label: '이동봉사' },
    { id: 'missing', label: '실종신고' },
  ];

  const toggleSort = () => {
    onSortChange(activeSort === 'latest' ? 'deadline' : 'latest');
  };

  return (
    <div className="flex items-center justify-between ml-[7px]">
      {/* 타입 탭 */}
      <div className="flex space-x-[18px]">
        {types.map((type) => (
          <button
            key={type.id}
            onClick={() => onTypeChange(type.id)}
            className={`text-16-m transition-colors relative pb-[4px] ${
              activeType === type.id ? 'text-black' : 'text-text-800'
            }`}
          >
            {type.label}
            {activeType === type.id && (
              <span className="absolute block bottom-[-3px] left-0 w-full h-[3px] bg-brand-point rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* 정렬 버튼 */}
      <button
        onClick={toggleSort}
        className="flex items-center gap-[4px] text-14-r text-text-800 mr-[7px]"
      >
        {activeSort === 'latest' ? '최신순' : '마감순'}
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M8 9l4-4 4 4"/>
          <path d="M16 15l-4 4-4-4"/>
        </svg>
      </button>
    </div>
  );
};

export default SortOptions;
