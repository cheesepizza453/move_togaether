'use client';

import { useEffect, useState } from 'react';
import { Home, Plus, Heart, User } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
// import { useSplash } from './SplashProvider';
import {IconMenuBarHome, IconMenuBarMap, IconMenuBarHeart, IconMenuBarMy, IconMenuBarPlus} from "@/components/icon/IconMenuBar";
import { useLoginDialog } from '@/components/LoginDialog';

const getActiveTabFromPath = (pathname) => {
  if (!pathname || pathname === '/') {
    return 'home';
  }

  if (pathname.startsWith('/shelter')) {
    return 'shelter';
  }

  if (pathname.startsWith('/volunteer/create')) {
    return 'post';
  }

  if (pathname.startsWith('/favorites')) {
    return 'favorites';
  }

  if (pathname.startsWith('/mypage')) {
    return 'mypage';
  }

  return 'home';
};

const BottomNavigation = () => {
  const pathname = usePathname();
  const [pendingTab, setPendingTab] = useState(null);
  const { showLoginDialog } = useLoginDialog();
  // const { showSplash } = useSplash();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    setPendingTab(null);
  }, [pathname]);

  const derivedActiveTab = getActiveTabFromPath(pathname);
  const activeTab = pendingTab ?? derivedActiveTab;

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
    const needsAuth = ['post', 'favorites', 'mypage'].includes(tabId);
    const redirectMap = {
      post: '/volunteer/create',
      favorites: '/favorites',
      mypage: '/mypage',
    };

    if (needsAuth) {
      if (authLoading) return;

      if (!user) {
        showLoginDialog({
          title: '로그인하고 더 편하게 이용해보세요!',
          message: '이 기능은 로그인 후 이용하실 수 있어요.',
          redirectPath: redirectMap[tabId]
        });
        return;
      }
    }

    setPendingTab(tabId);

    const selectedTab = tabs.find(tab => tab.id === tabId);
    if (selectedTab?.href) router.push(selectedTab.href);
  };

  return (
    <>
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

    </>
  );
};

export default BottomNavigation;
