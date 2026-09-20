"use client";

import Image from "next/image";
import {
  CAMPAIGN_FIRST_MONTH_SPECIAL,
  CAMPAIGN_IMAGE,
  CAMPAIGN_LIMIT,
  CAMPAIGN_TITLE,
} from "@/lib/campaign";

/** 常に下部に表示するキャンペーンバナー */
export function LPFixedCampaignBanner() {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] bg-white shadow-[0_-4px_24px_rgba(0,0,0,0.12)] border-t border-abody-teal/20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
          <a
            href="#campaign"
            className="flex-1 min-w-0 flex items-center gap-3 sm:gap-4 group"
            aria-label="ボディメイクキャンペーンを見る"
          >
            <div className="relative w-16 h-11 sm:w-20 sm:h-14 shrink-0 rounded-xl overflow-hidden flex-shrink-0 bg-neutral-100 flex items-center justify-center">
              <Image
                src={CAMPAIGN_IMAGE}
                alt=""
                fill
                className="object-contain object-center group-hover:scale-105 transition-transform duration-300"
                sizes="80px"
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm sm:text-base font-bold text-abody-teal">{CAMPAIGN_TITLE}</p>
              <p className="text-base sm:text-lg font-bold text-neutral-900">
                {CAMPAIGN_LIMIT} 初月{CAMPAIGN_FIRST_MONTH_SPECIAL}（税別）
              </p>
              <p className="text-sm text-neutral-600 mt-0.5">
                体験トレーニング・入会金<span className="font-bold text-abody-teal">無料</span>
              </p>
            </div>
          </a>
          <a
            href="#campaign"
            className="inline-flex items-center justify-center px-6 py-3 text-base font-bold rounded-xl bg-abody-teal text-white hover:bg-abody-teal-dark transition-colors text-center shrink-0"
            aria-label="キャンペーン予約する"
          >
            キャンペーン予約する
          </a>
        </div>
      </div>
    </div>
  );
}
