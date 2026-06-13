/** 店舗別LINE予約リンク（体験予約） */
export const LINE_URL_EBISU = "https://lin.ee/Lt7TNZd";
export const LINE_URL_UENO = "https://lin.ee/j02i6sq";
export const LINE_URL_SAKURAGICHO = "https://lin.ee/X2nEVKr";
export const LINE_URL_SHINJUKU =
  process.env.NEXT_PUBLIC_LINE_URL_SHINJUKU || "https://lin.ee/67ezcOd";
export const LINE_URL_FUKUOKA = "https://lin.ee/spUXr6b";

/** 店舗ID → LINE予約URL */
export const LINE_URL_BY_STORE: Record<string, string> = {
  ebisu: LINE_URL_EBISU,
  ueno: LINE_URL_UENO,
  sakuragicho: LINE_URL_SAKURAGICHO,
  shinjuku: LINE_URL_SHINJUKU,
  fukuoka: LINE_URL_FUKUOKA,
};

/** 共通LINE（ヘッダー・キャンペーン等で未指定時のフォールバック＝恵比寿店） */
export const LINE_URL =
  process.env.NEXT_PUBLIC_LINE_URL || LINE_URL_EBISU;

/** リクルート（採用）用LINE */
export const LINE_URL_RECRUIT = "https://lin.ee/cqUlxW8";

/** 本番サイトのオリジン（LP用） */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://abodyl.vercel.app";

/** 上野店個室利用ジムの予約ページ（別サイトのURL。ジム利用は abody-gas-booking-2b6k） */
export const BOOKING_PAGE_URL =
  process.env.NEXT_PUBLIC_BOOKING_URL || "https://abody-gas-booking-2b6k.vercel.app/booking";

/** トレーニング風景のInstagram Reel。thumbnail に public/ 内の画像パスを指定するとサムネイル表示（例: /reel-thumb-1.jpg） */
export const INSTAGRAM_REELS: { url: string; thumbnail?: string }[] = [
  { url: "https://www.instagram.com/reel/DN5cyCOj6-0/" },
  { url: "https://www.instagram.com/reel/DG5Z3u3TBJx/" },
  { url: "https://www.instagram.com/reel/DTzovGWgRk7/" },
];
