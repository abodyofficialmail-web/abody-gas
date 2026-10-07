import type { ReactNode } from "react";
import Image from "next/image";
import { Check, CupSoda, Droplets } from "lucide-react";
import { LPOptions } from "@/components/lp/Options";

const SERVICES = [
  {
    title: "トレーニング",
    src: "/features/training.png",
    alt: "パーソナルトレーニングの様子",
    objectPosition: "object-center",
  },
  {
    title: "ストレッチ",
    src: "/features/stretch.jpg",
    alt: "パーソナルストレッチの様子",
    objectPosition: "object-[center_32%]",
  },
  {
    title: "ピラティス",
    src: "/features/pilates.png",
    alt: "マシンピラティスの様子",
    objectPosition: "object-center",
  },
] as const;

function PriceCard({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border-2 border-[#2457e6] bg-white shadow-soft">
      <div className="bg-gradient-to-r from-[#1a43c8] via-[#2457e6] to-[#3b74ff] px-3 py-2.5 text-center text-sm sm:text-base font-bold text-white">
        {title}
      </div>
      {children}
    </div>
  );
}

function GuaranteeList({ items }: { items: string[] }) {
  return (
    <ul className="mx-3 mb-3 sm:mx-4 sm:mb-4 space-y-2 rounded-xl bg-[#eef4ff] px-3 py-3 text-left">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-2 text-[11px] sm:text-sm leading-snug text-neutral-700">
          <span className="mt-0.5 flex h-4 w-4 sm:h-5 sm:w-5 shrink-0 items-center justify-center rounded-full bg-[#2457e6] text-white">
            <Check className="h-2.5 w-2.5 sm:h-3 sm:w-3" strokeWidth={3} />
          </span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function PriceAmount({
  amount,
  tax = true,
  monthly = true,
}: {
  amount: string;
  tax?: boolean;
  monthly?: boolean;
}) {
  return (
    <p className="text-center font-black tracking-tight text-[#2457e6] tabular-nums">
      <span className="text-3xl sm:text-4xl md:text-5xl">{amount}</span>
      <span className="text-lg sm:text-xl">円</span>
      {monthly && <span className="text-base sm:text-lg font-bold text-neutral-800">/月</span>}
      {tax && <span className="ml-0.5 text-[10px] sm:text-xs font-bold text-neutral-500">（税込）</span>}
    </p>
  );
}

export function LPPrice() {
  return (
    <section id="price" className="bg-[#f3f7ff] py-14 sm:py-20">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <div className="mb-8 text-center sm:mb-10">
          <p className="text-sm sm:text-base font-bold tracking-wide text-[#1a3fbe]">
            受け放題パーソナルジム Abody
          </p>
          <div className="mt-1 flex items-center justify-center gap-3 sm:gap-5">
            <span className="flex flex-col gap-1.5 text-[#2457e6]" aria-hidden>
              <span className="block h-1 w-4 origin-center rotate-[58deg] rounded-full bg-current sm:w-5" />
              <span className="block h-1 w-4 origin-center rotate-[58deg] rounded-full bg-current sm:w-5" />
            </span>
            <h2
              className="text-5xl sm:text-7xl font-black italic leading-none tracking-tight text-[#2457e6]"
              style={{ textShadow: "4px 4px 0 #c5d6ff" }}
            >
              price
            </h2>
            <span className="flex flex-col gap-1.5 text-[#2457e6]" aria-hidden>
              <span className="block h-1 w-4 origin-center -rotate-[58deg] rounded-full bg-current sm:w-5" />
              <span className="block h-1 w-4 origin-center -rotate-[58deg] rounded-full bg-current sm:w-5" />
            </span>
          </div>
          <div className="mt-3 flex items-center justify-center gap-3">
            <span className="h-px w-8 bg-[#2457e6] sm:w-12" aria-hidden />
            <p className="rounded-full bg-[#2457e6] px-4 py-1.5 text-xs sm:text-sm font-bold text-white">
              目的に合わせて選べる
            </p>
            <span className="h-px w-8 bg-[#2457e6] sm:w-12" aria-hidden />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 sm:gap-4">
          {SERVICES.map((service) => (
            <div key={service.title} className="relative overflow-hidden rounded-2xl shadow-soft">
              <div className="relative aspect-[3/4] sm:aspect-[4/5]">
                <Image
                  src={service.src}
                  alt={service.alt}
                  fill
                  className={`object-cover ${service.objectPosition}`}
                  sizes="(max-width: 768px) 33vw, 280px"
                />
              </div>
              <div className="absolute inset-x-1.5 bottom-2 sm:inset-x-3 sm:bottom-3">
                <p className="rounded-full bg-[#2457e6] py-1.5 text-center text-[11px] sm:text-sm font-bold text-white shadow-md">
                  {service.title}
                </p>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-3 text-center text-[11px] text-neutral-500">
          ※マシンピラティスは上野店・桜木町店・新宿店
        </p>

        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
          <PriceCard title="初回体験 + カウンセリング">
            <div className="flex items-baseline justify-center gap-2 px-3 py-5 sm:py-6">
              <span className="text-sm sm:text-base font-bold text-neutral-700">60分</span>
              <p className="font-black tracking-tight text-[#2457e6] tabular-nums">
                <span className="text-3xl sm:text-4xl">3,850</span>
                <span className="text-lg">円</span>
                <span className="ml-0.5 text-[10px] sm:text-xs font-bold text-neutral-500">（税込）</span>
              </p>
            </div>
          </PriceCard>

          <PriceCard title="入会金">
            <div className="flex items-center justify-center gap-2 px-3 py-4 sm:gap-3 sm:py-5">
              <div className="text-center leading-tight">
                <p className="text-[10px] sm:text-xs text-neutral-500">通常</p>
                <p className="text-sm sm:text-base font-bold text-neutral-800 tabular-nums">
                  16,500円
                  <span className="text-[10px] font-medium text-neutral-500">（税込）</span>
                </p>
              </div>
              <span className="text-lg text-[#2457e6]" aria-hidden>
                ▶
              </span>
              <div className="text-center">
                <p className="mb-1 text-[10px] sm:text-xs font-bold text-neutral-700">当日入会で</p>
                <p className="inline-block rounded-md bg-[#ffe14d] px-2 py-0.5 text-2xl sm:text-3xl font-black leading-none text-neutral-900 tabular-nums">
                  0<span className="text-base sm:text-lg">円</span>
                </p>
              </div>
            </div>
          </PriceCard>
        </div>

        <div className="mt-3 grid grid-cols-1 gap-3 sm:mt-4 sm:grid-cols-2 sm:gap-4">
          <PriceCard title="受け放題30分">
            <div className="px-3 pb-1 pt-4 sm:pt-5">
              <PriceAmount amount="30,800" />
            </div>
            <GuaranteeList
              items={[
                "30分×月10回を最低保証",
                "60分×月4回+30分×月2回で予約することも可能",
              ]}
            />
          </PriceCard>

          <PriceCard title="受け放題60分">
            <div className="px-3 pb-1 pt-4 sm:pt-5">
              <PriceAmount amount="58,300" />
            </div>
            <GuaranteeList
              items={["60分×月10回を最低保証", "30分×月20回で予約することも可能"]}
            />
          </PriceCard>
        </div>

        <div className="mt-3 grid grid-cols-1 gap-3 sm:mt-4 sm:grid-cols-2 sm:gap-4">
          <div className="rounded-2xl bg-gradient-to-r from-[#1a43c8] via-[#2457e6] to-[#3b74ff] px-4 py-5 text-center text-white shadow-soft">
            <p className="text-sm sm:text-base font-bold">月4回 30分プラン</p>
            <p className="mt-1 font-black tracking-tight tabular-nums">
              <span className="text-3xl sm:text-4xl">16,000</span>
              <span className="text-lg">円</span>
              <span className="text-base font-bold">/月</span>
            </p>
          </div>
          <div className="rounded-2xl bg-gradient-to-r from-[#1a43c8] via-[#2457e6] to-[#3b74ff] px-4 py-5 text-center text-white shadow-soft">
            <p className="text-sm sm:text-base font-bold">月4回 60分プラン</p>
            <p className="mt-1 font-black tracking-tight tabular-nums">
              <span className="text-3xl sm:text-4xl">32,000</span>
              <span className="text-lg">円</span>
              <span className="text-base font-bold">/月</span>
            </p>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#1636a8] to-[#2457e6] px-4 py-3 text-white shadow-soft sm:gap-3">
          <Droplets className="h-5 w-5 shrink-0" aria-hidden />
          <CupSoda className="h-5 w-5 shrink-0" aria-hidden />
          <p className="text-sm sm:text-base font-bold tracking-wide">全プラン 水・プロテイン提供付き</p>
        </div>
        <p className="mt-2 text-center text-[11px] text-neutral-500">
          ※恵比寿店はプロテインの提供がありません
        </p>

        <LPOptions />
      </div>
    </section>
  );
}
