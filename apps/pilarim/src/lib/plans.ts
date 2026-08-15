export type MembershipPlan = {
  id: string;
  name: string;
  nameEn: string;
  summary: string;
  description: string;
  firstMonth: string;
  fromThirdMonth: string;
};

/** 上野店：ピラティス受け放題は1回30分 */
export const UENO_PLANS: MembershipPlan[] = [
  {
    id: "basic",
    name: "ベーシックプラン",
    nameEn: "basic plan",
    summary: "ピラティス受け放題（1回30分）",
    description:
      "月に何回でもピラティスが受けられる。姿勢改善や低強度のトレーニングから始めたい方におすすめ。",
    firstMonth: "22,500",
    fromThirdMonth: "20,000",
  },
  {
    id: "bodymake",
    name: "ボディメイクプラン",
    nameEn: "bodymake plan",
    summary: "ピラティス受け放題（1回30分）＋マンツーマンパーソナル2回",
    description:
      "ベーシックプランにマンツーマンのパーソナルトレーニング2回。アウターマッスルもつけてボディメイクしたい人におすすめ。",
    firstMonth: "31,000",
    fromThirdMonth: "28,000",
  },
  {
    id: "specialmake",
    name: "スペシャルメイクプラン",
    nameEn: "specialmake",
    summary: "ピラティス受け放題（1回30分）＋マンツーマンパーソナル4回",
    description:
      "ベーシックプランにマンツーマンのパーソナルトレーニング4回。しっかり結果を出したい人におすすめ。",
    firstMonth: "33,000",
    fromThirdMonth: "30,000",
  },
  {
    id: "allinone",
    name: "オールインワンプラン",
    nameEn: "all-in-one plan",
    summary: "ピラティス受け放題（1回30分）＋マンツーマンパーソナル受け放題（30分）",
    description:
      "姿勢改善もダイエットも、最短で進めたい人におすすめ。",
    firstMonth: "48,000",
    fromThirdMonth: "45,000",
  },
];

export const SHINJUKU_PLAN = {
  name: "マンツーマン",
  nameEn: "personal training",
  summary: "マンツーマンパーソナルトレーニング",
  description: "新宿店はマンツーマンのパーソナルトレーニング専門。",
  monthly: "25,000",
};

export const TICKET_PLANS = [
  {
    name: "ピラティスのパーソナル",
    nameEn: "personal",
    description:
      "ピラティスパーソナル（60分）。マンツーマンのピラティスセッション。あなたに合ったオリジナルのプログラムでボディメイクや体の機能性を高めます。",
    prices: [
      { label: "1回分", value: "7,000", note: "" },
      { label: "4回分", value: "24,000", note: "4,000円お得" },
    ],
  },
  {
    name: "ダイエットプラン",
    nameEn: "diet plan",
    description:
      "マンツーマンであなたに合った食事の提案やアドバイスをします。プロのトレーナーがサポートするので、効率よく減量できます。",
    prices: [
      { label: "1ヶ月", value: "15,000", note: "" },
      { label: "3ヶ月", value: "30,000", note: "1ヶ月お得" },
    ],
  },
];
