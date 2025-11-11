'use client';

import { usePathname } from 'next/navigation';
import { memo } from 'react';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import BottomNavigation from '@/components/common/BottomNavigation';
import { Toaster } from 'sonner';

const ClientLayout = memo(({ children }) => {
  const pathname = usePathname();
  const isLoginPage = ['/login', '/signup', '/signup/additional-info', '/signup/kakao', '/signup/success', '/mypage/edit', '/find-id', '/forgot-password'].includes(pathname);
  const isVolunteerCreatePage = pathname === '/volunteer/create';

  return (
    <>
      {/* {!isLoginPage && <Header />} */}
      <main>{children}</main>
      {!isLoginPage && <BottomNavigation />}
      {!isLoginPage && <Footer />}
      <Toaster
        position="top-right"
        expand={true}
        richColors={true}
        closeButton={true}
        duration={5000}
      />
    </>
  );
});

ClientLayout.displayName = 'ClientLayout';

export default ClientLayout;
