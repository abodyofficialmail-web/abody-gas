import Image from "next/image";

const PILATES_BENEFITS = [
  { title: "体幹強化", desc: "インナーマッスルを鍛え、安定した体の軸を作ります。" },
  { title: "姿勢改善", desc: "正しいアライメントで猫背や反り腰を整えます。" },
  { title: "柔軟性アップ", desc: "しなやかな動きで可動域を広げ、ケガ予防に。" },
  { title: "リラックス効果", desc: "呼吸に合わせた動きで心身の緊張をほぐします。" },
];

export function LPLifestyleSection() {
  return (
    <section className="py-16 sm:py-24 bg-neutral-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <h2 className="text-base sm:text-lg font-bold text-center text-neutral-900 mb-8 tracking-wide">ピラティスマシン導入しました</h2>
        <div className="rounded-2xl overflow-hidden shadow-soft border border-neutral-100 bg-white mb-10">
          <div className="relative aspect-[16/9] sm:aspect-[21/9] max-h-[320px]">
            <Image
              src="/pilates-machine.png"
              alt="ピラティスリフォーマーマシン"
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, 1152px"
            />
          </div>
        </div>
        <h3 className="text-sm sm:text-base font-bold text-center text-neutral-900 mb-6 tracking-wide">ピラティスのメリット</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {PILATES_BENEFITS.map((item) => (
            <div key={item.title} className="bg-white rounded-2xl p-5 shadow-soft border border-neutral-100">
              <h4 className="text-sm font-bold text-abody-teal mb-2">{item.title}</h4>
              <p className="text-neutral-600 text-xs leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
