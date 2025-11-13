'use client';

import { createContext, useContext, useRef, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import useDialog from '../hooks/useDialog';

const DialogContext = createContext();

export const useDialogContext = () => {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error('useDialogContext must be used within a DialogProvider');
  }
  return context;
};

export const DialogProvider = ({ children }) => {
  const dialogHook = useDialog();
  const pendingCallbackRef = useRef(null);

  const getButtonStyles = (type) => {
    // 모든 타입에 대해 노란색 계열 사용
    return 'bg-brand-main text-black';
  };

  // 다이얼로그가 닫힐 때 pending 콜백 실행
  useEffect(() => {
    if (!dialogHook.dialog.isOpen && pendingCallbackRef.current) {
      const callback = pendingCallbackRef.current;
      pendingCallbackRef.current = null;

      // 다이얼로그가 완전히 닫힌 후 콜백 실행
      // 페이지 이동이 포함된 경우 즉시 실행하지 않고 약간의 지연을 둠
      const timer = setTimeout(() => {
        callback();
      }, 150);

      return () => clearTimeout(timer);
    }
  }, [dialogHook.dialog.isOpen]);

  return (
      <DialogContext.Provider value={dialogHook}>
        {children}
        {/* 커스텀 오버레이 (Radix 기본 스크롤 락 비활성화) */}
        {dialogHook.dialog.isOpen && (
          <div id="dialog-overlay" className="dialog-overlay fixed inset-0 z-[9998] bg-black/60" />
        )}
        <Dialog
          modal={false}
          open={dialogHook.dialog.isOpen}
          onOpenChange={(open) => {
            if (!open) {
              dialogHook.closeDialog();
            }
          }}
        >
          <DialogContent
            className="fixed left-[50%] top-[50%] grid w-[85vw] rounded-[15px] max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border p-6 pt-[36px] shadow-[0_0_6px_0px_rgba(0,0,0,0.25)] z-[9999] bg-white"
            showCloseButton={false}
            onOpenAutoFocus={(e) => {
              e.preventDefault();
              // Radix 내부 스크롤 락 클래스가 남아있다면 제거 시도
              document.body.classList.remove('radix-scroll-locked');
            }}
          >
          <DialogHeader className="text-center">
            <DialogTitle className="mb-[15px] text-22-b text-center">
              {dialogHook.dialog.title}
            </DialogTitle>
            <DialogDescription className="text-text-800 text-16-r leading-relaxed whitespace-pre-line text-center">
              {dialogHook.dialog.message}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-center">
            <Button
              onClick={() => {
                // 콜백을 ref에 저장
                if (dialogHook.dialog.onConfirm) {
                  pendingCallbackRef.current = dialogHook.dialog.onConfirm;
                }

                // 다이얼로그 닫기
                dialogHook.closeDialog();
              }}
              className={`flex-1 text-16-m ${getButtonStyles(dialogHook.dialog.type)}`}
            >
              {dialogHook.dialog.confirmText}
            </Button>
            {dialogHook.dialog.showCancel && (
              <Button
                variant="outline"
                onClick={() => {
                  // 콜백을 ref에 저장
                  if (dialogHook.dialog.onCancel) {
                    pendingCallbackRef.current = dialogHook.dialog.onCancel;
                  }

                  // 다이얼로그 닫기
                  dialogHook.closeDialog();
                }}
                className="flex-1 border-gray-300 text-gray-700 text-16-m"
              >
                {dialogHook.dialog.cancelText}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DialogContext.Provider>
  );
};
