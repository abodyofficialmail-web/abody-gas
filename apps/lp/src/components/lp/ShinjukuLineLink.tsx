"use client";

import type { ReactNode } from "react";
import { navigateToShinjukuLine } from "@/lib/googleAdsTracking";
import { LINE_URL_SHINJUKU } from "@/lib/constants";

type Props = {
  href?: string;
  className?: string;
  children: ReactNode;
  "aria-label"?: string;
};

/** 新宿店公式LINEへ遷移するCTA（Google広告経由のみCV計測） */
export function ShinjukuLineLink({
  href = LINE_URL_SHINJUKU,
  className,
  children,
  "aria-label": ariaLabel,
}: Props) {
  return (
    <a
      href={href}
      onClick={(e) => {
        e.preventDefault();
        navigateToShinjukuLine(href);
      }}
      className={className}
      aria-label={ariaLabel}
      data-store-id="shinjuku"
    >
      {children}
    </a>
  );
}
