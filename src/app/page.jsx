'use client';

import { useState } from 'react';
import Header from '../components/Header';
import MainBanner from '../components/MainBanner';
import SortOptions from '../components/SortOptions';
import PostCard from '../components/PostCard';
import Footer from '../components/Footer';
import BottomNavigation from '../components/BottomNavigation';

export default function Home() {
  const [sortOption, setSortOption] = useState('latest');

  // 목업 데이터 (실제로는 API에서 가져올 데이터)
  const mockPosts = [
    {
      id: 1,
      title: "서울에서 대구까지 입양 예정 강아지 호치의 이동봉사를 구합니다!",
      dogName: "호치",
      dogSize: "소형견",
      dogBreed: "믹스",
      departureAddress: "서울",
      arrivalAddress: "대구",
      deadline: "2024-10-31",
      images: ["/images/dog1.jpg", "/images/dog1-2.jpg"],
      status: "active"
    },
    {
      id: 2,
      title: "부산에서 광주까지 입양 예정 강아지 루시의 이동봉사를 구합니다!",
      dogName: "루시",
      dogSize: "중형견",
      dogBreed: "골든리트리버",
      departureAddress: "부산",
      arrivalAddress: "광주",
      deadline: "2024-11-15",
      images: ["/images/dog2.jpg"],
      status: "active"
    },
    {
      id: 3,
      title: "인천에서 대전까지 입양 예정 강아지 맥스의 이동봉사를 구합니다!",
      dogName: "맥스",
      dogSize: "대형견",
      dogBreed: "허스키",
      departureAddress: "인천",
      arrivalAddress: "대전",
      deadline: "2024-12-01",
      images: ["/images/dog3.jpg", "/images/dog3-2.jpg", "/images/dog3-3.jpg"],
      status: "active"
    },
    {
      id: 4,
      title: "울산에서 제주까지 입양 예정 강아지 벨라의 이동봉사를 구합니다!",
      dogName: "벨라",
      dogSize: "소형견",
      dogBreed: "포메라니안",
      departureAddress: "울산",
      arrivalAddress: "제주",
      deadline: "2024-10-20",
      images: ["/images/dog4.jpg"],
      status: "active"
    },
    {
      id: 5,
      title: "대구에서 부산까지 입양 예정 강아지 토비의 이동봉사를 구합니다!",
      dogName: "토비",
      dogSize: "중소형견",
      dogBreed: "비글",
      departureAddress: "대구",
      arrivalAddress: "부산",
      deadline: "2024-11-30",
      images: ["/images/dog5.jpg", "/images/dog5-2.jpg"],
      status: "active"
    },
    {
      id: 6,
      title: "광주에서 서울까지 입양 예정 강아지 코코의 이동봉사를 구합니다!",
      dogName: "코코",
      dogSize: "소형견",
      dogBreed: "치와와",
      departureAddress: "광주",
      arrivalAddress: "서울",
      deadline: "2024-12-15",
      images: ["/images/dog6.jpg"],
      status: "active"
    }
  ];

  const handleSortChange = (sortId) => {
    setSortOption(sortId);
    // 실제로는 정렬 로직 구현
    console.log('정렬 옵션 변경:', sortId);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <Header />

      {/* 메인 콘텐츠 */}
      <main className="w-full px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8 pb-24 lg:pb-8">
        {/* 메인 배너 */}
        <section className="mb-6 sm:mb-8 lg:mb-12">
          <MainBanner />
        </section>

        {/* 정렬 옵션 */}
        <section className="mb-6 sm:mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
            <SortOptions onSortChange={handleSortChange} />
          </div>
        </section>

        {/* 게시물 목록 */}
        <section>
          {/* <div className="mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2 text-center sm:text-left">
              진행 중인 봉사 요청
            </h2>
            <p className="text-gray-600 text-center sm:text-left">
              현재 {mockPosts.length}개의 봉사 요청이 진행 중입니다
            </p>
          </div> */}

          {/* 게시물 그리드 */}
          <div className="grid grid-cols-1 gap-4 sm:gap-6">
            {mockPosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>

          {/* 더보기 버튼 */}
          <div className="text-center mt-8 sm:mt-12">
            <button className="w-full sm:w-auto px-6 sm:px-8 py-3 border border-gray-300 text-gray-700 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-colors">
              더 많은 봉사 요청 보기
            </button>
          </div>
        </section>

        {/* 서비스 소개 */}
        <section className="mt-12 sm:mt-16">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sm:p-8 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4">
              Move Togaether는
            </h2>
            <p className="text-base sm:text-lg text-gray-600 leading-relaxed max-w-3xl mx-auto">
              입양 예정인 유기견들이 새로운 가족에게 안전하게 이동할 수 있도록
              봉사자와 보호소/개인 구조자를 연결하는 매칭 플랫폼입니다.
              <br className="hidden sm:block" />
              작은 도움이 큰 변화를 만듭니다. 함께 유기견들의 행복한 미래를 만들어가세요.
            </p>
          </div>
        </section>
      </main>

      {/* 푸터 (데스크톱에서만 표시) */}
      <div className="hidden lg:block">
        <Footer />
      </div>

      {/* 하단 네비게이션 (모바일에서만 표시) */}
      <BottomNavigation />
    </div>
  );
}
