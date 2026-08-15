const CARDS = [
  {
    id: "posture",
    label: "42歳 / デスクワーク",
    period: "3ヶ月",
    before: "猫背・肩こりが日常",
    after: "肩が開き、見た目の印象が変わった",
    note: "週2〜3回のマシンピラティス中心",
  },
  {
    id: "habit",
    label: "38歳 / 運動習慣ゼロ",
    period: "4ヶ月",
    before: "入会しても続かない",
    after: "週3回が当たり前になった",
    note: "仕事前後の30分パーソナルで定着",
  },
  {
    id: "diet",
    label: "51歳 / 機能性ダイエット",
    period: "3ヶ月",
    before: "体重は落ちても体が重い",
    after: "体脂肪が落ち、動きが軽くなった",
    note: "ピラティス＋パーソナルの組み合わせ",
  },
];

export function LPBeforeAfter() {
  return (
    <section className="py-16 sm:py-24 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <h2 className="text-base sm:text-lg font-bold text-center text-neutral-900 mb-4 tracking-wide">
          続けたら変わった
        </h2>
        <p className="text-center text-neutral-600 mb-12 text-sm">
          30代〜50代男性に多い変化のイメージです
        </p>
        <div className="overflow-x-auto snap-x snap-mandatory -mx-4 px-4 pb-2 scrollbar-hide">
          <div className="flex gap-6" style={{ width: "max-content" }}>
            {CARDS.map((card) => (
              <div
                key={card.id}
                className="flex-shrink-0 w-[85vw] sm:w-[70vw] md:w-[420px] lg:w-[480px] snap-start"
              >
                <div className="bg-white rounded-2xl overflow-hidden shadow-soft border border-neutral-100 h-full">
                  <div className="grid grid-cols-2 gap-0 min-h-[160px]">
                    <div className="bg-neutral-100 p-5 flex flex-col justify-end">
                      <span className="text-[10px] font-medium text-white bg-black/60 px-2 py-0.5 rounded w-fit mb-3">
                        Before
                      </span>
                      <p className="text-sm font-medium text-neutral-800">{card.before}</p>
                    </div>
                    <div className="bg-pilarim-cream p-5 flex flex-col justify-end">
                      <span className="text-[10px] font-medium text-white bg-pilarim-bronze px-2 py-0.5 rounded w-fit mb-3">
                        After
                      </span>
                      <p className="text-sm font-medium text-neutral-800">{card.after}</p>
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="text-sm font-medium text-neutral-800">{card.label}</p>
                    <p className="text-xs text-pilarim-bronze mt-1">{card.period}で変化</p>
                    <p className="text-xs text-neutral-500 mt-1">{card.note}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
