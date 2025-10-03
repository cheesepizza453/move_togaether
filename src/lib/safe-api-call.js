// 안전한 API 호출을 위한 유틸리티 함수
import { useRef, useCallback } from 'react';

/**
 * 컴포넌트가 마운트된 상태에서만 상태를 업데이트하는 안전한 API 호출 함수
 * @param {Function} apiCall - API 호출 함수
 * @param {Object} options - 옵션 설정
 * @returns {Function} 안전한 API 호출 함수
 */
export const useSafeApiCall = (apiCall, options = {}) => {
  const isMountedRef = useRef(true);
  const abortControllerRef = useRef(null);

  // 컴포넌트 언마운트 시 정리
  const cleanup = useCallback(() => {
    isMountedRef.current = false;
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  // 안전한 상태 업데이트 함수
  const safeSetState = useCallback((setter, value) => {
    if (isMountedRef.current) {
      setter(value);
    }
  }, []);

  // 안전한 API 호출 함수
  const safeApiCall = useCallback(async (...args) => {
    // 이전 요청이 있다면 취소
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // 새로운 AbortController 생성
    abortControllerRef.current = new AbortController();

    try {
      // 로딩 상태 설정
      if (options.setLoading) {
        safeSetState(options.setLoading, true);
      }
      if (options.setError) {
        safeSetState(options.setError, null);
      }

      // API 호출 실행
      const result = await apiCall(...args, abortControllerRef.current.signal);

      // 성공 시 데이터 설정
      if (options.setData && isMountedRef.current) {
        safeSetState(options.setData, result);
      }

      return result;
    } catch (error) {
      // AbortError는 무시 (컴포넌트 언마운트로 인한 정상적인 취소)
      if (error.name === 'AbortError') {
        console.log('API 호출이 취소되었습니다.');
        return null;
      }

      // 에러 처리
      if (options.setError && isMountedRef.current) {
        const errorMessage = error.message || '오류가 발생했습니다.';
        safeSetState(options.setError, errorMessage);
      }

      console.error('API 호출 오류:', error);
      throw error;
    } finally {
      // 로딩 상태 해제
      if (options.setLoading && isMountedRef.current) {
        safeSetState(options.setLoading, false);
      }
    }
  }, [apiCall, options, safeSetState]);

  return {
    safeApiCall,
    cleanup,
    isMounted: () => isMountedRef.current
  };
};

/**
 * 디바운스된 API 호출을 위한 훅
 * @param {Function} apiCall - API 호출 함수
 * @param {number} delay - 디바운스 지연 시간 (ms)
 * @returns {Function} 디바운스된 API 호출 함수
 */
export const useDebouncedApiCall = (apiCall, delay = 300) => {
  const timeoutRef = useRef(null);

  const debouncedApiCall = useCallback((...args) => {
    // 이전 타임아웃 취소
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // 새로운 타임아웃 설정
    timeoutRef.current = setTimeout(() => {
      apiCall(...args);
    }, delay);
  }, [apiCall, delay]);

  return debouncedApiCall;
};

/**
 * 재시도 로직이 포함된 API 호출 함수
 * @param {Function} apiCall - API 호출 함수
 * @param {Object} options - 재시도 옵션
 * @returns {Function} 재시도 로직이 포함된 API 호출 함수
 */
export const useRetryApiCall = (apiCall, options = {}) => {
  const {
    maxRetries = 3,
    retryDelay = 1000,
    retryCondition = (error) => error.status >= 500
  } = options;

  const retryApiCall = useCallback(async (...args) => {
    let lastError;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await apiCall(...args);
      } catch (error) {
        lastError = error;

        // 재시도 조건 확인
        if (attempt < maxRetries && retryCondition(error)) {
          console.log(`API 호출 실패, ${retryDelay}ms 후 재시도 (${attempt + 1}/${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, retryDelay));
          continue;
        }

        // 재시도 불가능한 경우 에러 throw
        throw error;
      }
    }

    throw lastError;
  }, [apiCall, maxRetries, retryDelay, retryCondition]);

  return retryApiCall;
};

/**
 * API 호출 상태를 관리하는 훅
 * @param {Object} initialState - 초기 상태
 * @returns {Object} 상태 관리 객체
 */
export const useApiState = (initialState = {}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(initialState.data || null);

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    setData(initialState.data || null);
  }, [initialState.data]);

  const setLoadingState = useCallback((isLoading) => {
    setLoading(isLoading);
    if (isLoading) {
      setError(null);
    }
  }, []);

  return {
    loading,
    error,
    data,
    setLoading: setLoadingState,
    setError,
    setData,
    reset
  };
};

