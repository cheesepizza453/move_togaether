'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import moment from 'moment';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Calendar, Clock, User, Phone, Heart, MessageCircle, Users, X } from 'lucide-react';
import { toast } from 'sonner';
import { convertDogSize } from '@/lib/utils';
import IconRightArrow from "../../../../public/img/icon/IconRightArrow";
import IconHeart from "../../../../public/img/icon/IconHeart";

export default function AuthorDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const authorId = params.id;

  const [author, setAuthor] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('active');

  useEffect(() => {
    if (authorId) {
      fetchAuthorData();
    }
  }, [authorId]);

  const fetchAuthorData = async () => {
    try {
      setLoading(true);

      // 작성자 정보와 게시물을 함께 가져오기
      const response = await fetch(`/api/authors/${authorId}`);

      if (!response.ok) {
        if (response.status === 404) {
          setError('존재하지 않는 작성자입니다.');
        } else {
          setError('작성자 정보를 불러올 수 없습니다.');
        }
        return;
      }

      const data = await response.json();
      setAuthor(data.author);
      setPosts(data.posts || []);
    } catch (err) {
      console.error('작성자 정보 조회 중 오류:', err);
      setError('작성자 정보를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleCall = (phone) => {
    window.location.href = `tel:${phone}`;
  };

  const handleSMS = (phone) => {
    window.location.href = `sms:${phone}`;
  };

  const handlePostClick = (postId) => {
    router.push(`/posts/${postId}`);
  };

  const getDdayColor = (dday) => {
    if (dday <= 3) return 'bg-[#F36C5E]';
    if (dday <= 7) return 'bg-[#FF8C42]';
    return 'bg-[#FFD700]';
  };

  const getDdayText = (dday) => {
    if (dday < 0) return `D+${Math.abs(dday)}`;
    if (dday === 0) return 'D-Day';
    return `D-${dday}`;
  };


  const getButtonInfo = (post) => {
    if (post.status !== 'active') {
      return {
        text: '모집 완료',
        className: 'w-full bg-gray-400 text-white py-3 px-4 rounded-[20px] font-medium text-sm cursor-not-allowed',
        disabled: true
      };
    } else {
      return {
        text: '문의하기',
        className: 'w-full bg-[#FFE066] text-gray-900 py-3 px-4 rounded-[20px] font-medium text-sm hover:bg-[#FFD700] transition-colors',
        disabled: false
      };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">작성자 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => window.history.back()}>
            뒤로 가기
          </Button>
        </div>
      </div>
    );
  }

  if (!author) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">작성자를 찾을 수 없습니다.</p>
          <Button onClick={() => window.history.back()}>
            뒤로 가기
          </Button>
        </div>
      </div>
    );
  }

  const activePosts = posts.filter(post => post.status === 'active');
  const completedPosts = posts.filter(post => post.status !== 'active');

  return (
    <div className="min-h-screen bg-[#FFDB6F]">
      {/* 헤더 - 노란색 배경 */}
      <div className="w-full px-[30px] pt-[15px]">
        <div className="flex items-center pt-[30px] pb-[40px]">
          <button
            onClick={() => window.history.back()}
            className={'p-[12px] pl-0 outline-none focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:outline-none'}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="9" height="16" viewBox="0 0 9 16" fill="none">
              <path d="M8 15L1 8" stroke="black" strokeWidth="2" strokeMiterlimit="10"
                    strokeLinecap="round"/>
              <path d="M8 0.999999L1 8" stroke="black" strokeWidth="2" strokeMiterlimit="10"
                    strokeLinecap="round"/>
            </svg>
          </button>
          <h1 className="text-22-m text-black ml-4">
            보호자 정보
          </h1>
        </div>

        {/* 작성자 정보 */}
        <div className="flex items-center gap-[9px] mb-4">
          <div className="relative w-[56px] h-[56px] rounded-full overflow-hidden flex items-center justify-center">
            <img src={'/img/default_profile.jpg'} alt={'프로필 이미지'} className={'absolute top-1/2 left-1/2 w-full h-full -translate-x-1/2 -translate-y-1/2 object-cover'}/>
          </div>
          <div>
            <p className="text-18-b text-black mb-1">{author.display_name || '익명'}</p>
            <p className="text-14-l text-black/70">{author.phone || '연락처 없음'}</p>
          </div>
        </div>

        {/* 소개글 */}
        {author.bio && (
          <div className="mb-4">
            <p className="text-14-r text-black/80 leading-relaxed whitespace-pre-line">
              {author.bio}
            </p>
          </div>
        )}

        {/* 소셜 미디어 링크 */}
        {(author.instagram || author.naver_cafe || author.kakao_openchat) && (
          <div className="flex gap-2 mb-6">
            {author.instagram && (
              <button
                onClick={() => window.open(author.instagram, '_blank')}
                className="px-3 py-1 bg-white/80 text-black text-xs rounded-full border border-white/50 hover:bg-white transition-colors"
              >
                인스타그램
              </button>
            )}
            {author.naver_cafe && (
              <button
                onClick={() => window.open(author.naver_cafe, '_blank')}
                className="px-3 py-1 bg-white/80 text-black text-xs rounded-full border border-white/50 hover:bg-white transition-colors"
              >
                네이버 카페
              </button>
            )}
            {author.kakao_openchat && (
              <button
                onClick={() => window.open(author.kakao_openchat, '_blank')}
                className="px-3 py-1 bg-white/80 text-black text-xs rounded-full border border-white/50 hover:bg-white transition-colors"
              >
                카카오톡 채널
              </button>
            )}
          </div>
        )}
      </div>

      {/* 메인 콘텐츠 - 흰색 카드 */}
      <main className="w-full bg-[#F9F9F5] rounded-t-[30px] px-[30px] pt-6 pb-6 min-h-[calc(100vh-120px)]">
        {/* 섹션 제목 */}
        <h2 className="text-18-b text-black mb-4">
          도움을 기다리는 친구들 <span className="text-[#F36C5E]">{posts.length}</span>
        </h2>

        {/* 탭 메뉴 */}
        <div className="flex border-gray-200 mb-4">
          <button
            onClick={() => setActiveTab('active')}
            className={`py-3 text-center text-base relative mr-[10px] ${
              activeTab === 'active'
                ? 'font-black text-brand-icon'
                : 'font-medium text-[#8b8b8b]'
            }`}
          >
            모집중
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`py-3 text-center text-base relative ${
              activeTab === 'completed'
                ? 'font-black text-brand-icon'
                : 'font-medium text-[#8b8b8b]'
            }`}
          >
            모집종료
          </button>
        </div>

        {/* 콘텐츠 */}
        {activeTab === 'active' ? (
          activePosts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="text-gray-500 text-center mb-4">
                <p className="text-lg font-medium">현재 모집 중인 게시물이 없습니다</p>
                <p className="text-sm mt-2">작성자가 새로운 게시물을 올리면 여기에 표시됩니다</p>
              </div>
            </div>
          ) : (
            <div>
              {activePosts.map((post) => {
                const buttonInfo = getButtonInfo(post);
                return (
                  <div key={post.id} className="bg-white rounded-[30px] px-8 py-6 mb-6 shadow-sm border border-gray-100">
                    <div className="flex items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-gray-900 mb-2 line-clamp-2">
                          {post.title}
                        </h3>
                        <p className="text-xs text-gray-500 mb-3">
                          {post.dog_name} / {convertDogSize(post.dog_size)}
                        </p>
                      </div>

                      <div className="relative flex-shrink-0">
                        <div className="w-20 h-20 rounded-[20px] overflow-hidden bg-gray-100">
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

                        <div className={`absolute -top-3 -right-2 px-2 py-1 rounded-full text-xs font-bold text-white ${getDdayColor(post.dday)}`}>
                          {getDdayText(post.dday)}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4">
                      <button
                        onClick={() => handlePostClick(post.id)}
                        className={buttonInfo.className}
                        disabled={buttonInfo.disabled}
                      >
                        {buttonInfo.text}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        ) : (
          completedPosts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="text-gray-500 text-center mb-4">
                <p className="text-lg font-medium">모집이 종료된 게시물이 없습니다</p>
                <p className="text-sm mt-2">완료된 봉사활동이 여기에 표시됩니다</p>
              </div>
            </div>
          ) : (
            <div>
              {completedPosts.map((post) => {
                const buttonInfo = getButtonInfo(post);
                return (
                  <div key={post.id} className="bg-white rounded-[30px] px-8 py-6 mb-6 shadow-sm border border-gray-100">
                    <div className="flex items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-gray-900 mb-2 line-clamp-2">
                          {post.title}
                        </h3>
                        <p className="text-xs text-gray-500 mb-3">
                          {post.dog_name} / {convertDogSize(post.dog_size)}
                        </p>
                      </div>

                      <div className="relative flex-shrink-0">
                        <div className="w-20 h-20 rounded-[20px] overflow-hidden bg-gray-100">
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
                      </div>
                    </div>

                    <div className="mt-4">
                      <button
                        onClick={() => handlePostClick(post.id)}
                        className={buttonInfo.className}
                        disabled={buttonInfo.disabled}
                      >
                        {buttonInfo.text}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        )}
      </main>
    </div>
  );
}
