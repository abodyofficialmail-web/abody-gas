"use client";

/**
 * 背景用の Abody ロゴ繰り返しパターン（CSS data URI で確実に表示）
 */
const PATTERN_SIZE = 52;

// SVG を data URI で埋め込み（外部ファイル・React の SVG に依存しない）
function getPatternDataUri(): string {
  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${PATTERN_SIZE * 2}" height="${PATTERN_SIZE * 2}">
  <text x="0" y="${PATTERN_SIZE * 0.8}" fill="rgba(0,0,0,0.28)" font-size="${PATTERN_SIZE * 0.45}" font-weight="700" font-family="sans-serif">ABODY</text>
</svg>`;
  const encoded = encodeURIComponent(svg.replace(/\s+/g, " ").trim());
  return `url("data:image/svg+xml,${encoded}")`;
}

export function AbodyLogoPattern() {
  return (
    <div
      className="fixed inset-0 z-0 overflow-hidden"
      aria-hidden
      style={{
        background: "linear-gradient(to bottom, #ffffff, #fafafa, #f5f5f5)",
      }}
    >
      <div
        className="absolute w-[200%] h-[200%] -left-1/2 -top-1/2"
        style={{
          backgroundImage: getPatternDataUri(),
          backgroundRepeat: "repeat",
          backgroundSize: `${PATTERN_SIZE}px ${PATTERN_SIZE}px`,
          transform: "rotate(-12deg)",
        }}
      />
    </div>
  );
}
