'use client';

import { useState, useEffect, createContext, useContext } from 'react';
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
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);

  // 사용자 인증 상태 확인
  useEffect(() => {
    // 초기 인증 상태 확인
    const getUser = async () => {
      try {
        // localStorage에서 캐시된 사용자 정보 확인
        const cachedUser = localStorage.getItem('supabase.auth.user');
        const cachedProfile = localStorage.getItem('supabase.auth.profile');

        if (cachedUser && cachedProfile) {
          try {
            const userData = JSON.parse(cachedUser);
            const profileData = JSON.parse(cachedProfile);

            // 캐시된 데이터가 유효한지 확인 (만료 시간 체크)
            const cacheTime = localStorage.getItem('supabase.auth.cacheTime');
            const now = Date.now();
            const CACHE_DURATION = 5 * 60 * 1000; // 5분

            if (cacheTime && (now - parseInt(cacheTime)) < CACHE_DURATION) {
              console.log('캐시된 사용자 정보 사용');
              setUser(userData);
              setProfile(profileData);
              setLoading(false);
              return;
            }
          } catch (parseError) {
            console.log('캐시된 데이터 파싱 오류, 서버에서 새로 가져옴:', parseError.message);
          }
        }

        // 캐시가 없거나 만료된 경우 서버에서 가져오기
        console.log('서버에서 사용자 정보 조회');
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUser(session.user);
          await fetchProfile(session.user.id);

          // 캐시에 저장
          localStorage.setItem('supabase.auth.user', JSON.stringify(session.user));
          localStorage.setItem('supabase.auth.cacheTime', Date.now().toString());
          setLoading(false);
          return;
        }

        // 세션에 사용자가 없으면 getUser로 재확인
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);

        if (user) {
          await fetchProfile(user.id);
          // 캐시에 저장
          localStorage.setItem('supabase.auth.user', JSON.stringify(user));
          localStorage.setItem('supabase.auth.cacheTime', Date.now().toString());
        }
      } catch (error) {
        console.error('사용자 정보 조회 오류:', error);
      } finally {
        setLoading(false);
      }
    };

    getUser();

    // 인증 상태 변경 리스너
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('onAuthStateChange 이벤트:', { event, session: !!session, user: !!session?.user });

        // 로그아웃 이벤트 처리
        if (event === 'SIGNED_OUT') {
          console.log('로그아웃 이벤트 감지 - 상태 초기화');
          setUser(null);
          setProfile(null);
          setLoading(false);

          // 캐시 정리
          localStorage.removeItem('supabase.auth.user');
          localStorage.removeItem('supabase.auth.profile');
          localStorage.removeItem('supabase.auth.cacheTime');
          localStorage.removeItem('supabase.auth.profileCacheTime');
          return;
        }

        // INITIAL_SESSION 이벤트에서도 사용자 정보 처리
        if (event === 'INITIAL_SESSION' && session?.user) {
          console.log('초기 세션에서 사용자 발견:', session.user.id);
          setUser(session.user);
          await fetchProfile(session.user.id);
          setLoading(false);
          return;
        }

        setUser(session?.user ?? null);

        if (session?.user) {
          console.log('사용자 세션 확인:', {
            userId: session.user.id,
            emailConfirmed: !!session.user.email_confirmed_at,
            hasMetadata: !!session.user.user_metadata,
            metadata: session.user.user_metadata
          });

          // 프로필 정보 가져오기
          await fetchProfile(session.user.id);

          // 이메일 인증 완료 후 프로필 생성 (SIGNED_IN 이벤트에서만)
          if (event === 'SIGNED_IN' && session.user.email_confirmed_at) {
            console.log('이메일 인증 완료된 사용자 - 프로필 생성 시도');
            try {
              await createProfileFromMetadata(session.user);
            } catch (error) {
              console.error('onAuthStateChange에서 프로필 생성 오류:', error);
            }
          }

          // 프로필 정보 조회
          try {
            await fetchProfile(session.user.id);
          } catch (error) {
            console.error('onAuthStateChange에서 프로필 조회 오류:', error);
          }
        } else {
          setProfile(null);
        }

        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // user_metadata에서 프로필 생성
  const createProfileFromMetadata = async (user) => {
    try {
      console.log('createProfileFromMetadata 시작:', { userId: user.id });
      const metadata = user.user_metadata;
      console.log('user_metadata:', metadata);

      // 이미 프로필이 생성되었는지 확인
      if (metadata.profile_created) {
        console.log('프로필이 이미 생성됨 - 건너뜀');
        return;
      }

      // 기존 프로필이 있는지 확인
      const { data: existingProfile, error: checkError } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('auth_user_id', user.id)
        .eq('is_deleted', false)
        .maybeSingle();

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('기존 프로필 확인 오류:', checkError);
        return;
      }

      if (existingProfile) {
        console.log('기존 프로필이 이미 존재함 - 건너뜀');
        return;
      }

      console.log('프로필 생성 시도:', {
        nickname: metadata.nickname,
        introduction: metadata.introduction,
        phone: metadata.phone,
        contactChannels: metadata.contactChannels
      });

      // user_profiles 테이블에 프로필 정보 저장
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert([
          {
            auth_user_id: user.id,
            email: user.email, // 이메일 동기화
            display_name: metadata.nickname,
            bio: metadata.introduction || null,
            phone: metadata.phone || null,
            instagram: metadata.contactChannels?.instagram ? metadata.channelInputs?.instagram : null,
            naver_cafe: metadata.contactChannels?.naverCafe ? metadata.channelInputs?.naverCafe : null,
            kakao_openchat: metadata.contactChannels?.kakaoOpenChat ? metadata.channelInputs?.kakaoOpenChat : null,
            security_question: metadata.securityQuestion || null,
            security_answer: metadata.securityAnswer || null,
            provider: metadata.provider || 'email', // 가입 방식 저장
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ]);

      if (profileError) {
        console.error('프로필 생성 오류:', profileError);
        return;
      }

      console.log('프로필 생성 성공');

      // user_metadata에 프로필 생성 완료 플래그 업데이트
      const { error: updateError } = await supabase.auth.updateUser({
        data: { profile_created: true }
      });

      if (updateError) {
        console.error('메타데이터 업데이트 오류:', updateError);
      } else {
        console.log('메타데이터 업데이트 성공');
      }

    } catch (error) {
      console.error('프로필 생성 중 오류:', error);
    }
  };

  // 사용자 프로필 조회
  const fetchProfile = async (userId) => {
    try {
      console.log('프로필 조회 시작:', { userId });

      // 캐시된 프로필 확인
      const cachedProfile = localStorage.getItem('supabase.auth.profile');
      const cacheTime = localStorage.getItem('supabase.auth.profileCacheTime');
      const now = Date.now();
      const CACHE_DURATION = 5 * 60 * 1000; // 5분

      if (cachedProfile && cacheTime && (now - parseInt(cacheTime)) < CACHE_DURATION) {
        try {
          const profileData = JSON.parse(cachedProfile);
          console.log('캐시된 프로필 사용');
          setProfile(profileData);
          return;
        } catch (parseError) {
          console.log('캐시된 프로필 파싱 오류, 서버에서 새로 가져옴:', parseError.message);
        }
      }

      // 서버에서 프로필 조회
      console.log('서버에서 프로필 조회');
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('auth_user_id', userId)
        .eq('is_deleted', false)
        .maybeSingle();

      if (error) {
        if (error.code === 'PGRST116') {
          // 결과가 없음 (프로필이 아직 생성되지 않음)
          console.log('프로필이 아직 생성되지 않음');
          setProfile(null);
        } else {
          console.error('프로필 조회 오류:', error);
          setProfile(null);
        }
      } else {
        console.log('프로필 조회 성공:', data);
        setProfile(data);

        // 프로필 캐시에 저장
        localStorage.setItem('supabase.auth.profile', JSON.stringify(data));
        localStorage.setItem('supabase.auth.profileCacheTime', Date.now().toString());
      }
    } catch (error) {
      console.error('프로필 조회 중 오류:', error);
      setProfile(null);
    }
  };

  // 회원가입
  const signUp = async ({ email, password, nickname, introduction, phone, contactChannels, channelInputs, securityQuestion, securityAnswer}) => {
    try {
      setLoading(true);

      console.log('서버 회원가입 요청 시작...');
      const result = await authAPI.signup({
        email,
        password,
        nickname,
        introduction,
        phone,
        contactChannels,
        channelInputs,
        securityQuestion,
        securityAnswer,
      });

      console.log('서버 회원가입 응답:', result);

      if (result.success) {
        return {
          success: true,
          message: '회원가입이 완료되었습니다. 이메일을 확인하여 계정을 활성화해주세요.',
          user: result.user
        };
      } else {
        return {
          success: false,
          error: result.error || '회원가입에 실패했습니다.'
        };
      }

    } catch (error) {
      console.error('회원가입 중 오류:', error);
      const errorInfo = handleAPIError(error);
      return {
        success: false,
        error: errorInfo.message
      };
    } finally {
      setLoading(false);
    }
  };

  // 로그인
  const signIn = async ({ email, password }) => {
    try {
      console.log('=== 로그인 시작 ===');
      console.log('useAuth signIn 시작:', { email, password: '***' });
      console.log('현재 Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
      console.log('현재 Supabase Anon Key 존재:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
      setLoading(true);

      // Supabase 클라이언트에서 직접 로그인 (세션 유지를 위해)
      console.log('Supabase 직접 로그인 시도...');
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      console.log('Supabase 로그인 응답:', { data: !!data, error: !!error });

      if (error) {
        console.log('Supabase 로그인 에러:', error);

        let errorMessage = '로그인에 실패했습니다.';
        if (error.message.includes('Invalid login credentials')) {
          errorMessage = '이메일 또는 비밀번호가 올바르지 않습니다.';
        } else if (error.message.includes('Email not confirmed')) {
          errorMessage = '이메일 인증이 필요합니다. 가입하신 이메일을 확인해주세요.';
        } else if (error.message.includes('Too many requests')) {
          errorMessage = '너무 많은 로그인 시도가 있었습니다. 잠시 후 다시 시도해주세요.';
        }

        return {
          success: false,
          error: errorMessage
        };
      }

      console.log('Supabase 로그인 성공:', data.user.id);
      console.log('사용자 정보:', { id: data.user.id, email: data.user.email });

      // 사용자 정보 설정
      console.log('setUser 호출 전');
      setUser(data.user);
      console.log('setUser 호출 완료');

      // 프로필 정보 조회
      console.log('프로필 조회 시작');
      await fetchProfile(data.user.id);
      console.log('프로필 조회 완료');

      console.log('=== 로그인 성공 ===');
      return {
        success: true,
        message: '로그인이 완료되었습니다.',
        user: data.user
      };

    } catch (error) {
      console.error('로그인 중 오류:', error);
      return {
        success: false,
        error: '로그인 중 오류가 발생했습니다.'
      };
    } finally {
      setLoading(false);
    }
  };

  // 로그아웃
  const signOut = async () => {
    try {
      console.log('=== 로그아웃 시작 ===');
      console.log('현재 사용자 상태:', { user: !!user, profile: !!profile });

      // 1. 즉시 로컬 상태 초기화 (사용자 경험 개선)
      console.log('로컬 상태 초기화 중...');
      setUser(null);
      setProfile(null);
      setLoading(false);

      // 캐시 정리
      localStorage.removeItem('supabase.auth.user');
      localStorage.removeItem('supabase.auth.profile');
      localStorage.removeItem('supabase.auth.cacheTime');
      localStorage.removeItem('supabase.auth.profileCacheTime');
      console.log('로컬 상태 및 캐시 초기화 완료');

      // 2. 클라이언트 사이드에서 Supabase 세션 정리 (백그라운드에서 실행)
      console.log('클라이언트 사이드 로그아웃 (백그라운드)...');
      // Promise를 기다리지 않고 백그라운드에서 실행
      supabase.auth.signOut().catch(error => {
        console.error('클라이언트 로그아웃 오류 (무시됨):', error);
      });

      console.log('=== 로그아웃 완료 (로컬 정리 완료) ===');
      return { success: true };
    } catch (error) {
      console.error('=== 로그아웃 중 전체 오류 ===');
      console.error('오류 상세:', error);
      // 오류가 발생해도 로컬 상태는 초기화
      setUser(null);
      setProfile(null);
      setLoading(false);
      return { success: false, error: '로그아웃 중 오류가 발생했습니다.' };
    }
  };

  // 이메일 인증 재발송
  const resendVerification = async (email) => {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email
      });

      if (error) throw error;

      return {
        success: true,
        message: '이메일 인증 메일을 재발송했습니다.'
      };

    } catch (error) {
      console.error('인증 메일 재발송 오류:', error);
      return {
        success: false,
        error: '인증 메일 재발송에 실패했습니다.'
      };
    }
  };

  // 닉네임 중복 체크 (API 엔드포인트 호출)
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

  // 프로필 업데이트 (캐시 갱신 포함)
  const updateProfile = async (updatedProfileData) => {
    try {
      console.log('프로필 업데이트 시작:', updatedProfileData);

      // 로컬 상태 업데이트
      setProfile(updatedProfileData);

      // localStorage 캐시 업데이트
      localStorage.setItem('supabase.auth.profile', JSON.stringify(updatedProfileData));
      localStorage.setItem('supabase.auth.profileCacheTime', Date.now().toString());

      console.log('프로필 캐시 업데이트 완료');
      return { success: true };
    } catch (error) {
      console.error('프로필 업데이트 중 오류:', error);
      return { success: false, error: error.message };
    }
  };

  // 이메일 인증 상태 확인
  const isEmailVerified = user?.email_confirmed_at !== null;

  // Supabase 연결 테스트
  const testSupabaseConnection = async () => {
    try {
      console.log('Supabase 연결 테스트 시작...');
      const { data, error } = await supabase.auth.getSession();
      console.log('Supabase 연결 테스트 결과:', { data, error });
      return { success: !error, error };
    } catch (error) {
      console.error('Supabase 연결 테스트 실패:', error);
      return { success: false, error };
    }
  };

  // 수동 프로필 생성 함수 (디버깅용)
  const createProfileManually = async () => {
    try {
      console.log('수동 프로필 생성 시작');
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        console.log('사용자 정보가 없음 - 프로필 생성 건너뜀');
        return { success: false, error: '사용자 정보가 없습니다.' };
      }

      if (!user.email_confirmed_at) {
        console.log('이메일 인증이 완료되지 않음 - 프로필 생성 건너뜀');
        return { success: false, error: '이메일 인증이 완료되지 않았습니다.' };
      }

      console.log('수동 프로필 생성 시도:', {
        userId: user.id,
        emailConfirmed: !!user.email_confirmed_at,
        hasMetadata: !!user.user_metadata,
        metadata: user.user_metadata
      });

      await createProfileFromMetadata(user);
      await fetchProfile(user.id);

      console.log('수동 프로필 생성 완료');
      return { success: true };
    } catch (error) {
      console.error('수동 프로필 생성 오류:', error);
      return { success: false, error: error.message };
    }
  };


  // 카카오톡 로그인 함수
  const signInWithKakao = async ({ userInfo }) => {
    try {
      setLoading(true);

      console.log('카카오톡 로그인 요청 시작...');
      const result = await authAPI.kakaoLogin({ userInfo });
      console.log('카카오톡 로그인 응답:', result);

      if (result.success) {
        // 클라이언트에서 세션 생성이 필요한 경우
        if (result.needsClientAuth) {
          // Supabase Auth 세션 새로고침
          const { data: { session }, error: sessionError } = await supabase.auth.getSession();

          if (sessionError) {
            console.error('세션 새로고침 오류:', sessionError);
            return {
              success: false,
              error: '세션 생성에 실패했습니다.'
            };
          }

          if (session?.user) {
            setUser(session.user);
            await fetchProfile(session.user.id);

            return {
              success: true,
              message: '카카오톡 로그인이 완료되었습니다.',
              user: session.user,
              isExistingUser: true
            };
          }
        } else {
          // 직접 사용자 정보 설정
          setUser(result.user);
          if (result.profile) {
            setProfile(result.profile);
          }

          return {
            success: true,
            message: '카카오톡 로그인이 완료되었습니다.',
            user: result.user,
            isExistingUser: true
          };
        }
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
      return {
        success: false,
        error: '카카오톡 로그인 처리 중 오류가 발생했습니다.'
      };
    } finally {
      setLoading(false);
    }
  };

  // 카카오톡 회원가입 함수
  const signUpWithKakao = async ({ userInfo, display_name, phone, phone_visible, bio, instagram, naver_cafe, kakao_openchat }) => {
    try {
      setLoading(true);

      console.log('카카오톡 회원가입 요청 시작...');
      const result = await authAPI.kakaoSignup({
        userInfo,
        display_name,
        phone,
        phone_visible,
        bio,
        instagram,
        naver_cafe,
        kakao_openchat
      });
      console.log('카카오톡 회원가입 응답:', result);

      if (result.success) {
        // 회원가입 성공 시 자동 로그인
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUser(user);
          await fetchProfile(user.id);
        }

        return {
          success: true,
          message: '카카오톡 회원가입이 완료되었습니다.',
          user: result.user
        };
      } else {
        return {
          success: false,
          error: result.error || '카카오톡 회원가입에 실패했습니다.'
        };
      }

    } catch (error) {
      console.error('카카오톡 회원가입 중 오류:', error);
      return {
        success: false,
        error: '카카오톡 회원가입 처리 중 오류가 발생했습니다.'
      };
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    profile,
    loading,
    isEmailVerified,
    signUp,
    signIn,
    signOut,
    resendVerification,
    checkNicknameDuplicate,
    updateProfile,
    testSupabaseConnection,
    createProfileManually,
    signUpWithKakao,
    signInWithKakao
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
