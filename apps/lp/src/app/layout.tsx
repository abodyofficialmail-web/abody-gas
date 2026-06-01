import type { Metadata, Viewport } from "next";
import { Noto_Sans_JP, Shippori_Mincho } from "next/font/google";
import Script from "next/script";
import { LPTopCampaignBar } from "@/components/lp/TopCampaignBar";
import { LPFixedCampaignBanner } from "@/components/lp/FixedCampaignBanner";
import "./globals.css";

const GTAG_ID = "AW-17030988109";

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

const siteOrigin = process.env.NEXT_PUBLIC_SITE_URL || "https://abodyl.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteOrigin),
  title: "ABODY｜受け放題パーソナルジム - 無意識で通う。気づいたら変わってる。",
  description: "パーソナルジム。恵比寿・上野・桜木町・新宿。",
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
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GTAG_ID}`}
          strategy="afterInteractive"
        />
        <Script id="gtag-config" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GTAG_ID}');
            function gtag_report_conversion(url) {
              var callback = function () {
                if (typeof(url) != 'undefined') {
                  window.location = url;
                }
              };
              if (window.gtag) {
                window.gtag('event', 'conversion', {
                  'send_to': '${GTAG_ID}/Mw3sCIT5rokcEM2Cgbk_',
                  'value': 1.0,
                  'currency': 'JPY',
                  'event_callback': callback
                });
              }
              return false;
            }
            function gtag_report_conversion_ueno(url) {
              var callback = function () {
                if (typeof(url) != 'undefined') {
                  window.location = url;
                }
              };
              gtag('event','conversion',{
                'send_to':'${GTAG_ID}/Mw3sCIT5rokcEM2Cgbk_',
                'value':1.0,
                'currency':'JPY',
                'event_callback':callback
              });
              return false;
            }
            function gtag_report_conversion_sakuragicho(url) {
              var callback = function () {
                if (typeof(url) != 'undefined') {
                  window.location = url;
                }
              };
              gtag('event','conversion',{
                'send_to':'${GTAG_ID}/QxeECNPHwYkcEM2Cgbk_',
                'value':1.0,
                'currency':'JPY',
                'event_callback':callback
              });
              return false;
            }
          `}
        </Script>
        <LPTopCampaignBar />
        <div className="page-shell abody-bg min-h-screen w-full flex justify-center">
          <div className="page-panel abody-card relative z-10 w-full md:max-w-[980px] md:shadow-xl md:rounded-2xl overflow-hidden bg-white md:bg-transparent">
            {children}
          </div>
        </div>
        <LPFixedCampaignBanner />
      </body>
    </html>
  );
}
