import Image from "next/image";
import { Check } from "lucide-react";

export function LPProgram() {
  return (
    <section id="program" className="py-16 sm:py-24 bg-pilarim-cream">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <h2 className="text-xl sm:text-3xl font-bold text-center text-pilarim-ink mb-10 sm:mb-14">
          その日の自分に、最適な30分。
        </h2>
        <div className="relative pb-8 md:pb-10">
          <div className="grid md:grid-cols-2 gap-6">
            <article className="bg-white rounded-3xl overflow-hidden shadow-soft border border-neutral-100">
              <div className="bg-pilarim-charcoal text-white px-6 py-3 text-sm font-semibold tracking-[0.18em]">
                PILATES
              </div>
              <div className="relative aspect-[16/10]">
                <Image
                  src="https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1200&q=80"
                  alt="マシンピラティス"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
              <div className="p-6 space-y-3">
                <h3 className="text-lg font-bold text-pilarim-ink">マシンピラティス</h3>
                {["姿勢改善", "体幹強化", "疲れにくい体"].map((item) => (
                  <p key={item} className="flex items-center gap-2 text-sm text-neutral-700">
                    <Check className="w-4 h-4 text-pilarim-bronze" strokeWidth={2.4} />
                    {item}
                  </p>
                ))}
              </div>
            </article>
            <article className="bg-white rounded-3xl overflow-hidden shadow-soft border border-neutral-100">
              <div className="bg-pilarim-charcoal text-white px-6 py-3 text-sm font-semibold tracking-[0.18em]">
                PERSONAL
              </div>
              <div className="relative aspect-[16/10]">
                <Image
                  src="https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=1200&q=80"
                  alt="パーソナルトレーニング"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
              <div className="p-6 space-y-3">
                <h3 className="text-lg font-bold text-pilarim-ink">パーソナルトレーニング</h3>
                {["ウエストを引き締める", "筋力・代謝アップ", "男らしいシルエット"].map((item) => (
                  <p key={item} className="flex items-center gap-2 text-sm text-neutral-700">
                    <Check className="w-4 h-4 text-pilarim-bronze" strokeWidth={2.4} />
                    {item}
                  </p>
                ))}
              </div>
            </article>
          </div>
          <div className="mt-6 md:mt-0 md:absolute md:left-1/2 md:-translate-x-1/2 md:-bottom-1 z-10 flex justify-center">
            <p className="inline-flex items-center gap-3 rounded-full bg-white border border-neutral-200 px-5 py-2.5 shadow-soft text-sm font-medium text-pilarim-ink">
              <svg
                viewBox="0 0 48 16"
                className="hidden sm:block w-10 h-4 text-pilarim-bronze"
                fill="none"
                aria-hidden
              >
                <path
                  d="M1 8 C12 8 12 2 24 2 C36 2 36 14 47 14"
                  stroke="currentColor"
                  strokeWidth="1.6"
                />
                <path d="M42 10 L47 14 L42 15.5" stroke="currentColor" strokeWidth="1.6" />
              </svg>
              どちらも受け放題。組み合わせは自由です。
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
