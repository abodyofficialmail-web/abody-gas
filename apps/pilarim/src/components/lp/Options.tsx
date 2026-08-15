import { TICKET_PLANS } from "@/lib/plans";

export function LPOptions() {
  return (
    <section className="py-14 sm:py-16 bg-neutral-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <h2 className="text-base sm:text-lg font-bold text-center text-neutral-900 mb-2 tracking-wide">
          オプション
        </h2>
        <p className="text-center text-neutral-500 text-xs sm:text-sm mb-6">
          こちらは任意で必ずご利用いただく必要や営業はございません
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {TICKET_PLANS.map((item) => (
            <div
              key={item.name}
              className="bg-white rounded-2xl p-6 shadow-soft border border-neutral-100 min-w-0"
            >
              <p className="text-xs text-neutral-400 font-shippori">{item.nameEn}</p>
              <p className="text-neutral-900 font-semibold text-sm sm:text-base mt-0.5">
                {item.name}
              </p>
              <p className="text-neutral-600 text-xs sm:text-sm leading-relaxed mt-3">
                {item.description}
              </p>
              <div className="mt-5 grid grid-cols-2 gap-3">
                {item.prices.map((price) => (
                  <div key={price.label} className="bg-pilarim-cream rounded-xl px-3 py-3">
                    <p className="text-xs text-neutral-500">{price.label}</p>
                    <p className="font-shippori text-xl font-semibold text-[#8B3A3A] mt-1">
                      {price.value}
                      <span className="text-xs font-medium text-neutral-500 ml-1">円</span>
                    </p>
                    <p className="text-[10px] text-[#8B3A3A]">税抜</p>
                    {price.note && (
                      <p className="text-[10px] font-bold text-[#8B3A3A] mt-1">{price.note}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
