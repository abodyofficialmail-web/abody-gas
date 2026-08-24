import Link from "next/link";

export function LPFooter() {
  return (
    <footer className="bg-pilarim-charcoal text-white/80 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="font-bold tracking-[0.18em] text-white">PILARIM</p>
        <p className="text-xs">30代〜50代男性のための通い放題スタジオ</p>
        <Link href="/recruit" className="text-xs hover:text-white">
          求人情報
        </Link>
      </div>
    </footer>
  );
}
