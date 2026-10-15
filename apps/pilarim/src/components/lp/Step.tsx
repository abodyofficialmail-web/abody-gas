import { Users, ClipboardList, Dumbbell, FileText, ChevronRight } from "lucide-react";

function ReformerIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden>
      <path
        d="M4 15.5h16"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M6 15.5c1.2-3.4 3.2-5 6-5s4.8 1.6 6 5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <circle cx="12" cy="7.5" r="1.6" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

const STEPS = [
  {
    icon: Users,
    title: "カウンセリング",
    description: "目的や悩みを丁寧にヒアリングします。",
  },
  {
    icon: ClipboardList,
    title: "姿勢・体力チェック",
    description: "現在の姿勢や体力をチェックします。",
  },
  {
    icon: ReformerIcon,
    title: "ピラティス体験",
    description: "ピラティスを体験。正しい動きを感じます。",
  },
  {
    icon: Dumbbell,
    title: "パーソナル体験",
    description: "パーソナルトレーニングを体験。効果を実感します。",
  },
  {
    icon: FileText,
    title: "プランのご案内",
    description: "あなたに合ったプランをご案内します。",
  },
];

export function LPStep() {
  return (
    <section className="py-10 sm:py-24 bg-white">
      <div className="max-w-6xl mx-auto px-2 sm:px-6">
        <h2 className="text-base sm:text-3xl font-bold text-center text-pilarim-ink mb-6 sm:mb-14">
          はじめての方も安心の体験の流れ
        </h2>
        <div className="flex items-start justify-between gap-0">
          {STEPS.map((step, i) => {
            const Icon = step.icon;
            return (
              <div key={step.title} className="flex items-start min-w-0 flex-1">
                <div className="text-center px-0.5 sm:px-2 w-full">
                  <div className="mx-auto w-5 h-5 sm:w-8 sm:h-8 rounded-full border border-neutral-300 text-neutral-500 flex items-center justify-center text-[10px] sm:text-sm font-medium mb-1.5 sm:mb-3">
                    {i + 1}
                  </div>
                  <h3 className="text-[9px] sm:text-sm font-bold text-pilarim-ink leading-tight mb-1.5 sm:mb-3">
                    {step.title}
                  </h3>
                  <div className="mx-auto w-6 h-6 sm:w-10 sm:h-10 flex items-center justify-center mb-1.5 sm:mb-3">
                    <Icon className="w-4 h-4 sm:w-6 sm:h-6 text-neutral-500" strokeWidth={1.6} />
                  </div>
                  <p className="text-[8px] sm:text-xs text-neutral-500 leading-relaxed">
                    {step.description}
                  </p>
                </div>
                {i < STEPS.length - 1 && (
                  <ChevronRight
                    className="w-3 h-3 sm:w-4 sm:h-4 text-neutral-300 shrink-0 mt-6 sm:mt-10"
                    strokeWidth={2}
                    aria-hidden
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
