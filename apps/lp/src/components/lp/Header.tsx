"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { LINE_URL_BY_STORE } from "@/lib/constants";
import { CAMPAIGN_STORES } from "@/lib/campaign";
import { navigateToStoreLine } from "@/lib/googleAdsTracking";

export function LPHeader() {
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
              href="/trainers"
              onClick={() => setMobileMenuOpen(false)}
              className="block w-full text-left px-4 py-2 rounded-2xl text-neutral-700 font-medium"
            >
              トレーナー紹介
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
