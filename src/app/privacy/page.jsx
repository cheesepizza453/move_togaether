
import React from "react";
import PrivacyText from "@/components/privacy/PrivacyText";

const PrivacyPage = () => {

  return (
    <div className="min-h-screen bg-white">
      {/* 헤더 */}
      <div className="bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center py-[28px] px-[30px]">
            <div>
              <h1 className="text-22-m text-black">개인정보 처리방침</h1>
            </div>
          </div>
        </div>
      </div>
      <PrivacyText/>
    </div>
  );
};

export default PrivacyPage;
