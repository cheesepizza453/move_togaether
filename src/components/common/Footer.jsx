const Footer = () => {
  return (
    <footer className="block bg-gray-50 border-t border-gray-200">
      <div className="w-full px-4 pt-8 pb-[120px]">
        {/* 구분선 */}
        <div className="">
          <div className="flex flex-col justify-between items-center space-y-3">
            {/* 저작권 */}
            <div className="text-12-r text-gray-500 text-center">
              ©2025 Move Togaether. All rights reserved.
            </div>

            {/* 추가 링크 */}
            <div className="flex flex-wrap justify-center gap-4 text-10-r text-gray-500">
              <a href="/privacy" className="hover:text-gray-700 transition-colors">
                개인정보처리방침
              </a>
              <a href="/terms" className="hover:text-gray-700 transition-colors">
                이용약관
              </a>
              {/*<a href="/sitemap" className="hover:text-gray-700 transition-colors">*/}
              {/*  사이트맵*/}
              {/*</a>*/}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
