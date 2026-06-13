"use client";
import { LINE_URL_BY_STORE } from "@/lib/constants";
import { navigateToStoreLine } from "@/lib/googleAdsTracking";

/** プレオープンキャンペーンは新宿店のみ */
const SHINJUKU_CAMPAIGN_SLOTS = 3;

const REMAINING_SLOTS: Record<string, number | null> = {
  ebisu: null,
  ueno: null,
  sakuragicho: null,
  shinjuku: SHINJUKU_CAMPAIGN_SLOTS,
  fukuoka: null,
};

const STORES = [
  { id: "ebisu", name: "恵比寿店", buttonClass: "bg-blue-600 focus-visible:ring-blue-500 hover:bg-blue-700 text-white", hasLineLink: true },
  { id: "ueno", name: "上野店", buttonClass: "bg-green-600 focus-visible:ring-green-500 hover:bg-green-700 text-white", hasLineLink: true },
  { id: "sakuragicho", name: "桜木町店", buttonClass: "bg-amber-500 focus-visible:ring-amber-400 hover:bg-amber-600 text-neutral-900", hasLineLink: true },
  { id: "shinjuku", name: "新宿店", buttonClass: "bg-purple-600 focus-visible:ring-purple-500 hover:bg-purple-700 text-white", hasLineLink: true },
  { id: "fukuoka", name: "福岡店", buttonClass: "bg-rose-500 focus-visible:ring-rose-400 hover:bg-rose-600 text-white", hasLineLink: false },
] as const;

function LineButton({
  storeId,
  url,
  className,
  children,
}: {
  storeId: string;
  url: string;
  className: string;
  children: React.ReactNode;
}) {
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

export function LPCTASection() {
  const badges = [
    { label: "無料体験", aria: "無料体験" },
    { label: "所要1分", aria: "所要約1分" },
    { label: "LINE調整で安心", aria: "LINEで日程調整" },
  ];

  return (
    <section className="relative bg-emerald-50/60 py-10 md:py-14">
      <div className="mx-auto w-full max-w-[920px] px-4">
        <div className="bg-white ring-1 ring-black/5 border border-black/10 shadow-lg rounded-2xl p-6 md:p-8">
          <div className="flex flex-wrap gap-2 mb-3">
            {badges.map((b) => (
              <span
                key={b.label}
                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-100/80 text-emerald-800 border border-emerald-200/60"
                aria-label={b.aria}
              >
                {b.label}
              </span>
            ))}
          </div>
          <h2 className="text-xl md:text-2xl font-semibold text-neutral-900">まずは無料体験を予約</h2>
          <p className="text-sm md:text-base text-black/60 mt-2">
            カウンセリングと体験トレーニング合わせて60分
            <br />
            公式ラインご登録後、簡単に体験予約ができます！
          </p>

          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {STORES.map((store) => (
              <div key={store.id} className="flex flex-col items-center gap-2">
                {store.hasLineLink ? (
                  <LineButton
                    storeId={store.id}
                    url={LINE_URL_BY_STORE[store.id] ?? LINE_URL_BY_STORE.ebisu}
                    className={`w-full h-14 md:h-16 flex items-center justify-center rounded-xl font-semibold text-base shadow-md hover:shadow-lg focus-visible:ring-2 focus-visible:ring-offset-2 transition-all px-4 text-center ${store.buttonClass}`}
                  >
                    {store.name}の無料体験を予約
                  </LineButton>
                ) : (
                  <span className="w-full h-14 md:h-16 flex items-center justify-center rounded-xl font-semibold text-base px-4 text-center bg-neutral-100 text-neutral-400">
                    {store.name}（準備中）
                  </span>
                )}
                {REMAINING_SLOTS[store.id] != null ? (
                  <p className="text-xs font-medium text-purple-700">
                    プレオープンCP 残り{REMAINING_SLOTS[store.id]}枠（新宿店のみ）
                  </p>
                ) : store.hasLineLink ? (
                  <p className="text-xs text-neutral-400">※キャンペーン対象外</p>
                ) : (
                  <p className="text-xs text-neutral-400">公式LINEは準備中です</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
