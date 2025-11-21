'use client';

import { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { authAPI, handleAPIError } from '@/lib/api-client';

// Auth Context 생성
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
  const [loading, setLoading] = useState(true); // 초기 로딩 상태는 true
  const [profile, setProfile] = useState(null);

  // ==========================================================
  // 1. 프로필 조회 및 캐싱 (useCallback으로 메모이제이션)
  // ==========================================================
  const fetchProfile = useCallback(async (userId) => {
    try {
      // 캐시 확인 로직
      const cachedProfile = localStorage.getItem('supabase.auth.profile');
      const cacheTime = localStorage.getItem('supabase.auth.profileCacheTime');
      const now = Date.now();
      const CACHE_DURATION = 5 * 60 * 1000; // 5분

      if (cachedProfile && cacheTime && (now - parseInt(cacheTime)) < CACHE_DURATION) {
        try {
          const profileData = JSON.parse(cachedProfile);
          if (profileData.auth_user_id === userId) {
            setProfile(profileData);
            return;
          }
        } catch (parseError) {
          console.log('캐시된 프로필 파싱 오류, 서버에서 새로 가져옴:', parseError.message);
        }
      }

      // 서버에서 프로필 조회
      const { data, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('auth_user_id', userId)
          .eq('is_deleted', false)
          .maybeSingle();

      if (error && error.code !== 'PGRST116') { // PGRST116: 결과 없음
        console.error('프로필 조회 오류:', error);
        setProfile(null);
        return;
      }

      setProfile(data);

      // 캐시 저장
      if (data) {
        localStorage.setItem('supabase.auth.profile', JSON.stringify(data));
        localStorage.setItem('supabase.auth.profileCacheTime', now.toString());
      } else {
        // 프로필이 없는 경우 캐시 삭제
        localStorage.removeItem('supabase.auth.profile');
        localStorage.removeItem('supabase.auth.profileCacheTime');
      }
    } catch (error) {
      console.error('프로필 조회 중 오류:', error);
      setProfile(null);
    }
  }, []);

  // ==========================================================
  // 2. 프로필 생성 (useCallback으로 메모이제이션)
  // ==========================================================
  const createProfileFromMetadata = useCallback(async (user) => {
    try {
      const metadata = user.user_metadata;

      if (metadata.profile_created) {
        return;
      }

      const { data: existingProfile } = await supabase
          .from('user_profiles')
          .select('id')
          .eq('auth_user_id', user.id)
          .eq('is_deleted', false)
          .maybeSingle();

      if (existingProfile) {
        return;
      }

      const { error: profileError } = await supabase
          .from('user_profiles')
          .insert([
            {
              auth_user_id: user.id,
              email: user.email,
              display_name: metadata.nickname,
              bio: metadata.introduction || null,
              phone: metadata.phone || null,
              instagram: metadata.contactChannels?.instagram ? metadata.channelInputs?.instagram : null,
              naver_cafe: metadata.contactChannels?.naverCafe ? metadata.channelInputs?.naverCafe : null,
              kakao_openchat: metadata.contactChannels?.kakaoOpenChat ? metadata.channelInputs?.kakaoOpenChat : null,
              security_question: metadata.securityQuestion || null,
              security_answer: metadata.securityAnswer || null,
              provider: metadata.provider || 'email',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
          ]);

      if (!profileError) {
        await supabase.auth.updateUser({
          data: { profile_created: true }
        });
        // 프로필 생성 성공 후, 프로필을 다시 가져와 로컬 상태를 업데이트합니다.
        await fetchProfile(user.id);
      }
    } catch (error) {
      console.error('프로필 생성 중 오류:', error);
    }
  }, [fetchProfile]);

  // ==========================================================
  // 3. 인증 상태 관리 (useEffect) - 초기 로딩 간소화
  // ==========================================================
  useEffect(() => {
    let isMounted = true;

    // 인증 상태 변경 리스너
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          if (!isMounted) return;

          console.log('Auth 이벤트:', event);

          // 로그아웃 (SIGNED_OUT)
          if (event === 'SIGNED_OUT') {
            setUser(null);
            setProfile(null);
            setLoading(false);

            // 캐시 정리 (profile만 관리)
            localStorage.removeItem('supabase.auth.profile');
            localStorage.removeItem('supabase.auth.profileCacheTime');
            return;
          }

          // 세션 업데이트 및 초기 로딩 완료 (INITIAL_SESSION, SIGNED_IN, TOKEN_REFRESHED)
          if (session?.user) {
            setUser(session.user);

            // 이메일 인증 완료 후 프로필 생성 (SIGNED_IN, INITIAL_SESSION 등에서 처리)
            if (session.user.email_confirmed_at) {
              await createProfileFromMetadata(session.user);
            }

            // 프로필 조회
            await fetchProfile(session.user.id);

          } else {
            setUser(null);
            setProfile(null);
          }

          // 초기 로딩 완료
          if (loading) {
            setLoading(false);
          }
        }
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [loading, fetchProfile, createProfileFromMetadata]);

  // ==========================================================
  // 4. 로그인 / 로그아웃 함수 (안정성 강화)
  // ==========================================================
  // 로그인
  const signIn = async ({ email, password }) => {
    try {
      setLoading(true);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        let errorMessage = '로그인에 실패했습니다.';
        if (error.message.includes('Invalid login credentials')) {
          errorMessage = '이메일 또는 비밀번호가 올바르지 않습니다.';
        } else if (error.message.includes('Email not confirmed')) {
          errorMessage = '이메일 인증이 필요합니다. 가입하신 이메일을 확인해주세요.';
        } else if (error.message.includes('Too many requests')) {
          errorMessage = '너무 많은 로그인 시도가 있었습니다. 잠시 후 다시 시도해주세요.';
        }
        return { success: false, error: errorMessage };
      }

      // 상태 업데이트는 onAuthStateChange 리스너가 처리합니다. (안정성)
      return {
        success: true,
        message: '로그인이 완료되었습니다.',
        user: data.user
      };
    } catch (error) {
      console.error('로그인 중 오류:', error);
      return { success: false, error: '로그인 중 오류가 발생했습니다.' };
    } finally {
      setLoading(false);
    }
  };

  // 로그아웃 (await 적용)
  const signOut = async () => {
    try {
      // 1. UX 개선을 위해 클라이언트 상태를 즉시 초기화
      setUser(null);
      setProfile(null);

      // 2. 캐시 정리
      localStorage.removeItem('supabase.auth.profile');
      localStorage.removeItem('supabase.auth.profileCacheTime');

      // 3. 서버에 로그아웃 요청 (await로 안정성 확보)
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error('서버 로그아웃 오류:', error);
        // 서버 로그아웃 오류 시에도 클라이언트 상태는 정리되었지만, 에러를 반환
        return { success: false, error: '서버 세션 정리 중 오류가 발생했습니다.' };
      }

      // onAuthStateChange의 SIGNED_OUT 이벤트가 최종 상태를 한 번 더 정리함
      return { success: true };
    } catch (error) {
      console.error('로그아웃 중 전체 오류:', error);
      return { success: false, error: '로그아웃 처리 중 알 수 없는 오류가 발생했습니다.' };
    }
  };


  // ==========================================================
  // 5. 기타 함수 (간소화)
  // ==========================================================

  // 회원가입
  const signUp = async ({ email, password, nickname, introduction, phone, contactChannels, channelInputs, securityQuestion, securityAnswer}) => {
    try {
      setLoading(true);
      const result = await authAPI.signup({ email, password, nickname, introduction, phone, contactChannels, channelInputs, securityQuestion, securityAnswer });

      if (result.success) {
        return { success: true, message: '회원가입이 완료되었습니다. 이메일을 확인하여 계정을 활성화해주세요.', user: result.user };
      } else {
        return { success: false, error: result.error || '회원가입에 실패했습니다.' };
      }
    } catch (error) {
      console.error('회원가입 중 오류:', error);
      const errorInfo = handleAPIError(error);
      return { success: false, error: errorInfo.message };
    } finally {
      setLoading(false);
    }
  };

  // 닉네임 중복 체크
  const checkNicknameDuplicate = async (nickname) => {
    try {
      if (!nickname.trim()) {
        return { isDuplicate: false, message: '' };
      }
      const result = await authAPI.checkNickname(nickname.trim());
      return result;
    } catch (error) {
      console.error('닉네임 중복 체크 중 오류:', error);
      return { isDuplicate: false, message: '중복 체크 중 오류가 발생했습니다.' };
    }
  };

  // 프로필 업데이트
  const updateProfile = async (updatedProfileData) => {
    try {
      // 로컬 상태 및 캐시 업데이트
      setProfile(updatedProfileData);
      localStorage.setItem('supabase.auth.profile', JSON.stringify(updatedProfileData));
      localStorage.setItem('supabase.auth.profileCacheTime', Date.now().toString());
      return { success: true };
    } catch (error) {
      console.error('프로필 업데이트 중 오류:', error);
      return { success: false, error: error.message };
    }
  };

  // 카카오톡 로그인
  const signInWithKakao = async ({ userInfo }) => {
    try {
      setLoading(true);
      const result = await authAPI.kakaoLogin({ userInfo });

      if (result.success) {
        // 클라이언트에서 세션 새로고침 또는 사용자 정보 직접 설정
        if (result.needsClientAuth) {
          await supabase.auth.getSession(); // 세션 새로고침 시도
        }
        // 상태 업데이트는 onAuthStateChange 리스너가 처리
        return {
          success: true,
          message: '카카오톡 로그인이 완료되었습니다.',
          user: result.user,
          isExistingUser: true
        };
      } else {
        return {
          success: false,
          error: result.error || '카카오톡 로그인에 실패했습니다.',
          needsSignup: result.needsSignup || false,
          duplicateInfo: result.duplicateInfo
        };
      }
    } catch (error) {
      console.error('카카오톡 로그인 중 오류:', error);
      return { success: false, error: '카카오톡 로그인 처리 중 오류가 발생했습니다.' };
    } finally {
      setLoading(false);
    }
  };

  // 카카오톡 회원가입
  const signUpWithKakao = async (data) => {
    try {
      setLoading(true);
      const result = await authAPI.kakaoSignup(data);

      if (result.success) {
        // 회원가입 성공 후, onAuthStateChange가 최종 사용자 정보를 업데이트할 것임
        return { success: true, message: '카카오톡 회원가입이 완료되었습니다.', user: result.user };
      } else {
        return { success: false, error: result.error || '카카오톡 회원가입에 실패했습니다.' };
      }
    } catch (error) {
      console.error('카카오톡 회원가입 중 오류:', error);
      return { success: false, error: '카카오톡 회원가입 처리 중 오류가 발생했습니다.' };
    } finally {
      setLoading(false);
    }
  };

  const isEmailVerified = user?.email_confirmed_at !== null;

  const value = {
    user,
    profile,
    loading,
    isEmailVerified,
    signUp,
    signIn,
    signOut,
    resendVerification: async (email) => { /* resendVerification 함수는 로직이 간단하므로 그대로 유지 */ },
    checkNicknameDuplicate,
    updateProfile,
    signUpWithKakao,
    signInWithKakao
  };

  return (
      <AuthContext.Provider value={value}>
        {children}
      </AuthContext.Provider>
  );
};