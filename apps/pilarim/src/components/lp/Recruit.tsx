import Link from "next/link";

export function LPRecruit() {
  return (
    <section className="py-16 sm:py-24 bg-pilarim-bronze">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
        <h2 className="text-base sm:text-lg font-bold text-white mb-4 tracking-wide">求人募集中</h2>
        <p className="text-white/90 mb-6">PILARIMで一緒に働きませんか？</p>
        <Link
          href="/recruit"
          className="inline-block px-8 py-4 rounded-2xl bg-white text-pilarim-bronze font-semibold hover:bg-neutral-100 transition-colors"
        >
          採用情報を見る
        </Link>
      </div>
    </section>
  );
}
