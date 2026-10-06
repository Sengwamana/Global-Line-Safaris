import type { Metadata } from "next";
import { buildPageMetadata, getHomepageContent } from "@/lib/content/service.server";
import { CTASection } from "@/domains/home/components/CTASection";
import { WhyChooseHero } from "@/domains/why-choose-us/components/WhyChooseHero";
import { WhyChoosePillars } from "@/domains/why-choose-us/components/WhyChoosePillars";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata('why-choose-us', {
    title: 'Why Travel With Us',
    description: 'Why travellers choose Global Line Safaris for safari and tour experiences across Rwanda and East Africa.',
    path: '/why-choose-us',
  });
}

export default async function WhyChooseUsPage() {
  const homepage = await getHomepageContent();
  const pillars = homepage.whyChoose.items;

  return (
    <div className="overflow-x-hidden">
      <WhyChooseHero />
      <WhyChoosePillars pillars={pillars} />
      <CTASection />
    </div>
  );
}
