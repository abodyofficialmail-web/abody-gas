import Image from "next/image";
import { Repeat, Dumbbell, User } from "lucide-react";
import { CtaButton } from "@/components/lp/CtaButton";

const FEATURES = [
  { icon: Repeat, label: "ピラティス受け放題" },
  { icon: Dumbbell, label: "パーソナル受け放題" },
  { icon: User, label: "毎回マンツーマン" },
];

export function LPHero() {
  return (
    <section className="bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 pb-14 sm:pt-12 sm:pb-20">
        <div className="grid grid-cols-2 gap-2 sm:gap-3 rounded-2xl sm:rounded-3xl overflow-hidden mb-10">
          <div className="relative aspect-[4/5] sm:aspect-[4/3] md:aspect-[5/4]">
            <Image
              src="https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1400&q=80"
              alt="トレーナーと一緒に行うマシンピラティス"
              fill
              className="object-cover"
              priority
              sizes="50vw"
            />
          </div>
          <div className="relative aspect-[4/5] sm:aspect-[4/3] md:aspect-[5/4]">
            <Image
              src="https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=1400&q=80"
              alt="ダンベルを使ったパーソナルトレーニング"
              fill
              className="object-cover"
              priority
              sizes="50vw"
            />
          </div>
        </div>

        <div className="text-center max-w-3xl mx-auto">
          <p className="text-xs sm:text-sm tracking-wide text-neutral-500 mb-4">
            30代〜50代男性のための姿勢改善・運動習慣スタジオ
          </p>
          <h1 className="text-[1.65rem] sm:text-4xl md:text-[42px] font-bold text-pilarim-ink leading-[1.35] tracking-tight">
            ピラティスも、パーソナルも。
            <br />
            通い放題で、理想の体へ。
          </h1>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3">
            {FEATURES.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.label}
                  className="flex items-center justify-center gap-2 rounded-2xl border border-neutral-200 bg-white px-4 py-3 shadow-soft"
                >
                  <Icon className="w-4 h-4 text-pilarim-bronze" strokeWidth={1.8} />
                  <span className="text-sm font-medium text-pilarim-ink">{item.label}</span>
                </div>
              );
            })}
          </div>

          <CtaButton href="#campaign" className="mt-8 px-10 py-4 text-base shadow-soft">
            まずは無料体験
          </CtaButton>
        </div>
      </div>
    </section>
  );
}
