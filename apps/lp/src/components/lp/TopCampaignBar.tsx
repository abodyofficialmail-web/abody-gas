"use client";

import { ShinjukuLineLink } from "@/components/lp/ShinjukuLineLink";

/** 常に表示するキャンペーンバナー（新宿店プレオープンのみ） */
export function LPTopCampaignBar() {
  return (
    <div className="sticky top-0 left-0 right-0 z-[100] bg-abody-teal text-white shadow-md">
      <ShinjukuLineLink
        className="block w-full py-2.5 px-4 text-center hover:bg-abody-teal-dark transition-colors"
        aria-label="新宿店プレオープンキャンペーンを見る"
      >
        <span className="text-sm sm:text-base font-bold">
          【新宿店のみ】プレオープンCP｜残り3枠｜初月980円｜入会金・初回体験0円
        </span>
      </ShinjukuLineLink>
    </div>
  );
}
