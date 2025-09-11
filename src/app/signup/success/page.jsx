'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { ChevronLeft } from 'lucide-react';

const SignupSuccessPage = () => {
  const [nickname, setNickname] = useState('');
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { user, profile } = useAuth();

  // 회원가입 후 자동 로그인 처리 및 닉네임 조회
  useEffect(() => {
    const handleSignupSuccess = async () => {
      try {
        // 1. URL 파라미터에서 닉네임 확인 (우선순위)
        const urlParams = new URLSearchParams(window.location.search);
        const nicknameParam = urlParams.get('nickname');
        if (nicknameParam) {
          setNickname(decodeURIComponent(nicknameParam));
          console.log('URL에서 닉네임 조회 성공:', nicknameParam);
          setLoading(false);
          return;
        }

        // 2. 현재 세션 확인
        const { data: { session } } = await supabase.auth.getSession();

        if (session?.user) {
          console.log('회원가입 성공 후 세션 확인:', session.user.id);

          // 3. user_metadata에서 닉네임 조회
          const metadata = session.user.user_metadata;
          if (metadata?.nickname) {
            setNickname(metadata.nickname);
            console.log('user_metadata에서 닉네임 조회 성공:', metadata.nickname);
          } else {
            // 4. 프로필 테이블에서 닉네임 조회 (백업)
            const { data: profileData } = await supabase
              .from('user_profiles')
              .select('display_name')
              .eq('auth_user_id', session.user.id)
              .eq('is_deleted', false)
              .single();

            if (profileData?.display_name) {
              setNickname(profileData.display_name);
              console.log('프로필에서 닉네임 조회 성공:', profileData.display_name);
            }
          }
        }

        // 5. useAuth 훅에서 프로필 정보 확인
        if (profile?.display_name) {
          setNickname(profile.display_name);
          console.log('useAuth 프로필에서 닉네임 조회 성공:', profile.display_name);
        }
      } catch (error) {
        console.error('닉네임 조회 오류:', error);
      } finally {
        setLoading(false);
      }
    };

    handleSignupSuccess();
  }, [profile]);

  // 로딩 중일 때
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500 mx-auto mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* 상단 네비게이션 */}
      <div className="flex items-center justify-between px-4 py-3 bg-white">
        <button
          onClick={() => router.back()}
          className="text-gray-600 text-lg"
        >
          <span className="flex items-center">
            <ChevronLeft size={20} className="text-gray-600 display-inline-block" />
            <span className="ml-1">회원가입</span>
          </span>
        </button>
        <div className="w-6"></div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        {/* 닉네임 표시 */}
        <div className="text-center mb-8">
          <p className="text-gray-600">
            {nickname ? `${nickname}님` : '회원가입'}
          </p>
        </div>

        {/* 가운데 이미지 */}
        <div className="mb-12">
          <img
            src="/img/join_logo.png"
            alt="회원가입 완료"
            className="mx-auto"
          />
        </div>

        {/* 성공 메시지 */}
        <div className="text-center mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            회원가입이 <span className="text-orange-500">완료</span>되었습니다!
          </h2>
          <p className="text-gray-600 text-sm">
            확인 버튼을 누르시면 메인으로 이동합니다.
          </p>
        </div>
      </div>

      {/* 메인으로 이동 버튼 - 화면 하단 고정 */}
      <div className="px-4 pb-8">
        <div className="w-full max-w-sm mx-auto">
          <Link
            href="/"
            className="w-full bg-yellow-400 text-gray-800 py-4 px-6 rounded-lg font-semibold text-center block hover:bg-yellow-500 transition-colors"
          >
            메인으로 이동
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SignupSuccessPage;
