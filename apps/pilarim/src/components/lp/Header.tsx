"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { LINE_URL_BY_STORE, STORES } from "@/lib/constants";
import { CtaButton } from "@/components/lp/CtaButton";

const NAV = [
  { href: "/#why", label: "特徴" },
  { href: "/#program", label: "プログラム" },
  { href: "/#price", label: "料金" },
  { href: "/#faq", label: "よくある質問" },
];

export function LPHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-neutral-100">
      <div className="px-4 sm:px-6 flex items-center justify-between h-14 sm:h-16">
        <Link href="/" className="text-lg font-bold tracking-[0.22em] text-pilarim-ink">
          PILARIM
        </Link>
        <nav className="hidden md:flex items-center gap-5 lg:gap-6">
          {NAV.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-[13px] text-neutral-600 hover:text-pilarim-ink transition-colors"
            >
              {item.label}
            </a>
          ))}
          <CtaButton href="/#campaign" className="text-sm px-5 py-2.5">
            まずは無料体験へ
          </CtaButton>
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
        <div className="md:hidden border-t border-neutral-100 bg-white py-4 px-4 space-y-2">
          {NAV.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="block px-4 py-2 text-neutral-700"
              onClick={() => setMobileMenuOpen(false)}
            >
              {item.label}
            </a>
          ))}
          {STORES.map((s) => (
            <CtaButton
              key={s.id}
              href={LINE_URL_BY_STORE[s.id]}
              className="w-full py-3"
              onClick={() => setMobileMenuOpen(false)}
            >
              {s.name}で無料体験へ
            </CtaButton>
          ))}
        </div>
      )}
    </header>
  );
}
