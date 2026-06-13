/** localStorage キー: Google広告経由の訪問者フラグ */
export const GOOGLE_ADS_VISITOR_KEY = "google_ads_visitor";

/** Previewモード用 localStorage キー（?gtag_preview=1 で有効化） */
export const GTAG_PREVIEW_KEY = "gtag_preview";

/** 新宿店_公式LINE追加 */
export const SHINJUKU_LINE_CONVERSION_SEND_TO = "AW-17030988109/6p08CJylobOcEM2Cgbk_";

const LINE_NAVIGATION_DELAY_MS = 300;
const LOG_PREFIX = "[ABODY GTAG Preview]";

type GtagFn = (...args: unknown[]) => void;

/** Tag Assistant 確認用 Preview モード（?gtag_preview=1 または開発環境） */
export function isGtagPreviewMode(): boolean {
  if (typeof window === "undefined") return false;

  const params = new URLSearchParams(window.location.search);
  if (params.get("gtag_preview") === "1") {
    localStorage.setItem(GTAG_PREVIEW_KEY, "true");
    return true;
  }

  if (process.env.NODE_ENV === "development") return true;

  return localStorage.getItem(GTAG_PREVIEW_KEY) === "true";
}

function gtagLog(message: string, data?: Record<string, unknown>): void {
  if (!isGtagPreviewMode()) return;
  if (data) {
    console.log(`${LOG_PREFIX} ${message}`, data);
    return;
  }
  console.log(`${LOG_PREFIX} ${message}`);
}

/** URLパラメータに gclid / wbraid / gbraid がある場合のみフラグを保存 */
export function markGoogleAdsVisitorFromUrl(): void {
  if (typeof window === "undefined") return;

  const params = new URLSearchParams(window.location.search);
  const gclid = params.get("gclid");
  const wbraid = params.get("wbraid");
  const gbraid = params.get("gbraid");

  gtagLog("markGoogleAdsVisitorFromUrl: URL params checked", {
    gclid,
    wbraid,
    gbraid,
    preview: isGtagPreviewMode(),
  });

  if (gclid || wbraid || gbraid) {
    localStorage.setItem(GOOGLE_ADS_VISITOR_KEY, "true");
    gtagLog("google_ads_visitor = true（Google広告経由として記録）", {
      matched: { gclid: !!gclid, wbraid: !!wbraid, gbraid: !!gbraid },
    });
    return;
  }

  gtagLog("google_ads_visitor は未設定（gclid / wbraid / gbraid なし）");
}

export function isGoogleAdsVisitor(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(GOOGLE_ADS_VISITOR_KEY) === "true";
}

/** 新宿店LINEへ遷移（Google広告経由の訪問者のみコンバージョン送信） */
export function navigateToShinjukuLine(lineUrl: string): void {
  const go = () => {
    gtagLog("LINEへ遷移", { lineUrl });
    window.location.href = lineUrl;
  };

  const isAdsVisitor = isGoogleAdsVisitor();

  gtagLog("新宿店LINE CTA クリック", {
    lineUrl,
    isGoogleAdsVisitor: isAdsVisitor,
    conversion: SHINJUKU_LINE_CONVERSION_SEND_TO,
  });

  if (!isAdsVisitor) {
    gtagLog("コンバージョン送信スキップ（Google広告経由ではない）");
    go();
    return;
  }

  const gtag = (window as unknown as { gtag?: GtagFn }).gtag;
  if (typeof gtag === "function") {
    gtagLog("コンバージョン送信: 新宿店_公式LINE追加", {
      send_to: SHINJUKU_LINE_CONVERSION_SEND_TO,
      event: "conversion",
    });
    gtag("event", "conversion", {
      send_to: SHINJUKU_LINE_CONVERSION_SEND_TO,
    });
  } else {
    gtagLog("コンバージョン送信失敗: gtag が未定義", { gtagType: typeof gtag });
  }

  gtagLog(`LINE遷移を ${LINE_NAVIGATION_DELAY_MS}ms 後に実行`);
  setTimeout(go, LINE_NAVIGATION_DELAY_MS);
}

/** 新宿店以外のLINEへ遷移（コンバージョン計測なし） */
export function navigateToLine(lineUrl: string): void {
  gtagLog("新宿店以外のLINE CTA クリック（コンバージョン計測なし）", { lineUrl });
  window.location.href = lineUrl;
}

/** 店舗IDに応じてLINE遷移（新宿店のみ条件付きコンバージョン） */
export function navigateToStoreLine(storeId: string, lineUrl: string): void {
  gtagLog("店舗LINE CTA クリック", { storeId, lineUrl });
  if (storeId === "shinjuku") {
    navigateToShinjukuLine(lineUrl);
    return;
  }
  navigateToLine(lineUrl);
}
