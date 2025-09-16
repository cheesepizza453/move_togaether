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
      <Dialog open={dialogHook.dialog.isOpen} onOpenChange={dialogHook.closeDialog}>
        <DialogContent className="max-w-xs w-full bg-white border border-gray-200 shadow-xl">
          <DialogHeader className="text-center">
            <DialogTitle className="text-lg text-center font-bold text-gray-900">
              {dialogHook.dialog.title}
            </DialogTitle>
            <DialogDescription className="text-gray-700 text-sm leading-relaxed whitespace-pre-line text-center">
              {dialogHook.dialog.message}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-3 justify-center">
            <Button
              onClick={dialogHook.dialog.onConfirm || dialogHook.closeDialog}
              className={`flex-1 ${getButtonStyles(dialogHook.dialog.type)}`}
            >
              {dialogHook.dialog.confirmText}
            </Button>
            {dialogHook.dialog.showCancel && (
              <Button
                variant="outline"
                onClick={dialogHook.dialog.onCancel || dialogHook.closeDialog}
                className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
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
