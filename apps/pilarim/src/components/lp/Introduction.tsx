import { CalendarCheck, Repeat, User } from "lucide-react";

const FEATURES = [
  {
    icon: CalendarCheck,
    title: "通いたいだけ通える",
    description: "受け放題だから、続かない理由をつくらない。仕事の前後30分でも習慣になります。",
  },
  {
    icon: Repeat,
    title: "ピラティスも筋トレも自由",
    description: "その日の体調でメニューを選べる。姿勢を整える日も、引き締める日も、同じスタジオで。",
  },
  {
    icon: User,
    title: "毎回マンツーマン",
    description: "周りの目を気にせず、30代〜50代男性の体に合わせた指導を受けられます。",
  },
];

export function LPIntroduction() {
  return (
    <section id="why" className="py-16 sm:py-24 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <h2 className="text-xl sm:text-3xl font-bold text-center text-pilarim-ink mb-10 sm:mb-14">
          PILARIMが選ばれる理由
        </h2>
        <div className="grid md:grid-cols-3 gap-5">
          {FEATURES.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="rounded-3xl border border-neutral-200 bg-white p-7 shadow-soft"
              >
                <div className="w-11 h-11 rounded-2xl bg-pilarim-bronze/10 flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-pilarim-bronze" strokeWidth={1.8} />
                </div>
                <h3 className="font-bold text-pilarim-ink mb-2">{item.title}</h3>
                <p className="text-sm text-neutral-600 leading-relaxed">{item.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
