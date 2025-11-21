import IconLoading from "../../../public/img/icon/IconLoading";
import React from "react";

const Loading = ({text, className}) => {
    return (
        <div className="min-h-screen bg-white flex justify-center items-center">
            <div className={'w-full flex justify-center translate-y-[-50%] mt-[-86px]'}>
                <IconLoading text={text} className={className}/>
            </div>
        </div>
    )
}
export default Loading;