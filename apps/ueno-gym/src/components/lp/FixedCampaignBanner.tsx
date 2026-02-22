"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { X } from "lucide-react";
import { LINE_URL } from "@/lib/constants";

const STORES = [
  { id: "ebisu", name: "恵比寿店" },
  { id: "ueno", name: "上野店" },
  { id: "sakuragicho", name: "桜木町店" },
];

const BANNER_DISMISSED_KEY = "abody-campaign-banner-dismissed";

export function LPFixedCampaignBanner() {
  const [selectedStore, setSelectedStore] = useState("ebisu");
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined" && localStorage.getItem(BANNER_DISMISSED_KEY) === "true") {
      setVisible(false);
    }
  }, []);

  const handleClose = () => {
    setVisible(false);
    if (typeof window !== "undefined") {
      localStorage.setItem(BANNER_DISMISSED_KEY, "true");
    }
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-3 left-1/2 -translate-x-1/2 w-[calc(100%-24px)] md:max-w-[980px] z-50 bg-white shadow-[0_-4px_24px_rgba(0,0,0,0.12)] border border-abody-teal/20 rounded-2xl mx-3 md:mx-0">
      <div className="relative max-w-6xl mx-auto px-5 py-4 sm:py-5 pr-12 sm:pr-14">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <Link
            href={LINE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 min-w-0 flex items-center gap-3 sm:gap-4 group"
            aria-label="キャンペーンを見る"
          >
            <div className="relative w-20 h-14 sm:w-24 sm:h-16 shrink-0 rounded-xl overflow-hidden flex-shrink-0 bg-neutral-100 flex items-center justify-center">
              <Image
                src="/campaign.png"
                alt=""
                fill
                className="object-contain object-center group-hover:scale-105 transition-transform duration-300"
                sizes="96px"
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm sm:text-base font-bold text-abody-teal">今だけキャンペーン</p>
              <p className="text-base sm:text-lg font-bold text-neutral-900">受け放題パーソナル980円</p>
              <p className="text-sm text-neutral-600 mt-1">
                <span className="line-through">3,500円</span> → <span className="font-bold text-abody-teal">0円</span> 初回体験
              </p>
            </div>
          </Link>
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
            <Link
              href={LINE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-6 py-3 text-base font-bold rounded-xl bg-abody-teal text-white hover:bg-abody-teal-dark transition-colors text-center"
            >
              店舗を選択して初回体験の予約をする
            </Link>
          </div>
        </div>
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-2 right-2 p-1.5 rounded-full text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700 transition-colors"
          aria-label="バナーを閉じる"
        >
          <X className="w-5 h-5" strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}
