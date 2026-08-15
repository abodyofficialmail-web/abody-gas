import Image from "next/image";

const HERO_IMAGES = [
  {
    src: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=1600&q=80",
    alt: "パーソナルトレーニングで体を整える様子",
  },
  {
    src: "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1600&q=80",
    alt: "マシンピラティスで姿勢を整える様子",
  },
];

export function LPHero() {
  return (
    <section className="relative min-h-[70vh] sm:min-h-[75vh] flex flex-col">
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div
          className="absolute inset-0 bg-neutral-900"
          style={{ clipPath: "polygon(0 0, 55% 0, 45% 100%, 0 100%)" }}
        >
          <Image
            src={HERO_IMAGES[0].src}
            alt={HERO_IMAGES[0].alt}
            fill
            className="object-cover"
            style={{ objectPosition: "30% center" }}
            priority
            sizes="(max-width: 640px) 100vw, 980px"
          />
        </div>
        <div
          className="absolute inset-0 overflow-hidden bg-neutral-900"
          style={{ clipPath: "polygon(55% 0, 100% 0, 100% 100%, 45% 100%)" }}
        >
          <Image
            src={HERO_IMAGES[1].src}
            alt={HERO_IMAGES[1].alt}
            fill
            className="object-cover"
            style={{ objectPosition: "55% 25%" }}
            priority
            sizes="(max-width: 640px) 100vw, 980px"
          />
        </div>
        <div className="absolute inset-0 bg-black/25 z-[5]" />
      </div>
      <div className="relative z-20 flex flex-col justify-between min-h-[70vh] sm:min-h-[75vh] px-4 sm:px-6 py-6 sm:py-8">
        <h1 className="font-shippori tracking-wide text-left">
          <span className="inline-block text-sm sm:text-base md:text-lg font-semibold text-neutral-900 bg-white/95 px-2 py-1 shadow-soft mb-1 w-fit animate-fade-slide-up">
            姿勢が整えば、体は変わる。
          </span>
          <br />
          <span className="inline-block text-sm sm:text-base md:text-lg font-semibold text-neutral-900 bg-white/95 px-2 py-1 shadow-soft w-fit animate-fade-slide-up-delay">
            動ける体で、引き締める。
          </span>
        </h1>
        <div>
          <p className="text-xs sm:text-sm font-medium text-neutral-900 bg-white/90 px-3 py-1.5 max-w-max shadow-soft mb-2">
            30代〜50代男性のための姿勢改善・運動習慣スタジオ
          </p>
          <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-neutral-900 bg-white/95 px-5 py-3 max-w-max shadow-soft font-shippori tracking-wide">
            PILARIM 受け放題ピラティス＆パーソナル
          </p>
        </div>
      </div>
    </section>
  );
}
