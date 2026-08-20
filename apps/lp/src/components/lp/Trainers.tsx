import Link from "next/link";

export function LPTrainers() {
  return (
    <section className="py-16 sm:py-24 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
        <h2 className="text-base sm:text-lg font-bold text-neutral-900 mb-4 tracking-wide">
          トレーナー紹介
        </h2>
        <p className="text-neutral-600 mb-6 text-sm sm:text-base">
          マンツーマンで寄り添うトレーナーの強みを、別ページで紹介しています。
        </p>
        <Link
          href="/trainers"
          className="inline-block px-8 py-4 rounded-2xl bg-abody-teal text-white font-semibold hover:bg-abody-teal-dark transition-colors shadow-soft"
        >
          トレーナー一覧を見る
        </Link>
      </div>
    </section>
  );
}
