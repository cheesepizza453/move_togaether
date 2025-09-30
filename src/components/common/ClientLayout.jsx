'use client';

import { usePathname } from 'next/navigation';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import BottomNavigation from '@/components/common/BottomNavigation';
import { AuthProvider } from '@/hooks/useAuth';
import { DialogProvider } from '@/components/DialogProvider';
import { Toaster } from 'sonner';

const ClientLayout = ({ children }) => {
  const pathname = usePathname();
  const isLoginPage = ['/login', '/signup', '/signup/additional-info', '/signup/kakao', '/signup/success', '/mypage/edit'].includes(pathname);
  const isVolunteerCreatePage = pathname === '/volunteer/create';

  return (
    <AuthProvider>
      <DialogProvider>
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
      </DialogProvider>
    </AuthProvider>
  );
};

export default ClientLayout;
