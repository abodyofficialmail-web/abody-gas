"use client";

import { useState } from "react";
import Image from "next/image";

/** 2つの動画を斜めに分割。publicフォルダに hero-video1.mp4 と hero-video2.mp4 を置いてください */
const HERO_VIDEOS = ["/hero-video1.mp4", "/hero-video2.mp4"];

export function LPHero() {
  const [videoError, setVideoError] = useState(false);

  return (
    <section className="relative min-h-[70vh] sm:min-h-[75vh] flex flex-col">
      <div className="absolute inset-0 z-0 overflow-hidden">
        {!videoError ? (
          <>
            <div className="absolute inset-0 bg-neutral-900" style={{ clipPath: "polygon(0 0, 55% 0, 45% 100%, 0 100%)" }}>
              <video
                autoPlay
                muted
                loop
                playsInline
                preload="auto"
                className="absolute inset-0 w-[140%] h-full -left-[20%] object-cover"
                style={{ objectPosition: "30% center" }}
                onError={() => setVideoError(true)}
              >
                <source src={HERO_VIDEOS[0]} type="video/mp4" />
              </video>
            </div>
            <div className="absolute inset-0 overflow-hidden bg-neutral-900" style={{ clipPath: "polygon(55% 0, 100% 0, 100% 100%, 45% 100%)" }}>
              <video
                autoPlay
                muted
                loop
                playsInline
                preload="auto"
                className="absolute inset-0 w-[125%] h-[135%] left-auto right-0 top-0 object-cover"
                style={{ objectPosition: "55% 25%" }}
                onError={() => setVideoError(true)}
              >
                <source src={HERO_VIDEOS[1]} type="video/mp4" />
              </video>
            </div>
          </>
        ) : (
          <Image src="/hero-top.png" alt="ABODYのジムでトレーニングする様子" fill className="object-cover" priority sizes="(max-width: 640px) 750px, 1920px" />
        )}
        <div className="absolute inset-0 bg-black/20 z-[5]" />
      </div>
      <div className="relative z-20 flex flex-col justify-between min-h-[70vh] sm:min-h-[75vh] px-4 sm:px-6 py-6 sm:py-8">
        <h1 className="font-shippori tracking-wide text-left">
          <span className="inline-block text-sm sm:text-base md:text-lg font-semibold text-neutral-900 bg-white/95 px-2 py-1 shadow-soft mb-1 w-fit animate-fade-slide-up">
            無意識で通える。
          </span>
          <br />
          <span className="inline-block text-sm sm:text-base md:text-lg font-semibold text-neutral-900 bg-white/95 px-2 py-1 shadow-soft w-fit animate-fade-slide-up-delay">
            気づいたら変わってる。
          </span>
        </h1>
        <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-neutral-900 bg-white/95 px-5 py-3 max-w-max shadow-soft font-shippori tracking-wide">
          Abody受け放題パーソナルジム
        </p>
      </div>
    </section>
  );
}
