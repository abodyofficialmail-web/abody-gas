import { User, DoorOpen, Coffee, MessageSquare, Brain } from "lucide-react";

const FEATURES = [
  { icon: User, title: "毎回マンツーマン", description: "専門トレーナーがあなたの専属でサポート。" },
  { icon: DoorOpen, title: "個室のプライベート空間", description: "周りの目を気にせずトレーニングに集中。" },
  { icon: Coffee, title: "プロテイン飲み放題", description: "運動後のゴールデンタイムを逃さない。" },
  { icon: MessageSquare, title: "セッション終了時のフィードバック", description: "毎回の成長を可視化。マイカルテと連動して記録も残せます。" },
  { icon: Brain, title: "AI姿勢診断", description: "最新技術で体の歪みをチェック。" },
];

export function LPIntroduction() {
  return (
    <section className="py-14 sm:py-16 bg-neutral-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <h2 className="text-base sm:text-lg font-bold text-center text-neutral-900 mb-10 sm:mb-12 tracking-wide">ABODYが選ばれる理由</h2>
        <div className="md:hidden overflow-x-auto snap-x snap-mandatory -mx-4 px-4 pb-2 scrollbar-hide">
          <div className="flex gap-4" style={{ width: "max-content" }}>
            {FEATURES.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="flex-shrink-0 w-[75%] max-w-[280px] snap-start">
                  <div className="bg-white rounded-2xl p-6 shadow-soft border border-neutral-100 h-full">
                    <div className="w-12 h-12 rounded-2xl bg-abody-teal/10 flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6 text-abody-teal" strokeWidth={1.5} />
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
              <div key={item.title} className="bg-white rounded-2xl p-6 sm:p-8 shadow-soft border border-neutral-100 min-w-0">
                <div className="w-12 h-12 rounded-2xl bg-abody-teal/10 flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-abody-teal" strokeWidth={1.5} />
                </div>
                <h3 className="text-sm font-semibold text-neutral-900 mb-2 whitespace-normal break-words">{item.title}</h3>
                <p className="text-neutral-600 text-xs sm:text-sm leading-relaxed whitespace-normal break-words">{item.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
