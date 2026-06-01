"use client";

import Link from "next/link";
import { LINE_URL } from "@/lib/constants";

/** 常に表示するキャンペーンバナー（閉じられない） */
export function LPTopCampaignBar() {
  return (
    <div className="sticky top-0 left-0 right-0 z-[100] bg-abody-teal text-white shadow-md">
      <Link
        href={LINE_URL}
        className="block w-full py-2.5 px-4 text-center hover:bg-abody-teal-dark transition-colors"
        aria-label="キャンペーンを見る"
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
      >
        <span className="text-sm sm:text-base font-bold">
          5/1〜5/17 ダイエットCP｜各店5名限定｜28,000円→14,000円（税別）｜初回体験0円
        </span>
      </Link>
    </div>
  );
}
