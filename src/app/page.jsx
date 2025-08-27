import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* 모바일 최적화된 컨테이너 */}
      <div className="min-h-screen px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-12">
        {/* 헤더 - 모바일에서 더 컴팩트하게 */}
        <header className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4 leading-tight">
            Move Togaether
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 dark:text-gray-300 max-w-sm sm:max-w-md lg:max-w-lg mx-auto leading-relaxed">
            함께 움직이는 새로운 경험을 시작해보세요
          </p>
        </header>

        {/* 메인 콘텐츠 - 모바일 우선 간격 */}
        <main className="space-y-6 sm:space-y-8 max-w-6xl mx-auto">
          {/* 환영 카드 - 모바일에서 더 큰 터치 영역 */}
          <Card className="w-full max-w-sm sm:max-w-md mx-auto shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-xl sm:text-2xl lg:text-3xl font-bold">
                🎉 환영합니다!
              </CardTitle>
              <CardDescription className="text-sm sm:text-base">
                새로운 프로젝트가 성공적으로 설정되었습니다
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pb-6">
              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-green-500">✅</span>
                  <span>Next.js 14 (App Router)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-500">✅</span>
                  <span>Tailwind CSS</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-500">✅</span>
                  <span>shadcn/ui 컴포넌트</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-500">✅</span>
                  <span>모바일 우선 디자인</span>
                </div>
              </div>
              <Button
                className="w-full h-12 sm:h-14 text-base sm:text-lg font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 active:scale-95"
                size="lg"
              >
                시작하기
              </Button>
            </CardContent>
          </Card>

          {/* 기능 카드들 - 모바일에서 세로 배치, 데스크톱에서 그리드 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <Card className="group hover:shadow-lg transition-all duration-300 active:scale-98 cursor-pointer">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg font-semibold group-hover:text-blue-600 transition-colors">
                  <span className="text-2xl sm:text-3xl">📱</span>
                  <span>모바일 우선</span>
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm leading-relaxed">
                  모든 디바이스에서 완벽한 경험을 제공합니다
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="group hover:shadow-lg transition-all duration-300 active:scale-98 cursor-pointer">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg font-semibold group-hover:text-purple-600 transition-colors">
                  <span className="text-2xl sm:text-3xl">🎨</span>
                  <span>현대적 UI</span>
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm leading-relaxed">
                  shadcn/ui로 아름다운 인터페이스를 구축합니다
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="group hover:shadow-lg transition-all duration-300 active:scale-98 cursor-pointer">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg font-semibold group-hover:text-green-600 transition-colors">
                  <span className="text-2xl sm:text-3xl">🚀</span>
                  <span>빠른 성능</span>
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm leading-relaxed">
                  Next.js의 최적화된 성능을 활용합니다
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="group hover:shadow-lg transition-all duration-300 active:scale-98 cursor-pointer">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg font-semibold group-hover:text-orange-600 transition-colors">
                  <span className="text-2xl sm:text-3xl">🔧</span>
                  <span>확장 가능</span>
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm leading-relaxed">
                  Vercel과 Supabase로 쉽게 확장할 수 있습니다
                </CardDescription>
              </CardHeader>
            </Card>
          </div>

          {/* 추가 모바일 최적화 섹션 */}
          <div className="mt-8 sm:mt-12">
            <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0 shadow-xl">
              <CardContent className="p-6 sm:p-8 text-center">
                <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">
                  🎯 모바일 최적화 완료!
                </h3>
                <p className="text-sm sm:text-base text-blue-100 mb-4 sm:mb-6 leading-relaxed">
                  터치 친화적인 인터페이스와 반응형 디자인으로<br className="hidden sm:block" />
                  모든 디바이스에서 완벽한 경험을 제공합니다
                </p>
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                  <Button
                    variant="secondary"
                    size="lg"
                    className="bg-white text-blue-600 hover:bg-gray-100 h-12 sm:h-14 text-base font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 active:scale-95"
                  >
                    더 알아보기
                  </Button>
                  <Button
                    size="lg"
                    className="bg-white/20 backdrop-blur-sm border-2 border-white text-white hover:bg-white hover:text-blue-600 h-12 sm:h-14 text-base font-semibold rounded-xl transition-all duration-200 active:scale-95 shadow-lg font-bold"
                  >
                    시작하기
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>

        {/* 푸터 - 모바일에서 더 컴팩트하게 */}
        <footer className="text-center mt-12 sm:mt-16 text-gray-500 dark:text-gray-400">
          <p className="text-xs sm:text-sm">
            © 2024 Move Togaether. Next.js + Tailwind CSS + shadcn/ui로 구축됨
          </p>
        </footer>
      </div>
    </div>
  );
}
