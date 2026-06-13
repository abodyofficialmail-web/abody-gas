"use client";

import Image from "next/image";
import { ShinjukuLineLink } from "@/components/lp/ShinjukuLineLink";

const CAMPAIGN_FIT: "contain" | "cover" = "contain";

export function LPCampaign() {
  return (
    <section className="py-12 sm:py-16 bg-abody-teal/5">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-2xl overflow-hidden shadow-soft border border-abody-teal/20">
          <div className="flex justify-center items-center w-full bg-neutral-100">
            <div className="relative w-full max-w-[720px] aspect-[16/9] mx-auto">
              <Image
                src="/campaign.png"
                alt="Abody新宿店 プレオープンキャンペーン 初月980円"
                fill
                className={CAMPAIGN_FIT === "contain" ? "object-contain" : "object-cover"}
                sizes="(max-width: 768px) 100vw, 720px"
                priority
              />
            </div>
          </div>
          <div className="p-6 sm:p-8 text-center">
            <p className="inline-block text-xs font-bold text-red-600 bg-red-50 border border-red-200 rounded-full px-3 py-1 mb-3">
              新宿店のみ実施中
            </p>
            <h2 className="text-base sm:text-lg font-bold text-neutral-900 mb-6 tracking-wide">
              新宿店 プレオープンキャンペーン
            </h2>

            <div className="text-left max-w-lg mx-auto space-y-5 text-neutral-700 text-sm sm:text-base">
              <p className="font-medium text-center sm:text-left">
                <span className="font-bold text-neutral-900">👑 残り3枠限定</span>
              </p>
              <p>
                通常<span className="font-semibold">28,000円</span>（税別）の受け放題パーソナルが
                <br />
                <span className="text-abody-teal font-bold text-lg sm:text-xl">初月980円（税別）</span>
                でご利用いただけます🔥
              </p>

              <hr className="border-neutral-200" />

              <p className="font-bold text-neutral-900">さらに、</p>
              <ul className="space-y-2 list-none">
                <li>🎁 <span className="font-bold text-abody-teal">入会金無料</span>（通常15,000円）</li>
                <li>🎁 <span className="font-bold text-abody-teal">初回体験トレーニング無料</span>（通常3,000円）</li>
              </ul>

              <hr className="border-neutral-200" />

              <p className="text-sm text-neutral-600">
                📍 新宿駅 徒歩5分／西新宿駅 徒歩4分
                <br />
                個室・マンツーマン・通い放題・LINEで簡単予約
              </p>

              <p className="text-neutral-600 text-xs sm:text-sm">
                ※キャンペーンは新宿店のみ。先着順のため定員に達し次第終了となります。
              </p>
            </div>

            <ShinjukuLineLink
              className="mt-8 inline-block px-6 py-3 rounded-2xl bg-abody-teal text-white font-semibold hover:bg-abody-teal-dark transition-colors"
              aria-label="新宿店でキャンペーン予約する"
            >
              新宿店でキャンペーン予約する
            </ShinjukuLineLink>
          </div>
        </div>
      </div>
    </section>
  );
}
