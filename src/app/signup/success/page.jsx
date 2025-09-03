'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, CheckCircle, ArrowRight } from 'lucide-react';

const SignupSuccessPage = () => {
  const [email, setEmail] = useState('');
  const router = useRouter();

  // URL 파라미터에서 이메일 확인
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const emailParam = urlParams.get('email');
    if (emailParam) {
      setEmail(emailParam);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        {/* 성공 아이콘 */}
        <div className="mb-6">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
        </div>

        {/* 제목 */}
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          회원가입이 완료되었습니다!
        </h1>

        {/* 설명 */}
        <p className="text-gray-600 mb-6 leading-relaxed">
          무브투게더에 오신 것을 환영합니다!
          이제 이메일 인증을 완료하면 서비스를 이용할 수 있습니다.
        </p>

        {/* 이메일 인증 안내 */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-center mb-3">
            <Mail className="w-5 h-5 text-blue-500 mr-2" />
            <span className="text-blue-700 font-medium">이메일 인증이 필요합니다</span>
          </div>
          <p className="text-sm text-blue-600">
            {email ? `${email}로 인증 메일을 발송했습니다.` : '가입하신 이메일로 인증 메일을 발송했습니다.'}
          </p>
        </div>

        {/* 인증 단계 안내 */}
        <div className="space-y-3 mb-8">
          <div className="flex items-center text-sm text-gray-600">
            <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium mr-3">
              1
            </div>
            <span>이메일 수신함을 확인하세요</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium mr-3">
              2
            </div>
            <span>인증 링크를 클릭하세요</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium mr-3">
              3
            </div>
            <span>로그인하여 서비스를 이용하세요</span>
          </div>
        </div>

        {/* 액션 버튼 */}
        <div className="space-y-3">
          <Link
            href="/login"
            className="w-full inline-flex items-center justify-center bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors"
          >
            로그인하기
            <ArrowRight className="w-4 h-4 ml-2" />
          </Link>

          <Link
            href="/"
            className="w-full inline-flex items-center justify-center bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
          >
            홈으로 돌아가기
          </Link>
        </div>

        {/* 추가 안내 */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500 mb-2">
            이메일을 받지 못하셨나요?
          </p>
          <div className="text-xs text-gray-500 space-y-1">
            <p>• 스팸 메일함을 확인해보세요</p>
            <p>• 이메일 주소를 다시 한 번 확인해보세요</p>
            <p>• 문제가 지속되면 고객센터에 문의해주세요</p>
          </div>
        </div>

        {/* 고객센터 링크 */}
        <div className="mt-4">
          <Link
            href="/contact"
            className="text-blue-500 hover:text-blue-600 text-sm font-medium"
          >
            고객센터 문의하기
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SignupSuccessPage;
