import { MapPin } from "lucide-react";
import { LINE_URL, STUDIO } from "@/lib/constants";

export function LPLocations() {
  const hasLineLink = LINE_URL.startsWith("http");
  const href = hasLineLink ? LINE_URL : "#campaign";

  return (
    <section className="py-16 sm:py-24 bg-neutral-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <h2 className="text-base sm:text-lg font-bold text-center text-neutral-900 mb-10 sm:mb-12 tracking-wide">
          店舗詳細
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-1 gap-6 max-w-xl mx-auto">
          <div
            className="bg-white rounded-2xl p-6 shadow-soft border-2"
            style={{ borderColor: "#9AA6B2" }}
          >
            <h3 className="text-sm font-semibold text-neutral-900 mb-2">{STUDIO.name}</h3>
            <span className="inline-block text-xs font-medium text-pilarim-bronze bg-pilarim-bronze/10 rounded-full px-3 py-1 mb-3">
              マシンピラティス＋パーソナル受け放題
            </span>
            <div className="space-y-2 text-neutral-600 text-sm sm:text-base">
              <div className="flex gap-2">
                <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-pilarim-bronze" />
                <span>{STUDIO.address}</span>
              </div>
              <p>{STUDIO.access}</p>
              <p className="text-neutral-500">{STUDIO.hours}</p>
              <p className="text-sm font-medium text-neutral-700">{STUDIO.feature}</p>
            </div>
            <div className="mt-4 flex flex-col gap-2">
              <a
                href={href}
                {...(hasLineLink ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                className="block w-full py-3 rounded-2xl bg-pilarim-bronze text-white font-semibold text-sm text-center shadow-soft hover:bg-pilarim-bronze-dark transition-colors"
              >
                {STUDIO.name}で初回の無料体験をする
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
