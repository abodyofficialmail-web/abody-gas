"use client";

import { useRef, useEffect, useState } from "react";
import Image from "next/image";
import { Dumbbell, Laptop, Sparkles, Wind } from "lucide-react";

const PROGRAM_IMAGES = [
  { src: "/program-img-1.png", alt: "パーソナルトレーニングの様子" },
  { src: "/program-img-2.png", alt: "トレーニング風景" },
];

const STYLES = [
  {
    icon: Dumbbell,
    title: "週3回しっかりトレーニング",
    desc: "筋力アップ・脂肪燃焼・姿勢改善まで、受け放題だから効率よく結果を出すためのペース。現在の会員様は平均週3回パーソナルしています",
  },
  {
    icon: Laptop,
    title: "仕事や家事の隙間時間にオンライン1回店舗で2回",
    desc: "仕事や育児で時間が読めない方でもOK。店舗とオンラインを組み合わせることで、通えない日でも運動習慣をキープできます。",
  },
  {
    icon: Sparkles,
    title: "今日はピラティスで体幹や姿勢強化",
    desc: "筋トレだけでは作れない「しなやかな体」を作り、ケガ予防や疲労回復にもつながります。",
  },
  {
    icon: Wind,
    title: "調子が悪いからストレッチで整える",
    desc: "体調や疲労に合わせて、無理せず整える日も大切。可動域を広げることで、次のトレーニングの効果も上がります。",
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
        <h2 className={`text-base sm:text-lg font-bold text-center text-neutral-900 mb-8 sm:mb-10 tracking-wide ${inView ? "animate-fade-slide-up" : "opacity-0 translate-y-4"}`}>
          ABODYはこんな通い方ができる
        </h2>

        {/* 画像が横に開いて文章を reveal */}
        <div className="relative rounded-2xl overflow-hidden bg-neutral-50">
          {/* 文章（背面） */}
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
                <div className="w-12 h-12 shrink-0 rounded-2xl bg-abody-teal/10 flex items-center justify-center">
                  <Icon className="w-6 h-6 text-abody-teal" strokeWidth={1.5} />
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

          {/* 2枚の画像：斜めに分割して上に重ね、横に開いて文章を reveal */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-2xl">
            {/* 左画像：斜めにカット、横に開く */}
            <div
              className={`absolute top-0 left-0 bottom-0 right-1/2 overflow-hidden ${inView ? "animate-images-open-left" : ""}`}
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
            {/* 右画像：斜めにカット、横に開く */}
            <div
              className={`absolute top-0 left-1/2 right-0 bottom-0 overflow-hidden ${inView ? "animate-images-open-right" : ""}`}
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
