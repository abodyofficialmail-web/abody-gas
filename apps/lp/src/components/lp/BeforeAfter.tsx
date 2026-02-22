import Image from "next/image";

const CARDS = [
  { id: "male1", label: "男性会員", image: "/before-after-male1.png", alt: "男性会員 ビフォーアフター（3ヶ月）", objectPosition: "center top" as const, hideArrow: true },
  {
    id: "male2",
    label: "男性会員",
    beforeImage: "/before-after-male2-before.png",
    afterImage: "/before-after-male2-after.png",
    alt: "男性会員 ビフォーアフター",
  },
  { id: "female1", label: "女性会員", image: "/before-after-female1.png", alt: "女性会員 ビフォーアフター", objectPosition: "center center" as const },
  {
    id: "female2",
    label: "女性会員",
    beforeImage: "/before-after-female2-after.png",
    afterImage: "/before-after-female2-before.png",
    alt: "女性会員 ビフォーアフター",
  },
];

function BeforeAfterCard({ card }: { card: (typeof CARDS)[number] }) {
  const isBeforeAfter = "beforeImage" in card && "afterImage" in card;

  if (isBeforeAfter) {
    const ba = card as { id: string; label: string; beforeImage: string; afterImage: string; alt: string };
    return (
      <div className="bg-white rounded-2xl overflow-hidden shadow-soft border border-neutral-100">
        <div className="grid grid-cols-2 gap-0 aspect-[3/2]">
          <div className="relative bg-neutral-100 overflow-hidden">
            <Image src={ba.beforeImage} alt="Before" fill className="object-cover object-center" sizes="50vw" />
            <span className="absolute bottom-1 left-1 text-[10px] font-medium text-white bg-black/60 px-2 py-0.5 rounded z-10">Before</span>
          </div>
          <div className="relative bg-neutral-100 overflow-hidden">
            <Image src={ba.afterImage} alt="After" fill className="object-cover object-center" sizes="50vw" />
            <span className="absolute bottom-1 left-1 text-[10px] font-medium text-white bg-black/60 px-2 py-0.5 rounded z-10">After</span>
          </div>
        </div>
        <p className="p-4 text-sm font-medium text-neutral-800">{ba.label}</p>
      </div>
    );
  }

  const c = card as { id: string; label: string; image: string; alt: string; objectPosition?: string; hideArrow?: boolean };
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-soft border border-neutral-100">
      <div className="relative aspect-[3/2] bg-neutral-100 overflow-hidden">
        <Image
          src={c.image}
          alt={c.alt}
          fill
          className="object-cover"
          style={{ objectPosition: c.objectPosition || "center center" }}
          sizes="(max-width: 1024px) 50vw, 25vw"
        />
        {c.hideArrow && (
          <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-10 bg-neutral-600 z-10" aria-hidden />
        )}
        <span className="absolute bottom-2 left-2 text-[10px] font-medium text-white bg-black/60 px-2 py-1 rounded z-10">Before</span>
        <span className="absolute bottom-2 right-2 text-[10px] font-medium text-white bg-black/60 px-2 py-1 rounded z-10">After</span>
      </div>
      <p className="p-4 text-sm font-medium text-neutral-800">{c.label}</p>
    </div>
  );
}

export function LPBeforeAfter() {
  return (
    <section className="py-16 sm:py-24 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <h2 className="text-base sm:text-lg font-bold text-center text-neutral-900 mb-4 tracking-wide">続けたら変わった</h2>
        <p className="text-center text-neutral-600 mb-12 text-sm">会員様のビフォーアフター</p>
        <div className="overflow-x-auto snap-x snap-mandatory -mx-4 px-4 pb-2 scrollbar-hide">
          <div className="flex gap-6" style={{ width: "max-content" }}>
            {CARDS.map((card) => (
              <div key={card.id} className="flex-shrink-0 w-[85vw] sm:w-[70vw] md:w-[420px] lg:w-[480px] snap-start">
                <BeforeAfterCard card={card} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
