import { MapPin, ExternalLink } from "lucide-react";

const STORES = [
  {
    id: "ebisu",
    name: "恵比寿店",
    address: "東京都渋谷区恵比寿西1-2-3 恵比寿プラザ 4F",
    access: "恵比寿駅 徒歩2分",
    hours: "10:00〜22:00（仮）",
    feature: "パーソナル中心",
    pilates: false,
    mapUrl: "https://www.google.com/maps/search/?api=1&query=恵比寿駅",
  },
  {
    id: "ueno",
    name: "上野店",
    address: "東京都台東区上野1-2-3 上野ビル 3F",
    access: "上野駅 徒歩3分",
    hours: "10:00〜22:00（仮）",
    feature: "マシンピラティス導入",
    pilates: true,
    mapUrl: "https://www.google.com/maps/search/?api=1&query=上野駅",
  },
  {
    id: "sakuragicho",
    name: "桜木町店",
    address: "神奈川県横浜市中区桜木町1-2-3 桜木町タワー 2F",
    access: "桜木町駅 徒歩1分",
    hours: "10:00〜21:00（仮）",
    feature: "マシンピラティス導入",
    pilates: true,
    mapUrl: "https://www.google.com/maps/search/?api=1&query=桜木町駅",
  },
  {
    id: "shinjuku",
    name: "新宿店",
    address: "東京都新宿区西新宿7-22-39",
    access: "新宿駅 徒歩5分",
    hours: "10:00〜22:00（仮）",
    feature: "マシンピラティス導入",
    pilates: true,
    mapUrl: "https://www.google.com/maps/search/?api=1&query=東京都新宿区西新宿7-22-39",
  },
];

export function Locations() {
  return (
    <section className="py-16 sm:py-24 bg-neutral-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <h2 className="text-xl sm:text-2xl font-bold text-center text-neutral-900 mb-12 sm:mb-16">
          店舗一覧
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {STORES.map((store) => (
            <div
              key={store.id}
              className="bg-white rounded-2xl p-6 shadow-soft border border-neutral-100"
            >
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                {store.name}
              </h3>
              {store.pilates ? (
                <span className="inline-block text-xs font-medium text-abody-teal bg-abody-teal/10 rounded-full px-3 py-1 mb-3">
                  マシンピラティスあり
                </span>
              ) : (
                <span className="inline-block text-xs text-neutral-500 mb-3">
                  ※パーソナル中心（ピラティスなし）
                </span>
              )}
              <div className="space-y-2 text-neutral-600 text-sm sm:text-base">
                <div className="flex gap-2">
                  <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-abody-teal" />
                  <span>{store.address}</span>
                </div>
                <p>{store.access}</p>
                <p className="text-neutral-500">{store.hours}</p>
                <p className="text-sm font-medium text-neutral-700">
                  {store.feature}
                </p>
              </div>
              <a
                href={store.mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-4 text-abody-teal font-medium text-sm hover:underline"
              >
                <ExternalLink className="w-4 h-4" />
                Googleマップで見る
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
