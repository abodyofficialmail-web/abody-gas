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
                  alt="今だけキャンペーン 受け放題パーソナル980円"
                  fill
                  className={CAMPAIGN_FIT === "contain" ? "object-contain" : "object-cover"}
                  sizes="(max-width: 768px) 100vw, 720px"
                  priority
                />
              </div>
            </div>
            <div className="p-6 sm:p-8 text-center">
              <h2 className="text-base sm:text-lg font-bold text-neutral-900 mb-4 tracking-wide">キャンペーン</h2>
              <p className="text-neutral-600 mb-3 text-base sm:text-lg">通常3,500円の体験トレーニングが期間限定で0円</p>
              <p className="text-2xl sm:text-3xl font-bold text-abody-teal mb-6">
                <span className="line-through text-neutral-500 font-normal">3,500円</span>
                <span className="mx-2">→</span>
                <span>0円</span>
              </p>
              <p className="text-neutral-600 mb-6 text-sm">現在実施中のキャンペーンはLINEでご確認ください。</p>
              <button
                type="button"
                onClick={() => setModalOpen(true)}
                className="inline-block px-6 py-3 rounded-2xl bg-abody-teal text-white font-semibold hover:bg-abody-teal-dark transition-colors"
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
