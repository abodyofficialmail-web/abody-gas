import { LINE_URL_RECRUIT } from "@/lib/constants";

export function LPRecruit() {
  return (
    <section className="py-16 sm:py-24 bg-abody-teal">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
        <h2 className="text-base sm:text-lg font-bold text-white mb-4 tracking-wide">求人募集中</h2>
        <p className="text-white/90 mb-6">ABODYで一緒に働きませんか？</p>
        <a
          href={LINE_URL_RECRUIT}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block px-8 py-4 rounded-2xl bg-white text-abody-teal font-semibold hover:bg-neutral-100 transition-colors"
        >
          採用情報を見る
        </a>
      </div>
    </section>
  );
}
