'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

const AuthCallbackPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log('OAuth 콜백 처리 시작');

        // URL에서 세션 정보 가져오기
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.error('세션 가져오기 오류:', error);
          setError('인증 처리 중 오류가 발생했습니다.');
          toast.error('로그인에 실패했습니다.');
          router.push('/login');
          return;
        }

        if (data.session?.user) {
          console.log('OAuth 로그인 성공:', data.session.user);

          // 사용자 프로필 확인 및 생성
          const { data: profile, error: profileError } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('auth_user_id', data.session.user.id)
            .single();

          if (profileError && profileError.code !== 'PGRST116') {
            console.error('프로필 조회 오류:', profileError);
            setError('사용자 정보를 가져올 수 없습니다.');
            toast.error('사용자 정보 조회에 실패했습니다.');
            router.push('/login');
            return;
          }

          if (!profile) {
            // 프로필이 없는 경우 (신규 사용자)
            console.log('신규 사용자, 프로필 생성 필요');

            // 카카오 사용자 정보 추출
            const userMetadata = data.session.user.user_metadata || {};
            const kakaoInfo = {
              id: userMetadata.kakao_id,
              nickname: userMetadata.kakao_nickname || userMetadata.display_name,
              profile_image: userMetadata.kakao_profile_image
            };

            // 추가 정보 입력 페이지로 이동 (카카오 정보와 함께)
            sessionStorage.setItem('kakaoUserInfo', JSON.stringify(kakaoInfo));
            router.push('/signup/kakao');
            return;
          }

          // 기존 사용자인 경우 메인 페이지로 이동
          console.log('기존 사용자 로그인 성공');
          toast.success('로그인이 완료되었습니다!');
          router.push('/mypage');

        } else {
          console.log('세션이 없음');
          setError('로그인에 실패했습니다.');
          toast.error('로그인에 실패했습니다.');
          router.push('/login');
        }

      } catch (error) {
        console.error('OAuth 콜백 처리 오류:', error);
        setError('인증 처리 중 오류가 발생했습니다.');
        toast.error('로그인 처리 중 오류가 발생했습니다.');
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    handleAuthCallback();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-yellow-500 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">로그인 처리 중...</h2>
          <p className="text-gray-500">잠시만 기다려주세요.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">로그인 실패</h2>
          <p className="text-gray-500 mb-4">{error}</p>
          <button
            onClick={() => router.push('/login')}
            className="bg-yellow-400 text-gray-800 px-6 py-2 rounded-lg hover:bg-yellow-500 transition-colors"
          >
            로그인 페이지로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default AuthCallbackPage;
