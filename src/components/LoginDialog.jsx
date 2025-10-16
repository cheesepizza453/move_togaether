'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog";
import { cn } from "@/lib/utils";

// 커스텀 AlertDialogContent (오버레이 없이)
const CustomAlertDialogContent = React.forwardRef(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Portal>
    <AlertDialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-[50%] top-[50%] z-[9999] grid w-[85vw] rounded-[15px] max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 pt-[36px] shadow-[0_0_6px_0px_rgba(0,0,0,0.25)] duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-90 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
        className
      )}
      {...props}
    />
  </AlertDialogPrimitive.Portal>
));
CustomAlertDialogContent.displayName = AlertDialogPrimitive.Content.displayName;

const LoginDialog = ({
  open,
  onOpenChange,
  title = "로그인이 필요합니다",
  description = "이 기능을 사용하려면 로그인해주세요.",
  redirectPath = "/login",
  onLoginSuccess
}) => {
  const router = useRouter();

  const handleLogin = () => {
    onOpenChange(false);

    // 리다이렉트 경로가 있으면 저장
    if (redirectPath !== "/login") {
      sessionStorage.setItem('redirectAfterLogin', redirectPath);
    }

    router.push('/login');

    // 로그인 성공 콜백이 있으면 실행
    if (onLoginSuccess) {
      onLoginSuccess();
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      {/* 커스텀 오버레이 */}
      {open && (
        <div
          className="fixed inset-0 z-[9998] bg-black/60"
          onClick={() => onOpenChange(false)}
        />
      )}
      <CustomAlertDialogContent className="z-[9999] bg-white">
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex flex-row gap-3">
          <AlertDialogCancel className="mt-0 flex-1 text-16-m">취소</AlertDialogCancel>
          <AlertDialogAction onClick={handleLogin} className="flex-1 text-16-m">
            로그인하기
          </AlertDialogAction>
        </AlertDialogFooter>
      </CustomAlertDialogContent>
    </AlertDialog>
  );
};

export default LoginDialog;
