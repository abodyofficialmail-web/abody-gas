import { MessageCircle, ScanLine, PersonStanding, Dumbbell, ClipboardList } from "lucide-react";

const STEPS = [
  { icon: MessageCircle, title: "カウンセリング", description: "体の状態と目標をヒアリングします。" },
  { icon: ScanLine, title: "姿勢・筋力チェック", description: "今の動きと歪みを確認します。" },
  { icon: PersonStanding, title: "ピラティス体験", description: "マシンで姿勢の整え方を体験します。" },
  { icon: Dumbbell, title: "パーソナル体験", description: "引き締めのトレーニングを体験します。" },
  { icon: ClipboardList, title: "プラン案内", description: "通い方と料金をご案内します。" },
];

export function LPStep() {
  return (
    <section className="py-16 sm:py-24 bg-pilarim-cream">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <h2 className="text-xl sm:text-3xl font-bold text-center text-pilarim-ink mb-10 sm:mb-14">
          無料体験の流れ
        </h2>
        <div className="relative">
          <div
            className="hidden sm:block absolute top-6 left-[10%] right-[10%] h-px bg-neutral-300"
            aria-hidden
          />
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-8 sm:gap-4">
            {STEPS.map((step, i) => {
              const Icon = step.icon;
              return (
                <div key={step.title} className="relative text-center px-2">
                  <div className="relative z-10 mx-auto w-12 h-12 rounded-full bg-pilarim-charcoal text-white flex items-center justify-center text-sm font-bold mb-3">
                    {i + 1}
                  </div>
                  <div className="mx-auto w-10 h-10 rounded-xl bg-white border border-neutral-200 flex items-center justify-center mb-3">
                    <Icon className="w-5 h-5 text-pilarim-bronze" strokeWidth={1.8} />
                  </div>
                  <h3 className="text-sm font-bold text-pilarim-ink mb-1">{step.title}</h3>
                  <p className="text-xs text-neutral-600 leading-relaxed">{step.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
