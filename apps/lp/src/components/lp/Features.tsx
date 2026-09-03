import Image from "next/image";
import {
  Bell,
  Brain,
  ClipboardList,
  Dumbbell,
  LineChart,
  MessageSquare,
} from "lucide-react";

/** 写真は public/features/ の同名ファイルを差し替えるだけで更新できます。 */
const PHOTOS = {
  training: "/features/training.png",
  stretch: "/features/stretch.png",
  pilates: "/features/pilates.png",
  continue: "/features/continue.png",
  goalMuscle: "/features/goal-muscle.png",
  goalFlexibility: "/features/goal-flexibility.png",
  goalPosture: "/features/goal-posture.png",
  goalDiet: "/features/goal-diet.png",
} as const;

const SERVICES = [
  {
    no: "01",
    title: "パーソナルトレーニング",
    photo: PHOTOS.training,
    alt: "パーソナルトレーニングの様子",
    points: ["個室のプライベート空間", "毎回マンツーマン", "オリジナルメニュー"],
  },
  {
    no: "02",
    title: "パーソナルストレッチ",
    photo: PHOTOS.stretch,
    alt: "パーソナルストレッチの様子",
    points: [
      "調子が悪い日は、今日はストレッチ",
      "週2回トレーニング＋週1回ストレッチで機能性アップ",
    ],
  },
  {
    no: "03",
    title: "マシンピラティス",
    photo: PHOTOS.pilates,
    alt: "マシンピラティスの様子",
    points: [
      "マンツーマン or 少人数",
      "体幹強化",
      "姿勢改善",
      "膝・腰に負担なく鍛えることもできる",
    ],
  },
] as const;

const CONTINUE_REASONS = [
  { icon: Bell, title: "LINEでリマインド", body: "通うタイミングを逃さない。" },
  { icon: Brain, title: "意識から変えられる", body: "習慣化までトレーナーが伴走します。" },
  {
    icon: ClipboardList,
    title: "毎回届くセッション内容とアンケート",
    body: "やったこと・感じたことがその場で残ります。",
  },
  {
    icon: MessageSquare,
    title: "トレーナーからのフィードバック",
    body: "自分の頑張りや成長を、毎回実感できます。",
  },
  {
    icon: LineChart,
    title: "マイカルテで成長が見える",
    body: "体型のビフォーアフターや、重量の伸びを確認できます。",
  },
] as const;

const GOALS = [
  {
    photo: PHOTOS.goalMuscle,
    alt: "筋力トレーニングの様子",
    want: "バルクアップ、筋力アップするなら",
    plan: "パーソナルトレーニングメイン受け放題",
  },
  {
    photo: PHOTOS.goalFlexibility,
    alt: "ストレッチで体を整える様子",
    want: "筋力だけでなく、体を柔らかくしたい",
    plan: "パーソナルトレーニングとパーソナルストレッチで受け放題",
  },
  {
    photo: PHOTOS.goalPosture,
    alt: "ピラティスで姿勢を整える様子",
    want: "体幹も鍛えて姿勢改善したい",
    plan: "パーソナルトレーニングとピラティスで受け放題",
  },
  {
    photo: PHOTOS.goalDiet,
    alt: "食事とトレーニングで減量するイメージ",
    want: "減量・ダイエットしたい",
    plan: "トレーニングと食事パーソナルで受け放題",
    note: "無理なく減量して、リバウンドを防ぐ。",
  },
] as const;

function PhotoFrame({
  src,
  alt,
  className = "",
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  return (
    <div className={`relative overflow-hidden bg-neutral-200 ${className}`}>
      <Image src={src} alt={alt} fill className="object-cover" sizes="(max-width: 768px) 100vw, 560px" />
    </div>
  );
}

export function LPFeatures() {
  return (
    <section id="features" className="bg-white">
      <div className="bg-neutral-900 text-white px-6 py-14 sm:py-20 text-center">
        <p className="text-abody-teal text-[11px] sm:text-xs font-bold tracking-[0.35em] mb-4">
          FEATURES
        </p>
        <h2 className="font-shippori text-2xl sm:text-4xl leading-relaxed tracking-wide">
          Abodyは、
          <span className="text-abody-teal">料金内</span>
          で
          <br className="sm:hidden" />
          全部受け放題。
        </h2>
        <p className="mt-4 text-sm sm:text-base text-white/70">
          パーソナルも、ストレッチも、ピラティスも。
          <br className="sm:hidden" />
          追加料金なく通い放題。
        </p>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14 sm:py-20 space-y-16 sm:space-y-24">
        {SERVICES.map((service, index) => {
          const imageLeft = index % 2 === 0;
          return (
            <article
              key={service.no}
              className="grid md:grid-cols-2 gap-8 md:gap-12 items-center"
            >
              <div className={imageLeft ? "md:order-1" : "md:order-2"}>
                <PhotoFrame
                  src={service.photo}
                  alt={service.alt}
                  className="aspect-[16/10] rounded-3xl shadow-soft"
                />
              </div>
              <div className={imageLeft ? "md:order-2" : "md:order-1"}>
                <p className="text-abody-teal font-bold text-sm tracking-[0.25em] mb-2">
                  {service.no}
                </p>
                <h3 className="font-shippori text-xl sm:text-3xl text-neutral-900 tracking-wide mb-5">
                  {service.title}
                </h3>
                <ul className="space-y-3">
                  {service.points.map((point) => (
                    <li key={point} className="flex items-start gap-3 text-sm sm:text-base text-neutral-700">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-abody-teal" />
                      <span className="leading-relaxed">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          );
        })}
      </div>

      <div className="bg-neutral-50 py-14 sm:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <p className="text-center text-abody-teal text-[11px] sm:text-xs font-bold tracking-[0.35em] mb-3">
            CONTINUE
          </p>
          <h2 className="font-shippori text-xl sm:text-3xl text-center text-neutral-900 tracking-wide mb-10 sm:mb-14">
            継続できる理由
          </h2>
          <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
            <PhotoFrame
              src={PHOTOS.continue}
              alt="セッション後のフィードバックの様子"
              className="aspect-[4/5] sm:aspect-[5/4] md:aspect-[4/5] rounded-3xl shadow-soft max-h-[520px]"
            />
            <ul className="space-y-5">
              {CONTINUE_REASONS.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.title} className="flex gap-4">
                    <div className="w-11 h-11 shrink-0 rounded-2xl bg-abody-teal/10 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-abody-teal" strokeWidth={1.6} />
                    </div>
                    <div>
                      <p className="font-bold text-neutral-900 text-sm sm:text-base">{item.title}</p>
                      <p className="text-neutral-600 text-xs sm:text-sm mt-1 leading-relaxed">
                        {item.body}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>

      <div className="py-14 sm:py-20 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <p className="text-center text-abody-teal text-[11px] sm:text-xs font-bold tracking-[0.35em] mb-3">
            YOUR PLAN
          </p>
          <h2 className="font-shippori text-xl sm:text-3xl text-center text-neutral-900 tracking-wide leading-relaxed mb-10 sm:mb-14">
            自分にあったパーソナルで
            <br />
            最短でボディメイクしませんか？
          </h2>
          <div className="grid sm:grid-cols-2 gap-5 sm:gap-6">
            {GOALS.map((goal) => (
              <article
                key={goal.want}
                className="group bg-white rounded-3xl overflow-hidden border border-neutral-100 shadow-soft"
              >
                <PhotoFrame
                  src={goal.photo}
                  alt={goal.alt}
                  className="aspect-[16/9] group-hover:[&_img]:scale-105 [&_img]:transition-transform [&_img]:duration-500"
                />
                <div className="p-5 sm:p-6">
                  <div className="flex items-start gap-2 mb-3">
                    <Dumbbell className="w-4 h-4 text-abody-teal mt-1 shrink-0" strokeWidth={1.8} />
                    <h3 className="font-bold text-neutral-900 text-sm sm:text-base leading-snug">
                      {goal.want}
                    </h3>
                  </div>
                  <p className="text-abody-teal font-bold text-sm sm:text-base leading-snug">
                    {goal.plan}
                  </p>
                  {"note" in goal && goal.note && (
                    <p className="text-neutral-500 text-xs sm:text-sm mt-2">{goal.note}</p>
                  )}
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
