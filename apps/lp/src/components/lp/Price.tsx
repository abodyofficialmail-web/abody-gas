export function LPPrice() {
  return (
    <section className="py-16 sm:py-24 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <h2 className="text-base sm:text-lg font-bold text-center text-neutral-900 mb-10 sm:mb-12 tracking-wide">料金プラン</h2>
        <div className="bg-abody-teal rounded-2xl sm:rounded-3xl py-12 sm:py-16 px-6 sm:px-12 text-center shadow-soft">
          <p className="text-[10px] sm:text-xs text-white/90 mb-2">パーソナル通い放題30分 or 月60分4回＋30分2回</p>
          <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight">月額28,000円<span className="text-xl sm:text-2xl md:text-3xl font-medium text-white/95 ml-1">（税別）</span></p>
          <p className="text-white/90 text-sm sm:text-base mt-4">月に何回トレーニングしてもこの料金</p>
          <p className="text-white/90 text-sm sm:text-base mt-1">プロテイン飲み放題付き（恵比寿店はプロテイン提供なし）</p>
          <p className="text-white/80 text-xs sm:text-sm mt-4">※上野・桜木町店はマシンピラティスあり。恵比寿・新宿・福岡店はパーソナル中心。</p>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-4 sm:gap-6">
          <div className="bg-abody-teal rounded-2xl py-8 sm:py-10 px-4 sm:px-6 text-center shadow-soft min-w-0">
            <p className="text-white/90 text-sm sm:text-base font-medium">初回体験</p>
            <p className="text-xl sm:text-2xl md:text-3xl font-bold text-white mt-2">3,000円</p>
            <p className="text-white/80 text-xs sm:text-sm mt-1">（税別）※新宿店プレオープンCP中は0円</p>
          </div>
          <div className="bg-abody-teal rounded-2xl py-8 sm:py-10 px-4 sm:px-6 text-center shadow-soft min-w-0">
            <p className="text-white/90 text-sm sm:text-base font-medium">入会金</p>
            <p className="text-xl sm:text-2xl md:text-3xl font-bold text-white mt-2">15,000円</p>
            <p className="text-white/80 text-[10px] sm:text-xs mt-1">（税別）※新宿店プレオープンCP中は無料</p>
          </div>
        </div>
      </div>
    </section>
  );
}
