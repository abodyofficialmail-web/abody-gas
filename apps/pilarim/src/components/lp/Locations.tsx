import { MapPin, ExternalLink } from "lucide-react";
import { LINE_URL_BY_STORE, STORES } from "@/lib/constants";
import { CtaButton } from "@/components/lp/CtaButton";

export function LPLocations() {
  return (
    <section className="py-16 sm:py-24 bg-neutral-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <h2 className="text-xl sm:text-3xl font-bold text-center text-pilarim-ink mb-10 sm:mb-12 tracking-wide">
          店舗詳細
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {STORES.map((store) => {
            const lineUrl = LINE_URL_BY_STORE[store.id];
            const hasLineLink = lineUrl.startsWith("http");
            const href = hasLineLink ? lineUrl : "#campaign";

            return (
              <div
                key={store.id}
                className="bg-white rounded-2xl p-6 shadow-soft border-2"
                style={{ borderColor: store.borderColor }}
              >
                <h3 className="text-sm font-semibold text-neutral-900 mb-2">{store.name}</h3>
                <span className="inline-block text-xs font-medium text-pilarim-bronze bg-pilarim-bronze/10 rounded-full px-3 py-1 mb-3">
                  {store.id === "ueno"
                    ? "ピラティス受け放題（1回30分）"
                    : "マンツーマン／ピラティス受け放題プランあり"}
                </span>
                <div className="space-y-2 text-neutral-600 text-sm sm:text-base">
                  <div className="flex gap-2">
                    <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-pilarim-bronze" />
                    <span>{store.address}</span>
                  </div>
                  <p>{store.access}</p>
                  <p className="text-neutral-500">{store.hours}</p>
                  <p className="text-sm font-medium text-neutral-700">{store.feature}</p>
                </div>
                <a
                  href={store.mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 mt-4 text-pilarim-bronze font-medium text-sm hover:underline"
                >
                  <ExternalLink className="w-4 h-4" />
                  Googleマップで見る
                </a>
                <div className="mt-4">
                  <CtaButton href={href} className="w-full py-3 text-sm shadow-soft">
                    {store.name}で初回の無料体験をする
                  </CtaButton>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
