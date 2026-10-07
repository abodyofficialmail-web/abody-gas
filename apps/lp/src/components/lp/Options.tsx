import { Shirt, Ticket, UtensilsCrossed, Waves } from "lucide-react";

const OPTIONS = [
  {
    name: "手ぶらプラン",
    description: "タオル・ウェア貸出",
    price: "3,300",
    icon: Shirt,
  },
  {
    name: "筋膜リリース",
    description: "20分",
    price: "3,300",
    icon: Waves,
  },
  {
    name: "食事パーソナル",
    description: "マンツーマン食事指導",
    price: "15,000",
    icon: UtensilsCrossed,
  },
  {
    name: "パーソナル回数券",
    description: "30分",
    price: "4,500",
    icon: Ticket,
  },
] as const;

export function LPOptions() {
  return (
    <div className="mt-8">
      <div className="mb-4 flex items-center gap-4">
        <span className="h-px flex-1 bg-neutral-200" aria-hidden />
        <h3 className="text-sm sm:text-base font-bold tracking-[0.25em] text-neutral-800">オプション</h3>
        <span className="h-px flex-1 bg-neutral-200" aria-hidden />
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {OPTIONS.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.name}
              className="flex items-center gap-3 rounded-2xl border border-[#d7e4ff] bg-white px-4 py-3.5 shadow-soft"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#eef4ff] text-[#2457e6]">
                <Icon className="h-5 w-5" aria-hidden />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-neutral-900">{item.name}</p>
                <p className="text-xs text-neutral-500">{item.description}</p>
              </div>
              <p className="shrink-0 text-right font-black leading-tight text-[#2457e6] tabular-nums">
                <span className="text-lg sm:text-xl">{item.price}</span>
                <span className="text-sm">円</span>
                <span className="block text-[10px] font-bold text-neutral-400">（税込）</span>
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
