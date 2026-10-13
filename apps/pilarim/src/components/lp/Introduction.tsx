import { CalendarDays, Repeat, User } from "lucide-react";

const FEATURES = [
  {
    icon: CalendarDays,
    title: "月に何回でも通える",
    description: "回数制限なしで通い放題。ペースを気にせず続けられます。",
  },
  {
    icon: Repeat,
    title: "ピラティスと筋トレを自由に選べる",
    description: "その日の体調や目標に合わせて、ピラティスとパーソナルを自由に選べます。",
  },
  {
    icon: User,
    title: "毎回マンツーマン",
    description: "経験豊富なトレーナーがあなたに寄り添い、しっかりサポートします。",
  },
];

export function LPIntroduction() {
  return (
    <section id="why" className="py-10 sm:py-24 bg-white">
      <div className="max-w-6xl mx-auto px-3 sm:px-6">
        <h2 className="text-base sm:text-3xl font-bold text-center text-pilarim-ink mb-5 sm:mb-14">
          PILARIMが続けやすい理由
        </h2>
        <div className="grid grid-cols-3 gap-1.5 sm:gap-5">
          {FEATURES.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="rounded-xl sm:rounded-3xl border border-neutral-200 bg-white px-1.5 py-3 sm:p-7 text-center shadow-soft"
              >
                <div className="mx-auto w-8 h-8 sm:w-11 sm:h-11 rounded-lg sm:rounded-2xl bg-pilarim-bronze/10 flex items-center justify-center mb-2 sm:mb-4">
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-pilarim-bronze" strokeWidth={1.8} />
                </div>
                <h3 className="font-bold text-pilarim-ink text-[11px] sm:text-base leading-snug mb-1 sm:mb-2">
                  {item.title}
                </h3>
                <p className="text-[9px] sm:text-sm text-neutral-600 leading-relaxed">
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
