import type { Metadata, Viewport } from "next";
import { Noto_Sans_JP, Shippori_Mincho } from "next/font/google";
import { LPTopCampaignBar } from "@/components/lp/TopCampaignBar";
import { LPFixedCampaignBanner } from "@/components/lp/FixedCampaignBanner";
import "./globals.css";

const notoSansJP = Noto_Sans_JP({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  variable: "--font-noto-sans-jp",
  display: "swap",
});

const shipporiMincho = Shippori_Mincho({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-shippori-mincho",
  display: "swap",
});

const siteOrigin = process.env.NEXT_PUBLIC_SITE_URL || "https://pilarim.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteOrigin),
  title: "PILARIM｜pilates studio x personal training",
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
    <html lang="ja" className={`${notoSansJP.variable} ${shipporiMincho.variable}`}>
      <body className="font-sans">
        <LPTopCampaignBar />
        <div className="page-shell pilarim-bg min-h-screen w-full flex justify-center">
          <div className="page-panel pilarim-card relative z-10 w-full md:max-w-[980px] md:shadow-xl md:rounded-2xl overflow-hidden bg-white md:bg-transparent">
            {children}
          </div>
        </div>
        <LPFixedCampaignBanner />
      </body>
    </html>
  );
}
