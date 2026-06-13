"use client";

import Link from "next/link";
import { MapPin, ExternalLink } from "lucide-react";
import { LINE_URL_BY_STORE } from "@/lib/constants";
import { navigateToStoreLine } from "@/lib/googleAdsTracking";

function LineLink({ storeId, url, className, children }: { storeId: string; url: string; className: string; children: React.ReactNode }) {
  return (
    <a
      href={url}
      onClick={(e) => {
        e.preventDefault();
        navigateToStoreLine(storeId, url);
      }}
      className={className}
      data-store-id={storeId}
    >
      {children}
    </a>
  );
}

const STORES = [
  { id: "ebisu", name: "恵比寿店", borderColor: "#3b82f6", address: "東京都渋谷区恵比寿南1-14-9", access: "恵比寿駅 徒歩2分", hours: "9:00〜22:00", feature: "パーソナル中心", pilates: false, mapUrl: "https://www.google.com/maps/search/?api=1&query=東京都渋谷区恵比寿南1-14-9", hasPrivateRoomBooking: false, hasLineLink: true },
  { id: "ueno", name: "上野店", borderColor: "#22c55e", address: "東京都台東区台東4-31-5オリオンビル4F", access: "上野駅 徒歩3分", hours: "9:00〜22:00", feature: "マシンピラティス導入", pilates: true, mapUrl: "https://www.google.com/maps/search/?api=1&query=東京都台東区台東4-31-5", hasPrivateRoomBooking: true, hasLineLink: true },
  { id: "sakuragicho", name: "桜木町店", borderColor: "#eab308", address: "横浜市中区野毛町2-59パストラル野毛マリヤ201", access: "桜木町駅 徒歩1分", hours: "9:00〜22:00", feature: "マシンピラティス導入", pilates: true, mapUrl: "https://www.google.com/maps/search/?api=1&query=横浜市中区野毛町2-59パストラル野毛マリヤ201", hasPrivateRoomBooking: false, hasLineLink: true },
  { id: "shinjuku", name: "新宿店", borderColor: "#a855f7", address: "東京都新宿区西新宿7-22-39", access: "新宿駅 徒歩5分", hours: "9:00〜22:00", feature: "パーソナル中心", pilates: false, mapUrl: "https://www.google.com/maps/search/?api=1&query=東京都新宿区西新宿7-22-39", hasPrivateRoomBooking: false, hasLineLink: true },
  { id: "fukuoka", name: "福岡店", borderColor: "#f43f5e", address: "福岡市中央区大名2-11-15 Shin-Akasakamon 3F", access: "赤坂駅 徒歩2分", hours: "9:00〜22:00", feature: "パーソナル中心", pilates: false, mapUrl: "https://www.google.com/maps/search/?api=1&query=福岡市中央区大名2-11-15+Shin-Akasakamon", hasPrivateRoomBooking: false, hasLineLink: true },
];

export function LPLocations() {
  return (
    <section className="py-16 sm:py-24 bg-neutral-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <h2 className="text-base sm:text-lg font-bold text-center text-neutral-900 mb-10 sm:mb-12 tracking-wide">店舗詳細</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {STORES.map((store) => (
            <div key={store.id} className="bg-white rounded-2xl p-6 shadow-soft border-2" style={{ borderColor: store.borderColor }}>
              <h3 className="text-sm font-semibold text-neutral-900 mb-2">{store.name}</h3>
              {store.pilates ? <span className="inline-block text-xs font-medium text-abody-teal bg-abody-teal/10 rounded-full px-3 py-1 mb-3">マシンピラティスあり</span> : <span className="inline-block text-xs text-neutral-500 mb-3">※パーソナル中心（ピラティスなし）</span>}
              <div className="space-y-2 text-neutral-600 text-sm sm:text-base">
                <div className="flex gap-2"><MapPin className="w-4 h-4 mt-0.5 shrink-0 text-abody-teal" /><span>{store.address}</span></div>
                <p>{store.access}</p>
                <p className="text-neutral-500">{store.hours}</p>
                <p className="text-sm font-medium text-neutral-700">{store.feature}</p>
              </div>
              <a href={store.mapUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 mt-4 text-abody-teal font-medium text-sm hover:underline"><ExternalLink className="w-4 h-4" />Googleマップで見る</a>
              <div className="mt-4 flex flex-col gap-2">
                {store.hasLineLink ? (
                  <LineLink storeId={store.id} url={LINE_URL_BY_STORE[store.id] ?? "#"} className="block w-full py-3 rounded-2xl bg-abody-teal text-white font-semibold text-sm text-center shadow-soft hover:bg-abody-teal-dark transition-colors">{store.name}で初回の無料体験をする</LineLink>
                ) : (
                  <p className="block w-full py-3 rounded-2xl bg-neutral-100 text-neutral-500 font-semibold text-sm text-center">公式LINEは準備中です</p>
                )}
                {store.hasPrivateRoomBooking && (
                  <Link href="/booking" className="block w-full py-3 rounded-2xl border-2 border-green-600 text-green-700 font-semibold text-sm text-center hover:bg-green-50 transition-colors">上野店・個室利用の予約（会員）</Link>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
