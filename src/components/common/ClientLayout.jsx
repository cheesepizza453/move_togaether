'use client';

import { usePathname } from 'next/navigation';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import BottomNavigation from '@/components/common/BottomNavigation';
import { AuthProvider } from '@/contexts/AuthContext';

const ClientLayout = ({ children }) => {
  const pathname = usePathname();
  const isLoginPage = ['/login', '/signup', '/signup/additional-info'].includes(pathname);

  return (
    <AuthProvider>
      {!isLoginPage && <Header />}
      <main>{children}</main>
      {!isLoginPage && <Footer />}
      {!isLoginPage && <BottomNavigation />}
    </AuthProvider>
  );
};

export default ClientLayout;
