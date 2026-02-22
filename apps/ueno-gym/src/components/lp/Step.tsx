import Image from "next/image";
import { Calendar, MapPin, MessageCircle, Dumbbell, Coffee } from "lucide-react";

const STEPS = [
  {
    icon: Calendar,
    title: "1. 予約",
    description: "LINEで希望日時をお知らせください。",
    image: "/booking-step.png",
    imageAlt: "スマートフォンで予約する様子",
  },
  {
    icon: MapPin,
    title: "2. 来店",
    description: "最寄りの店舗へお越しください。",
    image: "/visit-step.png",
    imageAlt: "ジムへ来店する様子",
  },
  {
    icon: MessageCircle,
    title: "3. カウンセリング",
    description: "体の状態や目標をヒアリングします。",
    image: "/counseling-step.png",
    imageAlt: "トレーナーとカウンセリング",
  },
  {
    icon: Dumbbell,
    title: "4. 体験",
    description: "実際のトレーニングを体験していただきます。",
    image: "/experience-step.png",
    imageAlt: "パーソナルトレーニングの体験",
  },
  {
    icon: Coffee,
    title: "5. プロテイン提供",
    description: "トレーニング後にプロテインをお渡しします。（恵比寿店は提供なし）",
    image: "/protein-step.png",
    imageAlt: "プロテイン提供",
  },
];

export function LPStep() {
  return (
    <section className="py-14 sm:py-16 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <h2 className="text-base sm:text-lg font-bold text-center text-neutral-900 mb-10 sm:mb-12 tracking-wide">無料体験の流れ</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {STEPS.map((step) => {
            const Icon = step.icon;
            return (
              <div key={step.title} className="group min-w-0">
                <div className="relative aspect-[4/3] rounded-2xl overflow-hidden mb-4 shadow-soft bg-neutral-100">
                  <Image
                    src={step.image}
                    alt={step.imageAlt}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />
                  <div className="absolute top-3 left-3 w-10 h-10 rounded-xl bg-abody-teal/90 flex items-center justify-center shadow-md">
                    <Icon className="w-5 h-5 text-white" strokeWidth={2} />
                  </div>
                </div>
                <h3 className="text-sm font-bold text-neutral-900 mb-2">{step.title}</h3>
                <p className="text-neutral-600 text-xs leading-relaxed">{step.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
