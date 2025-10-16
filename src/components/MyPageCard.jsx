'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import moment from 'moment';

const MyPageCard = ({ post, activeSubTab, tab }) => {
  const router = useRouter();

  const convertDogSize = (size) => {
    const sizeMap = {
      small: '소형견',
      smallMedium: '중소형견',
      medium: '중형견',
      large: '대형견',
    };
    return sizeMap[size] || size;
  };

  const formatDate = (date) => moment(date).format('YY/MM/DD');

  const getDday = (deadline) => {
    const today = moment();
    const deadlineDate = moment(deadline);
    return deadlineDate.diff(today, 'days');
  };

  // D-day 배지 색상 결정 (PostCard와 동일)
  const getDdayColor = (dday) => {
    if (dday <= 7) return 'bg-brand-point text-white';
    if (dday <= 14) return 'bg-brand-main text-white';
    return 'bg-[#FFE889] text-brand-yellow-dark';
  };

/*  const getStatusBadge = (status, deadline) => {
    if (status !== 'active')
      return { text: '입양 완료', className: 'bg-green-100 text-green-600' };

    const dday = getDday(deadline);
    if (dday < 0) return { text: '마감', className: 'bg-red-100 text-red-600' };
    if (dday <= 3)
      return { text: `D-${dday}`, className: 'bg-red-100 text-red-600' };
    if (dday <= 7)
      return { text: `D-${dday}`, className: 'bg-orange-100 text-orange-600' };
    return { text: `D-${dday}`, className: 'bg-yellow-100 text-yellow-600' };
  };*/

  const dday = getDday(post.deadline);
  // const statusBadge = getStatusBadge(post.status, post.deadline);

  return (

      //
      <div className={`${activeSubTab === '완료' ? 'bg-text-300' : 'bg-white shadow-[0_0_15px_0px_rgba(0,0,0,0.1)]' } rounded-[15px] px-[22px] py-[18px] cursor-pointer relative`}>
        {/* 진행중 탭에서만 D-day 표시 */}
        {activeSubTab === '진행중' && (
            <div className="absolute -top-3 left-[-5px] z-10">
          <span
              className={`flex items-center justify-center px-[13px] h-[24px] rounded-[7px] text-12-b font-bold ${getDdayColor(
                  dday
              )}`}
          >
            D-{dday}
          </span>
            </div>
        )}

        {/* 카드 본문 */}
        <div className="flex items-center">
          <div className="w-[76px] h-[80px] bg-gray-100 rounded-[15px] mr-3 flex-shrink-0 overflow-hidden relative shadow-[0_0_7px_0px_rgba(0,0,0,0.25)]">
            {post.images && post.images.length > 0 ? (
                <img
                    src={post.images[0]}
                    alt={post.dog_name}
                    className="w-full h-full object-cover"
                />
            ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                  이미지 없음
                </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="min-h-[40px] text-14-m text-black leading-[1.35] mb-[4px] line-clamp-2">
              {post.title}
            </h3>
            <div className={'flex items-center justify-between'}>
            <p className="text-12-r text-text-800">
              {post.dog_name} / {convertDogSize(post.dog_size)}
            </p>
            <p className="text-9-r text-text-600">{formatDate(post.created_at)}</p>
            </div>
          </div>

          {activeSubTab !== '진행중' && (
              <div className="ml-2">

              </div>
          )}
        </div>

        {/* 하단 버튼/날짜 */}
        {tab === 'apply' ? (
            // 지원 탭
            <div className="mt-[12px]">
              <button
                  onClick={() => router.push(`/posts/${post.id}`)}
                  className="w-full bg-brand-main text-[#333] py-[8px] text-14-m rounded-[15px]"
              >
                {formatDate(post.application_date)} 지원
              </button>
            </div>
        ) : (
            // 작성 탭
            <>
              {activeSubTab === '진행중' && (
                  <div className="mt-[12px]">
                    <button
                        onClick={() =>
                            router.push(`/posts/${post.id}?tab=applicants`)
                        }
                        className="w-full bg-brand-main text-[#333] py-[8px] text-14-m rounded-[15px]"
                    >
                      지원자 <span className={'text-14-b'}>{post.applicant_count || 0}</span>
                    </button>
                  </div>
              )}

              {activeSubTab === '종료' && (
                  <div className="mt-[12px]">
                    <button
                        // 작성 페이지로 이동 (재업로드)
                        onClick={() => router.push('/volunteer/create')}
                        className="w-full bg-brand-point text-white py-[8px] text-14-m rounded-[15px]"
                    >
                      재업로드
                    </button>
                  </div>
              )}
              {/*
              {activeSubTab === '완료' && (
                  <div className="mt-[12px]">
                    <div className="flex space-x-2">
                      <Link
                          href={`/posts/${post.id}`}
                          className="flex-1 bg-gray-100 text-gray-600 py-2 px-4 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors text-center"
                      >
                        상세보기
                      </Link>
                    </div>
                  </div>
              )}*/}
            </>
        )}
      </div>
  );
};

export default MyPageCard;
