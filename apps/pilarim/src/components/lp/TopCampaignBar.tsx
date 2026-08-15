import { CAMPAIGN_BAR_TEXT } from "@/lib/campaign";

export function LPTopCampaignBar() {
  return (
    <div className="sticky top-0 left-0 right-0 z-[100] bg-pilarim-bronze text-white shadow-md">
      <a
        href="#campaign"
        className="block w-full py-2.5 px-4 text-center hover:bg-pilarim-bronze-dark transition-colors"
        aria-label="オープニングキャンペーンを見る"
      >
        <span className="text-sm sm:text-base font-bold">{CAMPAIGN_BAR_TEXT}</span>
      </a>
    </div>
  );
}
