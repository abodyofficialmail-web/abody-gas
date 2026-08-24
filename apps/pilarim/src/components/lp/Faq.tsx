const FAQS = [
  {
    q: "運動が続いたことがなくても大丈夫ですか？",
    a: "大丈夫です。30分から通えて、毎回マンツーマンなので、一人で続かない人向けの設計です。",
  },
  {
    q: "ピラティスは男性でも受けられますか？",
    a: "受けられます。姿勢改善と体幹強化が目的なので、30代〜50代の男性にも合うメニューです。",
  },
  {
    q: "体験は何分ですか？",
    a: "カウンセリングと体験トレーニング合わせて約60分です。服装のレンタルもあります。",
  },
  {
    q: "上野店と新宿店の違いは？",
    a: "上野店はピラティス受け放題（1回30分）のプランが中心です。新宿店はマンツーマン25,000円に加え、ボディメイク以上のプランがあります。",
  },
];

export function LPFaq() {
  return (
    <section id="faq" className="py-16 sm:py-24 bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <h2 className="text-xl sm:text-3xl font-bold text-center text-pilarim-ink mb-10">FAQ</h2>
        <div className="space-y-4">
          {FAQS.map((item) => (
            <details key={item.q} className="group rounded-3xl border border-neutral-200 bg-white p-5 shadow-soft">
              <summary className="cursor-pointer font-semibold text-pilarim-ink list-none flex justify-between gap-4">
                {item.q}
                <span className="text-neutral-400 group-open:rotate-45 transition-transform">+</span>
              </summary>
              <p className="mt-3 text-sm text-neutral-600 leading-relaxed">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
