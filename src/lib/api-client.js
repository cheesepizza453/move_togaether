// 통합 API 클라이언트
import { supabase } from './supabase';

// API 기본 설정
const API_BASE = '/api';

// 에러 타입 정의
export const API_ERROR_TYPES = {
  AUTH: 'auth',
  PERMISSION: 'permission',
  NOT_FOUND: 'not_found',
  VALIDATION: 'validation',
  NETWORK: 'network',
  SERVER: 'server',
  UNKNOWN: 'unknown'
};

// 커스텀 에러 클래스
export class APIError extends Error {
  constructor(message, type = API_ERROR_TYPES.UNKNOWN, status = null, data = null) {
    super(message);
    this.name = 'APIError';
    this.type = type;
    this.status = status;
    this.data = data;
  }
}

// 인증 헤더 생성
const getAuthHeaders = async () => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) {
      return {};
    }

    return {
      'Authorization': `Bearer ${session.access_token}`,
      'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    };
  } catch (error) {
    console.error('Error getting auth headers:', error);
    return {};
  }
};

// 기본 헤더 생성
const getDefaultHeaders = () => ({
  'Content-Type': 'application/json',
  'Cache-Control': 'no-cache, no-store, must-revalidate',
  'Pragma': 'no-cache',
  'Expires': '0'
});

// API 호출 함수 (재시도 로직 포함)
const apiCall = async (endpoint, options = {}) => {
  const url = `${API_BASE}${endpoint}`;
  const maxRetries = options.maxRetries || 2;
  const retryDelay = options.retryDelay || 1000;

  // 인증이 필요한 엔드포인트 확인
  const needsAuth = options.requiresAuth !== false && (
    ['POST', 'PUT', 'DELETE', 'PATCH'].includes(options.method) ||
    endpoint.includes('/auth/') ||
    endpoint.includes('/applications') ||
    endpoint.includes('/favorites') ||
    endpoint.includes('/posts/list') // posts/list는 항상 인증 헤더 전달 (찜 상태 조회를 위해)
  );

  // 헤더 구성
  let headers = {
    ...getDefaultHeaders(),
    ...options.headers
  };

  // 인증 헤더 추가
  if (needsAuth) {
    const authHeaders = await getAuthHeaders();
    headers = { ...headers, ...authHeaders };
  }

  // 요청 설정
  const config = {
    method: options.method || 'GET',
    headers,
    ...options
  };

  // body가 객체인 경우 JSON 문자열로 변환
  if (config.body && typeof config.body === 'object' && !(config.body instanceof FormData)) {
    config.body = JSON.stringify(config.body);
  }

  // 재시도 로직
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      console.log(`API 호출 시도 ${attempt + 1}/${maxRetries + 1}:`, { url, config });

      // 타임아웃 설정 (10초)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(url, {
        ...config,
        signal: controller.signal
      });

      console.log('API 응답 받음:', { status: response.status, ok: response.ok });

      clearTimeout(timeoutId);

      // 응답이 JSON인지 확인
      const contentType = response.headers.get('content-type');
      const isJson = contentType && contentType.includes('application/json');

      let data = null;
      if (isJson) {
        data = await response.json();
      }

      // HTTP 에러 상태 처리
      if (!response.ok) {
        const errorMessage = data?.error || data?.message || `HTTP ${response.status} Error`;

        // 인증 오류
        if (response.status === 401) {
          await supabase.auth.signOut();
          throw new APIError('인증이 필요합니다. 다시 로그인해주세요.', API_ERROR_TYPES.AUTH, 401, data);
        }

        // 권한 오류
        if (response.status === 403) {
          throw new APIError('접근 권한이 없습니다.', API_ERROR_TYPES.PERMISSION, 403, data);
        }

        // 리소스 없음
        if (response.status === 404) {
          throw new APIError('요청한 리소스를 찾을 수 없습니다.', API_ERROR_TYPES.NOT_FOUND, 404, data);
        }

        // 유효성 검사 오류
        if (response.status === 400) {
          throw new APIError(errorMessage, API_ERROR_TYPES.VALIDATION, 400, data);
        }

        // 서버 오류
        if (response.status >= 500) {
          throw new APIError('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.', API_ERROR_TYPES.SERVER, response.status, data);
        }

        // 기타 오류
        throw new APIError(errorMessage, API_ERROR_TYPES.UNKNOWN, response.status, data);
      }

      return data;
    } catch (error) {
      console.error(`API 호출 에러 (시도 ${attempt + 1}):`, error);

      // 마지막 시도이거나 재시도할 수 없는 오류인 경우
      if (attempt === maxRetries ||
          error instanceof APIError ||
          (error.name === 'AbortError') ||
          (error instanceof TypeError && error.message.includes('fetch'))) {

        // 네트워크 오류
        if (error instanceof TypeError && error.message.includes('fetch')) {
          throw new APIError('네트워크 연결을 확인해주세요.', API_ERROR_TYPES.NETWORK, null, null);
        }

        // 타임아웃 오류
        if (error.name === 'AbortError') {
          throw new APIError('요청 시간이 초과되었습니다. 다시 시도해주세요.', API_ERROR_TYPES.NETWORK, null, null);
        }

        // APIError는 그대로 전달
        if (error instanceof APIError) {
          throw error;
        }

        // 기타 오류
        console.error(`API Error (${endpoint}):`, error);
        throw new APIError(error.message || '알 수 없는 오류가 발생했습니다.', API_ERROR_TYPES.UNKNOWN, null, null);
      }

      // 재시도 전 대기
      console.warn(`API 호출 실패 (시도 ${attempt + 1}/${maxRetries + 1}), ${retryDelay}ms 후 재시도...`);
      await new Promise(resolve => setTimeout(resolve, retryDelay));
    }
  }
};

// 게시물 관련 API
export const postsAPI = {
  // 게시물 목록 조회 (통합)
  getList: async (params = {}) => {
    const searchParams = new URLSearchParams(params);
    return apiCall(`/posts/list?${searchParams.toString()}`);
  },

  // 개별 게시물 조회
  getById: async (id) => {
    return apiCall(`/posts/${id}`, { requiresAuth: false });
  },

  // 게시물 생성
  create: async (postData) => {
    return apiCall('/posts/volunteer', {
      method: 'POST',
      body: postData
    });
  },

  // 게시물 수정
  update: async (id, postData) => {
    return apiCall(`/posts/${id}`, {
      method: 'PUT',
      body: postData
    });
  },

  // 게시물 삭제
  delete: async (id) => {
    return apiCall(`/posts/${id}`, {
      method: 'DELETE'
    });
  }
};

// 즐겨찾기 관련 API
export const favoritesAPI = {
  // 즐겨찾기 목록 조회
  getList: async (params = {}) => {
    const searchParams = new URLSearchParams({ ...params, type: 'favorites' });
    return apiCall(`/posts/list?${searchParams.toString()}`);
  },

  // 즐겨찾기 추가
  add: async (postId) => {
    return apiCall('/favorites', {
      method: 'POST',
      body: { post_id: postId }
    });
  },

  // 즐겨찾기 제거
  remove: async (postId) => {
    return apiCall(`/favorites?post_id=${postId}`, {
      method: 'DELETE'
    });
  },

  // 즐겨찾기 여부 확인
  check: async (postId) => {
    return apiCall(`/favorites/check?post_id=${postId}`);
  }
};

// 마이페이지 관련 API
export const myPageAPI = {
  // 내가 작성한 게시물 (상태별 필터링 지원)
  getMyPosts: async (params = {}) => {
    const searchParams = new URLSearchParams({
      ...params,
      type: 'my',
      status: params.status || 'all'
    });
    return apiCall(`/posts/list?${searchParams.toString()}`);
  },

  // 내가 지원한 게시물
  getAppliedPosts: async (params = {}) => {
    const searchParams = new URLSearchParams({ ...params, type: 'applied', status: 'all' });
    return apiCall(`/posts/list?${searchParams.toString()}`);
  },

  // 내가 작성한 게시물 - 진행중 (deadline 미지남 + status active)
  getMyPostsInProgress: async () => {
    return apiCall('/posts/list?type=my&status=active&filter=in_progress');
  },

  // 내가 작성한 게시물 - 종료 (deadline 지남 + status active)
  getMyPostsExpired: async () => {
    return apiCall('/posts/list?type=my&status=active&filter=expired');
  },

  // 내가 작성한 게시물 - 완료 (status completed)
  getMyPostsCompleted: async () => {
    return apiCall('/posts/list?type=my&status=completed');
  }
};

// 인증 관련 API
export const authAPI = {
  // 회원가입
  signup: async (userData) => {
    return apiCall('/auth/signup', {
      method: 'POST',
      body: userData,
      requiresAuth: false
    });
  },

  // 로그인
  login: async (credentials) => {
    return apiCall('/auth/login', {
      method: 'POST',
      body: credentials,
      requiresAuth: false
    });
  },

  // 로그아웃
  logout: async () => {
    return apiCall('/auth/logout', {
      method: 'POST'
    });
  },

  // 이메일 중복 체크
  checkEmail: async (email) => {
    return apiCall('/auth/check-email', {
      method: 'POST',
      body: { email },
      requiresAuth: false
    });
  },

  // 닉네임 중복 체크
  checkNickname: async (nickname) => {
    return apiCall('/auth/check-nickname', {
      method: 'POST',
      body: { nickname },
      requiresAuth: false
    });
  },

  // 카카오 로그인
  kakaoLogin: async (userInfo) => {
    return apiCall('/auth/kakao/login', {
      method: 'POST',
      body: { userInfo },
      requiresAuth: false
    });
  },

  // 카카오 회원가입
  kakaoSignup: async (userData) => {
    return apiCall('/auth/kakao/signup', {
      method: 'POST',
      body: userData,
      requiresAuth: false
    });
  }
};

// 봉사 신청 관련 API
export const applicationsAPI = {
  // 봉사 신청
  apply: async (postId, message) => {
    return apiCall('/applications', {
      method: 'POST',
      body: { post_id: postId, message }
    });
  },

  // 봉사 신청 상태 변경
  updateStatus: async (applicationId, status, message) => {
    return apiCall(`/applications/${applicationId}/status`, {
      method: 'PUT',
      body: { status, message }
    });
  },

  // 내가 신청한 봉사 목록
  getMyApplications: async (params = {}) => {
    const searchParams = new URLSearchParams({ ...params, type: 'my' });
    return apiCall(`/applications?${searchParams.toString()}`);
  },

  // 내가 받은 봉사 신청 목록
  getReceivedApplications: async (params = {}) => {
    const searchParams = new URLSearchParams({ ...params, type: 'received' });
    return apiCall(`/applications?${searchParams.toString()}`);
  }
};

// 주소 검증 API
export const addressAPI = {
  // 주소 유효성 검사
  validate: async (address) => {
    return apiCall('/validate-address', {
      method: 'POST',
      body: { address },
      requiresAuth: false
    });
  }
};

// 에러 처리 유틸리티
export const handleAPIError = (error) => {
  if (error instanceof APIError) {
    return {
      type: error.type,
      message: error.message,
      status: error.status,
      data: error.data
    };
  }

  return {
    type: API_ERROR_TYPES.UNKNOWN,
    message: error.message || '알 수 없는 오류가 발생했습니다.',
    status: null,
    data: null
  };
};

// 인증 상태 확인
export const checkAuthStatus = async () => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return !!session;
  } catch (error) {
    return false;
  }
};

// 기본 export
const apiClient = {
  posts: postsAPI,
  favorites: favoritesAPI,
  myPage: myPageAPI,
  auth: authAPI,
  applications: applicationsAPI,
  address: addressAPI,
  handleError: handleAPIError,
  checkAuth: checkAuthStatus
};

export default apiClient;
