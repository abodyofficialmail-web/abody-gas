import { LINE_URL_BY_STORE, STORES } from "@/lib/constants";
import { CAMPAIGN_REMAINING_SLOTS } from "@/lib/campaign";

export function LPCTASection() {
  const badges = [
    { label: "無料体験", aria: "無料体験" },
    { label: "所要1分", aria: "所要約1分" },
    { label: "LINE調整で安心", aria: "LINEで日程調整" },
  ];

  return (
    <section className="relative bg-pilarim-cream py-10 md:py-14">
      <div className="mx-auto w-full max-w-[920px] px-4">
        <div className="bg-white ring-1 ring-black/5 border border-black/10 shadow-lg rounded-2xl p-6 md:p-8">
          <div className="flex flex-wrap gap-2 mb-3">
            {badges.map((b) => (
              <span
                key={b.label}
                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-neutral-100 text-neutral-700 border border-neutral-200"
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
            {STORES.map((store) => {
              const lineUrl = LINE_URL_BY_STORE[store.id];
              const hasLineLink = lineUrl.startsWith("http");
              const href = hasLineLink ? lineUrl : "#campaign";
              return (
                <div key={store.id} className="flex flex-col items-center gap-2">
                  <a
                    href={href}
                    {...(hasLineLink ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    className="w-full h-14 md:h-16 flex items-center justify-center rounded-xl font-semibold text-base shadow-md hover:shadow-lg focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-pilarim-bronze transition-all px-4 text-center bg-pilarim-bronze hover:bg-pilarim-bronze-dark text-white"
                  >
                    {store.name}の無料体験を予約
                  </a>
                  <p className="text-xs font-medium text-pilarim-bronze">
                    オープニングCP 残り{CAMPAIGN_REMAINING_SLOTS}名
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
