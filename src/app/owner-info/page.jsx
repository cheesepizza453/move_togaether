import {IconChannelInstagram, IconChannelNaverCafe, IconChannelKakaoTalk} from "@/components/icon/IconChannel";
import PostCardInfo from "@/components/PostCardInfo";

const OwnerInfo = () => {
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
            dday: 1,
            created: '2025/10/10'
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
            dday: 11,
            isFavorite: true,
            created: '2025/10/10'
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
            dday: 20,
            created: '2025/10/10'
        }
    ];

    const channelButton = [
        { label: '인스타그램', icon: <IconChannelInstagram />, href: '/' },
        { label: '네이버 카페', icon: <IconChannelNaverCafe />, href: '/' },
        { label: '카카오톡 채널', icon: <IconChannelKakaoTalk />, href: '/' },
    ];
    return(
        <div className={'bg-brand-bg'}>
            <div className={'bg-brand-main px-[30px] pt-[23px] pb-[46px]'}>
                <div className={'flex items-center gap-x-[18px]'}>
                    <figure className={'relative shrink-0 w-[70px] h-[70px] rounded-full bg-brand-bg overflow-hidden shadow-[0_0_9px_0px_rgba(0,0,0,0.2)]'}>
                        <img src={'/img/default_profile.jpg'} className={'absolute top-1/2 left-1/2 w-full h-full -translate-x-1/2 -translate-y-1/2 object-cover'} alt={'profile'}/>
                    </figure>
                    <div>
                        <p><strong className={'name text-18-b'}>부천 000보호소</strong></p>
                        <p className={'phone mt-[4px] text-14-l text-[#535353]'}>010-0000-0000</p>
                        <p className={'desc mt-[6px] text-12-r text-[#535353] leading-[1.25]'}>50자 제한 필요 부천에 있는 00000 보호소입니다. 아이들이 행복을 찾을 수 있도록 도와주세요.</p>
                    </div>
                </div>
                <div className={'mt-[40px]'}>
                    <ul className="flex gap-x-[6px]">
                        {channelButton.map((item, index) => (
                            <li key={index}>
                                <a
                                    href={item.href}
                                    className="flex items-center justify-center gap-x-[6px] w-[111px] h-[24px] border border-brand-yellow-dark text-brand-yellow-dark bg-brand-bg rounded-[7px] text-12-m"
                                >
                                    <figure className="w-[17px] h-[17px]">
                                        {item.icon}
                                    </figure>
                                    {item.label}
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
            <div className={'bg-white rounded-t-[30px] pt-[45px] pb-[30px] px-[20px] mt-[-20px]'}>
                <p className={'relative inline-block text-16-m ml-[7px]'}>도움을 기다리는 친구들
                    <span
                        className={'absolute block bottom-[-6px] left-0 w-full h-[3px] bg-brand-point rounded-full'}>
                    </span>
                </p>
                <div className={'mt-[25px]'}>
                    <ul className={'flex flex-col space-y-[16px]'}>
                        {mockPosts.map((post) => (
                            <li key={post.id}>
                                <PostCardInfo post={post} />
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    )
}

export default OwnerInfo