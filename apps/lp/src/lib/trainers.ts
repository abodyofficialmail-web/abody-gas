/** 店舗ID（Header / Locations と揃える） */
export const TRAINER_STORES = [
  { id: "ebisu", name: "恵比寿店" },
  { id: "ueno", name: "上野店" },
  { id: "sakuragicho", name: "桜木町店" },
  { id: "shinjuku", name: "新宿店" },
  { id: "fukuoka", name: "福岡店" },
] as const;

export type TrainerStoreId = (typeof TRAINER_STORES)[number]["id"];

export type Trainer = {
  id: string;
  name: string;
  nameEn?: string;
  /** メイン写真。`apps/lp/public/trainers/` に置いてパスを指定する */
  photo?: string;
  /** 追加写真。カード内で切り替え表示する */
  photos?: string[];
  stores: TrainerStoreId[];
  catch: string;
  strengths: string[];
  bio: string;
};

/**
 * LPの `/trainers` に出すトレーナー一覧。
 * 写真は `apps/lp/public/trainers/` に置き、photo / photos を差し替える。
 */
export const TRAINERS: Trainer[] = [
  {
    id: "tomoki",
    name: "ともき",
    nameEn: "Tomoki",
    photo: "/trainers/tomoki.jpg",
    photos: ["/trainers/tomoki.jpg", "/trainers/tomoki-stage.jpg"],
    stores: ["ebisu", "shinjuku"],
    catch: "続けられる形に落とすのが得意",
    strengths: ["初心者の習慣化", "ボディメイク", "フィジーク"],
    bio: "「何から始めればいいかわからない」という方の最初の一歩を一緒に作ります。難しい種目を押し付けるのではなく、生活に合うペースで結果が出るトレーニングに落とすのが強みです。フィジーク大会にも出場し、見た目づくりの実体験も指導に活かしています。",
  },
];

export function storeName(id: TrainerStoreId): string {
  return TRAINER_STORES.find((s) => s.id === id)?.name ?? id;
}
