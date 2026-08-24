"use client";

import { useState } from "react";
import { SHINJUKU_PLAN, SHINJUKU_PLANS, UENO_PLANS, type MembershipPlan } from "@/lib/plans";

function Yen({ value }: { value: string }) {
  return (
    <p className="text-2xl sm:text-3xl font-bold text-pilarim-bronze tracking-tight">
      {value}
      <span className="text-sm font-medium text-neutral-500 ml-1">円</span>
      <span className="text-[10px] text-neutral-400 ml-1">税抜</span>
    </p>
  );
}

function PlanCard({ plan }: { plan: MembershipPlan }) {
  return (
    <article className="bg-white rounded-3xl p-5 sm:p-7 border border-neutral-200 shadow-soft">
      <p className="text-xs tracking-[0.18em] text-neutral-400">{plan.nameEn}</p>
      <h3 className="text-base sm:text-lg font-bold text-pilarim-ink mt-0.5">{plan.name}</h3>
      <p className="text-sm font-medium text-pilarim-bronze mt-2">{plan.summary}</p>
      <p className="text-neutral-600 text-xs sm:text-sm leading-relaxed mt-2">{plan.description}</p>
      <div className="mt-5 grid grid-cols-1 sm:grid-cols-[auto_1fr_1fr] gap-3 items-stretch">
        <div className="flex items-center justify-center bg-pilarim-charcoal text-white text-xs font-bold rounded-2xl px-4 py-3 min-h-[72px]">
          通常価格
        </div>
        <div className="bg-pilarim-cream rounded-2xl px-4 py-3">
          <p className="text-xs text-neutral-500 mb-1">1ヶ月</p>
          <Yen value={plan.firstMonth} />
        </div>
        <div className="bg-pilarim-cream rounded-2xl px-4 py-3">
          <p className="text-xs text-neutral-500 mb-1">3ヶ月目以降</p>
          <Yen value={plan.fromThirdMonth} />
        </div>
      </div>
    </article>
  );
}

export function LPPrice() {
  const [store, setStore] = useState<"ueno" | "shinjuku">("ueno");

  return (
    <section id="price" className="py-16 sm:py-24 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <p className="text-center text-xs tracking-[0.28em] text-neutral-400 mb-2">
          PILARIM MENU PRICE
        </p>
        <h2 className="text-xl sm:text-3xl font-bold text-center text-pilarim-ink mb-8">
          料金プラン
        </h2>

        <div className="flex justify-center gap-2 mb-10">
          <button
            type="button"
            onClick={() => setStore("ueno")}
            className={`px-5 py-2 rounded-full text-sm font-semibold transition-colors ${
              store === "ueno"
                ? "bg-pilarim-bronze text-white"
                : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
            }`}
          >
            上野店
          </button>
          <button
            type="button"
            onClick={() => setStore("shinjuku")}
            className={`px-5 py-2 rounded-full text-sm font-semibold transition-colors ${
              store === "shinjuku"
                ? "bg-pilarim-bronze text-white"
                : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
            }`}
          >
            新宿店
          </button>
        </div>

        {store === "ueno" ? (
          <div className="space-y-5">
            <p className="text-center text-xs text-neutral-500 mb-2">
              上野店のピラティス受け放題は1回30分です
            </p>
            {UENO_PLANS.map((plan) => (
              <PlanCard key={plan.id} plan={plan} />
            ))}
          </div>
        ) : (
          <div className="space-y-5">
            <article className="bg-white rounded-3xl p-5 sm:p-7 border border-neutral-200 shadow-soft">
              <p className="text-xs tracking-[0.18em] text-neutral-400">{SHINJUKU_PLAN.nameEn}</p>
              <h3 className="text-base sm:text-lg font-bold text-pilarim-ink mt-0.5">
                {SHINJUKU_PLAN.name}
              </h3>
              <p className="text-sm font-medium text-pilarim-bronze mt-2">{SHINJUKU_PLAN.summary}</p>
              <p className="text-neutral-600 text-xs sm:text-sm leading-relaxed mt-2">
                {SHINJUKU_PLAN.description}
              </p>
              <div className="mt-5 grid grid-cols-1 sm:grid-cols-[auto_1fr] gap-3 items-stretch">
                <div className="flex items-center justify-center bg-pilarim-charcoal text-white text-xs font-bold rounded-2xl px-4 py-3 min-h-[72px]">
                  通常価格
                </div>
                <div className="bg-pilarim-cream rounded-2xl px-4 py-3">
                  <p className="text-xs text-neutral-500 mb-1">月額</p>
                  <Yen value={SHINJUKU_PLAN.monthly} />
                </div>
              </div>
            </article>
            {SHINJUKU_PLANS.map((plan) => (
              <PlanCard key={plan.id} plan={plan} />
            ))}
          </div>
        )}

        <div className="mt-6 grid grid-cols-2 gap-4 sm:gap-6">
          <div className="bg-pilarim-charcoal rounded-3xl py-8 sm:py-10 px-4 sm:px-6 text-center min-w-0">
            <p className="text-white/90 text-sm sm:text-base font-medium">初回体験</p>
            <p className="text-xl sm:text-2xl md:text-3xl font-bold text-white mt-2">3,000円</p>
            <p className="text-white/80 text-xs sm:text-sm mt-1">
              （税別）※オープニングキャンペーン中は0円
            </p>
          </div>
          <div className="bg-pilarim-charcoal rounded-3xl py-8 sm:py-10 px-4 sm:px-6 text-center min-w-0">
            <p className="text-white/90 text-sm sm:text-base font-medium">入会金</p>
            <p className="text-xl sm:text-2xl md:text-3xl font-bold text-white mt-2">15,000円</p>
            <p className="text-white/80 text-[10px] sm:text-xs mt-1">
              （税別）※オープニングキャンペーン中は無料
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
