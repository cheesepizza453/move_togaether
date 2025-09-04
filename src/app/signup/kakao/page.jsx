'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';


const KakaoSignupPage = () => {
  const [loading, setLoading] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [formData, setFormData] = useState({
    display_name: '',
    phone: '',
    phone_visible: false,
    bio: '',
    instagram: '',
    naver_cafe: '',
    kakao_openchat: ''
  });
  const [errors, setErrors] = useState({});
  const router = useRouter();
  const { user, loading: authLoading, signUpWithKakao, signInWithKakao } = useAuth();

  // 로그인 상태 확인 및 리다이렉트
  useEffect(() => {
    const checkAuthAndRedirect = async () => {
      // useAuth 훅의 로딩이 완료되었고 사용자가 있는 경우
      if (!authLoading && user) {
        console.log('로그인된 사용자 감지, 메인 페이지로 리다이렉트:', user.id);
        router.replace('/');
        return;
      }

      // useAuth 훅이 로딩 중이 아닌데도 사용자 정보가 없는 경우
      // Supabase 세션을 직접 확인하여 추가 검증
      if (!authLoading && !user) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            console.log('세션에서 사용자 발견, 메인 페이지로 리다이렉트:', session.user.id);
            router.replace('/');
          }
        } catch (error) {
          console.error('세션 확인 오류:', error);
        }
      }
    };

    checkAuthAndRedirect();
  }, [user, authLoading, router]);

  useEffect(() => {
    // sessionStorage에서 카카오톡 사용자 정보 가져오기
    const kakaoUserInfo = sessionStorage.getItem('kakaoUserInfo');

    if (kakaoUserInfo) {
      try {
        const userInfo = JSON.parse(kakaoUserInfo);
        setUserInfo(userInfo);
        setFormData(prev => ({
          ...prev,
          display_name: userInfo.nickname || userInfo.name || ''
        }));
        toast.success('카카오톡 인증이 완료되었습니다.');
      } catch (error) {
        console.error('사용자 정보 파싱 오류:', error);
        toast.error('사용자 정보를 불러올 수 없습니다.');
        router.push('/login');
      }
    } else {
      toast.error('카카오톡 인증 정보가 없습니다.');
      router.push('/login');
    }
  }, [router]);



  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.display_name.trim()) {
      newErrors.display_name = '표시명을 입력해주세요.';
    } else if (formData.display_name.length < 2) {
      newErrors.display_name = '표시명은 2자 이상 입력해주세요.';
    }

    if (formData.phone && !/^010-\d{4}-\d{4}$/.test(formData.phone)) {
      newErrors.phone = '올바른 전화번호 형식을 입력해주세요. (010-0000-0000)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      const result = await signUpWithKakao({
        userInfo,
        ...formData
      });

      if (result.success) {
        // sessionStorage 정리
        sessionStorage.removeItem('kakaoUserInfo');
        toast.success('회원가입이 완료되었습니다!');
        router.push('/mypage');
      } else {
        // 기존 사용자인 경우 로그인 처리
        if (result.needsLogin && result.isExistingUser) {
          toast.info('이미 가입된 계정입니다. 로그인을 진행합니다.');

          // 카카오톡 로그인 시도
          const loginResult = await signInWithKakao({ userInfo });

          if (loginResult.success) {
            sessionStorage.removeItem('kakaoUserInfo');
            toast.success('카카오톡 로그인이 완료되었습니다!');
            router.push('/mypage');
            return;
          } else {
            toast.error(loginResult.error || '로그인에 실패했습니다.');
            return;
          }
        }

        // 개선된 에러 메시지 표시 (가입 방식 구분 안내)
        const errorMessage = result.error || '회원가입에 실패했습니다.';
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error('카카오톡 회원가입 오류:', error);
      toast.error('회원가입 처리 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 인증 상태 로딩 중일 때 로딩 화면 표시
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-yellow-500 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">로그인 상태 확인 중...</h2>
          <p className="text-gray-500">잠시만 기다려주세요.</p>
        </div>
      </div>
    );
  }

  // 이미 로그인된 사용자는 리다이렉트 처리 (useEffect에서 처리되지만 추가 안전장치)
  if (user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-yellow-500 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">메인 페이지로 이동 중...</h2>
          <p className="text-gray-500">이미 로그인되어 있습니다.</p>
        </div>
      </div>
    );
  }

  if (loading && !userInfo) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-yellow-500 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">카카오톡 인증 중...</h2>
          <p className="text-gray-500">잠시만 기다려주세요.</p>
        </div>
      </div>
    );
  }

  if (!userInfo) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-700 mb-2">인증 정보를 불러올 수 없습니다</h2>
          <p className="text-gray-500 mb-4">다시 시도해주세요.</p>
          <button
            onClick={() => router.push('/login')}
            className="bg-yellow-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-yellow-600 transition-colors"
          >
            로그인 페이지로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">카카오톡 간편 가입</h1>
          <p className="text-gray-600">추가 정보를 입력해주세요</p>
        </div>

        {/* 카카오톡 사용자 정보 */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-3">
            <img
              src={userInfo.profile_image || '/img/default_profile.jpg'}
              alt="프로필"
              className="w-12 h-12 rounded-full"
            />
            <div>
              <p className="font-semibold text-gray-800">{userInfo.nickname || userInfo.name}</p>
              <p className="text-sm text-gray-600">{userInfo.email}</p>
            </div>
          </div>
        </div>

        {/* 폼 */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 표시명 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              표시명 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.display_name}
              onChange={(e) => handleInputChange('display_name', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent ${
                errors.display_name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="표시명을 입력해주세요"
              maxLength={20}
            />
            {errors.display_name && (
              <p className="mt-1 text-sm text-red-500">{errors.display_name}</p>
            )}
          </div>

          {/* 전화번호 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              전화번호
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent ${
                errors.phone ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="010-0000-0000"
              maxLength={13}
            />
            {errors.phone && (
              <p className="mt-1 text-sm text-red-500">{errors.phone}</p>
            )}
          </div>

          {/* 전화번호 공개 여부 */}
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">
              전화번호 공개
            </label>
            <button
              type="button"
              onClick={() => handleInputChange('phone_visible', !formData.phone_visible)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                formData.phone_visible ? 'bg-yellow-500' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  formData.phone_visible ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* 자기소개 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              자기소개
            </label>
            <textarea
              value={formData.bio}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              placeholder="간단한 자기소개를 입력해주세요"
              rows={3}
              maxLength={200}
            />
          </div>

          {/* SNS 링크 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">연락 채널</h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                인스타그램
              </label>
              <input
                type="text"
                value={formData.instagram}
                onChange={(e) => handleInputChange('instagram', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                placeholder="@username"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                네이버 카페
              </label>
              <input
                type="url"
                value={formData.naver_cafe}
                onChange={(e) => handleInputChange('naver_cafe', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                placeholder="https://cafe.naver.com/..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                카카오톡 오픈채팅
              </label>
              <input
                type="url"
                value={formData.kakao_openchat}
                onChange={(e) => handleInputChange('kakao_openchat', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                placeholder="https://open.kakao.com/..."
              />
              <p className="mt-1 text-xs text-gray-500">
                채팅방 우상단 ⋮ → 공유 → 링크 복사
              </p>
            </div>
          </div>

          {/* 제출 버튼 */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-yellow-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-yellow-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '가입 중...' : '가입 완료'}
          </button>
        </form>

        {/* 취소 버튼 */}
        <div className="mt-6 text-center">
          <button
            onClick={() => router.push('/login')}
            className="text-gray-500 hover:text-gray-700 text-sm"
          >
            취소
          </button>
        </div>
      </div>
    </div>
  );
};

export default KakaoSignupPage;
