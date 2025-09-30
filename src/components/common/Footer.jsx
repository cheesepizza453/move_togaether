import moment from "moment";

const Footer = () => {
  const currentYear = moment().year();
  return (
    <footer className="block bg-gray-50 border-t border-gray-200">
      <div className="w-full px-4 sm:px-6 lg:px-8 pt-8 pb-24">
        {/* 구분선 */}
        <div className="">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-3 sm:space-y-4 md:space-y-0">
            {/* 저작권 */}
            <div className="text-xs sm:text-sm text-gray-500 text-center md:text-left">
              © {currentYear} Move Togaether. All rights reserved.
            </div>

            {/* 추가 링크 */}
            <div className="flex flex-wrap justify-center md:justify-end gap-4 sm:gap-6 text-xs sm:text-sm text-gray-500">
              <a href="/privacy" className="hover:text-gray-700 transition-colors">
                개인정보처리방침
              </a>
              <a href="/terms" className="hover:text-gray-700 transition-colors">
                이용약관
              </a>
              <a href="/sitemap" className="hover:text-gray-700 transition-colors">
                사이트맵
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
