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
      <main className={'bg-white'}>{children}</main>
      {!isLoginPage && <BottomNavigation />}
      {!isLoginPage && <Footer />}
      <Toaster
        position="top-center"
        expand={true}
        richColors={false}
        closeButton={true}
        duration={3000}
        toastOptions={{
            classNames: {
                toast: "!rounded-[15px] !text-14-m !shadow-[0_0_10px_0px_rgba(0,0,0,0.1)]",
                success:
                    "!bg-[#BFE1C5] !text-[#2BA03E]",
                error:
                    "!bg-brand-point-bg !text-brand-point",
                warning:
                    "bg-[#FFF6D1] text-[#DBBC13]",
                info:
                    "bg-white text-black",
            },
        }}
      />
    </>
  );
});

ClientLayout.displayName = 'ClientLayout';

export default ClientLayout;
