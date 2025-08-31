// API 호출을 위한 유틸리티 함수들
import { supabase } from './supabase'

// 기본 API 설정
const API_BASE = '/api'

// 인증 헤더 생성 (Supabase 세션 사용)
const getAuthHeaders = async () => {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    return session?.access_token ? { 'Authorization': `Bearer ${session.access_token}` } : {}
  } catch (error) {
    console.error('Error getting auth headers:', error)
    return {}
  }
}

// API 호출 함수
const apiCall = async (endpoint, options = {}) => {
  const url = `${API_BASE}${endpoint}`

  // 인증이 필요한 요청인지 확인
  const needsAuth = ['POST', 'PUT', 'DELETE'].includes(options.method) ||
                   endpoint.includes('/auth/') ||
                   endpoint.includes('/applications') ||
                   endpoint.includes('/favorites')

  let headers = {
    'Content-Type': 'application/json',
    ...options.headers
  }

  // 인증이 필요한 요청에만 토큰 추가
  if (needsAuth) {
    const authHeaders = await getAuthHeaders()
    headers = { ...headers, ...authHeaders }
  }

  const config = {
    headers,
    ...options
  }

  try {
    const response = await fetch(url, config)
    const data = await response.json()

    if (!response.ok) {
      // 인증 오류 시 자동 로그아웃
      if (response.status === 401) {
        await supabase.auth.signOut()
        throw new Error('Authentication failed - please login again')
      }
      throw new Error(data.error || 'API call failed')
    }

    return data
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error)
    throw error
  }
}

// 게시물 관련 API (모든 데이터 처리를 백엔드에서)
export const postsAPI = {
  // 게시물 목록 조회 (검색, 필터링, 페이지네이션)
  getList: (params = {}) => {
    const searchParams = new URLSearchParams(params)
    return apiCall(`/posts?${searchParams.toString()}`)
  },

  // 개별 게시물 조회 (상세 정보 포함)
  getById: (id) => apiCall(`/posts/${id}`),

  // 게시물 생성
  create: (postData) => apiCall('/posts', {
    method: 'POST',
    body: JSON.stringify(postData)
  }),

  // 게시물 수정
  update: (id, postData) => apiCall(`/posts/${id}`, {
    method: 'PUT',
    body: JSON.stringify(postData)
  }),

  // 게시물 삭제
  delete: (id) => apiCall(`/posts/${id}`, {
    method: 'DELETE'
  }),

  // 내가 작성한 게시물 목록
  getMyPosts: (params = {}) => {
    const searchParams = new URLSearchParams({ ...params, type: 'my' })
    return apiCall(`/posts/my?${searchParams.toString()}`)
  }
}

// 봉사 신청 관련 API
export const applicationsAPI = {
  // 내가 신청한 봉사 목록
  getMyApplications: (params = {}) => {
    const searchParams = new URLSearchParams({ ...params, type: 'my' })
    return apiCall(`/applications?${searchParams.toString()}`)
  },

  // 내가 받은 봉사 신청 목록
  getReceivedApplications: (params = {}) => {
    const searchParams = new URLSearchParams({ ...params, type: 'received' })
    return apiCall(`/applications?${searchParams.toString()}`)
  },

  // 봉사 신청 생성
  create: (applicationData) => apiCall('/applications', {
    method: 'POST',
    body: JSON.stringify(applicationData)
  }),

  // 봉사 신청 상태 변경 (수락/거절)
  updateStatus: (id, status, message) => apiCall(`/applications/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status, message })
  })
}

// 찜 목록 관련 API
export const favoritesAPI = {
  // 찜 목록 조회
  getList: (params = {}) => {
    const searchParams = new URLSearchParams(params)
    return apiCall(`/favorites?${searchParams.toString()}`)
  },

  // 찜 추가
  add: (postId) => apiCall('/favorites', {
    method: 'POST',
    body: JSON.stringify({ post_id: postId })
  }),

  // 찜 제거
  remove: (postId) => apiCall(`/favorites?post_id=${postId}`, {
    method: 'DELETE'
  }),

  // 찜 여부 확인
  check: (postId) => apiCall(`/favorites/check?post_id=${postId}`)
}

// 사용자 프로필 관련 API
export const profileAPI = {
  // 프로필 조회
  get: () => apiCall('/auth/profile'),

  // 프로필 수정
  update: (profileData) => apiCall('/auth/profile', {
    method: 'PUT',
    body: JSON.stringify(profileData)
  }),

  // 프로필 이미지 업로드
  uploadImage: (file) => {
    const formData = new FormData()
    formData.append('image', file)

    return apiCall('/auth/profile/image', {
      method: 'POST',
      body: formData,
      headers: {} // FormData 사용 시 Content-Type 자동 설정
    })
  }
}

// 보호소 관련 API
export const sheltersAPI = {
  // 보호소 목록 조회
  getList: (params = {}) => {
    const searchParams = new URLSearchParams(params)
    return apiCall(`/shelters?${searchParams.toString()}`)
  },

  // 보호소 상세 정보
  getById: (id) => apiCall(`/shelters/${id}`),

  // 보호소 등록 (인증된 사용자만)
  create: (shelterData) => apiCall('/shelters', {
    method: 'POST',
    body: JSON.stringify(shelterData)
  }),

  // 보호소 정보 수정
  update: (id, shelterData) => apiCall(`/shelters/${id}`, {
    method: 'PUT',
    body: JSON.stringify(shelterData)
  })
}

// 인증 상태 확인
export const checkAuthStatus = async () => {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    return !!session
  } catch (error) {
    return false
  }
}

// 에러 처리 유틸리티
export const handleAPIError = (error) => {
  if (error.message.includes('Authentication failed')) {
    return { type: 'auth', message: '로그인이 필요합니다.' }
  } else if (error.message.includes('Not authorized')) {
    return { type: 'permission', message: '권한이 없습니다.' }
  } else if (error.message.includes('not found')) {
    return { type: 'not_found', message: '요청한 리소스를 찾을 수 없습니다.' }
  } else {
    return { type: 'general', message: error.message || '오류가 발생했습니다.' }
  }
}
