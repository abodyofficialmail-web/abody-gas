"use client";

import Image from "next/image";
import { LINE_URL_BY_STORE } from "@/lib/constants";
import { navigateToStoreLine } from "@/lib/googleAdsTracking";
import {
  CAMPAIGN_FIRST_MONTH_ORIGINAL,
  CAMPAIGN_FIRST_MONTH_PRICE,
  CAMPAIGN_IMAGE,
  CAMPAIGN_IMAGE_ALT,
  CAMPAIGN_LIMIT,
  CAMPAIGN_PERIOD,
  CAMPAIGN_REMAINING_SLOTS,
  CAMPAIGN_STORES,
  CAMPAIGN_SUBTITLE,
  CAMPAIGN_TITLE,
} from "@/lib/campaign";

function StoreLineButton({
  storeId,
  url,
  className,
  children,
}: {
  storeId: string;
  url: string;
  className: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={url}
      onClick={(e) => {
        e.preventDefault();
        navigateToStoreLine(storeId, url);
      }}
      className={className}
      data-store-id={storeId}
    >
      {children}
    </a>
  );
}

export function LPCampaign() {
  return (
    <section id="campaign" className="py-12 sm:py-16 bg-abody-teal/5">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-2xl overflow-hidden shadow-soft border border-abody-teal/20">
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
                <span className="text-abody-teal font-bold text-lg sm:text-xl">
                  → {CAMPAIGN_FIRST_MONTH_PRICE}（税別）
                </span>
              </p>

              <ul className="space-y-2 list-none">
                <li>🎁 <span className="font-bold text-abody-teal">体験トレーニング無料</span></li>
                <li>🎁 <span className="font-bold text-abody-teal">入会金無料</span></li>
              </ul>

              <p className="text-sm text-neutral-600">
                📅 キャンペーン期間：{CAMPAIGN_PERIOD}
              </p>

              <p className="text-neutral-600 text-xs sm:text-sm">
                ※先着順のため定員に達し次第終了となります。残り枠は店舗により異なります。
              </p>
            </div>

            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg mx-auto">
              {CAMPAIGN_STORES.map((store) => (
                <div key={store.id} className="flex flex-col gap-1">
                  <StoreLineButton
                    storeId={store.id}
                    url={LINE_URL_BY_STORE[store.id] ?? "#"}
                    className={`w-full py-3 rounded-2xl font-semibold text-sm transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 ${store.buttonClass}`}
                  >
                    {store.name}で予約する
                  </StoreLineButton>
                  <p className="text-xs text-neutral-500">
                    残り{CAMPAIGN_REMAINING_SLOTS[store.id]}名
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
