import type { Metadata, Viewport } from "next";
import { Noto_Sans_JP, Shippori_Mincho } from "next/font/google";
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

export const metadata: Metadata = {
  title: "ABODY｜受け放題パーソナルジム - 無意識で通う。気づいたら変わってる。",
  description: "パーソナルジム。恵比寿・上野・桜木町。",
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
        <div className="sticky top-0 left-0 right-0 z-[100] py-1 px-2 text-center text-xs font-medium bg-emerald-200 text-emerald-900 border-b border-emerald-300">
          BOOKING: abody-ueno-gym
        </div>
        <div className="page-shell abody-bg min-h-screen w-full flex justify-center">
          <div className="page-panel abody-card relative z-10 w-full md:max-w-[980px] md:shadow-xl md:rounded-2xl overflow-hidden bg-white md:bg-transparent">
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
