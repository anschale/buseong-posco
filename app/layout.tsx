import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "천안 부성2구역 공동주택 포스코더샵 분양안내 | 관심고객 모집",
  description: "천안 부성2구역 공동주택 포스코더샵(가칭) 1,290세대 대단지 아파트 분양 정보, 관심고객 등록 및 청약 일정 안내.",
  keywords: ["천안 부성2구역", "부성동 포스코더샵", "천안 포스코더샵", "부성지구 분양", "관심고객등록", "천안 아파트 분양", "성성호수공원 아파트"],
  authors: [{ name: "부성동 포스코더샵 홍보센터" }],
  formatDetection: {
    telephone: true,
  },
  openGraph: {
    type: "website",
    title: "천안 부성2구역 공동주택 포스코더샵 분양안내",
    description: "성성호수공원 조망과 1호선 부성역 초역세권 프리미엄 대단지! 관심고객으로 등록해주시면 상세 청약 가이드를 즉시 발송해 드립니다.",
    url: "https://buseong-posco-45do.vercel.app",
    siteName: "천안 부성2구역 공동주택 포스코더샵 홍보관",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "부성동 포스코더샵 분양안내 조감도",
      },
    ],
    locale: "ko_KR",
  },
  other: {
    "naver-site-verification": "cbf372c55283e16bcf24b4065d0cda5522a230c4",
    "google-site-verification": "9XmRra7Kq0CcC4REp5MVLeArH4OjDVLdcH6KHXVOOtk",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full scroll-smooth">
      <head>
        {/* iOS 웹 클립 아이콘만 선언 (파비콘은 Next.js가 app/favicon.ico를 자동 로드) */}
        <link rel="apple-touch-icon" href="/apple-icon.png" />
      </head>
      <body className="min-h-full flex flex-col antialiased">
        {children}
      </body>
    </html>
  );
}
