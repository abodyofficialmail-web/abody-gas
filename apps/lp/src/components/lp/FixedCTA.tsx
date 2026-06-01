"use client";

import { LINE_URL } from "@/lib/constants";

export function LPFixedCTA() {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 pb-safe bg-white/95 backdrop-blur border-t border-neutral-100 md:hidden">
      <a
        href={LINE_URL}
        onClick={(e) => {
          e.preventDefault();
          const w = window as unknown as { gtag_report_conversion?: (u: string) => boolean };
          if (w.gtag_report_conversion) {
            w.gtag_report_conversion(LINE_URL);
          } else {
            window.location.href = LINE_URL;
          }
          return false;
        }}
        className="block w-full py-3 text-sm rounded-2xl bg-abody-orange text-white font-semibold text-center shadow-soft hover:bg-abody-orange-dark transition-colors"
        aria-label="LINEで初回体験を予約"
      >
        初回体験はこちら
      </a>
    </div>
  );
}
