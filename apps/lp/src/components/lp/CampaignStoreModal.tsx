"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { LINE_URL_BY_STORE } from "@/lib/constants";
import { X } from "lucide-react";

function LineLinkModal({ storeId, url, className, children }: { storeId: string; url: string; className: string; children: React.ReactNode }) {
  return (
    <a
      href={url}
      onClick={(e) => {
        e.preventDefault();
        const w = window as unknown as { gtag_report_conversion?: (u: string) => boolean };
        if (w.gtag_report_conversion) {
          w.gtag_report_conversion(url);
        } else {
          window.location.href = url;
        }
        return false;
      }}
      className={className}
      data-store-id={storeId}
    >
      {children}
    </a>
  );
}

const STORES = [
  { id: "ebisu", name: "恵比寿店", lineUrl: LINE_URL_BY_STORE.ebisu, slotsLabel: "残り枠5名", buttonClass: "bg-blue-600 hover:bg-blue-700 text-white focus-visible:ring-blue-500" },
  { id: "ueno", name: "上野店", lineUrl: LINE_URL_BY_STORE.ueno, slotsLabel: "残り枠5名", buttonClass: "bg-green-600 hover:bg-green-700 text-white focus-visible:ring-green-500" },
  { id: "sakuragicho", name: "桜木町店", lineUrl: LINE_URL_BY_STORE.sakuragicho, slotsLabel: "残り枠5名", buttonClass: "bg-amber-500 hover:bg-amber-600 text-neutral-900 focus-visible:ring-amber-400" },
  { id: "shinjuku", name: "新宿店", lineUrl: LINE_URL_BY_STORE.shinjuku, slotsLabel: "残り枠5名", buttonClass: "bg-purple-600 hover:bg-purple-700 text-white focus-visible:ring-purple-500" },
] as const;

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export function CampaignStoreModal({ isOpen, onClose }: Props) {
  useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";
    window.scrollTo(0, 0);
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen || typeof document === "undefined") return null;

  const modal = (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="campaign-modal-title"
    >
      <div
        className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b border-neutral-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <h2 id="campaign-modal-title" className="text-lg font-bold text-neutral-900">
            店舗を選んでキャンペーン予約
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-abody-teal"
            aria-label="閉じる"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <p className="text-sm text-neutral-600">
            無料体験の残り枠は店舗により異なります。予約はLINEで完了します。
          </p>
          {STORES.map((store) => (
            <div
              key={store.id}
              className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-xl border border-neutral-200 bg-neutral-50/80"
            >
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-neutral-900">{store.name}</p>
                <p className="text-sm text-neutral-600 mt-0.5">{store.slotsLabel}</p>
              </div>
              <LineLinkModal
                storeId={store.id}
                url={store.lineUrl}
                className={`inline-flex items-center justify-center h-12 px-6 rounded-xl font-semibold transition-colors shrink-0 focus-visible:ring-2 focus-visible:ring-offset-2 ${store.buttonClass}`}
              >
                この店舗で予約
              </LineLinkModal>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
