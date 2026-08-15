import { LINE_URL } from "@/lib/constants";

export function LPFixedCTA() {
  const hasLineLink = LINE_URL.startsWith("http");
  const href = hasLineLink ? LINE_URL : "#campaign";

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 pb-safe bg-white/95 backdrop-blur border-t border-neutral-100 md:hidden">
      <a
        href={href}
        {...(hasLineLink ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        className="block w-full py-3 text-sm rounded-2xl bg-pilarim-accent text-white font-semibold text-center shadow-soft hover:bg-pilarim-accent-dark transition-colors"
        aria-label="LINEで初回体験を予約"
      >
        初回体験はこちら
      </a>
    </div>
  );
}
