"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LINE_URL, LINE_URL_BY_STORE } from "@/lib/constants";
import { CAMPAIGN_STORES } from "@/lib/campaign";
import { navigateToStoreLine } from "@/lib/googleAdsTracking";

const STORES = [
  { id: "ebisu", name: "恵比寿店" },
  { id: "ueno", name: "上野店" },
  { id: "sakuragicho", name: "桜木町店" },
  { id: "shinjuku", name: "新宿店" },
  { id: "fukuoka", name: "福岡店" },
];

export function LPHeader() {
  const pathname = usePathname();
  const isTrainers = pathname === "/trainers";

  return isTrainers ? <TrainersHeader /> : <HomeHeader />;
}

function HomeHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedStore, setSelectedStore] = useState("ebisu");
  const lineUrl = LINE_URL_BY_STORE[selectedStore] ?? LINE_URL;
  const hasLineLink = Boolean(LINE_URL_BY_STORE[selectedStore]);

  const handleLineClick = () => {
    if (!hasLineLink) return;
    navigateToStoreLine(selectedStore, lineUrl);
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-neutral-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14 sm:h-16">
        <div className="flex items-center gap-5">
          <Link href="/" className="text-base font-semibold tracking-tight text-neutral-900">
            ABODY
          </Link>
          <Link
            href="/trainers"
            className="hidden md:inline text-sm font-medium text-neutral-600 hover:text-abody-teal transition-colors"
          >
            トレーナー
          </Link>
        </div>
        <nav className="hidden md:flex items-center gap-6">
          <select
            value={selectedStore}
            onChange={(e) => setSelectedStore(e.target.value)}
            className="text-sm text-neutral-600 bg-transparent border border-neutral-200 rounded-2xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-abody-teal/30"
          >
            {STORES.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
          {hasLineLink ? (
            <a
              href={lineUrl}
              onClick={(e) => {
                e.preventDefault();
                handleLineClick();
              }}
              className="text-sm font-medium px-4 py-2 rounded-2xl bg-abody-teal text-white shadow-soft hover:bg-abody-teal-dark transition-colors"
              aria-label="LINEで無料体験を予約"
            >
              体験無料
            </a>
          ) : (
            <span className="text-sm font-medium px-4 py-2 rounded-2xl bg-neutral-100 text-neutral-400">
              準備中
            </span>
          )}
        </nav>
        <button
          type="button"
          className="md:hidden !w-auto !p-2 !bg-transparent !text-neutral-600"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="メニュー"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-neutral-100 bg-white py-4 px-4">
          <div className="space-y-2">
            <Link
              href="/trainers"
              onClick={() => setMobileMenuOpen(false)}
              className="block w-full text-left px-4 py-2 rounded-2xl text-neutral-700 font-medium"
            >
              トレーナー紹介
            </Link>
            <p className="text-xs text-neutral-500 mb-2">店舗を選択</p>
            {STORES.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => {
                  setSelectedStore(s.id);
                  setMobileMenuOpen(false);
                }}
                className={`block w-full !text-left !px-4 !py-2 !rounded-2xl !border-0 ${
                  selectedStore === s.id
                    ? "!bg-abody-teal/10 !text-abody-teal font-medium"
                    : "!bg-transparent !text-neutral-700"
                }`}
              >
                {s.name}
              </button>
            ))}
            {hasLineLink ? (
              <a
                href={lineUrl}
                onClick={(e) => {
                  e.preventDefault();
                  setMobileMenuOpen(false);
                  handleLineClick();
                  return false;
                }}
                className="block mt-4 text-center py-3 rounded-2xl bg-abody-teal text-white font-medium"
                aria-label="LINEで無料体験を予約"
              >
                体験無料
              </a>
            ) : (
              <p className="block mt-4 text-center py-3 rounded-2xl bg-neutral-100 text-neutral-400 font-medium">
                公式LINEは準備中です
              </p>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

function TrainersHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-neutral-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14 sm:h-16">
        <div className="flex items-center gap-5">
          <Link href="/" className="text-base font-semibold tracking-tight text-neutral-900">
            ABODY
          </Link>
          <Link
            href="/trainers"
            className="hidden md:inline text-sm font-medium text-neutral-600 hover:text-abody-teal transition-colors"
          >
            トレーナー
          </Link>
        </div>
        <nav className="hidden md:flex items-center gap-2">
          {CAMPAIGN_STORES.map((store) => (
            <StoreLineButton
              key={store.id}
              storeId={store.id}
              name={store.name}
              buttonClass={store.buttonClass}
              compact
            />
          ))}
        </nav>
        <button
          type="button"
          className="md:hidden !w-auto !p-2 !bg-transparent !text-neutral-600"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="メニュー"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-neutral-100 bg-white py-4 px-4">
          <div className="space-y-2">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block w-full text-left px-4 py-2 rounded-2xl text-neutral-700 font-medium"
            >
              トップへ
            </Link>
            <p className="text-xs text-neutral-500 pt-2">体験トレーニングの予約</p>
            {CAMPAIGN_STORES.map((store) => (
              <StoreLineButton
                key={store.id}
                storeId={store.id}
                name={store.name}
                buttonClass={store.buttonClass}
                onNavigate={() => setMobileMenuOpen(false)}
              />
            ))}
          </div>
        </div>
      )}
    </header>
  );
}

function StoreLineButton({
  storeId,
  name,
  buttonClass,
  compact,
  onNavigate,
}: {
  storeId: string;
  name: string;
  buttonClass: string;
  compact?: boolean;
  onNavigate?: () => void;
}) {
  const url = LINE_URL_BY_STORE[storeId];
  const label = `${name}で体験トレーニングの予約をする`;

  if (!url) {
    return (
      <span className="block w-full text-center py-3 rounded-2xl bg-neutral-100 text-neutral-400 font-medium text-sm">
        {name}は準備中
      </span>
    );
  }

  return (
    <a
      href={url}
      onClick={(e) => {
        e.preventDefault();
        onNavigate?.();
        navigateToStoreLine(storeId, url);
      }}
      className={`${
        compact
          ? "inline-flex items-center justify-center !w-auto px-3 py-2 text-xs"
          : "block w-full text-center px-4 py-3 text-sm"
      } rounded-2xl font-semibold shadow-soft transition-colors ${buttonClass}`}
      aria-label={label}
    >
      {compact ? name : label}
    </a>
  );
}
