import { LPHeader } from "@/components/lp/Header";
import { LPHero } from "@/components/lp/Hero";
import { LPInstagramReels } from "@/components/lp/InstagramReels";
import { LPPrice } from "@/components/lp/Price";
import { LPCampaign } from "@/components/lp/Campaign";
import { LPFeatures } from "@/components/lp/Features";
import { LPBeforeAfter } from "@/components/lp/BeforeAfter";
import { LPReviews } from "@/components/lp/Reviews";
import { LPOptions } from "@/components/lp/Options";
import { LPStep } from "@/components/lp/Step";
import { LPCTASection } from "@/components/lp/CTASection";
import { LPLocations } from "@/components/lp/Locations";
import { LPTrainers } from "@/components/lp/Trainers";
import { LPRecruit } from "@/components/lp/Recruit";
import { LPFixedCTA } from "@/components/lp/FixedCTA";

export default function Page() {
  return (
    <>
      <LPHeader />
      <main className="pb-56 sm:pb-64">
        <LPHero />
        <LPInstagramReels />
        <LPPrice />
        <LPCampaign />
        <LPFeatures />
        <LPBeforeAfter />
        <LPReviews />
        <LPOptions />
        <LPStep />
        <LPCampaign />
        <LPCTASection />
        <LPLocations />
        <LPTrainers />
        <LPRecruit />
      </main>
      <LPFixedCTA />
    </>
  );
}
