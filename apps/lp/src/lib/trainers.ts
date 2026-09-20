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
  /** 一言 */
  catch: string;
  /** 実績/資格 */
  credentials?: string[];
  /** トレーニング歴 */
  experience?: string;
  /** 得意なトレーニング */
  strengths: string[];
  /** 趣味 */
  hobbies?: string[];
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
    catch: "トレーニングは、きつさより楽しさ。楽しく長く続けることを、1番大切にしてます‼",
    credentials: ["JATIトレーニング指導者", "健康運動実践指導者"],
    experience: "9年",
    strengths: ["筋肥大", "ストレッチ"],
    hobbies: ["映画鑑賞", "サッカー観戦"],
  },
];

export function storeName(id: TrainerStoreId): string {
  return TRAINER_STORES.find((s) => s.id === id)?.name ?? id;
}
