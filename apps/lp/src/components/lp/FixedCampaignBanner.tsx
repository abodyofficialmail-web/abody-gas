"use client";

import { useState } from "react";
import Image from "next/image";
import { LINE_URL, LINE_URL_BY_STORE } from "@/lib/constants";

const STORES = [
  { id: "ebisu", name: "恵比寿店" },
  { id: "ueno", name: "上野店" },
  { id: "sakuragicho", name: "桜木町店" },
  { id: "shinjuku", name: "新宿店" },
];

/** 常に下部に表示するキャンペーンバナー（閉じられない） */
export function LPFixedCampaignBanner() {
  const [selectedStore, setSelectedStore] = useState("ebisu");
  const lineUrl = LINE_URL_BY_STORE[selectedStore] ?? LINE_URL;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] bg-white shadow-[0_-4px_24px_rgba(0,0,0,0.12)] border-t border-abody-teal/20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
          <a
            href={lineUrl}
            onClick={(e) => {
              e.preventDefault();
              const w = window as unknown as { gtag_report_conversion?: (u: string) => boolean };
              if (w.gtag_report_conversion) {
                w.gtag_report_conversion(lineUrl);
              } else {
                window.location.href = lineUrl;
              }
              return false;
            }}
            className="flex-1 min-w-0 flex items-center gap-3 sm:gap-4 group"
            aria-label="キャンペーンを見る"
            data-store-id={selectedStore}
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
              <p className="text-sm sm:text-base font-bold text-abody-teal">5/1〜5/17｜各店5名限定</p>
              <p className="text-base sm:text-lg font-bold text-neutral-900">
                28,000円→14,000円（税別）ダイエットCP
              </p>
              <p className="text-sm text-neutral-600 mt-0.5">
                初回体験<span className="font-bold text-abody-teal">0円</span>
              </p>
            </div>
          </a>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <select
              value={selectedStore}
              onChange={(e) => setSelectedStore(e.target.value)}
              className="text-base bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-abody-teal/30"
            >
              {STORES.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
            <a
              href={lineUrl}
              onClick={(e) => {
                e.preventDefault();
                const w = window as unknown as { gtag_report_conversion?: (u: string) => boolean };
                if (w.gtag_report_conversion) {
                  w.gtag_report_conversion(lineUrl);
                } else {
                  window.location.href = lineUrl;
                }
                return false;
              }}
              className="inline-flex items-center justify-center px-6 py-3 text-base font-bold rounded-xl bg-abody-teal text-white hover:bg-abody-teal-dark transition-colors text-center"
              data-store-id={selectedStore}
            >
              店舗を選択して初回体験の予約をする
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
