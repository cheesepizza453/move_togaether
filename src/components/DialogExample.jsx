'use client';

import { useDialogContext } from './DialogProvider';

const DialogExample = () => {
  const { showInfo, showConfirm, showWarning, showError, showSuccess } = useDialogContext();

  const handleInfoDialog = () => {
    showInfo(
      `더 많은 구조견들에게 기회를 주기 위해
30일의 디데이가 지나면 게시물은 숨겨집니다.
디데이 종료 시 재업로드 할 수 있습니다.`,
      '안내사항',
      { confirmText: '확인하고 업로드하기' }
    );
  };

  const handleConfirmDialog = () => {
    showConfirm(
      '모집 완료 시 상태를 변경할 수 없습니다.\n완료 하시겠습니까?',
      '확인',
      {
        confirmText: '확인',
        cancelText: '취소',
        onConfirm: () => {
          console.log('완료 처리');
          showSuccess('문의를 남겼습니다.');
        }
      }
    );
  };

  const handleErrorDialog = () => {
    showError(
      '네트워크 오류가 발생했습니다.\n다시 시도해주세요.',
      '오류',
      { confirmText: '다시 시도' }
    );
  };

  const handleSuccessDialog = () => {
    showSuccess('문의를 남겼습니다.');
  };

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-xl font-bold mb-4">Dialog 컴포넌트 예시</h2>

      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={handleInfoDialog}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          안내사항 Dialog
        </button>

        <button
          onClick={handleConfirmDialog}
          className="px-4 py-2 bg-yellow-500 text-black rounded hover:bg-yellow-600"
        >
          확인 Dialog
        </button>

        <button
          onClick={handleErrorDialog}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          에러 Dialog
        </button>

        <button
          onClick={handleSuccessDialog}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          성공 Dialog
        </button>
      </div>
    </div>
  );
};

export default DialogExample;
