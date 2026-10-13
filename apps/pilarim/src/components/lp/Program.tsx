import Image from "next/image";
import { Check } from "lucide-react";

function ProgramCard({
  kicker,
  title,
  image,
  alt,
  items,
}: {
  kicker: string;
  title: string;
  image: string;
  alt: string;
  items: string[];
}) {
  return (
    <article className="bg-white rounded-2xl sm:rounded-3xl overflow-hidden shadow-soft border border-neutral-100">
      <div className="bg-pilarim-charcoal text-white px-2 sm:px-5 py-2 sm:py-3 text-center">
        <p className="text-[9px] sm:text-sm font-semibold tracking-wide sm:tracking-[0.14em] leading-tight">
          <span className="block sm:inline">{kicker}</span>
          <span className="hidden sm:inline mx-1 font-normal text-white/70">|</span>
          <span className="block sm:inline font-medium">{title}</span>
        </p>
      </div>
      <div className="relative aspect-[16/10]">
        <Image
          src={image}
          alt={alt}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 50vw, 480px"
        />
      </div>
      <div className="p-2.5 sm:p-6 space-y-1.5 sm:space-y-3">
        {items.map((item) => (
          <p
            key={item}
            className="flex items-start gap-1 sm:gap-2 text-[10px] sm:text-sm text-neutral-700 leading-snug"
          >
            <Check className="w-3 h-3 sm:w-4 sm:h-4 text-pilarim-bronze shrink-0 mt-0.5" strokeWidth={2.4} />
            {item}
          </p>
        ))}
      </div>
    </article>
  );
}

export function LPProgram() {
  return (
    <section id="program" className="py-10 sm:py-24 bg-pilarim-cream">
      <div className="max-w-6xl mx-auto px-3 sm:px-6">
        <h2 className="text-base sm:text-3xl font-bold text-center text-pilarim-ink mb-5 sm:mb-14">
          その日のあなたに、最適な30分を。
        </h2>
        <div className="relative pb-2 sm:pb-10">
          <div className="grid grid-cols-2 gap-2 sm:gap-6">
            <ProgramCard
              kicker="PILATES"
              title="姿勢を整える"
              image="https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1200&q=80"
              alt="マシンピラティス"
              items={["猫背・巻き肩改善", "体幹強化", "疲れにくい体へ"]}
            />
            <ProgramCard
              kicker="PERSONAL TRAINING"
              title="体を鍛える"
              image="https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=1200&q=80"
              alt="パーソナルトレーニング"
              items={["お腹まわりを引き締める", "筋力・代謝アップ", "男らしいシルエットへ"]}
            />
          </div>
          <div className="mt-3 sm:mt-6 flex items-center justify-center gap-2 sm:gap-4">
            <svg
              viewBox="0 0 48 20"
              className="w-8 sm:w-14 h-4 sm:h-6 text-neutral-400"
              fill="none"
              aria-hidden
            >
              <path
                d="M2 2 C8 2 10 16 46 16"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
              <path d="M40 12 L46 16 L40 18" stroke="currentColor" strokeWidth="1.6" />
            </svg>
            <p className="text-[11px] sm:text-base font-medium text-pilarim-ink text-center leading-snug">
              どちらも受け放題。組み合わせは自由。
            </p>
            <svg
              viewBox="0 0 48 20"
              className="w-8 sm:w-14 h-4 sm:h-6 text-neutral-400"
              fill="none"
              aria-hidden
            >
              <path
                d="M46 2 C40 2 38 16 2 16"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
              <path d="M8 12 L2 16 L8 18" stroke="currentColor" strokeWidth="1.6" />
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}
