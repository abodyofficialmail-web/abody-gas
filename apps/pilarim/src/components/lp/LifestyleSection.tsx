import Image from "next/image";

const PILATES_BENEFITS = [
  { title: "体幹強化", desc: "インナーマッスルを鍛え、デスクワークでも崩れにくい軸をつくります。" },
  { title: "姿勢改善", desc: "猫背・巻き肩・反り腰を、正しいアライメントで整えます。" },
  { title: "機能性アップ", desc: "可動域と安定性を同時に上げ、日常の動きが楽になります。" },
  { title: "引き締め", desc: "呼吸と連動した動きで、無理な食事制限に頼らない体づくりへ。" },
];

export function LPLifestyleSection() {
  return (
    <section className="py-16 sm:py-24 bg-neutral-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <h2 className="text-base sm:text-lg font-bold text-center text-neutral-900 mb-8 tracking-wide">
          ピラティスとパーソナルを、同じスタジオで
        </h2>
        <div className="rounded-2xl overflow-hidden shadow-soft border border-neutral-100 bg-white mb-10">
          <div className="relative aspect-[16/9] sm:aspect-[21/9] max-h-[320px]">
            <Image
              src="https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1600&q=80"
              alt="ピラティスリフォーマーマシン"
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, 1152px"
            />
          </div>
        </div>
        <h3 className="text-sm sm:text-base font-bold text-center text-neutral-900 mb-6 tracking-wide">
          ピラティスのメリット
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {PILATES_BENEFITS.map((item) => (
            <div key={item.title} className="bg-white rounded-2xl p-5 shadow-soft border border-neutral-100">
              <h4 className="text-sm font-bold text-pilarim-bronze mb-2">{item.title}</h4>
              <p className="text-neutral-600 text-xs leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
