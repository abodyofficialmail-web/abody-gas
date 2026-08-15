import Image from "next/image";
import { Calendar, MapPin, MessageCircle, Dumbbell, PersonStanding } from "lucide-react";

const STEPS = [
  {
    icon: Calendar,
    title: "1. 予約",
    description: "LINEで希望日時をお知らせください。",
    image:
      "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=900&q=80",
    imageAlt: "スマートフォンで予約する様子",
  },
  {
    icon: MapPin,
    title: "2. 来店",
    description: "スタジオへお越しください。手ぶらでも大丈夫です。",
    image:
      "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=900&q=80",
    imageAlt: "スタジオへ来店する様子",
  },
  {
    icon: MessageCircle,
    title: "3. カウンセリング",
    description: "姿勢・不調・目標をヒアリングします。続かなかった理由もここで整理します。",
    image:
      "https://images.unsplash.com/photo-1576678927484-cc907957088c?auto=format&fit=crop&w=900&q=80",
    imageAlt: "トレーナーとカウンセリング",
  },
  {
    icon: Dumbbell,
    title: "4. 体験",
    description: "ピラティスまたはパーソナルを、その日の体に合わせて体験します。",
    image:
      "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=900&q=80",
    imageAlt: "パーソナルまたはピラティスの体験",
  },
  {
    icon: PersonStanding,
    title: "5. フィードバック",
    description: "今日の体の状態と、今後の通い方をお伝えします。",
    image:
      "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=900&q=80",
    imageAlt: "体験後のフィードバック",
  },
];

export function LPStep() {
  return (
    <section className="py-14 sm:py-16 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <h2 className="text-base sm:text-lg font-bold text-center text-neutral-900 mb-10 sm:mb-12 tracking-wide">
          無料体験の流れ
        </h2>
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
                  <div className="absolute top-3 left-3 w-10 h-10 rounded-xl bg-pilarim-bronze/90 flex items-center justify-center shadow-md">
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
