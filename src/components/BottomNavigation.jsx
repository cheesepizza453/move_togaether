'use client';

import { useState } from 'react';
import { Home, Search, Plus, Heart, User } from 'lucide-react';

const BottomNavigation = () => {
  const [activeTab, setActiveTab] = useState('home');

  const tabs = [
    {
      id: 'home',
      label: '홈',
      icon: Home,
      href: '/'
    },
    {
      id: 'search',
      label: '검색',
      icon: Search,
      href: '/search'
    },
    {
      id: 'post',
      label: '봉사신청',
      icon: Plus,
      href: '/posts/new',
      isCircle: true
    },
    {
      id: 'favorites',
      label: '찜',
      icon: Heart,
      href: '/favorites'
    },
    {
      id: 'mypage',
      label: '마이',
      icon: User,
      href: '/mypage'
    }
  ];

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
    // 실제로는 라우팅 처리
    console.log('탭 클릭:', tabId);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50 lg:hidden">
      <div className="flex items-center justify-around px-2 py-3">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          const isCircle = tab.isCircle;

          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`flex flex-col items-center justify-center w-full py-2 px-1 transition-all duration-200 ${
                isActive
                  ? 'text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className={`relative transition-all duration-200 ${
                isCircle
                  ? 'p-3 rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 hover:shadow-xl'
                  : `p-2 rounded-lg ${isActive ? 'bg-blue-50' : 'hover:bg-gray-50'}`
              }`}>
                <Icon className={`transition-all duration-200 ${
                  isCircle
                    ? 'w-6 h-6'
                    : `w-6 h-6 ${isActive ? 'text-blue-600 scale-110' : 'text-gray-500'}`
                }`} />
                {!isCircle && isActive && (
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-600 rounded-full"></div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* iOS 스타일 홈 인디케이터 */}
      <div className="w-32 h-1 bg-gray-300 rounded-full mx-auto mb-1"></div>
    </div>
  );
};

export default BottomNavigation;
