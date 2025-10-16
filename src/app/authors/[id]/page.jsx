'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import moment from 'moment';
import { Button } from '@/components/ui/button';
import PostTimeline from '@/components/PostTimeline';
import {IconChannelInstagram, IconChannelKakaoTalk, IconChannelNaverCafe} from "@/components/icon/IconChannel";

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

  const channelButton = [
    { label: '인스타그램', icon: <IconChannelInstagram />, href: '/' },
    { label: '네이버 카페', icon: <IconChannelNaverCafe />, href: '/' },
    { label: '카카오톡 채널', icon: <IconChannelKakaoTalk />, href: '/' },
  ];

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
      <div className="w-full">
        <div className="h-[78px] px-[30px] flex items-center">
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
        <div className="flex items-center gap-[18px] px-[30px] mb-[40px]">
          <div className="relative w-[70px] h-[70px] flex-shrink-0 rounded-full overflow-hidden flex items-center justify-center">
            <img src={'/img/default_profile.jpg'} alt={'프로필 이미지'} className={'absolute top-1/2 left-1/2 w-full h-full -translate-x-1/2 -translate-y-1/2 object-cover'}/>
          </div>
          <div>
            <p className="text-18-b text-black mb-1">{author?.display_name || '익명'}</p>
            <p className="mb-[5px] text-14-l text-[#535353]">{author?.phone.replace(/(\d{3})(\d{3,4})(\d{4})/, "$1-$2-$3") || '연락처 없음'}</p>
            {/* 소개글 */}
            {author.bio && (
            <p className="text-12-r text-text-800 leading-relaxed whitespace-normal">
              {author.bio}
            </p>
            )}
          </div>
        </div>

        {/* 소셜 미디어 링크 */}
        {(author.instagram || author.naver_cafe || author.kakao_openchat) && (
            <div className="flex gap-x-[6px] px-[30px] mb-[23px]">
              {author.instagram && (
                  <button
                      onClick={() => window.open(author.instagram, '_blank')}
                      className="flex items-center justify-center px-[20px] py-[5px] rounded-[7px] bg-brand-bg border border-brand-yellow-dark text-12-m text-[#C3950B]"
                  >
                    <span className={'ml-[-4px] mr-[3px] inline-block w-[17px h-[17px]'}><IconChannelInstagram/></span>
                    인스타그램
                  </button>
              )}
              {author.naver_cafe && (
                  <button
                      onClick={() => window.open(author.naver_cafe, '_blank')}
                      className="flex items-center justify-center px-[20px] py-[5px] rounded-[7px] bg-brand-bg border border-brand-yellow-dark text-12-m text-[#C3950B]"
                  >
                   <span className={'ml-[-4px] mr-[3px] inline-block w-[17px h-[17px]'}><IconChannelNaverCafe/></span>
                     네이버 카페
                  </button>
        )}
        {author.kakao_openchat && (
            <button
                onClick={() => window.open(author.kakao_openchat, '_blank')}
                className="flex items-center justify-center px-[20px] py-[5px] rounded-[7px] bg-brand-bg border border-brand-yellow-dark text-12-m text-[#C3950B]"
            >
              <span className={'ml-[-4px] mr-[3px] inline-block w-[17px h-[17px]'}><IconChannelKakaoTalk/></span>
              카카오톡 채널
            </button>
        )}
            </div>
        )}
      </div>

      {/* 메인 콘텐츠 - 흰색 카드 */}
      <main className="w-full bg-white rounded-t-[30px] px-[30px] pt-6 pb-6 min-h-[calc(100vh-120px)]">
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
          <PostTimeline
            posts={activePosts}
            onPostClick={handlePostClick}
            emptyMessage={{
              title: '현재 모집 중인 게시물이 없습니다',
              description: '작성자가 새로운 게시물을 올리면 여기에 표시됩니다'
            }}
          />
        ) : (
          <PostTimeline
            posts={completedPosts}
            onPostClick={handlePostClick}
            emptyMessage={{
              title: '모집이 종료된 게시물이 없습니다',
              description: '완료된 봉사활동이 여기에 표시됩니다'
            }}
          />
        )}
      </main>
    </div>
  );
}
