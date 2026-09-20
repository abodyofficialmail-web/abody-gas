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
  {
    id: "hiromu",
    name: "ひろむ",
    nameEn: "Hiromu",
    photo: "/trainers/hiromu.jpg",
    stores: [],
    catch: "初心者からコンテスト出場を考えてるお客様等抜かりなく、丁寧にしっかりサポートさせていただきます！\n今日も最高の1日にしよう！",
    experience: "1年半",
    strengths: ["ダイエット", "バルクアップ"],
  },
  {
    id: "seiya",
    name: "せいや",
    nameEn: "Seiya",
    photo: "/trainers/seiya.jpg",
    stores: [],
    catch: "身体を変えることで人生を変えるお手伝いいたします！",
    credentials: ["大会出場あり", "栄養コンシェルジュ1つ星"],
    experience: "8年",
    strengths: ["追い込み", "筋肥大"],
    hobbies: ["サウナ", "格闘技観戦", "サッカー観戦"],
  },
  {
    id: "takeharu",
    name: "たけはる",
    nameEn: "Takeharu",
    photo: "/trainers/takeharu.jpg",
    stores: [],
    catch: "自分と一緒に、ボディメイク頑張りましょう🔥",
    credentials: ["FWJ茨城大会 ビギナー7位", "FWJ茨城大会 オープン6位"],
    experience: "2年半",
    strengths: ["筋肥大", "フォーム修正"],
    hobbies: ["トレーニング", "サーフィン"],
  },
  {
    id: "ryo",
    name: "りょう",
    nameEn: "Ryo",
    photo: "/trainers/ryo.jpg",
    stores: [],
    catch: "トレーニングは身体も心も変わります！\n理想の身体に向けて全力でサポート致します！",
    credentials: [
      "NESTA RTS",
      "NESTA PFT",
      "ストレッチポール運動指導",
      "2023アマチュアオリンピア韓国85キロ出場",
      "2025アマチュアオリンピア韓国90キロ出場",
      "スクワット220キロ10回",
    ],
    experience: "8年",
    strengths: ["ボディーメイク", "ダイエット", "姿勢改善"],
    hobbies: ["ハムスターを眺める", "好きな人とご飯を一緒に作る"],
  },
  {
    id: "yuto",
    name: "ゆうと",
    nameEn: "Yuto",
    photo: "/trainers/yuto.jpg",
    stores: [],
    catch: "「できない」から「できる」へ。\nその感動体験を通じながら、目標達成に向けて全力でサポートいたします！",
    credentials: ["NSCA-CPT", "NACM-CPT", "トレーニング検定2級"],
    experience: "8年",
    strengths: ["筋肥大", "姿勢改善", "ストレッチ"],
    hobbies: ["サウナ", "野球観戦"],
  },
];

export function storeName(id: TrainerStoreId): string {
  return TRAINER_STORES.find((s) => s.id === id)?.name ?? id;
}
