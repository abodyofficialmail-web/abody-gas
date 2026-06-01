import { Star } from "lucide-react";

type Review = {
  id: number;
  /** フルネームは出さずイニシャル＋さん（例: Tさん） */
  label: string;
  /** アバター用の1文字（英字推奨） */
  initial: string;
  /** 表示用（例: 2週間前） */
  postedAgo: string;
  stars: number;
  paragraphs: string[];
};

const REVIEWS: Review[] = [
  {
    id: 1,
    label: "Tさん",
    initial: "T",
    postedAgo: "2週間前",
    stars: 5,
    paragraphs: [
      "筋トレを始めてみたかったけど、やり方が分からずパーソナルジムを調べたところこちらのお店をSNSで発見。",
      "トレーナーさんが丁寧に教えてくれて、ベンチも＋20キロあげれるようになりました。",
      "通い放題で1対1で教えてくれるので、関係性も築きやすく非常に気に入っています。",
      "おすすめです！",
    ],
  },
  {
    id: 2,
    label: "Yさん",
    initial: "Y",
    postedAgo: "2週間前",
    stars: 5,
    paragraphs: [
      "去年の夏頃から利用させていただいてます！",
      "楽しく、でもしっかりと追い込んでもらえるので効果も実感でき、いろいろ試して続かなかったジム通いがいまも続けられてます。",
    ],
  },
  {
    id: 3,
    label: "Rさん",
    initial: "R",
    postedAgo: "1年前",
    stars: 5,
    paragraphs: [
      "パーソナルジムを探してて個室で受け放題が気になり無料体験に申し込みました。",
      "他のジムにない個室でのトレーニングと毎回マンツーマンなので他の人の目を気にせずトレーナーさんが自分に合ったトレーニングを教えてくれるので入会して1ヶ月ですが変化を感じてます😊",
      "受け放題なのでたくさんトレーニングできるのも嬉しいです！",
    ],
  },
  {
    id: 4,
    label: "Oさん",
    initial: "O",
    postedAgo: "1週間前",
    stars: 5,
    paragraphs: [
      "30分という短時間のトレーニングが自分にはすごく合っていて、無理なく続けられています。もともと通い放題というシステムに魅力を感じて入会しましたが、好きなタイミングで通えるのが想像以上に便利です。",
      "現在入会して6ヶ月ほど経ちますが、少しずつ筋肉もついてきた実感があり、モチベーションにもつながっています。",
      "週3回以上の運動習慣をしっかり身につけたい方には、特におすすめできるジムだと思います。",
    ],
  },
];

function InitialAvatar({ initial }: { initial: string }) {
  return (
    <div
      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-abody-teal/15 text-sm font-bold text-abody-teal uppercase"
      aria-hidden
    >
      {initial}
    </div>
  );
}

export function LPReviews() {
  return (
    <section className="py-16 sm:py-24 bg-neutral-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <h2 className="text-base sm:text-lg font-bold text-center text-neutral-900 mb-2 tracking-wide">お客さまの声</h2>
        <p className="text-center text-sm text-neutral-500 mb-10 sm:mb-12 max-w-xl mx-auto">
          実際にご利用いただいた方からの感想です。
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {REVIEWS.map((review) => (
            <article
              key={review.id}
              className="bg-white rounded-2xl p-6 sm:p-7 shadow-soft border border-neutral-100 flex flex-col"
            >
              <div className="flex gap-3 mb-4">
                <InitialAvatar initial={review.initial} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 justify-between">
                    <p className="font-bold text-neutral-900 text-base">{review.label}</p>
                    <span className="text-xs text-neutral-400 shrink-0 tabular-nums">{review.postedAgo}</span>
                  </div>
                  <div className="flex gap-0.5 mt-1.5" role="img" aria-label={`${review.stars}つ星の評価`}>
                    {Array.from({ length: review.stars }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 sm:w-[18px] sm:h-[18px] fill-amber-400 text-amber-400" strokeWidth={1.5} />
                    ))}
                  </div>
                </div>
              </div>
              <div className="space-y-3 text-neutral-700 text-[15px] sm:text-base leading-relaxed border-t border-neutral-100 pt-4">
                {review.paragraphs.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
