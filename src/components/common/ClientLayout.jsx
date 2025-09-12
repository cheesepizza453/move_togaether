'use client';

import { usePathname } from 'next/navigation';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import BottomNavigation from '@/components/common/BottomNavigation';
import { AuthProvider } from '@/contexts/AuthContext';
import { Toaster } from 'sonner';

const ClientLayout = ({ children }) => {
  const pathname = usePathname();
  const isLoginPage = ['/login', '/signup', '/signup/additional-info', '/signup/kakao', '/signup/success', '/mypage/edit'].includes(pathname);
  const isVolunteerCreatePage = pathname === '/volunteer/create';

  return (
    <AuthProvider>
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
    </AuthProvider>
  );
};

export default ClientLayout;
