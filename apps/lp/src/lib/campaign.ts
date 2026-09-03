/** ボディメイクキャンペーン（LP共通） */
export const CAMPAIGN_IMAGE = "/campaign.jpg";
export const CAMPAIGN_IMAGE_ALT =
  "Abody ボディメイクキャンペーン 先着5名限定 初月980円 パーソナルトレーニング受け放題";

export const CAMPAIGN_TITLE = "鍛えて整える ボディメイクキャンペーン";
export const CAMPAIGN_SUBTITLE = "無理なく続くから、継続できる。";
export const CAMPAIGN_PERIOD = "9.1（火）〜 9.23（水）";
export const CAMPAIGN_LIMIT = "先着5名限定";
export const CAMPAIGN_FIRST_MONTH_ORIGINAL = "30,800円";
export const CAMPAIGN_FIRST_MONTH_PRICE = "9,800円";
export const CAMPAIGN_FIRST_MONTH_SPECIAL = "980円";
export const CAMPAIGN_GIFT =
  "パーソナルストレッチ＋筋膜リリース 30分×2回プレゼント";

export const CAMPAIGN_REMAINING_SLOTS: Record<string, number> = {
  shinjuku: 5,
  ueno: 5,
  sakuragicho: 5,
  ebisu: 5,
  fukuoka: 5,
};

export const CAMPAIGN_STORES = [
  {
    id: "ebisu",
    name: "恵比寿店",
    buttonClass:
      "bg-blue-600 hover:bg-blue-700 text-white focus-visible:ring-blue-500",
  },
  {
    id: "ueno",
    name: "上野店",
    buttonClass:
      "bg-green-600 hover:bg-green-700 text-white focus-visible:ring-green-500",
  },
  {
    id: "sakuragicho",
    name: "桜木町店",
    buttonClass:
      "bg-amber-500 hover:bg-amber-600 text-neutral-900 focus-visible:ring-amber-400",
  },
  {
    id: "shinjuku",
    name: "新宿店",
    buttonClass:
      "bg-purple-600 hover:bg-purple-700 text-white focus-visible:ring-purple-500",
  },
  {
    id: "fukuoka",
    name: "福岡店",
    buttonClass:
      "bg-rose-500 hover:bg-rose-600 text-white focus-visible:ring-rose-400",
  },
] as const;

export const CAMPAIGN_BAR_TEXT =
  "【ボディメイクCP】先着5名 初月980円｜体験・入会金無料｜9/1〜9/23";
