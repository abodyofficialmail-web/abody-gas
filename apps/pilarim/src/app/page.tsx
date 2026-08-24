import { LPHeader } from "@/components/lp/Header";
import { LPHero } from "@/components/lp/Hero";
import { LPProgram } from "@/components/lp/Program";
import { LPIntroduction } from "@/components/lp/Introduction";
import { LPStep } from "@/components/lp/Step";
import { LPReviews } from "@/components/lp/Reviews";
import { LPPrice } from "@/components/lp/Price";
import { LPOptions } from "@/components/lp/Options";
import { LPLocations } from "@/components/lp/Locations";
import { LPFaq } from "@/components/lp/Faq";
import { LPCTASection } from "@/components/lp/CTASection";
import { LPFooter } from "@/components/lp/Footer";
import { LPFixedCTA } from "@/components/lp/FixedCTA";

export default function Page() {
  return (
    <>
      <LPHeader />
      <main className="pb-24 md:pb-0">
        <LPHero />
        <LPProgram />
        <LPIntroduction />
        <LPStep />
        <LPReviews />
        <LPPrice />
        <LPOptions />
        <LPLocations />
        <LPFaq />
        <LPCTASection />
      </main>
      <LPFooter />
      <LPFixedCTA />
    </>
  );
}
