import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* 헤더 */}
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Move Togaether
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-md mx-auto">
            함께 움직이는 새로운 경험을 시작해보세요
          </p>
        </header>

        {/* 메인 콘텐츠 */}
        <main className="space-y-8">
          {/* 환영 카드 */}
          <Card className="max-w-md mx-auto">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">🎉 환영합니다!</CardTitle>
              <CardDescription>
                새로운 프로젝트가 성공적으로 설정되었습니다
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                <p>✅ Next.js 14 (App Router)</p>
                <p>✅ Tailwind CSS</p>
                <p>✅ shadcn/ui 컴포넌트</p>
                <p>✅ 모바일 우선 디자인</p>
              </div>
              <Button className="w-full" size="lg">
                시작하기
              </Button>
            </CardContent>
          </Card>

          {/* 기능 카드들 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  📱 모바일 우선
                </CardTitle>
                <CardDescription>
                  모든 디바이스에서 완벽한 경험을 제공합니다
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  🎨 현대적 UI
                </CardTitle>
                <CardDescription>
                  shadcn/ui로 아름다운 인터페이스를 구축합니다
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  🚀 빠른 성능
                </CardTitle>
                <CardDescription>
                  Next.js의 최적화된 성능을 활용합니다
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  🔧 확장 가능
                </CardTitle>
                <CardDescription>
                  Vercel과 Supabase로 쉽게 확장할 수 있습니다
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </main>

        {/* 푸터 */}
        <footer className="text-center mt-16 text-gray-500 dark:text-gray-400">
          <p className="text-sm">
            © 2024 Move Together. Next.js + Tailwind CSS + shadcn/ui로 구축됨
          </p>
        </footer>
      </div>
    </div>
  );
}
