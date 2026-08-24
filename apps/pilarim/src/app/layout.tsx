import type { Metadata, Viewport } from "next";
import { Noto_Sans_JP } from "next/font/google";
import "./globals.css";

const notoSansJP = Noto_Sans_JP({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-noto-sans-jp",
  display: "swap",
});

const siteOrigin = process.env.NEXT_PUBLIC_SITE_URL || "https://pilarim.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteOrigin),
  title: "PILARIM｜ピラティスも、パーソナルも。通い放題で、理想の体へ。",
  description:
    "30代〜50代男性向け。受け放題のマシンピラティスとパーソナルトレーニングで、姿勢改善・運動習慣・機能的なダイエットを両立するスタジオ。",
  alternates: {
    canonical: siteOrigin,
  },
  icons: {
    icon: "/favicon.svg",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" className={notoSansJP.variable}>
      <body className="font-sans">
        <div className="page-shell pilarim-bg min-h-screen w-full flex justify-center">
          <div className="page-panel pilarim-card relative z-10 w-full md:max-w-[980px] md:shadow-xl md:rounded-2xl overflow-hidden bg-white md:bg-transparent">
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
