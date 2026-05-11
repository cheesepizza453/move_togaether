

import React from "react";
import TermsText from "@/components/terms/TermsText";

const TermsPage = () => {

  return (
    <div className="min-h-screen bg-white">
      {/* 헤더 */}
      <div className="bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center py-[28px] px-[30px]">
            <div>
              <h1 className="text-22-m text-black">이용약관</h1>
            </div>
          </div>
        </div>
      </div>
      <TermsText/>
    </div>
  );
};

export default TermsPage;
