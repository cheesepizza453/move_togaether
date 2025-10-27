'use client';

import { createContext, useContext } from 'react';
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

  const getButtonStyles = (type) => {
    // 모든 타입에 대해 노란색 계열 사용
    return 'bg-yellow-500 hover:bg-yellow-600 text-black';
  };

  return (
      <DialogContext.Provider value={dialogHook}>
        {children}
        {/* 커스텀 오버레이 (Radix 기본 스크롤 락 비활성화) */}
        {dialogHook.dialog.isOpen && (
          <div className="dialog-overlay fixed inset-0 z-[9998] bg-black/60" />
        )}
        <Dialog modal={false} open={dialogHook.dialog.isOpen} onOpenChange={dialogHook.closeDialog}>
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
            <DialogTitle className="mb-[15px] text-22-b">
              {dialogHook.dialog.title}
            </DialogTitle>
            <DialogDescription className="text-[#333] text-16-r leading-relaxed whitespace-pre-line text-center">
              {dialogHook.dialog.message}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-3 justify-center">
            <Button
              onClick={dialogHook.dialog.onConfirm || dialogHook.closeDialog}
              className={`flex-1 text-16-m ${getButtonStyles(dialogHook.dialog.type)}`}
            >
              {dialogHook.dialog.confirmText}
            </Button>
            {dialogHook.dialog.showCancel && (
              <Button
                variant="outline"
                onClick={() => {
                  if (dialogHook.dialog.onCancel) {
                    dialogHook.dialog.onCancel();
                  }
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
