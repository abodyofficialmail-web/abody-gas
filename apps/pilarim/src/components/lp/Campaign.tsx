import Image from "next/image";
import {
  CAMPAIGN_FIRST_MONTH_ORIGINAL,
  CAMPAIGN_FIRST_MONTH_PRICE,
  CAMPAIGN_IMAGE,
  CAMPAIGN_IMAGE_ALT,
  CAMPAIGN_LIMIT,
  CAMPAIGN_PERIOD,
  CAMPAIGN_SUBTITLE,
  CAMPAIGN_TITLE,
} from "@/lib/campaign";

export function LPCampaign() {
  return (
    <section id="campaign" className="py-12 sm:py-16 bg-pilarim-cream">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-2xl overflow-hidden shadow-soft border border-pilarim-bronze/20">
          <div className="flex justify-center items-center w-full bg-neutral-100">
            <div className="relative w-full max-w-[720px] aspect-[1024/535] mx-auto">
              <Image
                src={CAMPAIGN_IMAGE}
                alt={CAMPAIGN_IMAGE_ALT}
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, 720px"
                priority
              />
            </div>
          </div>
          <div className="p-6 sm:p-8 text-center">
            <p className="inline-block text-xs font-bold text-red-600 bg-red-50 border border-red-200 rounded-full px-3 py-1 mb-3">
              {CAMPAIGN_LIMIT}
            </p>
            <h2 className="text-base sm:text-lg font-bold text-neutral-900 mb-2 tracking-wide">
              {CAMPAIGN_TITLE}
            </h2>
            <p className="text-sm text-neutral-600 mb-6">{CAMPAIGN_SUBTITLE}</p>

            <div className="text-left max-w-lg mx-auto space-y-5 text-neutral-700 text-sm sm:text-base">
              <p>
                初月料金
                <span className="line-through text-neutral-400 mx-1">
                  {CAMPAIGN_FIRST_MONTH_ORIGINAL}
                </span>
                <span className="text-pilarim-bronze font-bold text-lg sm:text-xl">
                  → {CAMPAIGN_FIRST_MONTH_PRICE}（税別）
                </span>
              </p>

              <ul className="space-y-2 list-none">
                <li>
                  🎁{" "}
                  <span className="font-bold text-pilarim-bronze">体験トレーニング無料</span>
                </li>
                <li>
                  🎁 <span className="font-bold text-pilarim-bronze">入会金無料</span>
                </li>
              </ul>

              <p className="text-sm text-neutral-600">📅 キャンペーン期間：{CAMPAIGN_PERIOD}</p>

              <p className="text-neutral-600 text-xs sm:text-sm">
                ※先着順のため定員に達し次第終了となります。
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
