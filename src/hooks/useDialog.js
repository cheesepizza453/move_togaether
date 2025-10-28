import { useState, useCallback } from 'react';

const useDialog = () => {
  const [dialog, setDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
    confirmText: '확인',
    cancelText: '취소',
    showCancel: false,
    onConfirm: null,
    onCancel: null
  });

  const openDialog = useCallback((options) => {
    setDialog({
      isOpen: true,
      title: options.title || '',
      message: options.message || '',
      type: options.type || 'info',
      confirmText: options.confirmText || '확인',
      cancelText: options.cancelText || '취소',
      showCancel: options.showCancel || false,
      onConfirm: options.onConfirm || null,
      onCancel: options.onCancel || null
    });
  }, []);

  const closeDialog = useCallback(() => {
    setDialog(prev => ({
      ...prev,
      isOpen: false
    }));
  }, []);

  // 편의 메서드들
  const showInfo = useCallback((message, title = '안내사항', options = {}) => {
    openDialog({
      title,
      message,
      type: 'info',
      confirmText: options.confirmText || '확인하고 업로드하기',
      ...options
    });
  }, [openDialog]);

  const showConfirm = useCallback((message, title = '확인', options = {}) => {
    openDialog({
      title,
      message,
      type: 'confirm',
      confirmText: options.confirmText || '확인',
      cancelText: options.cancelText || '취소',
      showCancel: true,
      ...options
    });
  }, [openDialog]);

  const showWarning = useCallback((message, title = '경고', options = {}) => {
    openDialog({
      title,
      message,
      type: 'warning',
      confirmText: options.confirmText || '확인',
      cancelText: options.cancelText || '취소',
      showCancel: true,
      ...options
    });
  }, [openDialog]);

  const showError = useCallback((message, title = '오류', options = {}) => {
    openDialog({
      title,
      message,
      type: 'error',
      confirmText: options.confirmText || '다시 시도',
      ...options
    });
  }, [openDialog]);

  const showSuccess = useCallback((message, title = '완료', options = {}) => {
    openDialog({
      title,
      message,
      type: 'info',
      confirmText: options.confirmText || '확인',
      ...options
    });
  }, [openDialog]);

  const showLoginRequired = useCallback((message = '이 기능을 사용하려면 로그인이 필요합니다.', title = '로그인이 필요합니다', options = {}) => {
    openDialog({
      title,
      message,
      type: 'login',
      confirmText: options.confirmText || '로그인하기',
      cancelText: options.cancelText || '취소',
      showCancel: options.showCancel !== undefined ? options.showCancel : (options.onCancel ? true : true),
      onConfirm: options.onConfirm || (() => {
        // 기본 로그인 리다이렉트
        window.location.href = '/login';
      }),
      onCancel: options.onCancel || null,
      ...options
    });
  }, [openDialog]);

  return {
    dialog,
    openDialog,
    closeDialog,
    showInfo,
    showConfirm,
    showWarning,
    showError,
    showSuccess,
    showLoginRequired
  };
};

export default useDialog;
