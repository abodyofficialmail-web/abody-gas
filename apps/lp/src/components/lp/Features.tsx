"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Dumbbell } from "lucide-react";

const PHOTOS = {
  training: "/features/training.png",
  stretch: "/features/stretch.jpg",
  pilates: "/features/pilates.png",
  continue: "/features/continue.png",
  continueLine: "/features/continue-line.jpg",
  continuePrivate: "/features/continue-private.jpg",
  continueBodycare: "/features/continue-bodycare.jpg",
  continuePlace: "/features/continue-place.jpg",
  continueSession: "/features/continue-session.jpg",
  continueKarte: "/features/continue-karte.jpg",
  goalMuscle: "/features/goal-muscle.jpg",
  goalFlexibility: "/features/goal-flexibility.jpg",
  goalPosture: "/features/goal-posture.jpg",
  goalDiet: "/features/goal-diet.jpg",
} as const;

const SERVICES = [
  {
    no: "01",
    title: "パーソナルトレーニング",
    photo: PHOTOS.training,
    alt: "パーソナルトレーニングの様子",
    objectPosition: "object-center",
    points: ["個室のプライベート空間", "毎回マンツーマン", "オリジナルメニュー"],
  },
  {
    no: "02",
    title: "パーソナルストレッチ",
    photo: PHOTOS.stretch,
    alt: "パーソナルストレッチの様子",
    objectPosition: "object-[center_32%]",
    points: ["調子が悪い日は、今日はストレッチ", "週2回トレーニング＋週1回ストレッチで機能性アップ"],
  },
  {
    no: "03",
    title: "マシンピラティス",
    photo: PHOTOS.pilates,
    alt: "マシンピラティスの様子",
    objectPosition: "object-center",
    points: ["マンツーマン or 少人数", "体幹強化", "姿勢改善", "膝・腰に負担なく鍛えることもできる"],
  },
] as const;

const CONTINUE_ITEMS = [
  { no: "01", title: "ラインで簡単予約&リマインド", points: ["ラインで簡単に予約できる", "通うタイミングを逃さない"] },
  { no: "02", title: "個室でマンツーマン", points: ["周りの目を気にせず集中できる", "毎回トレーナーがついてメニューを組む"] },
  { no: "03", title: "毎回届くセッション内容とアンケート", points: ["やったこと・感じたことがその場で残ります"] },
  { no: "04", title: "トレーナーからのフィードバック", points: ["自分の頑張りや成長を、毎回実感できます"] },
  { no: "05", title: "マイカルテで成長が見える", points: ["体型のビフォーアフターを確認できる", "重量の伸びを確認できる"] },
  { no: "06", title: "ピラティスやパーソナルストレッチも受け放題", points: ["柔軟性や体幹アップも同じ料金内", "調子に合わせてメニューを切り替えられる"] },
  { no: "07", title: "他店舗利用やオンラインセッションも可能", points: ["受け放題のマンツーマンはそのまま", "近くに行く日は、近くの店舗でセッション", "雨の日は自宅からオンラインに切り替えられる"] },
] as const;

const GOALS = [
  { photo: PHOTOS.goalMuscle, alt: "筋力トレーニングの様子", want: "バルクアップ、筋力アップするなら", plan: "パーソナルトレーニングメイン受け放題" },
  { photo: PHOTOS.goalFlexibility, alt: "ストレッチで体を整える様子", want: "筋力だけでなく、体を柔らかくしたい", plan: "パーソナルトレーニングとパーソナルストレッチで受け放題" },
  { photo: PHOTOS.goalPosture, alt: "ピラティスで姿勢を整える様子", want: "体幹も鍛えて姿勢改善したい", plan: "パーソナルトレーニングとピラティスで受け放題" },
  { photo: PHOTOS.goalDiet, alt: "食事とトレーニングで減量するイメージ", want: "減量・ダイエットしたい", plan: "トレーニングと食事パーソナルで受け放題", note: "無理なく減量して、リバウンドを防ぐ。" },
] as const;

function continuePhoto(no: string) {
  if (no === "01") return { src: PHOTOS.continueLine, alt: "LINEでかんたん予約の流れ", objectFit: "object-contain", className: "aspect-[16/9] rounded-3xl shadow-soft bg-white" };
  if (no === "02") return { src: PHOTOS.continuePrivate, alt: "個室でのマンツーマンセッション", objectFit: "object-cover", className: "aspect-[16/10] rounded-3xl shadow-soft" };
  if (no === "03") return { src: PHOTOS.continueSession, alt: "毎回届くセッション内容とアンケート", objectFit: "object-contain", className: "aspect-[16/9] rounded-3xl shadow-soft bg-white" };
  if (no === "05") return { src: PHOTOS.continueKarte, alt: "マイカルテで体重とセッション記録が見える", objectFit: "object-contain", className: "aspect-[16/9] rounded-3xl shadow-soft bg-white" };
  if (no === "06") return { src: PHOTOS.continueBodycare, alt: "ストレッチとピラティスも受け放題", objectFit: "object-contain", className: "aspect-[16/9] rounded-3xl shadow-soft bg-white" };
  if (no === "07") return { src: PHOTOS.continuePlace, alt: "店舗でも自宅でも受け放題のままトレーニングできる", objectFit: "object-contain", className: "aspect-[16/9] rounded-3xl shadow-soft bg-white" };
  return { src: PHOTOS.continue, alt: "継続を支えるサポートの様子", objectFit: "object-cover", className: "aspect-[16/10] rounded-3xl shadow-soft" };
}

function Frame({ align = "left", children }: { align?: "left" | "right"; children: React.ReactNode }) {
  const right = align === "right";
  return (
    <div className={`relative ${right ? "mb-2.5 ml-2.5" : "mb-2.5 mr-2.5"}`}>
      <div aria-hidden className={`absolute inset-0 rounded-[1.6rem] bg-gradient-to-br from-abody-teal to-[#07332f] ${right ? "-translate-x-2 translate-y-2" : "translate-x-2 translate-y-2"}`} />
      <div aria-hidden className={`pointer-events-none absolute h-28 w-28 rounded-full bg-abody-teal/25 blur-2xl ${right ? "-left-8 top-6" : "-right-8 top-6"}`} />
      <div className="relative">{children}</div>
    </div>
  );
}

function Photo({
  src, alt, className = "", overlayNo, overlayTitle, objectFit = "object-cover", objectPosition = "object-center",
}: {
  src: string; alt: string; className?: string; overlayNo?: string; overlayTitle?: string; objectFit?: string; objectPosition?: string;
}) {
  return (
    <div className={`relative overflow-hidden bg-neutral-200 ${className}`}>
      <Image src={src} alt={alt} fill className={`${objectFit} ${objectPosition}`} sizes="(max-width: 768px) 100vw, 560px" />
      {overlayTitle && <div className="absolute inset-0 bg-gradient-to-t from-[#07332f]/90 via-[#07332f]/25 to-transparent" />}
      {overlayTitle && (
        <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6">
          {overlayNo && <p className="text-abody-teal font-bold text-sm mb-1">{overlayNo}</p>}
          <h3 className="text-white text-xl sm:text-2xl font-bold leading-snug drop-shadow">{overlayTitle}</h3>
        </div>
      )}
    </div>
  );
}

function ContinueCarousel() {
  const scroller = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const total = CONTINUE_ITEMS.length;

  const go = (next: number) => {
    const el = scroller.current;
    if (!el) return;
    const i = (next + total) % total;
    el.scrollTo({ left: i * el.clientWidth, behavior: "smooth" });
    setIndex(i);
  };

  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    const onScroll = () => {
      setIndex(Math.min(total - 1, Math.max(0, Math.round(el.scrollLeft / Math.max(el.clientWidth, 1)))));
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [total]);

  return (
    <div className="relative">
      <div ref={scroller} className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide">
        {CONTINUE_ITEMS.map((item) => {
          const photo = continuePhoto(item.no);
          return (
            <article key={item.title} className="flex-[0_0_100%] snap-center px-1">
              <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
                <Frame>
                  <Photo src={photo.src} alt={photo.alt} objectFit={photo.objectFit} className={photo.className} />
                </Frame>
                <div>
                  <p className="text-abody-teal font-bold text-sm mb-2">{item.no}</p>
                  <h3 className="text-xl sm:text-2xl font-bold text-neutral-900 mb-5">{item.title}</h3>
                  <ul className="space-y-3">
                    {item.points.map((point) => (
                      <li key={point} className="flex items-start gap-3 text-sm sm:text-base text-neutral-700">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-abody-teal" />
                        <span className="leading-relaxed">{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </article>
          );
        })}
      </div>
      <div className="mt-5 flex items-center justify-center gap-4">
        <button type="button" onClick={() => go(index - 1)} className="w-10 h-10 rounded-full border border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50 flex items-center justify-center" aria-label="前の仕組み">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2" role="tablist" aria-label="継続できる仕組み">
          {CONTINUE_ITEMS.map((item, i) => (
            <button key={item.title} type="button" role="tab" aria-selected={i === index} onClick={() => go(i)} className={`h-2 rounded-full transition-all ${i === index ? "w-6 bg-abody-teal" : "w-2 bg-neutral-300"}`} aria-label={`${item.title}へ`} />
          ))}
        </div>
        <button type="button" onClick={() => go(index + 1)} className="w-10 h-10 rounded-full border border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50 flex items-center justify-center" aria-label="次の仕組み">
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
      <p className="mt-3 text-center text-xs text-neutral-400">{index + 1} / {total}</p>
    </div>
  );
}

export function LPFeatures() {
  return (
    <section id="features" className="bg-white">
      <div className="relative overflow-hidden px-6 py-16 sm:py-24 text-center text-white">
        <div className="absolute inset-0 bg-[#07332f]" />
        <div className="absolute inset-0 bg-gradient-to-br from-abody-teal/50 via-[#07332f] to-[#021716]" />
        <div aria-hidden className="absolute -left-1/4 top-0 h-full w-1/2 rotate-12 bg-gradient-to-b from-white/10 to-transparent" />
        <div aria-hidden className="absolute -right-16 -top-20 h-64 w-64 rounded-full bg-abody-teal/35 blur-3xl" />
        <div aria-hidden className="absolute -left-10 -bottom-16 h-48 w-48 rounded-full bg-teal-200/20 blur-3xl" />
        <div aria-hidden className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-teal-200/40 to-transparent" />
        <div className="relative mx-auto max-w-2xl">
          <p className="mb-5 flex items-center justify-center gap-3 text-[11px] sm:text-xs font-bold tracking-[0.38em] text-teal-100/90">
            <span className="h-px w-8 sm:w-12 bg-teal-100/50" />FEATURES<span className="h-px w-8 sm:w-12 bg-teal-100/50" />
          </p>
          <h2 className="text-2xl sm:text-4xl font-bold leading-relaxed tracking-wide">
            Abodyは、
            <span className="relative inline-block text-teal-200">
              料金内
              <span className="absolute inset-x-0 -bottom-0.5 h-[0.35em] bg-abody-teal/35 -z-10" />
            </span>
            で
            <br className="sm:hidden" />
            全部受け放題。
          </h2>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-2">
            {["パーソナル", "ストレッチ", "ピラティス"].map((item) => (
              <span key={item} className="rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-xs sm:text-sm tracking-wide backdrop-blur-sm">{item}</span>
            ))}
          </div>
          <p className="mt-5 text-sm sm:text-base text-white/70">追加料金なく通い放題。</p>
        </div>
      </div>

      <div className="bg-[#f4faf8] px-4 sm:px-6 py-14 sm:py-20">
        <div className="max-w-6xl mx-auto space-y-16 sm:space-y-24">
          {SERVICES.map((service, i) => {
            const imageLeft = i % 2 === 0;
            return (
              <article key={service.no} className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
                <div className={imageLeft ? "md:order-1" : "md:order-2"}>
                  <Frame align={imageLeft ? "left" : "right"}>
                    <Photo src={service.photo} alt={service.alt} overlayNo={service.no} overlayTitle={service.title} objectPosition={service.objectPosition} className="aspect-[16/10] rounded-[1.6rem] shadow-soft ring-1 ring-white/40" />
                  </Frame>
                </div>
                <div className={imageLeft ? "md:order-2" : "md:order-1"}>
                  <ul className="space-y-4">
                    {service.points.map((point) => (
                      <li key={point} className="flex items-start gap-3 text-sm sm:text-base text-neutral-700 border-b border-abody-teal/15 pb-4 last:border-0 last:pb-0">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-abody-teal" />
                        <span className="leading-relaxed">{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            );
          })}
        </div>
      </div>

      <div className="bg-neutral-50 py-14 sm:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <p className="text-center text-abody-teal text-[11px] sm:text-xs font-bold tracking-widest mb-3">CONTINUE</p>
          <h2 className="text-xl sm:text-2xl font-bold text-center text-neutral-900 mb-8 sm:mb-10">継続できる仕組み</h2>
          <ContinueCarousel />
        </div>
      </div>

      <div className="py-14 sm:py-20 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <p className="text-center text-abody-teal text-[11px] sm:text-xs font-bold tracking-widest mb-3">YOUR PLAN</p>
          <h2 className="text-xl sm:text-2xl font-bold text-center text-neutral-900 leading-relaxed mb-10 sm:mb-14">
            自分にあったパーソナルで
            <br />
            最短でボディメイク
          </h2>
          <div className="grid sm:grid-cols-2 gap-5 sm:gap-6">
            {GOALS.map((goal) => (
              <article key={goal.want} className="group bg-white rounded-3xl overflow-hidden border border-neutral-100 shadow-soft">
                <Photo src={goal.photo} alt={goal.alt} className="aspect-[16/9] group-hover:[&_img]:scale-105 [&_img]:transition-transform [&_img]:duration-500" />
                <div className="p-5 sm:p-6">
                  <div className="flex items-start gap-2 mb-3">
                    <Dumbbell className="w-4 h-4 text-abody-teal mt-1 shrink-0" strokeWidth={1.8} />
                    <h3 className="font-bold text-neutral-900 text-sm sm:text-base leading-snug">{goal.want}</h3>
                  </div>
                  <p className="text-abody-teal font-bold text-sm sm:text-base leading-snug">{goal.plan}</p>
                  {"note" in goal && goal.note && <p className="text-neutral-500 text-xs sm:text-sm mt-2">{goal.note}</p>}
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
