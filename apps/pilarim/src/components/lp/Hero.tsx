import Image from "next/image";
import { CtaButton } from "@/components/lp/CtaButton";

export function LPHero() {
  return (
    <section className="relative bg-white">
      <h1 className="sr-only">ピラティスも、パーソナルも。通い放題で、理想の体へ。</h1>
      <div className="relative">
        <Image
          src="/hero-desktop.jpg"
          alt="マシンピラティスとパーソナルトレーニングの様子"
          width={1309}
          height={1084}
          className="hidden sm:block w-full h-auto"
          priority
          sizes="(max-width: 768px) 100vw, 980px"
        />
        <Image
          src="/hero-mobile.jpg"
          alt="マシンピラティスとパーソナルトレーニングの様子"
          width={1024}
          height={848}
          className="sm:hidden w-full h-auto"
          priority
          sizes="100vw"
        />
        <div className="hidden sm:flex absolute inset-x-0 bottom-8 justify-center px-4">
          <CtaButton href="#campaign" className="px-10 py-3.5 text-base shadow-soft">
            まずは無料体験へ
          </CtaButton>
        </div>
      </div>
      <div className="sm:hidden flex justify-center px-4 pt-4 pb-2">
        <CtaButton href="#campaign" className="w-full max-w-xs py-3.5 text-base shadow-soft">
          まずは無料体験へ
        </CtaButton>
      </div>
    </section>
  );
}
