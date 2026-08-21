import type { Metadata } from "next";
import Link from "next/link";
import { LPHeader } from "@/components/lp/Header";
import { LPFixedCTA } from "@/components/lp/FixedCTA";
import { LPTrainerList } from "@/components/lp/TrainerList";
import { LINE_URL } from "@/lib/constants";

export const metadata: Metadata = {
  title: "トレーナー紹介｜ABODY",
  description:
    "ABODYのパーソナルトレーナー一覧。初心者の習慣化、ボディメイク、姿勢改善など、それぞれの強みを紹介します。",
};

export default function TrainersPage() {
  return (
    <>
      <LPHeader />
      <main className="pb-56 sm:pb-64 min-h-screen bg-[#e8f6f3]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-10 pb-8">
          <div className="text-center mb-8">
            <p className="text-xs font-medium tracking-[0.2em] text-abody-teal mb-2">TRAINERS</p>
            <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 tracking-wide">
              トレーナー紹介
            </h1>
            <p className="mt-3 text-neutral-600 text-sm sm:text-base leading-relaxed">
              毎回マンツーマン。経験も得意分野も人それぞれです。
              <br className="hidden sm:block" />
              自分に合う担当と、無理なく続く通い方を一緒に見つけましょう。
            </p>
          </div>

          <LPTrainerList />

          <section className="mt-12 bg-abody-teal rounded-2xl shadow-soft p-6 md:p-8 text-center">
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-wide mb-3">
              まずは無料体験でトレーナーに会う
            </h2>
            <p className="text-white/90 mb-6 text-sm sm:text-base">
              カウンセリングと体験トレーニングで、自分に合う進め方を確認できます。
            </p>
            <Link
              href={LINE_URL}
              className="inline-block px-8 py-4 rounded-2xl bg-white text-abody-teal font-semibold hover:bg-neutral-100 transition-colors"
            >
              公式LINEで体験を予約
            </Link>
          </section>
        </div>
      </main>
      <LPFixedCTA />
    </>
  );
}
