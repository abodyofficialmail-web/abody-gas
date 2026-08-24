import { LINE_URL_BY_STORE, STORES } from "@/lib/constants";
import { CtaButton } from "@/components/lp/CtaButton";

export function LPFixedCTA() {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-3 bg-white/95 backdrop-blur border-t border-neutral-100 md:hidden">
      <div className="grid grid-cols-2 gap-2">
        {STORES.map((store) => (
          <CtaButton
            key={store.id}
            href={LINE_URL_BY_STORE[store.id]}
            className="w-full py-3.5 text-sm"
          >
            {store.name}で体験
          </CtaButton>
        ))}
      </div>
    </div>
  );
}
