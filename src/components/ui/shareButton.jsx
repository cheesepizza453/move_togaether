const ShareButton = ({ url, title }) => {
    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: title || '무브투개더',
                    text: '이 이동봉사 게시물을 공유해보세요!',
                    url: url || window.location.href,
                });
            } catch (err) {
                console.log('공유 취소 또는 오류:', err);
            }
        } else {
            alert('이 브라우저에서는 공유를 지원하지 않습니다.');
        }
    };

    return (
        <div className={'flex gap-3'}>
            <button
                onClick={handleShare}
                className="rounded-[15px] text-16-m h-[54px] w-full flex-1 bg-[#f7f7f7] border border-[#d9d9d9]"
            >
                공유하기
            </button>
        </div>
    );
};

export default ShareButton;