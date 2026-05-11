'use client';

import ShareButton from "@/components/ui/shareButton";
import Image from "next/image";

const Banner1 = () => {
    return (
        <div className={'min-h-screen pt-[30px] bg-white flex items-center flex-col'}>
            <figure>
                <Image width={550} height={800} src={'/img/banner1_info.png'} alt={''}/>
            </figure>
            <ShareButton className={'mt-[30px] w-full flex items-center justify-center flex-1 px-[100px]'}/>
        </div>
    )
}
export default Banner1