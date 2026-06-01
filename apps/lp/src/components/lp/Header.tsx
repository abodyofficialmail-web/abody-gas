"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { LINE_URL } from "@/lib/constants";

const STORES = [
  { id: "ebisu", name: "恵比寿店" },
  { id: "ueno", name: "上野店" },
  { id: "sakuragicho", name: "桜木町店" },
  { id: "shinjuku", name: "新宿店" },
];

export function LPHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedStore, setSelectedStore] = useState("ebisu");

  const handleLineClick = (url: string) => {
    const w = window as unknown as { gtag_report_conversion?: (u: string) => boolean };
    if (w.gtag_report_conversion) {
      w.gtag_report_conversion(url);
    } else {
      window.location.href = url;
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-neutral-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14 sm:h-16">
        <Link href="/" className="text-base font-semibold tracking-tight text-neutral-900">
          ABODY
        </Link>
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
          <a
            href={LINE_URL}
            onClick={(e) => {
              e.preventDefault();
              handleLineClick(LINE_URL);
              return false;
            }}
            className="text-sm font-medium px-4 py-2 rounded-2xl bg-abody-teal text-white shadow-soft hover:bg-abody-teal-dark transition-colors"
            aria-label="LINEで無料体験を予約"
          >
            体験無料
          </a>
        </nav>
        <button type="button" className="md:hidden p-2 text-neutral-600" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="メニュー">
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-neutral-100 bg-white py-4 px-4">
          <div className="space-y-2">
            <p className="text-xs text-neutral-500 mb-2">店舗を選択</p>
            {STORES.map((s) => (
              <button key={s.id} onClick={() => { setSelectedStore(s.id); setMobileMenuOpen(false); }} className={`block w-full text-left px-4 py-2 rounded-2xl ${selectedStore === s.id ? "bg-abody-teal/10 text-abody-teal font-medium" : "text-neutral-700"}`}>
                {s.name}
              </button>
            ))}
            <a
              href={LINE_URL}
              onClick={(e) => {
                e.preventDefault();
                setMobileMenuOpen(false);
                handleLineClick(LINE_URL);
                return false;
              }}
              className="block mt-4 text-center py-3 rounded-2xl bg-abody-teal text-white font-medium"
              aria-label="LINEで無料体験を予約"
            >
              体験無料
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
