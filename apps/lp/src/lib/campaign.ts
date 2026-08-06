/** 夏の特別キャンペーン（LP共通） */
export const CAMPAIGN_IMAGE = "/campaign.png";
export const CAMPAIGN_IMAGE_ALT =
  "Abody 夏の特別キャンペーン 初月9,800円 体験トレーニング・入会金無料";

export const CAMPAIGN_TITLE = "夏の特別キャンペーン";
export const CAMPAIGN_SUBTITLE = "今年こそ、理想のカラダを手に入れるチャンス！";
export const CAMPAIGN_PERIOD = "8.1（土）〜 8.23（日）";
export const CAMPAIGN_LIMIT = "先着5名様限定";
export const CAMPAIGN_FIRST_MONTH_ORIGINAL = "30,800円";
export const CAMPAIGN_FIRST_MONTH_PRICE = "9,800円";

export const CAMPAIGN_REMAINING_SLOTS: Record<string, number> = {
  shinjuku: 4,
  ueno: 3,
  sakuragicho: 3,
  ebisu: 2,
  fukuoka: 3,
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
  "【夏の特別CP】初月9,800円｜体験・入会金無料｜8/1〜8/23";
