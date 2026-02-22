"use client";

import Link from "next/link";
import { LINE_URL_BY_STORE } from "@/lib/constants";

const STORES = [
  { id: "ebisu", name: "恵比寿店", buttonClass: "bg-blue-600 focus-visible:ring-blue-500 hover:bg-blue-700 text-white" },
  { id: "ueno", name: "上野店", buttonClass: "bg-green-600 focus-visible:ring-green-500 hover:bg-green-700 text-white" },
  { id: "sakuragicho", name: "桜木町店", buttonClass: "bg-amber-500 focus-visible:ring-amber-400 hover:bg-amber-600 text-neutral-900" },
] as const;

export function LPCTASection() {
  const badges = [
    { label: "無料体験", aria: "無料体験" },
    { label: "所要1分", aria: "所要約1分" },
    { label: "LINE調整で安心", aria: "LINEで日程調整" },
  ];

  return (
    <section className="relative bg-emerald-50/60 py-10 md:py-14">
      <div className="mx-auto w-full max-w-[920px] px-4">
        <div className="bg-white ring-1 ring-black/5 border border-black/10 shadow-lg rounded-2xl p-6 md:p-8">
          <div className="flex flex-wrap gap-2 mb-3">
            {badges.map((b) => (
              <span
                key={b.label}
                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-100/80 text-emerald-800 border border-emerald-200/60"
                aria-label={b.aria}
              >
                {b.label}
              </span>
            ))}
          </div>
          <h2 className="text-xl md:text-2xl font-semibold text-neutral-900">まずは無料体験を予約</h2>
          <p className="text-sm md:text-base text-black/60 mt-2">
            1分で完了。送信後にLINEで日程を調整します。
          </p>

          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {STORES.map((store) => (
              <Link
                key={store.id}
                href={LINE_URL_BY_STORE[store.id] ?? LINE_URL_BY_STORE.ebisu}
                target="_blank"
                rel="noopener noreferrer"
                className={`h-14 md:h-16 flex items-center justify-center rounded-xl font-semibold text-base shadow-md hover:shadow-lg focus-visible:ring-2 focus-visible:ring-offset-2 transition-all px-4 text-center ${store.buttonClass}`}
              >
                {store.name}の無料体験を予約
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
