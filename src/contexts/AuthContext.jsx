'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = () => {
    // TODO: 실제 인증 상태 확인 로직 구현
    const token = localStorage.getItem('authToken');

    if (token) {
      // TODO: 토큰 유효성 검증 및 사용자 정보 가져오기
      setUser({
        id: '1',
        name: '사용자',
        email: 'user@example.com'
      });
    }

    setLoading(false);
  };

  const login = async (email, password) => {
    try {
      // TODO: 실제 로그인 API 호출
      console.log('로그인 시도:', { email, password });

      // 테스트용: 간단한 이메일/비밀번호 검증
      if (email && password && password.length >= 8) {
        // 임시 로그인 성공 처리
        const mockUser = {
          id: '1',
          name: '사용자',
          email: email
        };

        localStorage.setItem('authToken', 'mock-token');
        setUser(mockUser);

        return { success: true };
      } else {
        return { success: false, error: '이메일과 비밀번호를 올바르게 입력해주세요.' };
      }
    } catch (error) {
      console.error('로그인 실패:', error);
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setUser(null);
    router.push('/');
  };

  const requireAuth = (callback) => {
    if (!user) {
      router.push('/login');
      return false;
    }
    return callback ? callback() : true;
  };

  const value = {
    user,
    loading,
    login,
    logout,
    requireAuth,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
