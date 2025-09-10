import moment from "moment";

const Footer = () => {
  const currentYear = moment().year();
  return (
    <footer className="block bg-gray-50 border-t border-gray-200">
      <div className="w-full px-4 sm:px-6 lg:px-8 pt-8 pb-24">
        {/* 서비스 소개 - 전체 row */}
        <div className="mb-8">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">
            Move Togaether
          </h3>
          <div className="max-w-4xl">
            <p className="text-gray-600 text-sm sm:text-base leading-relaxed mb-3">
              Move Togaether는 입양 예정인 유기견들이 새로운 가족에게 안전하게 이동할 수 있도록
              봉사자와 보호소/개인 구조자를 연결하는 매칭 플랫폼입니다.
            </p>
            <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
              작은 도움이 큰 변화를 만듭니다. 함께 유기견들의 행복한 미래를 만들어가세요.
            </p>
          </div>
        </div>

        {/* 빠른 링크와 연락처 - 2단 구조 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12">
          {/* 빠른 링크 */}
          <div className="space-y-4">
            <h3 className="text-base sm:text-lg font-semibold text-gray-800">
              빠른 링크
            </h3>
            <ul className="space-y-2">
              <li>
                <a href="/posts" className="text-gray-600 hover:text-blue-600 transition-colors text-sm">
                  봉사 요청 보기
                </a>
              </li>
              <li>
                <a href="/posts/new" className="text-gray-600 hover:text-blue-600 transition-colors text-sm">
                  봉사 요청 등록
                </a>
              </li>
              <li>
                <a href="/about" className="text-gray-600 hover:text-blue-600 transition-colors text-sm">
                  서비스 소개
                </a>
              </li>
              <li>
                <a href="/contact" className="text-gray-600 hover:text-blue-600 transition-colors text-sm">
                  문의하기
                </a>
              </li>
            </ul>
          </div>

          {/* 연락처 및 정보 */}
          <div className="space-y-4">
            <h3 className="text-base sm:text-lg font-semibold text-gray-800">
              연락처
            </h3>
            <div className="space-y-2 text-sm text-gray-600">
              <p>
                <span className="font-medium">고객센터:</span> 1588-0000
              </p>
              <p>
                <span className="font-medium">이메일:</span> support@movetogaether.com
              </p>
              <p>
                <span className="font-medium">운영시간:</span> 평일 09:00 - 18:00
              </p>
            </div>

            <div className="pt-2">
              <h4 className="font-medium text-gray-800 mb-3 text-sm">소셜 미디어</h4>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-blue-600 transition-colors">
                  <span className="sr-only">인스타그램</span>
                  📷
                </a>
                <a href="#" className="text-gray-400 hover:text-blue-600 transition-colors">
                  <span className="sr-only">네이버 카페</span>
                  🏠
                </a>
                <a href="#" className="text-gray-400 hover:text-blue-600 transition-colors">
                  <span className="sr-only">카카오톡</span>
                  💬
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* 구분선 */}
        <div className="border-t border-gray-200 mt-6 sm:mt-8 pt-6 sm:pt-8">
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
