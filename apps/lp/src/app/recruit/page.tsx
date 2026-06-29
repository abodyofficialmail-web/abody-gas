import { LPHeader } from "@/components/lp/Header";
import { LINE_URL_RECRUIT } from "@/lib/constants";
import Link from "next/link";
import Image from "next/image";
import type { ReactNode } from "react";

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="bg-white rounded-2xl shadow-soft border border-neutral-100 p-6 md:p-8">
      <h2 className="text-base sm:text-lg font-bold text-neutral-900 mb-4 tracking-wide">
        {title}
      </h2>
      <div className="text-sm sm:text-base text-neutral-700 space-y-3 leading-relaxed">
        {children}
      </div>
    </section>
  );
}

export default function RecruitPage() {
  return (
    <>
      <LPHeader />
      <main className="pb-56 sm:pb-64">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-10 pb-8">
          <div className="text-center mb-10">
            <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 tracking-wide">
              求人募集
            </h1>
            <p className="mt-3 text-neutral-600">
              【未経験OK】SNSに強い｜月100本以上のセッションも可能｜副業OK｜店舗拡大フェーズのトレーナー募集
            </p>
          </div>

          <div className="space-y-8">
            <Section title="Abodyで働く魅力">
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  圧倒的なセッション経験が積める環境：月100本以上のセッションを担当することも可能。短期間で指導経験を積み、トレーナーとして大きく成長できます。
                </li>
                <li>
                  未経験OK・研修サポートあり：初心者指導に特化した環境のため、基礎から実践までしっかり学べます。
                </li>
                <li>
                  副業・ダブルワークOK：まずは副業からスタートし、将来的に本業に切り替える働き方も可能です。
                </li>
                <li>
                  SNS集客・営業スキルも学べる：指導だけでなく、トレーナーとして“選ばれる力”が身につきます。
                </li>
                <li>
                  店舗拡大フェーズに関われる：今後の展開に伴い、運営・教育・マネジメントにも挑戦できます。
                </li>
              </ul>
            </Section>

            <Section title="募集内容">
              <div className="space-y-2">
                <p className="font-bold text-neutral-900">募集職種</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>インストラクター（スポーツトレーナー）</li>
                  <li>
                    ピラティスインストラクター
                    <span className="text-neutral-600">（上野店・桜木町店・新宿店のみ募集）</span>
                  </li>
                </ul>
                <p className="font-bold text-neutral-900">仕事内容</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>初心者向けパーソナルトレーニング指導</li>
                  <li>食事アドバイス</li>
                  <li>顧客サポート</li>
                  <li>SNS発信や集客補助</li>
                  <li>店舗運営サポート</li>
                </ul>
                <p>
                  <span className="font-bold text-neutral-900">診療科目・サービス形態：</span>トレーニングジム
                </p>
              </div>
            </Section>

            <Section title="勤務地">
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  恵比寿店：東京都渋谷区恵比寿南1-14-9
                </li>
                <li>
                  上野店：東京都台東区台東4-31-5オリオンビル4F
                </li>
                <li>
                  桜木町店：横浜市中区野毛町2-59パストラル野毛マリヤ201
                </li>
                <li>
                  新宿店：東京都新宿区西新宿7-22-39
                </li>
                <li>
                  福岡店：福岡市中央区大名2-11-15 Shin-Akasakamon 3F
                </li>
              </ul>
            </Section>

            <Section title="給与">
              <div className="space-y-2">
                <p>
                  <span className="font-bold text-neutral-900">【業務委託】</span> 月給280,000円〜350,000円
                </p>
                <p className="text-neutral-600">
                  働きやすさ・待遇：正社員もしくは業務委託契約 / 280000円〜＋インセンティブ30%~
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>未経験OK／経験者歓迎</li>
                  <li>時給1700円〜</li>
                  <li>インセンティブ30%</li>
                  <li>交通費支給</li>
                  <li>週2日〜OK／シフト自由</li>
                  <li>副業・Wワーク可</li>
                  <li>東京・横浜エリア勤務</li>
                </ul>
                <p>
                  独立・開業支援あり／歩合制あり／社会保険完備／交通費支給／副業OK
                </p>
              </div>
            </Section>

            <Section title="勤務時間">
              <div className="space-y-2">
                <ul className="list-disc pl-6 space-y-2">
                  <li>時短勤務相談可／午前のみ勤務／午後のみ勤務</li>
                  <li>残業ほぼなし／残業月20時間以内</li>
                  <li>スキマ時間勤務</li>
                  <li>10:00〜22:00の間でシフト制</li>
                  <li>1日4時間〜勤務OK</li>
                  <li>週2日〜勤務可能（※副業・ダブルワーク歓迎）</li>
                </ul>
                <p className="font-bold text-neutral-900">休憩時間</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>6時間以上勤務：45分</li>
                  <li>8時間以上勤務：60分</li>
                  <li>※休憩時間も時給が発生します</li>
                </ul>
              </div>
            </Section>

            <Section title="休日">
              <ul className="list-disc pl-6 space-y-2">
                <li>週休2日</li>
                <li>年間休日120日以上</li>
                <li>週1日からOK</li>
                <li>週2日からOK</li>
                <li>月1シフト提出</li>
                <li>シフト制／希望休の申請可能</li>
              </ul>
            </Section>

            <Section title="応募要件">
              <div className="space-y-4">
                <div className="space-y-2">
                  <p className="font-bold text-neutral-900">【必須条件】</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>20〜35歳の方</li>
                    <li>トレーニングや運動が好きな方</li>
                    <li>人と話すことが好きな方</li>
                    <li>成長意欲がある方</li>
                    <li>責任感を持って仕事に取り組める方</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <p className="font-bold text-neutral-900">【歓迎条件】</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>パーソナルトレーナー経験者</li>
                    <li>未経験でもトレーナーを目指している方</li>
                    <li>副業でスキルを身につけたい方</li>
                    <li>将来トレーナーとして独立を考えている方</li>
                    <li>SNS発信や集客に興味がある方</li>
                    <li>店舗運営やマネジメントに挑戦したい方</li>
                  </ul>
                </div>

                <div className="text-neutral-600">
                  経験よりもやる気と人柄を重視します。未経験の方も安心してご応募ください。
                </div>
              </div>
            </Section>

            <section className="bg-white rounded-2xl shadow-soft border border-neutral-100 p-6 md:p-8">
              <h2 className="text-base sm:text-lg font-bold text-neutral-900 mb-4 tracking-wide">
                働く雰囲気
              </h2>
              <div className="flex gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory">
                <div className="snap-start flex-shrink-0 relative w-44 sm:w-52 aspect-square rounded-2xl overflow-hidden bg-neutral-100 border border-neutral-100">
                  <Image src="/recruit-1.png" alt="スタッフ写真1" fill className="object-cover" />
                </div>
                <div className="snap-start flex-shrink-0 relative w-44 sm:w-52 aspect-square rounded-2xl overflow-hidden bg-neutral-100 border border-neutral-100">
                  <Image src="/recruit-2.png" alt="スタッフ写真2" fill className="object-cover" />
                </div>
                <div className="snap-start flex-shrink-0 relative w-44 sm:w-52 aspect-square rounded-2xl overflow-hidden bg-neutral-100 border border-neutral-100">
                  <Image src="/recruit-3.png" alt="スタッフ写真3" fill className="object-cover" />
                </div>
                <div className="snap-start flex-shrink-0 relative w-44 sm:w-52 aspect-square rounded-2xl overflow-hidden bg-neutral-100 border border-neutral-100">
                  <Image src="/recruit-4.png" alt="スタッフ写真4" fill className="object-cover" />
                </div>
              </div>
              <p className="text-xs sm:text-sm text-neutral-500 mt-4">
                スライドして写真をご覧ください。
              </p>
            </section>

            <section className="bg-abody-teal rounded-2xl shadow-soft p-6 md:p-8">
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-wide mb-3">
                応募は公式LINEから
              </h2>
              <p className="text-white/90 mb-6">
                上記の内容をご確認のうえ、公式ラインからご応募ください。
              </p>
              <div className="flex justify-center">
                <Link
                  href={LINE_URL_RECRUIT}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block px-8 py-4 rounded-2xl bg-white text-abody-teal font-semibold hover:bg-neutral-100 transition-colors"
                >
                  公式LINEで応募
                </Link>
              </div>
            </section>
          </div>
        </div>
      </main>
    </>
  );
}

