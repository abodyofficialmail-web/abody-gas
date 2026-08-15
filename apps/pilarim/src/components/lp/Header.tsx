"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { LINE_URL, LINE_URL_BY_STORE, STORES } from "@/lib/constants";
import { PilarimLogo } from "@/components/lp/PilarimLogo";

export function LPHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedStore, setSelectedStore] = useState<(typeof STORES)[number]["id"]>("ueno");
  const lineUrl = LINE_URL_BY_STORE[selectedStore] ?? LINE_URL;
  const hasLineLink = lineUrl.startsWith("http");
  const href = hasLineLink ? lineUrl : "#campaign";

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-neutral-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14 sm:h-16">
        <Link href="/" className="flex items-center" aria-label="PILARIM トップ">
          <PilarimLogo className="h-10 sm:h-12 w-auto" priority />
        </Link>
        <nav className="hidden md:flex items-center gap-4">
          <select
            value={selectedStore}
            onChange={(e) => setSelectedStore(e.target.value as typeof selectedStore)}
            className="text-sm text-neutral-600 bg-transparent border border-neutral-200 rounded-2xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pilarim-bronze/30"
          >
            {STORES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
          <a
            href={href}
            {...(hasLineLink ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            className="text-sm font-medium px-4 py-2 rounded-2xl bg-pilarim-bronze text-white shadow-soft hover:bg-pilarim-bronze-dark transition-colors"
            aria-label="LINEで無料体験を予約"
          >
            体験無料
          </a>
        </nav>
        <button
          type="button"
          className="md:hidden p-2 text-neutral-600"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="メニュー"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-neutral-100 bg-white py-4 px-4">
          <p className="text-xs text-neutral-500 mb-2">店舗を選択</p>
          {STORES.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => {
                setSelectedStore(s.id);
                setMobileMenuOpen(false);
              }}
              className={`block w-full text-left px-4 py-2 rounded-2xl ${
                selectedStore === s.id
                  ? "bg-pilarim-bronze/10 text-pilarim-bronze font-medium"
                  : "text-neutral-700"
              }`}
            >
              {s.name}
            </button>
          ))}
          <a
            href={href}
            {...(hasLineLink ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            className="block mt-4 text-center py-3 rounded-2xl bg-pilarim-bronze text-white font-medium"
            onClick={() => setMobileMenuOpen(false)}
          >
            体験無料
          </a>
        </div>
      )}
    </header>
  );
}
