'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const router = useRouter();
  const { signIn, testSupabaseConnection } = useAuth();

  // URL 파라미터에서 메시지 확인
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const message = urlParams.get('message');
    if (message === 'signup_success') {
      setSuccessMessage('회원가입이 완료되었습니다. 로그인해주세요.');
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log('로그인 시도:', { email, password: '***' });
      const result = await signIn({ email, password });
      console.log('로그인 결과:', result);

      if (result.success) {
        console.log('로그인 성공, 마이페이지로 이동');
        toast.success('로그인되었습니다!');
        router.push('/mypage');
      } else {
        console.log('로그인 실패:', result.error);
        setError(result.error || '로그인에 실패했습니다.');
        toast.error(result.error || '로그인에 실패했습니다.');
      }
    } catch (error) {
      console.error('로그인 중 예외 발생:', error);
      setError('로그인 중 오류가 발생했습니다.');
      toast.error('로그인 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleKakaoLogin = () => {
    // TODO: 카카오톡 로그인 로직 구현
    console.log('카카오톡 로그인 시도');
  };

  const handleTestConnection = async () => {
    console.log('Supabase 연결 테스트 시작...');
    const result = await testSupabaseConnection();
    console.log('연결 테스트 결과:', result);
    if (result.success) {
      setSuccessMessage('Supabase 연결 성공!');
    } else {
      setError('Supabase 연결 실패: ' + (result.error?.message || '알 수 없는 오류'));
    }
  };

  const handleGoBack = () => {
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
      {/* 뒤로 가기 버튼 */}
      <div className="absolute top-6 left-6">
        <button
          onClick={handleGoBack}
          className="flex items-center justify-center w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
        >
          <ArrowLeft size={20} className="text-gray-600" />
        </button>
      </div>

      {/* 로고 및 브랜드명 */}
      <div className="text-center mb-8">
        <div className="mb-4">
          <img
            src="/img/login_logo.png"
            alt="무브투개더 로고"
            className="max-w-[70%] mx-auto"
          />
        </div>
      </div>

      {/* 성공 메시지 */}
      {successMessage && (
        <div className="w-full max-w-sm mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg">
          {successMessage}
        </div>
      )}

      {/* 에러 메시지 */}
      {error && (
        <div className="w-full max-w-sm mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* 로그인 폼 */}
      <form onSubmit={handleLogin} className="w-full max-w-sm space-y-4">
        {/* 이메일 입력 */}
        <div>
          <input
            type="email"
            placeholder="이메일"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
            required
            disabled={loading}
          />
        </div>

        {/* 비밀번호 입력 */}
        <div>
          <input
            type="password"
            placeholder="비밀번호(8~12자, 영문+숫자)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
            required
            minLength={8}
            maxLength={12}
            disabled={loading}
          />
        </div>

        {/* 로그인 버튼 */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full font-semibold py-3 rounded-lg transition-colors text-base ${
            loading
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-[#FFDD44] text-black'
          }`}
        >
          {loading ? '로그인 중...' : '로그인'}
        </button>
      </form>

      {/* 구분선 */}
      <div className="w-full max-w-sm my-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-400">or</span>
          </div>
        </div>
      </div>

      {/* 간편 로그인 */}
      <div className="w-full max-w-sm space-y-2">
        <p className="text-center text-gray-400 text-xs">간편 로그인</p>

        {/* 카카오톡 로그인 버튼 */}
        <button
          onClick={handleKakaoLogin}
          disabled={loading}
          className={`w-full font-[500] py-3 rounded-lg transition-colors relative ${
            loading
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-[#FFEB3B] text-black'
          }`}
        >
          {/* SVG 아이콘 - 왼쪽에 고정 */}
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
            <svg width="26" height="26" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
              <ellipse cx="13" cy="10" rx="13" ry="10" fill="#3E2723"/>
              <path d="M5.63214 22.992C5.3305 23.2321 4.89728 22.9485 4.99657 22.576L6.24028 17.9105C6.30456 17.6694 6.57149 17.5453 6.79724 17.6516L9.69891 19.0184C9.96709 19.1448 10.0095 19.5087 9.77752 19.6933L5.63214 22.992Z" fill="#3E2723"/>
            </svg>
          </div>

          {/* 텍스트 - 버튼 가운데에 위치 */}
          <span className="block text-center font-[400] text-base">카카오톡으로 로그인</span>
        </button>
      </div>

      {/* 하단 링크 */}
      <div className="w-full max-w-sm mt-4">
        <div className="flex items-center justify-center space-x-4 text-xs">
          <Link href="/forgot-password" className="text-gray-400 hover:text-gray-600">
            아이디/비밀번호 찾기
          </Link>
          <div className="w-px h-4 bg-gray-300"></div>
          <Link href="/signup" className="text-gray-400 hover:text-gray-600">
            이메일로 회원가입
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
