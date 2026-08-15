import { Star } from "lucide-react";

type Review = {
  id: number;
  label: string;
  initial: string;
  postedAgo: string;
  stars: number;
  paragraphs: string[];
};

const REVIEWS: Review[] = [
  {
    id: 1,
    label: "Kさん（40代）",
    initial: "K",
    postedAgo: "3週間前",
    stars: 5,
    paragraphs: [
      "長年のデスクワークで猫背がひどく、写真に写る自分の姿勢が気になっていました。",
      "ピラティスで肩まわりが開いてきて、同僚に「姿勢よくなったね」と言われたのが最初の変化です。",
      "受け放題なので、調子のいい日はパーソナル、疲れている日はピラティス、と使い分けられています。",
    ],
  },
  {
    id: 2,
    label: "Mさん（30代）",
    initial: "M",
    postedAgo: "1ヶ月前",
    stars: 5,
    paragraphs: [
      "ジムは何度も入会して、そのたびに続かなかった人間です。",
      "30分から通えて、毎回マンツーマンなので「今日はやめておこう」が起きにくい。気づいたら週3が当たり前になっていました。",
      "意志に頼らない仕組みが、自分には合っていました。",
    ],
  },
  {
    id: 3,
    label: "Sさん（50代）",
    initial: "S",
    postedAgo: "2週間前",
    stars: 5,
    paragraphs: [
      "ただ痩せたいのではなく、ゴルフや日常の動きを楽にしたかったのが入会理由です。",
      "体重だけでなく、しゃがむ・ひねる・歩くが楽になった。機能が上がりながら引き締まる感覚があります。",
      "同年代の男性も多く、気負わず通えています。",
    ],
  },
  {
    id: 4,
    label: "Tさん（40代）",
    initial: "T",
    postedAgo: "1週間前",
    stars: 5,
    paragraphs: [
      "食事制限だけのダイエットは何度も失敗していました。",
      "ピラティスで体の使い方を直し、パーソナルで代謝を上げる順番が自分にはしっくりきました。",
      "見た目が変わる前に、まず体が軽くなったのが続けられた理由です。",
    ],
  },
];

function InitialAvatar({ initial }: { initial: string }) {
  return (
    <div
      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-pilarim-bronze/15 text-sm font-bold text-pilarim-bronze uppercase"
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
        <h2 className="text-base sm:text-lg font-bold text-center text-neutral-900 mb-2 tracking-wide">
          お客さまの声
        </h2>
        <p className="text-center text-sm text-neutral-500 mb-10 sm:mb-12 max-w-xl mx-auto">
          姿勢改善・運動習慣・機能的なダイエットを目的に通われている方の声です。
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
                    <span className="text-xs text-neutral-400 shrink-0 tabular-nums">
                      {review.postedAgo}
                    </span>
                  </div>
                  <div className="flex gap-0.5 mt-1.5" role="img" aria-label={`${review.stars}つ星の評価`}>
                    {Array.from({ length: review.stars }).map((_, i) => (
                      <Star
                        key={i}
                        className="w-4 h-4 sm:w-[18px] sm:h-[18px] fill-amber-400 text-amber-400"
                        strokeWidth={1.5}
                      />
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
