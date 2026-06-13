"use client";

import { useEffect } from "react";
import {
  isGtagPreviewMode,
  isGoogleAdsVisitor,
  markGoogleAdsVisitorFromUrl,
  SHINJUKU_LINE_CONVERSION_SEND_TO,
} from "@/lib/googleAdsTracking";

/** LP初回アクセス時に Google広告パラメータを検知して localStorage へ保存 */
export function GoogleAdsVisitorTracker() {
  useEffect(() => {
    markGoogleAdsVisitorFromUrl();

    if (isGtagPreviewMode()) {
      console.log("[ABODY GTAG Preview] Tracker ready", {
        isGoogleAdsVisitor: isGoogleAdsVisitor(),
        conversion: SHINJUKU_LINE_CONVERSION_SEND_TO,
        hint: "新宿店LINEボタンをクリックして conversion 発火を確認してください",
      });
    }
  }, []);

  return null;
}
