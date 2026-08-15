/** 体験予約用LINE（未設定時はキャンペーンセクションへ誘導） */
export const LINE_URL = process.env.NEXT_PUBLIC_LINE_URL || "#campaign";

/** 採用用LINE */
export const LINE_URL_RECRUIT =
  process.env.NEXT_PUBLIC_LINE_URL_RECRUIT || LINE_URL;

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://pilarim.vercel.app";

export const STUDIO = {
  id: "pilarim",
  name: "PILARIM",
  address: "体験予約時にアクセスをご案内します",
  access: "駅近・通いやすい立地",
  hours: "9:00〜22:00",
  feature: "マシンピラティス＋パーソナル受け放題",
  mapUrl: "",
};

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
