/** 店舗別LINE予約リンク（体験予約） */
export const LINE_URL_EBISU = "https://lin.ee/Lt7TNZd";
export const LINE_URL_UENO = "https://lin.ee/j02i6sq";
export const LINE_URL_SAKURAGICHO = "https://lin.ee/X2nEVKr";

/** 店舗ID → LINE予約URL */
export const LINE_URL_BY_STORE: Record<string, string> = {
  ebisu: LINE_URL_EBISU,
  ueno: LINE_URL_UENO,
  sakuragicho: LINE_URL_SAKURAGICHO,
};

/** 共通LINE（ヘッダー・キャンペーン等で未指定時のフォールバック＝恵比寿店） */
export const LINE_URL =
  process.env.NEXT_PUBLIC_LINE_URL || LINE_URL_EBISU;

/** リクルート（採用）用LINE */
export const LINE_URL_RECRUIT = "https://lin.ee/cqUlxW8";

/** 本番サイトのオリジン（LP・APIのベースURL） */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://abody-gas.vercel.app";

/** 上野店個室利用ジムの予約ページ（体験予約のLINEとは別URL） */
export const BOOKING_PAGE_URL = `${SITE_URL}/booking`;

/** トレーニング風景のInstagram Reel。thumbnail に public/ 内の画像パスを指定するとサムネイル表示（例: /reel-thumb-1.jpg） */
export const INSTAGRAM_REELS: { url: string; thumbnail?: string }[] = [
  { url: "https://www.instagram.com/reel/DN5cyCOj6-0/" },
  { url: "https://www.instagram.com/reel/DG5Z3u3TBJx/" },
  { url: "https://www.instagram.com/reel/DTzovGWgRk7/" },
];
