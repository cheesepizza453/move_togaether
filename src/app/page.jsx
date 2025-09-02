'use client';

import { useState } from 'react';
import Header from '../components/common/Header';
import MainBanner from '../components/MainBanner';
import SortOptions from '../components/SortOptions';
import PostCard from '../components/PostCard';
import Footer from '../components/common/Footer';
import BottomNavigation from '../components/common/BottomNavigation';

export default function Home() {
  const [sortOption, setSortOption] = useState('latest');

  // 목업 데이터 (실제로는 API에서 가져올 데이터)
  const mockPosts = [
    {
      id: 1,
      title: "서울에서 대구까지 입양 예정 강아지 호치의 이동을 도와 주실 보호자 구합니다.",
      dogName: "호치",
      dogSize: "소형견",
      dogBreed: "믹스",
      departureAddress: "서울",
      arrivalAddress: "대구",
      deadline: "25/01/01",
      images: ["/images/dog1.jpg"],
      status: "active",
      dday: 3
    },
    {
      id: 2,
      title: "강아지 이동 봉사 구합니다.",
      dogName: "호치",
      dogSize: "소형견",
      dogBreed: "믹스",
      departureAddress: "서울",
      arrivalAddress: "대구",
      deadline: "25/01/01",
      images: ["/images/dog2.jpg"],
      status: "active",
      dday: 19,
      isFavorite: true
    },
    {
      id: 3,
      title: "시흥에서 남양주 또롱이의 안전한 이동을 도와주실 분을 간절히 기다리고 있습니다.",
      dogName: "호치",
      dogSize: "소형견",
      dogBreed: "믹스",
      departureAddress: "시흥",
      arrivalAddress: "남양주",
      deadline: "25/01/01",
      images: ["/images/dog3.jpg"],
      status: "active",
      dday: 80
    }
  ];

  const handleSortChange = (sortId) => {
    setSortOption(sortId);
    console.log('정렬 옵션 변경:', sortId);
  };

  return (
    <div className="min-h-screen bg-[#FBFBF7]">

      {/* 메인 콘텐츠 */}
      <main className="w-full bg-brand-bg px-[23px] pt-[15px]">
        {/* 메인 배너 */}
        <section className="mb-[27px]">
          <MainBanner />
        </section>

        {/* 정렬 옵션 */}
        <section className="mb-6">
          <SortOptions onSortChange={handleSortChange} />
        </section>

        {/* 게시물 목록 */}
        <section>
          <div className="space-y-[18px]">
            {mockPosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        </section>
      </main>

    </div>
  );
}
