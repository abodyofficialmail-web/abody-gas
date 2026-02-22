import { Star } from "lucide-react";

const REVIEWS = [
  { id: 1, stars: 5, text: "アットホームな雰囲気で、続けやすいです。個室なので周りの目を気にせず集中できました。" },
  { id: 2, stars: 5, text: "毎回のフィードバックで成長が実感できます。頑張りすぎず、自分のペースで通えています。" },
  { id: 3, stars: 5, text: "個室のプライベート空間が安心。恥ずかしがり屋の私でも通えました。" },
  { id: 4, stars: 5, text: "トレーナーさんが寄り添ってくれて、続けられた。体の変化より、心が軽くなった気がする。" },
];

export function LPReviews() {
  return (
    <section className="py-16 sm:py-24 bg-neutral-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <h2 className="text-base sm:text-lg font-bold text-center text-neutral-900 mb-10 sm:mb-12 tracking-wide">お客さまの声</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {REVIEWS.map((review) => (
            <div key={review.id} className="bg-white rounded-2xl p-6 shadow-soft border border-neutral-100">
              <div className="flex gap-1 mb-3">
                {Array.from({ length: review.stars }).map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" strokeWidth={1.5} />
                ))}
              </div>
              <p className="text-neutral-700 leading-relaxed text-sm sm:text-base">「{review.text}」</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
