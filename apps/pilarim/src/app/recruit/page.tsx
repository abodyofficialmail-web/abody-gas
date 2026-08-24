import { LPHeader } from "@/components/lp/Header";
import { LPFooter } from "@/components/lp/Footer";
import { CtaButton } from "@/components/lp/CtaButton";
import { LINE_URL_RECRUIT } from "@/lib/constants";
import type { ReactNode } from "react";

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="bg-white rounded-2xl shadow-soft border border-neutral-100 p-6 md:p-8">
      <h2 className="text-base sm:text-lg font-bold text-neutral-900 mb-4 tracking-wide">{title}</h2>
      <div className="text-sm sm:text-base text-neutral-700 space-y-3 leading-relaxed">{children}</div>
    </section>
  );
}

export default function RecruitPage() {
  const hasLineLink = LINE_URL_RECRUIT.startsWith("http");
  const href = hasLineLink ? LINE_URL_RECRUIT : "#";

  return (
    <>
      <LPHeader />
      <main className="pb-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-10 pb-8">
          <div className="text-center mb-10">
            <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 tracking-wide">求人募集</h1>
            <p className="mt-3 text-neutral-600">
              【未経験OK】30代〜50代男性の姿勢改善・運動習慣を支えるトレーナー／ピラティスインストラクター募集
            </p>
          </div>

          <div className="space-y-8">
            <Section title="PILARIMで働く魅力">
              <ul className="list-disc pl-6 space-y-2">
                <li>ピラティスとパーソナルの両方を指導できる。機能改善と引き締めを同時に扱えます。</li>
                <li>未経験OK・研修サポートあり。姿勢評価と短時間セッションの型を基礎から学べます。</li>
                <li>副業・ダブルワークOK。まずは週数回からスタートできます。</li>
                <li>店舗拡大フェーズに関われる。指導だけでなく、運営や教育にも挑戦できます。</li>
              </ul>
            </Section>

            <Section title="募集内容">
              <div className="space-y-2">
                <p className="font-bold text-neutral-900">募集職種</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>パーソナルトレーナー</li>
                  <li>ピラティスインストラクター</li>
                </ul>
                <p className="font-bold text-neutral-900">仕事内容</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>マシンピラティス／パーソナルトレーニング指導</li>
                  <li>姿勢・動作の評価とフィードバック</li>
                  <li>食事アドバイス</li>
                  <li>顧客サポート</li>
                </ul>
              </div>
            </Section>

            <Section title="応募方法">
              <p>公式LINEから「求人希望」とお送りください。</p>
              {hasLineLink ? (
                <CtaButton href={href} className="mt-4 px-8 py-4">
                  LINEで応募する
                </CtaButton>
              ) : (
                <p className="mt-4 text-sm text-neutral-500">
                  応募用LINEは準備中です。準備ができ次第、こちらからご案内します。
                </p>
              )}
            </Section>
          </div>
        </div>
      </main>
      <LPFooter />
    </>
  );
}
