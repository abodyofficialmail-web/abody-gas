import { User, Repeat, PersonStanding, CalendarCheck, Brain } from "lucide-react";

const FEATURES = [
  {
    icon: User,
    title: "毎回マンツーマン",
    description: "周りの目を気にせず、30代〜50代男性の体に合わせた指導を受けられます。",
  },
  {
    icon: Repeat,
    title: "ピラティスもパーソナルも受け放題",
    description: "その日の目的でメニューを選べる。通うほど、姿勢も代謝も整っていく。",
  },
  {
    icon: PersonStanding,
    title: "姿勢と機能性から整える",
    description: "猫背・巻き肩・腰痛の土台を直し、見た目だけでなく動ける体をつくります。",
  },
  {
    icon: CalendarCheck,
    title: "続かない人のための設計",
    description: "30分から通える。仕事の前後に入れて、運動習慣が自然と定着します。",
  },
  {
    icon: Brain,
    title: "セッション後のフィードバック",
    description: "毎回の変化を可視化。何のために今日動いたのかが、はっきり残ります。",
  },
];

export function LPIntroduction() {
  return (
    <section className="py-14 sm:py-16 bg-neutral-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <h2 className="text-base sm:text-lg font-bold text-center text-neutral-900 mb-10 sm:mb-12 tracking-wide">
          PILARIMが選ばれる理由
        </h2>
        <div className="md:hidden overflow-x-auto snap-x snap-mandatory -mx-4 px-4 pb-2 scrollbar-hide">
          <div className="flex gap-4" style={{ width: "max-content" }}>
            {FEATURES.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="flex-shrink-0 w-[75%] max-w-[280px] snap-start">
                  <div className="bg-white rounded-2xl p-6 shadow-soft border border-neutral-100 h-full">
                    <div className="w-12 h-12 rounded-2xl bg-pilarim-bronze/10 flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6 text-pilarim-bronze" strokeWidth={1.5} />
                    </div>
                    <h3 className="text-sm font-semibold text-neutral-900 mb-2">{item.title}</h3>
                    <p className="text-neutral-600 text-xs leading-relaxed">{item.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="hidden md:grid md:grid-cols-2 gap-6">
          {FEATURES.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="bg-white rounded-2xl p-6 sm:p-8 shadow-soft border border-neutral-100 min-w-0"
              >
                <div className="w-12 h-12 rounded-2xl bg-pilarim-bronze/10 flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-pilarim-bronze" strokeWidth={1.5} />
                </div>
                <h3 className="text-sm font-semibold text-neutral-900 mb-2 whitespace-normal break-words">
                  {item.title}
                </h3>
                <p className="text-neutral-600 text-xs sm:text-sm leading-relaxed whitespace-normal break-words">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
