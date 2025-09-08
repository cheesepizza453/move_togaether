'use client';

import { useState } from 'react';
import { Home, Plus, Heart, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
// import { useSplash } from './SplashProvider';
import {IconMenuBarHome, IconMenuBarMap, IconMenuBarHeart, IconMenuBarMy, IconMenuBarPlus} from "@/components/icon/IconMenuBar";

const BottomNavigation = () => {
  const [activeTab, setActiveTab] = useState('home');
  // const { showSplash } = useSplash();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  // Splash가 표시되는 동안 하단 네비게이션 숨김
  // if (showSplash) {
  //   return null;
  // }

  const tabs = [
    {
      id: 'home',
      label: '홈',
      icon: IconMenuBarHome,
      href: '/',
      customIcon: ''
    },
    {
      id: 'shelter',
      label: '보호소 위치',
      icon: IconMenuBarMap,
      href: '/shelter',
      customIcon: ''
    },
    {
      id: 'post',
      label: '',
      icon: IconMenuBarPlus,
      href: '/volunteer/create',
      isCircle: true
    },
    {
      id: 'favorites',
      label: '저장목록',
      icon: IconMenuBarHeart,
      href: '/favorites',
      customIcon: ''
    },
    {
      id: 'mypage',
      label: '마이페이지',
      icon: IconMenuBarMy,
      href: '/mypage',
      customIcon: ''
    }
  ];

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);

    // post 버튼 클릭 시 로그인 상태 확인
    if (tabId === 'post') {
      if (authLoading) {
        // 로딩 중일 때는 아무것도 하지 않음
        return;
      }

      if (!user) {
        // 로그인되지 않은 경우
        toast.error('로그인이 필요합니다.', {
          description: '게시글을 작성하려면 로그인해주세요.',
          action: {
            label: '로그인하기',
            onClick: () => {
              // 로그인 성공 후 다시 작성 페이지로 이동할 수 있도록 현재 경로 저장
              sessionStorage.setItem('redirectAfterLogin', '/volunteer/create');
              router.push('/login');
            }
          }
        });
        return;
      }
    }

    // 해당 탭의 href로 이동
    const selectedTab = tabs.find(tab => tab.id === tabId);
    if (selectedTab && selectedTab.href) {
      router.push(selectedTab.href);
    }
  };

  return (
        <div className="fixed flex items-center bottom-0 left-[50%] translate-x-[-50%] right-0 w-full max-w-[550px] h-[86px] px-[44px] bg-[rgba(254,254,253,0.95)]
        shadow-[0_-2px_8px_0px_rgba(114,113,109,0.25)] z-50 rounded-t-[30px] justify-between">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            const isCircle = tab.isCircle;

            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={`flex flex-col items-center justify-center ${
                  isActive
                    ? 'text-[#FFC928]'
                    : 'text-[#B6B6B6]'
                }`}
              >
                <div className={`relative transition-all duration-200 ${
                  isCircle
                    ? 'flex justify-center items-center w-[42px] h-[42px] rounded-full bg-[#F5C8B7]'
                    : ``
                }`}>
                  <figure className={isCircle ? 'w-[22px] h-[22px]':'w-[30px] h-[30px]'}>
                    <Icon fill={isActive ? '#FFD044' : '#B6B6B6'} />
                  </figure>
                </div>

                {/* 라벨 텍스트 */}
                {!isCircle && (
                  <span className={`text-9-r mt-1 font-medium transition-colors ${
                    isActive ? 'text-brand-main' : 'text-[#B6B6B6]'
                  }`}>
                    {tab.label}
                  </span>
                )}
              </button>
            );
          })}
        </div>
  );
};

export default BottomNavigation;
