'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useDialogContext } from './DialogProvider';

// 통합된 로그인 다이얼로그 훅
export const useLoginDialog = () => {
  const { showLoginRequired } = useDialogContext();
  const router = useRouter();

  const showLoginDialog = (options = {}) => {
    const {
      title = '로그인이 필요합니다',
      message = '이 기능을 사용하려면 로그인이 필요합니다.',
      redirectPath = '/login',
      onLoginSuccess,
      onCancel,
      ...otherOptions
    } = options;

    showLoginRequired(message, title, {
      onConfirm: () => {
        // 리다이렉트 경로가 있으면 저장
        if (redirectPath !== '/login') {
          sessionStorage.setItem('redirectAfterLogin', redirectPath);
        }

        router.push('/login');

        // 로그인 성공 콜백이 있으면 실행
        if (onLoginSuccess) {
          onLoginSuccess();
        }
      },
      onCancel: onCancel,
      ...otherOptions
    });
  };

  return { showLoginDialog };
};

// 기존 LoginDialog 컴포넌트는 호환성을 위해 유지하되 내부적으로 통합된 다이얼로그 사용
const LoginDialog = ({
  open,
  onOpenChange,
  title = "로그인이 필요합니다",
  description = "이 기능을 사용하려면 로그인해주세요.",
  redirectPath = "/login",
  onLoginSuccess
}) => {
  const { showLoginDialog } = useLoginDialog();

  React.useEffect(() => {
    if (open) {
      showLoginDialog({
        title,
        message: description,
        redirectPath,
        onLoginSuccess
      });
      onOpenChange(false);
    }
  }, [open, title, description, redirectPath, onLoginSuccess, onOpenChange, showLoginDialog]);

  return null; // 실제 렌더링은 DialogProvider에서 처리
};

export default LoginDialog;
