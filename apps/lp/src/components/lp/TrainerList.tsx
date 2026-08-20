"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { TRAINERS, TRAINER_STORES, storeName, type Trainer, type TrainerStoreId } from "@/lib/trainers";

type FilterId = "all" | TrainerStoreId;

export function LPTrainerList() {
  const [filter, setFilter] = useState<FilterId>("all");

  const trainers = useMemo(
    () => (filter === "all" ? TRAINERS : TRAINERS.filter((t) => t.stores.includes(filter))),
    [filter]
  );

  return (
    <div>
      <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-4 px-4 pb-2 mb-8">
        <FilterChip active={filter === "all"} onClick={() => setFilter("all")}>
          すべて
        </FilterChip>
        {TRAINER_STORES.map((store) => (
          <FilterChip
            key={store.id}
            active={filter === store.id}
            onClick={() => setFilter(store.id)}
          >
            {store.name}
          </FilterChip>
        ))}
      </div>

      {trainers.length === 0 ? (
        <p className="text-center text-neutral-500 text-sm py-12">
          この店舗のトレーナー紹介は準備中です。
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {trainers.map((trainer) => (
            <article
              key={trainer.id}
              className="bg-white rounded-2xl shadow-soft border border-neutral-100 overflow-hidden flex flex-col"
            >
              <TrainerPhoto trainer={trainer} />
              <div className="p-5 flex flex-col gap-3 flex-1">
                <p className="text-sm font-semibold text-abody-teal">{trainer.catch}</p>
                <div>
                  <p className="text-xs font-bold text-neutral-500 mb-2 tracking-wide">強み</p>
                  <ul className="flex flex-wrap gap-2">
                    {trainer.strengths.map((s) => (
                      <li
                        key={s}
                        className="text-xs font-medium text-abody-teal bg-abody-teal/10 rounded-full px-3 py-1"
                      >
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
                <p className="text-sm text-neutral-600 leading-relaxed">{trainer.bio}</p>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

function TrainerPhoto({ trainer }: { trainer: Trainer }) {
  const gallery = (trainer.photos?.length ? trainer.photos : trainer.photo ? [trainer.photo] : []).filter(
    Boolean
  ) as string[];
  const [index, setIndex] = useState(0);
  const current = gallery[index];

  return (
    <div className="relative aspect-[3/4] bg-neutral-100">
      {current ? (
        <Image
          src={current}
          alt={`${trainer.name}（ABODYトレーナー）`}
          fill
          className="object-cover object-top"
          sizes="(max-width: 640px) 100vw, 480px"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-abody-teal/10 text-4xl font-bold text-abody-teal">
          {trainer.name.slice(0, 1)}
        </div>
      )}
      {gallery.length > 1 && (
        <div className="absolute top-3 right-3 z-10 flex gap-1.5">
          {gallery.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => setIndex(i)}
              className={`relative h-12 w-9 overflow-hidden rounded-lg border-2 !p-0 !w-9 !h-12 ${
                i === index ? "!border-white" : "!border-white/40"
              }`}
              aria-label={`${trainer.name}の写真${i + 1}`}
            >
              <Image src={src} alt="" fill className="object-cover" sizes="36px" />
            </button>
          ))}
        </div>
      )}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/25 to-transparent px-5 pb-4 pt-16">
        <h2 className="text-white text-xl font-bold tracking-wide">
          {trainer.name}
          {trainer.nameEn && (
            <span className="ml-2 text-sm font-medium text-white/75">{trainer.nameEn}</span>
          )}
        </h2>
        <p className="mt-1 text-white/85 text-xs">
          {trainer.stores.map(storeName).join(" / ")}
        </p>
      </div>
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-shrink-0 !w-auto px-4 py-2 rounded-full text-sm font-medium transition-colors ${
        active
          ? "!bg-abody-teal !text-white shadow-soft"
          : "!bg-white !text-neutral-700 border border-neutral-200 hover:border-abody-teal/40"
      }`}
    >
      {children}
    </button>
  );
}
