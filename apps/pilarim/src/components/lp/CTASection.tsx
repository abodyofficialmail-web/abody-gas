import { Check, Shirt, Bath, Footprints, Droplets } from "lucide-react";
import { LINE_URL_BY_STORE, STORES } from "@/lib/constants";
import { CAMPAIGN_FIRST_MONTH_PRICE } from "@/lib/campaign";
import { CtaButton } from "@/components/lp/CtaButton";

const PERKS = [
  { icon: Shirt, label: "ウェア貸し出し無料" },
  { icon: Bath, label: "タオル貸し出し無料" },
  { icon: Footprints, label: "シューズ貸し出し無料" },
  { icon: Droplets, label: "お水をご用意" },
];

export function LPCTASection() {
  return (
    <section id="campaign" className="bg-pilarim-charcoal text-white py-14 sm:py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 grid md:grid-cols-2 gap-10 items-center">
        <div>
          <p className="text-sm tracking-wide text-white/70 mb-3">期間限定</p>
          <h2 className="text-2xl sm:text-4xl font-bold leading-tight">
            まずは無料体験。
            <br />
            初月{CAMPAIGN_FIRST_MONTH_PRICE}
          </h2>
          <p className="mt-4 text-white/80 text-sm">体験トレーニング・入会金無料</p>
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {STORES.map((store) => (
              <CtaButton
                key={store.id}
                href={LINE_URL_BY_STORE[store.id]}
                className="h-14"
              >
                {store.name}で無料体験
              </CtaButton>
            ))}
          </div>
        </div>
        <div className="rounded-3xl border border-white/20 p-6 sm:p-8">
          <p className="font-semibold mb-5">無料体験でご用意するもの</p>
          <ul className="space-y-4">
            {PERKS.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.label} className="flex items-center gap-3 text-sm text-white/90">
                  <span className="w-9 h-9 rounded-xl border border-white/20 flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 text-pilarim-bronze" strokeWidth={1.8} />
                  </span>
                  <Check className="w-4 h-4 text-pilarim-bronze shrink-0" strokeWidth={2.4} />
                  {item.label}
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
