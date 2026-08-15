"use client";

import { useRef, useEffect, useState } from "react";
import Image from "next/image";
import { PersonStanding, Dumbbell, Briefcase, Wind } from "lucide-react";

const PROGRAM_IMAGES = [
  {
    src: "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1200&q=80",
    alt: "マシンピラティスで体幹を整える様子",
  },
  {
    src: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=1200&q=80",
    alt: "パーソナルトレーニングの様子",
  },
];

const STYLES = [
  {
    icon: PersonStanding,
    title: "週3回ピラティスで姿勢を整える",
    desc: "デスクワークで固まった肩と腰を、マシンピラティスでリセット。猫背や巻き肩が、通うほど楽になっていきます。",
  },
  {
    icon: Dumbbell,
    title: "パーソナルで代謝と筋力を上げる",
    desc: "見た目だけ痩せない。動ける筋肉を残しながら脂肪を落とすので、リバウンドしにくい体になります。",
  },
  {
    icon: Briefcase,
    title: "仕事の前後30分で習慣化する",
    desc: "続かないのは意志の問題ではありません。短い枠を受け放題で回せるから、忙しい30代〜50代でも定着します。",
  },
  {
    icon: Wind,
    title: "調子が悪い日はストレッチで整える",
    desc: "無理に追い込む日ばかりではない。可動域を広げておくと、次のトレーニングの効果も上がります。",
  },
];

const CARD_CLASSES = [
  "animate-program-card-1",
  "animate-program-card-2",
  "animate-program-card-3",
  "animate-program-card-4",
];

export function LPProgram() {
  const ref = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) setInView(true);
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section ref={ref} className="py-16 sm:py-24 bg-white overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <h2
          className={`text-base sm:text-lg font-bold text-center text-neutral-900 mb-8 sm:mb-10 tracking-wide ${
            inView ? "animate-fade-slide-up" : "opacity-0 translate-y-4"
          }`}
        >
          PILARIMはこんな通い方ができる
        </h2>

        <div className="relative rounded-2xl overflow-hidden bg-neutral-50">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-6 sm:p-8 min-h-[320px] sm:min-h-[360px]">
            {STYLES.map((item, i) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className={`flex items-start gap-4 bg-white rounded-2xl p-6 shadow-soft border border-neutral-100 ${
                    inView ? CARD_CLASSES[i] ?? CARD_CLASSES[CARD_CLASSES.length - 1] : "opacity-0"
                  }`}
                >
                  <div className="w-12 h-12 shrink-0 rounded-2xl bg-pilarim-bronze/10 flex items-center justify-center">
                    <Icon className="w-6 h-6 text-pilarim-bronze" strokeWidth={1.5} />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-neutral-900 mb-2 leading-snug">
                      {item.title}
                    </h3>
                    <p className="text-neutral-600 text-xs sm:text-sm leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-2xl">
            <div
              className={`absolute top-0 left-0 bottom-0 right-1/2 overflow-hidden ${
                inView ? "animate-images-open-left" : ""
              }`}
              style={{ clipPath: "polygon(0 0, 55% 0, 45% 100%, 0 100%)" }}
            >
              <Image
                src={PROGRAM_IMAGES[0].src}
                alt={PROGRAM_IMAGES[0].alt}
                fill
                className="object-cover"
                style={{ objectPosition: "70% center" }}
                sizes="50vw"
              />
            </div>
            <div
              className={`absolute top-0 left-1/2 right-0 bottom-0 overflow-hidden ${
                inView ? "animate-images-open-right" : ""
              }`}
              style={{ clipPath: "polygon(55% 0, 100% 0, 100% 100%, 45% 100%)" }}
            >
              <Image
                src={PROGRAM_IMAGES[1].src}
                alt={PROGRAM_IMAGES[1].alt}
                fill
                className="object-cover"
                style={{ objectPosition: "30% center" }}
                sizes="50vw"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
