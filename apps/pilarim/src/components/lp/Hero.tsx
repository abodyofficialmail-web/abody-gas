import Image from "next/image";
import { CtaButton } from "@/components/lp/CtaButton";

function ReformerIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5 text-pilarim-bronze" fill="none" aria-hidden>
      <rect x="2.5" y="15" width="19" height="3.2" rx="0.8" stroke="currentColor" strokeWidth="1.6" />
      <rect x="6" y="9.5" width="8.5" height="5.5" rx="0.8" stroke="currentColor" strokeWidth="1.6" />
      <path d="M14.5 12.2h5.2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="5" cy="18.6" r="1.15" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="19" cy="18.6" r="1.15" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

function DumbbellIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5 text-pilarim-bronze" fill="none" aria-hidden>
      <path
        d="M6.5 8.5v7M17.5 8.5v7M4.5 10v4M19.5 10v4M6.5 12h11"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function PersonIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5 text-pilarim-bronze" fill="none" aria-hidden>
      <circle cx="12" cy="8" r="2.4" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M7.5 18.5c.7-3.2 2.5-4.8 4.5-4.8s3.8 1.6 4.5 4.8"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

const FEATURES = [
  { icon: ReformerIcon, label: "ピラティス受け放題" },
  { icon: DumbbellIcon, label: "パーソナル受け放題" },
  { icon: PersonIcon, label: "毎回マンツーマン" },
];

export function LPHero() {
  return (
    <section className="relative overflow-hidden bg-white">
      <div className="absolute inset-0 grid grid-cols-2" aria-hidden>
        <div className="relative">
          <Image
            src="https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1400&q=80"
            alt=""
            fill
            className="object-cover object-[30%_center]"
            priority
            sizes="(max-width: 768px) 50vw, 490px"
          />
        </div>
        <div className="relative">
          <Image
            src="https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=1400&q=80"
            alt=""
            fill
            className="object-cover object-[70%_center]"
            priority
            sizes="(max-width: 768px) 50vw, 490px"
          />
        </div>
      </div>
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(255,255,255,0.86) 0%, rgba(255,255,255,0.68) 46%, rgba(255,255,255,0.32) 100%)",
        }}
        aria-hidden
      />

      <div className="relative z-10 px-4 sm:px-8 py-16 sm:py-24 text-center">
        <p className="text-xs sm:text-sm tracking-wide text-neutral-600 mb-5">
          30〜50代男性のための受け放題スタジオ
        </p>
        <h1 className="text-pilarim-ink font-black tracking-tight leading-[1.2]">
          <span className="block text-[2rem] sm:text-5xl md:text-[56px]">ピラティスも、</span>
          <span className="block text-[2rem] sm:text-5xl md:text-[56px]">パーソナルも。</span>
        </h1>
        <p className="mt-5 text-base sm:text-xl font-bold text-pilarim-ink">
          通い放題で、理想の体へ。
        </p>
        <p className="mt-4 text-sm sm:text-[15px] text-neutral-600 leading-relaxed max-w-md mx-auto">
          整える日も、鍛える日も。あなたの体調や目的に合わせて、毎回メニューを選べます。
        </p>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl mx-auto">
          {FEATURES.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className="flex items-center justify-center gap-2 rounded-2xl border border-neutral-200 bg-white px-4 py-3.5 shadow-soft"
              >
                <Icon />
                <span className="text-sm font-medium text-pilarim-ink">{item.label}</span>
              </div>
            );
          })}
        </div>

        <CtaButton href="#campaign" className="mt-8 px-10 py-4 text-base shadow-soft">
          まずは無料体験へ
        </CtaButton>
      </div>
    </section>
  );
}
