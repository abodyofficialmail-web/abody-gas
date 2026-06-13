"use client";

import Image from "next/image";
import { ShinjukuLineLink } from "@/components/lp/ShinjukuLineLink";

/** 常に下部に表示するキャンペーンバナー（新宿店プレオープンのみ） */
export function LPFixedCampaignBanner() {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] bg-white shadow-[0_-4px_24px_rgba(0,0,0,0.12)] border-t border-abody-teal/20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
          <ShinjukuLineLink
            className="flex-1 min-w-0 flex items-center gap-3 sm:gap-4 group"
            aria-label="新宿店プレオープンキャンペーンを見る"
          >
            <div className="relative w-16 h-11 sm:w-20 sm:h-14 shrink-0 rounded-xl overflow-hidden flex-shrink-0 bg-neutral-100 flex items-center justify-center">
              <Image
                src="/campaign.png"
                alt=""
                fill
                className="object-contain object-center group-hover:scale-105 transition-transform duration-300"
                sizes="80px"
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm sm:text-base font-bold text-abody-teal">新宿店のみ｜残り3枠</p>
              <p className="text-base sm:text-lg font-bold text-neutral-900">
                プレオープンCP 初月980円（税別）
              </p>
              <p className="text-sm text-neutral-600 mt-0.5">
                入会金・初回体験<span className="font-bold text-abody-teal">0円</span>
              </p>
            </div>
          </ShinjukuLineLink>
          <ShinjukuLineLink
            className="inline-flex items-center justify-center px-6 py-3 text-base font-bold rounded-xl bg-abody-teal text-white hover:bg-abody-teal-dark transition-colors text-center shrink-0"
            aria-label="新宿店で体験予約する"
          >
            新宿店で体験予約する
          </ShinjukuLineLink>
        </div>
      </div>
    </div>
  );
}
