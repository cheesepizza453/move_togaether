import IconLoading from "../../../public/img/icon/IconLoading";
import React from "react";

const Loading = () => {
    return (
        <div className="min-h-screen bg-white flex justify-center">
            <div className={'w-full flex justify-center pt-[24vh]'}>
                <IconLoading/>
            </div>
        </div>
    )
}
export default Loading;