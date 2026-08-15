/** 体験予約用LINE（未設定時はキャンペーンセクションへ誘導） */
export const LINE_URL = process.env.NEXT_PUBLIC_LINE_URL || "#campaign";

export const LINE_URL_UENO = process.env.NEXT_PUBLIC_LINE_URL_UENO || LINE_URL;
export const LINE_URL_SHINJUKU =
  process.env.NEXT_PUBLIC_LINE_URL_SHINJUKU || LINE_URL;

export const LINE_URL_BY_STORE: Record<string, string> = {
  ueno: LINE_URL_UENO,
  shinjuku: LINE_URL_SHINJUKU,
};

/** 採用用LINE */
export const LINE_URL_RECRUIT =
  process.env.NEXT_PUBLIC_LINE_URL_RECRUIT || LINE_URL;

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://pilarim.vercel.app";

export const STORES = [
  {
    id: "ueno",
    name: "上野店",
    address: "東京都台東区台東4-31-5オリオンビル4F",
    access: "上野駅 徒歩3分",
    hours: "9:00〜22:00",
    feature: "ピラティス受け放題（1回30分）＋パーソナル",
    pilates: true,
    borderColor: "#22c55e",
    mapUrl: "https://www.google.com/maps/search/?api=1&query=東京都台東区台東4-31-5",
  },
  {
    id: "shinjuku",
    name: "新宿店",
    address: "東京都新宿区西新宿7-22-39",
    access: "新宿駅 徒歩5分",
    hours: "9:00〜22:00",
    feature: "マンツーマン25,000円／ボディメイク・スペシャルメイク・オールインワンあり",
    pilates: true,
    borderColor: "#a855f7",
    mapUrl: "https://www.google.com/maps/search/?api=1&query=東京都新宿区西新宿7-22-39",
  },
] as const;

export type StoreId = (typeof STORES)[number]["id"];

/** トレーニング風景（Instagram Reel）。URLを追加するとサムネイル表示されます */
export const INSTAGRAM_REELS: { url: string; thumbnail?: string }[] = [];

export const STUDIO_SCENES = [
  {
    src: "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=900&q=80",
    alt: "マシンピラティスのレッスン風景",
  },
  {
    src: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=900&q=80",
    alt: "パーソナルトレーニングの様子",
  },
  {
    src: "https://images.unsplash.com/photo-1576678927484-cc907957088c?auto=format&fit=crop&w=900&q=80",
    alt: "トレーナーとマンツーマンで整える様子",
  },
];
