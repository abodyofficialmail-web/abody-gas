"use client";

import { useState, useEffect } from "react";
import { INSTAGRAM_REELS } from "@/lib/constants";

function ReelCard({ reel, idx }: { reel: (typeof INSTAGRAM_REELS)[number]; idx: number }) {
  const [thumbnail, setThumbnail] = useState<string | null>(reel.thumbnail ?? null);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    if (thumbnail || imgError) return;
    fetch(`/api/reel-thumbnail?url=${encodeURIComponent(reel.url)}`)
      .then((r) => r.ok ? r.json() : null)
      .then((data) => data?.thumbnail && setThumbnail(data.thumbnail))
      .catch(() => {});
  }, [reel.url, thumbnail, imgError]);

  const showThumb = thumbnail && !imgError;

  return (
    <a
      href={reel.url}
      target="_blank"
      rel="noopener noreferrer"
      className="relative flex-shrink-0 w-[280px] sm:w-[320px] snap-start block rounded-2xl overflow-hidden shadow-soft border border-neutral-100 aspect-[9/16] max-h-[400px] bg-neutral-100 hover:opacity-90 transition-opacity group"
    >
      {showThumb ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={thumbnail!}
            alt={`Reel ${idx + 1}`}
            className="absolute inset-0 w-full h-full object-cover"
            onError={() => setImgError(true)}
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
            <span className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center text-2xl pl-1 text-neutral-800 shadow-lg">▶</span>
          </div>
        </>
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center text-neutral-500 text-sm p-4">
          <span className="mb-2 text-2xl">▶</span>
          <span>Reel #{idx + 1}</span>
          <span className="text-xs mt-1 text-neutral-400">クリックでInstagramで開く</span>
        </div>
      )}
    </a>
  );
}

export function LPInstagramReels() {
  if (INSTAGRAM_REELS.length === 0) {
    return (
      <section className="py-16 sm:py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="text-base sm:text-lg font-bold text-center text-neutral-900 mb-10 sm:mb-12 tracking-wide">トレーニング風景</h2>
          <p className="text-center text-neutral-500 text-sm">
            src/lib/constants.ts の INSTAGRAM_REEL_URLS にReelのURLを追加してください
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 sm:py-24 bg-white overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <h2 className="text-base sm:text-lg font-bold text-center text-neutral-900 mb-10 sm:mb-12 tracking-wide">トレーニング風景</h2>
        <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide -mx-4 px-4 pb-2">
          {INSTAGRAM_REELS.map((reel, idx) => (
            <ReelCard key={idx} reel={reel} idx={idx} />
          ))}
        </div>
      </div>
    </section>
  );
}
