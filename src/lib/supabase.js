import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// 싱글톤 패턴으로 클라이언트 인스턴스 관리
let supabaseInstance = null;

const createSupabaseClient = () => {
  if (!supabaseInstance) {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        // 자동으로 세션 새로고침
        autoRefreshToken: true,
        // 세션 지속성 설정
        persistSession: true,
        // 로컬 스토리지 사용으로 로그인 상태 유지
        storage: typeof window !== 'undefined' ? window.localStorage : undefined
      }
    });
  }
  return supabaseInstance;
};

// 클라이언트 사이드용 Supabase 인스턴스 (인증 전용)
export const supabase = createSupabaseClient();

// 서버 사이드용 Supabase 인스턴스 (사용자 토큰 기반)
export const createServerSupabaseClient = (accessToken) => {
  if (accessToken) {
    // 인증된 사용자용 (anon key + 사용자 토큰)
    return createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }
    })
  } else {
    // 서버사이드 익명 사용자용 (anon key 사용)
    return createClient(supabaseUrl, supabaseAnonKey)
  }
}

// 관리자 기능용 Supabase 인스턴스 (서비스 롤 키 사용)
export const createAdminSupabaseClient = () => {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceRoleKey) {
    console.warn('SUPABASE_SERVICE_ROLE_KEY not found, using anon key instead')
    return createClient(supabaseUrl, supabaseAnonKey)
  }
  return createClient(supabaseUrl, serviceRoleKey)
}

// 인증 상태 확인 함수 (클라이언트용)
export const getCurrentUser = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) throw error
    return user
  } catch (error) {
    console.error('Error getting current user:', error)
    return null
  }
}

// 세션 변경 감지
export const onAuthStateChange = (callback) => {
  return supabase.auth.onAuthStateChange(callback)
}

// 로그인
export const signIn = async (email, password) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    if (error) throw error
    return data
  } catch (error) {
    console.error('Error signing in:', error)
    throw error
  }
}

// 카카오 로그인
export const signInWithKakao = async () => {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'kakao',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    })
    if (error) throw error
    return data
  } catch (error) {
    console.error('Error signing in with Kakao:', error)
    throw error
  }
}

// 회원가입
export const signUp = async (email, password) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password
    })
    if (error) throw error
    return data
  } catch (error) {
    console.error('Error signing up:', error)
    throw error
  }
}

// 로그아웃
export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    return true
  } catch (error) {
    console.error('Error signing out:', error)
    return false
  }
}

// 비밀번호 재설정
export const resetPassword = async (email) => {
  try {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`
    })
    if (error) throw error
    return data
  } catch (error) {
    console.error('Error resetting password:', error)
    throw error
  }
}

// 현재 세션 가져오기
export const getSession = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession()
    if (error) throw error
    return session
  } catch (error) {
    console.error('Error getting session:', error)
    return null
  }
}

// 사용자 프로필 조회 함수
export const getUserProfile = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('auth_user_id', userId)
      .eq('is_deleted', false)
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error getting user profile:', error)
    return null
  }
}
