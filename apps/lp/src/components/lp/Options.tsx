export function LPOptions() {
  const OPTIONS = [
    {
      name: "60分受け放題",
      price: "+25,000",
      unit: "円",
      description: "30分じゃ物足りない方やストレッチかピラティス30分トレーニング30分などオリジナルにカスタマイズできます",
    },
    {
      name: "着替えレンタル",
      price: "3,300",
      unit: "円",
      description: "",
    },
    {
      name: "食事パーソナル",
      price: "9,800",
      unit: "円",
      description: "※効果が実感できなかったら返金保証付き",
    },
  ];

  return (
    <section className="py-14 sm:py-16 bg-neutral-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <h2 className="text-base sm:text-lg font-bold text-center text-neutral-900 mb-2 tracking-wide">オプション</h2>
        <p className="text-center text-neutral-500 text-xs sm:text-sm mb-6">こちらは任意で必ずご利用いただく必要や営業はございません</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {OPTIONS.map((item) => (
            <div
              key={item.name}
              className="bg-white rounded-2xl p-6 shadow-soft border border-neutral-100 min-w-0"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                <p className="text-neutral-900 font-semibold text-sm sm:text-base">{item.name}</p>
                {item.price && (
                  <p className="text-abody-teal font-bold text-base sm:text-lg shrink-0">
                    {item.price}
                    {item.unit && <span className="font-medium text-neutral-600 ml-1">{item.unit}</span>}
                  </p>
                )}
              </div>
              {item.description && <p className="text-neutral-600 text-xs sm:text-sm leading-relaxed">{item.description}</p>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
