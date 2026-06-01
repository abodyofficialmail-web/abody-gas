"use client";

import { useState } from "react";
import Image from "next/image";
import { CampaignStoreModal } from "@/components/lp/CampaignStoreModal";

const CAMPAIGN_FIT: "contain" | "cover" = "contain";

export function LPCampaign() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <section className="py-12 sm:py-16 bg-abody-teal/5">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="bg-white rounded-2xl overflow-hidden shadow-soft border border-abody-teal/20">
            <div className="flex justify-center items-center w-full bg-neutral-100">
              <div className="relative w-full max-w-[720px] aspect-[16/9] mx-auto">
                <Image
                  src="/campaign.png"
                  alt="ダイエットキャンペーン 通い放題パーソナルトレーニング"
                  fill
                  className={CAMPAIGN_FIT === "contain" ? "object-contain" : "object-cover"}
                  sizes="(max-width: 768px) 100vw, 720px"
                  priority
                />
              </div>
            </div>
            <div className="p-6 sm:p-8 text-center">
              <h2 className="text-base sm:text-lg font-bold text-neutral-900 mb-6 tracking-wide">キャンペーン</h2>

              <div className="text-left max-w-lg mx-auto space-y-5 text-neutral-700 text-sm sm:text-base">
                <p>
                  <span className="font-bold text-neutral-900">⏰ キャンペーン期間</span>
                  <br />
                  5/1（金）〜5/17（日）まで
                </p>
                <p className="font-medium">各店舗5名様限定のキャンペーン！</p>
                <p>
                  通常<span className="font-semibold">28,000円</span>のプランが
                  <br />
                  <span className="text-abody-teal font-bold text-lg sm:text-xl">
                    14,000円（税別）
                  </span>
                  でご利用可能に🔥
                </p>

                <hr className="border-neutral-200" />

                <p className="font-bold text-neutral-900">さらに、</p>
                <p>
                  <span className="font-bold">👑先着5名様限定で</span>
                  <br />
                  <span className="text-abody-teal font-bold">2ヶ月目も50%OFF（14,000円）🔥</span>
                </p>

                <hr className="border-neutral-200" />

                <p className="font-bold text-neutral-900">6名様以降の方は</p>
                <p>
                  <span className="mr-1">👉</span>
                  <span className="font-bold text-abody-teal">初月のみ50%OFF（14,000円）</span>
                </p>

                <hr className="border-neutral-200" />

                <p className="font-bold text-neutral-900">また、</p>
                <p>
                  🎁 初回体験トレーニングも無料（通常3,000円 → <span className="font-bold text-abody-teal">0円</span>）
                </p>

                <hr className="border-neutral-200" />

                <p className="text-neutral-600 text-xs sm:text-sm">
                  ※先着順のため、定員に達し次第終了となります。
                </p>
              </div>

              <button
                type="button"
                onClick={() => setModalOpen(true)}
                className="mt-8 inline-block px-6 py-3 rounded-2xl bg-abody-teal text-white font-semibold hover:bg-abody-teal-dark transition-colors"
              >
                キャンペーンを見る
              </button>
            </div>
          </div>
        </div>
      </section>
      <CampaignStoreModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}
