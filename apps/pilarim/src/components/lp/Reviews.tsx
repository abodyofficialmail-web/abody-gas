"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

const REVIEWS = [
  {
    id: 1,
    name: "Kさん",
    age: "44歳",
    job: "会社員",
    period: "5ヶ月目",
    photo:
      "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=600&q=80",
    quote:
      "デスクワークの猫背が気になって始めました。ピラティスで肩が開いて、同僚に姿勢よくなったねと言われました。受け放題なので続くのが一番大きいです。",
  },
  {
    id: 2,
    name: "Mさん",
    age: "38歳",
    job: "会社員",
    period: "4ヶ月目",
    photo:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=600&q=80",
    quote:
      "ジムは何度も続かなかった人間です。30分から通えて毎回マンツーマンなので、やめておこうが起きにくい。気づいたら週3が当たり前になりました。",
  },
  {
    id: 3,
    name: "Sさん",
    age: "51歳",
    job: "自営業",
    period: "3ヶ月目",
    photo:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80",
    quote:
      "ただ痩せたいのではなく、日常の動きを楽にしたかった。体重だけでなく、しゃがむ・歩くが楽になった。同年代の男性も多く気負わず通えています。",
  },
  {
    id: 4,
    name: "Tさん",
    age: "42歳",
    job: "会社員",
    period: "6ヶ月目",
    photo:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80",
    quote:
      "食事制限だけのダイエットは失敗続きでした。ピラティスで使い方を直し、パーソナルで代謝を上げる順番がしっくりきました。",
  },
];

export function LPReviews() {
  const [index, setIndex] = useState(0);
  const review = REVIEWS[index];

  return (
    <section className="py-16 sm:py-24 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <h2 className="text-xl sm:text-3xl font-bold text-center text-pilarim-ink mb-10 sm:mb-14">
          同世代の男性が、続けています。
        </h2>
        <div className="relative">
          <div className="grid md:grid-cols-[220px_1fr] gap-6 items-center">
            <div className="relative mx-auto w-40 h-40 sm:w-52 sm:h-52 md:w-full md:h-64 rounded-3xl overflow-hidden shadow-soft">
              <Image
                src={review.photo}
                alt={`${review.name}のイメージ写真`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 208px, 220px"
              />
            </div>
            <div className="relative bg-pilarim-cream rounded-3xl p-6 sm:p-8 shadow-soft">
              <div
                className="hidden md:block absolute left-0 top-10 -translate-x-2 w-4 h-4 rotate-45 bg-pilarim-cream"
                aria-hidden
              />
              <p className="text-base sm:text-lg text-pilarim-ink leading-relaxed">
                「{review.quote}」
              </p>
              <p className="mt-6 text-sm font-semibold text-pilarim-ink">
                {review.name} / {review.age} / {review.job} / {review.period}
              </p>
            </div>
          </div>
          <div className="mt-8 flex items-center justify-center gap-6">
            <button
              type="button"
              aria-label="前の声"
              className="w-10 h-10 rounded-full border border-neutral-300 bg-white flex items-center justify-center hover:border-pilarim-bronze transition-colors"
              onClick={() => setIndex((index - 1 + REVIEWS.length) % REVIEWS.length)}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex gap-2">
              {REVIEWS.map((item, i) => (
                <button
                  key={item.id}
                  type="button"
                  aria-label={`${i + 1}件目`}
                  className={`h-2 rounded-full transition-all ${
                    i === index ? "w-6 bg-pilarim-bronze" : "w-2 bg-neutral-300"
                  }`}
                  onClick={() => setIndex(i)}
                />
              ))}
            </div>
            <button
              type="button"
              aria-label="次の声"
              className="w-10 h-10 rounded-full border border-neutral-300 bg-white flex items-center justify-center hover:border-pilarim-bronze transition-colors"
              onClick={() => setIndex((index + 1) % REVIEWS.length)}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
