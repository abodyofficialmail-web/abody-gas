"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { LINE_URL } from "@/lib/constants";
import { PilarimLogo } from "@/components/lp/PilarimLogo";

export function LPHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const hasLineLink = LINE_URL.startsWith("http");

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-neutral-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14 sm:h-16">
        <Link href="/" className="flex items-center" aria-label="PILARIM トップ">
          <PilarimLogo className="h-10 sm:h-12 w-auto" priority />
        </Link>
        <nav className="hidden md:flex items-center gap-6">
          {hasLineLink ? (
            <a
              href={LINE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium px-4 py-2 rounded-2xl bg-pilarim-bronze text-white shadow-soft hover:bg-pilarim-bronze-dark transition-colors"
              aria-label="LINEで無料体験を予約"
            >
              体験無料
            </a>
          ) : (
            <a
              href="#campaign"
              className="text-sm font-medium px-4 py-2 rounded-2xl bg-pilarim-bronze text-white shadow-soft hover:bg-pilarim-bronze-dark transition-colors"
            >
              体験無料
            </a>
          )}
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
          {hasLineLink ? (
            <a
              href={LINE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-center py-3 rounded-2xl bg-pilarim-bronze text-white font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              体験無料
            </a>
          ) : (
            <a
              href="#campaign"
              className="block text-center py-3 rounded-2xl bg-pilarim-bronze text-white font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              体験無料
            </a>
          )}
        </div>
      )}
    </header>
  );
}
