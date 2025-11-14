export default function Head() {
        return (
            <>
                    {/* Title */}
                    <title>무브투개더 - 함께 움직여 마음을 잇다</title>

                    {/* Basic SEO */}
                    <meta
                        name="description"
                        content="유기견이 새로운 삶을 향해 안전하게 이동할 수 있도록, 따뜻한 마음과 발걸음을 잇는 이동봉사 매칭 플랫폼입니다."
                    />
                    <meta
                        name="keywords"
                        content="유기견, 이동봉사, 매칭, 보호소, 입양, 봉사자, Move Togaether, 반려동물, 구조, 봉사활동"
                    />
                    <meta name="robots" content="index, follow" />
                    <meta name="author" content="Move Togaether Team" />
                    <meta name="creator" content="Move Togaether" />
                    <meta name="publisher" content="Move Togaether" />

                    {/* Viewport */}
                    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
                    <meta name="theme-color" content="#FFD700" />

                    {/* Format detection */}
                    <meta name="format-detection" content="telephone=no,address=no,email=no" />

                    {/* Canonical */}
                    <link rel="canonical" href="https://move-togaether.com" />

                    {/* Open Graph */}
                    <meta property="og:type" content="website" />
                    <meta property="og:locale" content="ko_KR" />
                    <meta property="og:url" content="https://move-togaether.com" />
                    <meta property="og:title" content="무브투개더 - 함께 움직여 마음을 잇다" />
                    <meta property="og:site_name" content="무브투개더" />
                    <meta
                        property="og:description"
                        content="유기견이 새로운 삶을 향해 안전하게 이동할 수 있도록, 따뜻한 마음과 발걸음을 잇는 이동봉사 매칭 플랫폼입니다."
                    />

                    {/* 카카오 */}
                    <meta property="og:image" content="https://move-togaether.com/img/og-image.jpg" />
                    <meta property="og:image:width" content="1200" />
                    <meta property="og:image:height" content="630" />

                    {/* Twitter */}
                    <meta name="twitter:card" content="summary_large_image" />
                    <meta name="twitter:title" content="무브투개더 - 함께 움직여 마음을 잇다" />
                    <meta
                        name="twitter:description"
                        content="유기견이 새로운 삶을 향해 안전하게 이동할 수 있도록, 따뜻한 마음과 발걸음을 잇는 이동봉사 매칭 플랫폼입니다."
                    />
                    <meta name="twitter:image" content="https://move-togaether.com/img/og-image.jpg" />

                    {/* Icons */}
                    <link rel="icon" href="/favicon.png" type="image/png" />
                    <link rel="icon" href="/favicon.ico" />
                    <link rel="apple-touch-icon" href="/apple-touch-icon.png" sizes="180x180" />

                    {/* Manifest */}
                    <link rel="manifest" href="/manifest.json" />
            </>
        );
}